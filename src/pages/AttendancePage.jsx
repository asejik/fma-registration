import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  collection, query, where, getDocs, addDoc, onSnapshot, doc,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { ILORIN_STUDENTS } from '../data/attendanceStudents';
import { MapPin, Clock, CheckCircle2, AlertTriangle, Loader2, ChevronDown } from 'lucide-react';

// ── Constants ──────────────────────────────────────────────────────────────
const ACADEMY_LAT = 8.481150148398003;
const ACADEMY_LNG = 4.613082508134742;
const ALLOWED_RADIUS_M = 100;
const COHORT = 'Ilorin';

// Training days: July 19–25 2026
const TRAINING_DAYS = [
  '2026-07-19',
  '2026-07-20',
  '2026-07-21',
  '2026-07-22',
  '2026-07-23',
  '2026-07-24',
  '2026-07-25',
];

// ── Haversine distance (meters) ────────────────────────────────────────────
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth radius in metres
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Today as YYYY-MM-DD (WAT = UTC+1) ─────────────────────────────────────
function getTodayWAT() {
  const now = new Date();
  // Shift to WAT (UTC+1)
  const wat = new Date(now.getTime() + 60 * 60 * 1000);
  return wat.toISOString().slice(0, 10);
}

// ── Format countdown ───────────────────────────────────────────────────────
function formatCountdown(ms) {
  if (ms <= 0) return '00:00:00';
  const totalSecs = Math.floor(ms / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

// ── Format display date ────────────────────────────────────────────────────
function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

// ── Component ──────────────────────────────────────────────────────────────
const AttendancePage = () => {
  const today = getTodayWAT();
  const isTrainingDay = TRAINING_DAYS.includes(today);

  // Window data from Firestore (real-time)
  const [window_, setWindow_] = useState(null); // { openTime, closeTime, isEnabled }
  const [windowLoading, setWindowLoading] = useState(true);

  // Student list from Firestore (falls back to seed list)
  const [students, setStudents] = useState(ILORIN_STUDENTS);

  // Form state
  const [selectedName, setSelectedName] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Submission state
  const [status, setStatus] = useState('idle'); // idle | locating | submitting | success | error | duplicate | blocked
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedTime, setSubmittedTime] = useState('');

  // Countdown state (recalculated every second)
  const [now, setNow] = useState(Date.now());

  // ── Tick every second ────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // ── Close dropdown on outside click ─────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Listen to today's attendance window (real-time) ──────────────────────
  useEffect(() => {
    const ref = doc(db, 'attendance_windows', today);
    const unsub = onSnapshot(ref, (snap) => {
      setWindow_(snap.exists() ? snap.data() : null);
      setWindowLoading(false);
    });
    return () => unsub();
  }, [today]);

  // ── Load student list from Firestore (falls back to seed) ────────────────
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const snap = await getDocs(collection(db, 'attendance_students'));
        if (!snap.empty) {
          const names = snap.docs.map((d) => d.data().name).filter(Boolean).sort();
          setStudents(names);
        }
      } catch {
        // silently use seed list
      }
    };
    fetchStudents();
  }, []);

  // ── Derive window status ──────────────────────────────────────────────────
  const windowStatus = (() => {
    if (!isTrainingDay) return 'not-training-day';
    if (windowLoading) return 'loading';
    if (!window_ || !window_.isEnabled) return 'no-window';
    const open = new Date(window_.openTime).getTime();
    const close = new Date(window_.closeTime).getTime();
    if (now < open) return 'waiting';
    if (now >= open && now <= close) return 'open';
    return 'closed';
  })();

  const msToOpen = window_
    ? Math.max(0, new Date(window_.openTime).getTime() - now)
    : 0;
  const msToClose = window_
    ? Math.max(0, new Date(window_.closeTime).getTime() - now)
    : 0;

  // ── Filtered names for dropdown ───────────────────────────────────────────
  const filteredNames = nameSearch
    ? students.filter((n) => n.toLowerCase().includes(nameSearch.toLowerCase()))
    : students;

  // ── Submit handler ────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!selectedName) return;

    // Re-check window is still open
    if (windowStatus !== 'open') {
      setStatus('error');
      setErrorMsg('Attendance window is no longer open. Please try again when it opens.');
      return;
    }

    setStatus('locating');
    setErrorMsg('');

    // 1. Request geolocation
    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMsg('Your browser does not support geolocation. Please use a modern browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const distance = haversineDistance(latitude, longitude, ACADEMY_LAT, ACADEMY_LNG);

        // 2. Check radius
        if (distance > ALLOWED_RADIUS_M) {
          setStatus('blocked');
          setErrorMsg(
            `You are ${Math.round(distance)}m from the academy. Attendance can only be submitted within ${ALLOWED_RADIUS_M}m of the venue.`
          );
          return;
        }

        setStatus('submitting');

        // 3. Check for duplicate submission today
        try {
          const dupQ = query(
            collection(db, 'attendance_records'),
            where('date', '==', today),
            where('studentName', '==', selectedName)
          );
          const dupSnap = await getDocs(dupQ);
          if (!dupSnap.empty) {
            setStatus('duplicate');
            return;
          }

          // 4. Save record
          const submittedAt = new Date().toISOString();
          await addDoc(collection(db, 'attendance_records'), {
            studentName: selectedName,
            cohort: COHORT,
            date: today,
            submittedAt,
            latitude,
            longitude,
            accuracy: Math.round(accuracy),
            distanceFromAcademy: Math.round(distance),
            flagged: false,
          });

          setSubmittedTime(new Date(submittedAt).toLocaleTimeString('en-NG', {
            hour: '2-digit', minute: '2-digit', hour12: true,
          }));
          setStatus('success');
        } catch (err) {
          console.error('Attendance submit error:', err);
          setStatus('error');
          setErrorMsg('Failed to save attendance. Please check your connection and try again.');
        }
      },
      (err) => {
        setStatus('error');
        if (err.code === 1) {
          setErrorMsg('Location access denied. Please allow location access in your browser settings and try again.');
        } else if (err.code === 2) {
          setErrorMsg('Unable to determine your location. Please ensure GPS is enabled.');
        } else {
          setErrorMsg('Location request timed out. Please try again.');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [selectedName, windowStatus, today]);

  // ── UI ────────────────────────────────────────────────────────────────────

  // Success screen
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-24 h-24 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 size={48} className="text-emerald-400" />
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Attendance Recorded!</h1>
        <p className="text-slate-400 mb-1">
          <span className="text-white font-semibold">{selectedName}</span>
        </p>
        <p className="text-slate-500 text-sm">{formatDateDisplay(today)} · {submittedTime}</p>
        <div className="mt-8 px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-semibold">
          ✅ Marked present for today
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <img src="/favicon.png" alt="FMA" className="h-14 w-14 rounded-2xl object-cover mx-auto mb-4 shadow-lg" />
          <h1 className="text-2xl font-black text-white tracking-tight">Daily Attendance</h1>
          <p className="text-slate-500 text-sm mt-1">Freedom Ministry Academy · Ilorin 2026</p>
          <p className="text-slate-600 text-xs mt-1 font-mono">{formatDateDisplay(today)}</p>
        </div>

        {/* ── Status Panel ──────────────────────────────────────────────── */}
        {windowLoading ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <Loader2 size={32} className="text-indigo-400 animate-spin" />
            <p className="text-slate-500 text-sm">Checking today's schedule…</p>
          </div>
        ) : windowStatus === 'not-training-day' ? (
          <StatusPanel
            icon={<Clock size={36} className="text-slate-500" />}
            title="No Training Today"
            subtitle="Attendance is only available on July 19–25, 2026."
            color="slate"
          />
        ) : windowStatus === 'no-window' ? (
          <StatusPanel
            icon={<Clock size={36} className="text-slate-500" />}
            title="No Attendance Scheduled"
            subtitle="The admin has not opened attendance for today. Please check back later."
            color="slate"
          />
        ) : windowStatus === 'waiting' ? (
          <StatusPanel
            icon={<Clock size={36} className="text-blue-400" />}
            title="Attendance Opens In"
            color="blue"
            countdown={formatCountdown(msToOpen)}
            subtitle={`Opens at ${new Date(window_.openTime).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: true })}`}
          />
        ) : windowStatus === 'closed' ? (
          <StatusPanel
            icon={<Clock size={36} className="text-slate-500" />}
            title="Attendance Closed"
            subtitle="Today's attendance window has passed. See you tomorrow!"
            color="slate"
          />
        ) : (
          /* ── OPEN: Show form ─────────────────────────────────────────── */
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5">
            {/* Closing countdown */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-400">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wide">Attendance Open</span>
              </div>
              <div className="text-right">
                <p className="text-white font-mono font-black text-lg leading-none">{formatCountdown(msToClose)}</p>
                <p className="text-slate-500 text-[10px] mt-0.5">closes at {new Date(window_.closeTime).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
              </div>
            </div>

            {/* Date (read-only display) */}
            <div>
              <label className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1.5 block">Date</label>
              <div className="bg-slate-950 border border-white/[0.07] rounded-xl px-4 py-3 text-white text-sm font-semibold">
                {formatDateDisplay(today)}
              </div>
            </div>

            {/* Cohort (read-only) */}
            <div>
              <label className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1.5 block">Cohort</label>
              <div className="bg-slate-950 border border-white/[0.07] rounded-xl px-4 py-3 text-slate-400 text-sm font-semibold">
                {COHORT}
              </div>
            </div>

            {/* Name dropdown */}
            <div>
              <label className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1.5 block">Your Name</label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((v) => !v)}
                  className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-sm text-left flex items-center justify-between transition-colors ${
                    selectedName ? 'text-white border-indigo-500' : 'text-slate-500 border-white/[0.07]'
                  } focus:outline-none focus:border-indigo-500`}
                >
                  <span>{selectedName || 'Select your name…'}</span>
                  <ChevronDown
                    size={16}
                    className={`text-slate-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                    {/* Search */}
                    <div className="p-2 border-b border-white/[0.06]">
                      <input
                        type="text"
                        value={nameSearch}
                        onChange={(e) => setNameSearch(e.target.value)}
                        placeholder="Search name…"
                        className="w-full bg-slate-950 border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        autoFocus
                      />
                    </div>
                    {/* Options */}
                    <ul className="max-h-52 overflow-y-auto divide-y divide-white/[0.04]">
                      {filteredNames.length === 0 ? (
                        <li className="px-4 py-3 text-slate-500 text-sm text-center">No name found</li>
                      ) : (
                        filteredNames.map((name) => (
                          <li key={name}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedName(name);
                                setNameSearch('');
                                setDropdownOpen(false);
                                setStatus('idle');
                              }}
                              className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                                selectedName === name
                                  ? 'bg-indigo-600/20 text-white font-semibold'
                                  : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                              }`}
                            >
                              {name}
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Error / status messages */}
            {status === 'blocked' && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                <MapPin size={18} className="text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-300 font-bold text-sm">Outside Allowed Radius</p>
                  <p className="text-red-400/80 text-xs mt-1 leading-relaxed">{errorMsg}</p>
                </div>
              </div>
            )}
            {status === 'error' && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                <AlertTriangle size={18} className="text-orange-400 shrink-0 mt-0.5" />
                <p className="text-orange-300 text-sm leading-relaxed">{errorMsg}</p>
              </div>
            )}
            {status === 'duplicate' && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
                <CheckCircle2 size={18} className="text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-300 font-bold text-sm">Already Submitted</p>
                  <p className="text-yellow-400/80 text-xs mt-1">Attendance for <span className="font-semibold">{selectedName}</span> has already been recorded today.</p>
                </div>
              </div>
            )}

            {/* Geolocation note */}
            <div className="flex items-start gap-2 text-slate-600 text-xs">
              <MapPin size={12} className="shrink-0 mt-0.5" />
              <span>Your location will be verified. You must be within {ALLOWED_RADIUS_M}m of the academy to submit.</span>
            </div>

            {/* Submit button */}
            <button
              type="button"
              disabled={!selectedName || status === 'locating' || status === 'submitting'}
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl text-base transition-all shadow-lg shadow-indigo-900/30 flex items-center justify-center gap-2"
            >
              {status === 'locating' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Getting your location…
                </>
              ) : status === 'submitting' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Mark Attendance
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Status Panel sub-component ─────────────────────────────────────────────
const StatusPanel = ({ icon, title, subtitle, countdown, color }) => {
  const borderColor = {
    blue: 'border-blue-500/20 bg-blue-500/5',
    slate: 'border-white/[0.06] bg-white/[0.02]',
    emerald: 'border-emerald-500/20 bg-emerald-500/5',
  }[color] || 'border-white/[0.06] bg-white/[0.02]';

  return (
    <div className={`rounded-3xl border p-8 text-center ${borderColor}`}>
      <div className="flex justify-center mb-4">{icon}</div>
      <h2 className="text-xl font-black text-white mb-2">{title}</h2>
      {countdown && (
        <p className="text-4xl font-black text-white font-mono tracking-wider my-4">{countdown}</p>
      )}
      <p className="text-slate-500 text-sm leading-relaxed">{subtitle}</p>
    </div>
  );
};

export default AttendancePage;
