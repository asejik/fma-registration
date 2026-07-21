import React, { useState, useEffect, useCallback } from 'react';
import {
  collection, getDocs, query, where, doc, setDoc, deleteDoc, addDoc, onSnapshot,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { ILORIN_STUDENTS } from '../data/attendanceStudents';
import {
  Calendar, Clock, CheckCircle2, Minus, Edit2, Trash2,
  Plus, Save, X, Download, UserPlus, Settings, Loader2,
} from 'lucide-react';

const TRAINING_DAYS = [
  '2026-07-19','2026-07-20','2026-07-21','2026-07-22',
  '2026-07-23','2026-07-24','2026-07-25',
];

function dayLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' });
}

function exportAttendanceCSV(students, records) {
  const header = ['Name', ...TRAINING_DAYS.map(dayLabel)].join(',');
  const rows = students.map((name) => {
    const cells = TRAINING_DAYS.map((date) => {
      const rec = records[date]?.[name];
      return rec ? `"${new Date(rec.submittedAt).toLocaleTimeString()}"` : 'Absent';
    });
    return [`"${name}"`, ...cells].join(',');
  });
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `FMA_Attendance_Ilorin_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const AttendanceAdminTab = () => {
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({}); // { date: { name: record } }
  const [windows, setWindows] = useState({}); // { date: windowData }
  const [loading, setLoading] = useState(true);

  // Window editor state
  const [editingWindow, setEditingWindow] = useState(null); // date string
  const [windowForm, setWindowForm] = useState({ openTime: '', closeTime: '', isEnabled: true });
  const [savingWindow, setSavingWindow] = useState(false);

  // Add student state
  const [addStudentName, setAddStudentName] = useState('');
  const [addingStudent, setAddingStudent] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);

  // Cell edit modal
  const [cellEdit, setCellEdit] = useState(null); // { name, date }
  const [cellSaving, setCellSaving] = useState(false);

  // ── Load students ─────────────────────────────────────────────────────────
  const loadStudents = useCallback(async () => {
    const snap = await getDocs(collection(db, 'attendance_students'));
    const existingNames = snap.docs.map((d) => d.data().name).filter(Boolean);
    const existingLower = new Set(existingNames.map((n) => n.toLowerCase()));

    // Add any names from the updated seed that are not yet in Firestore
    const missing = ILORIN_STUDENTS.filter((n) => !existingLower.has(n.toLowerCase()));
    if (missing.length > 0) {
      await Promise.all(
        missing.map((name) => addDoc(collection(db, 'attendance_students'), { name, cohort: 'Ilorin' }))
      );
    }

    const allNames = [...new Set([...existingNames, ...missing])].sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    );
    setStudents(allNames);
  }, []);

  // ── Load attendance records ───────────────────────────────────────────────
  const loadRecords = useCallback(async () => {
    const snap = await getDocs(
      query(collection(db, 'attendance_records'), where('cohort', '==', 'Ilorin'))
    );
    const map = {};
    snap.docs.forEach((d) => {
      const data = d.data();
      if (!map[data.date]) map[data.date] = {};
      map[data.date][data.studentName] = { ...data, id: d.id };
    });
    setRecords(map);
  }, []);

  // ── Listen to windows (real-time) ─────────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'attendance_windows'), (snap) => {
      const map = {};
      snap.docs.forEach((d) => { map[d.id] = d.data(); });
      setWindows(map);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    Promise.all([loadStudents(), loadRecords()]).finally(() => setLoading(false));
  }, [loadStudents, loadRecords]);

  // ── Save window ───────────────────────────────────────────────────────────
  const saveWindow = async () => {
    if (!windowForm.openTime || !windowForm.closeTime) return;
    setSavingWindow(true);
    try {
      // Convert local time strings to full ISO strings for the selected date
      const toISO = (timeStr) => {
        const [h, m] = timeStr.split(':');
        const d = new Date(`${editingWindow}T00:00:00+01:00`);
        d.setHours(parseInt(h), parseInt(m), 0, 0);
        return d.toISOString();
      };
      await setDoc(doc(db, 'attendance_windows', editingWindow), {
        date: editingWindow,
        openTime: toISO(windowForm.openTime),
        closeTime: toISO(windowForm.closeTime),
        isEnabled: windowForm.isEnabled,
      });
      setEditingWindow(null);
    } catch (err) {
      console.error('Save window error:', err);
      alert('Failed to save window. Check your connection.');
    } finally {
      setSavingWindow(false);
    }
  };

  // ── Open window editor ────────────────────────────────────────────────────
  const openWindowEditor = (date) => {
    const w = windows[date];
    if (w) {
      const toTime = (iso) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
      setWindowForm({ openTime: toTime(w.openTime), closeTime: toTime(w.closeTime), isEnabled: w.isEnabled });
    } else {
      setWindowForm({ openTime: '08:00', closeTime: '09:00', isEnabled: true });
    }
    setEditingWindow(date);
  };

  // ── Add student ───────────────────────────────────────────────────────────
  const addStudent = async () => {
    const name = addStudentName.trim();
    if (!name || students.includes(name)) return;
    setAddingStudent(true);
    try {
      await addDoc(collection(db, 'attendance_students'), { name, cohort: 'Ilorin' });
      setStudents((prev) => [...prev, name].sort());
      setAddStudentName('');
      setShowAddStudent(false);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingStudent(false);
    }
  };

  // ── Delete student ────────────────────────────────────────────────────────
  const deleteStudent = async (name) => {
    if (!window.confirm(`Remove "${name}" from the student list?`)) return;
    try {
      const snap = await getDocs(
        query(collection(db, 'attendance_students'), where('name', '==', name))
      );
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
      setStudents((prev) => prev.filter((s) => s !== name));
    } catch (err) {
      console.error(err);
    }
  };

  // ── Toggle cell (admin mark present/absent) ───────────────────────────────
  const toggleCell = async (name, date) => {
    setCellSaving(true);
    try {
      const existing = records[date]?.[name];
      if (existing) {
        // Remove (mark absent)
        await deleteDoc(doc(db, 'attendance_records', existing.id));
        setRecords((prev) => {
          const next = { ...prev };
          if (next[date]) { next[date] = { ...next[date] }; delete next[date][name]; }
          return next;
        });
      } else {
        // Mark present (admin override)
        const submittedAt = new Date(`${date}T00:00:00+01:00`).toISOString();
        const ref = await addDoc(collection(db, 'attendance_records'), {
          studentName: name, cohort: 'Ilorin', date,
          submittedAt, latitude: null, longitude: null,
          distanceFromAcademy: null, flagged: false, adminOverride: true,
        });
        setRecords((prev) => ({
          ...prev,
          [date]: { ...(prev[date] || {}), [name]: { id: ref.id, studentName: name, date, submittedAt, adminOverride: true } },
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCellSaving(false);
      setCellEdit(null);
    }
  };

  // ── Attendance count helpers ──────────────────────────────────────────────
  const dayCount = (date) => Object.keys(records[date] || {}).length;
  const studentTotal = (name) => TRAINING_DAYS.filter((d) => records[d]?.[name]).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 size={32} className="text-indigo-400 animate-spin" />
        <p className="text-slate-500 text-sm">Loading attendance data…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ── Section 1: Window Manager ───────────────────────────────────── */}
      <div className="bg-slate-900 border border-white/[0.05] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Settings size={16} className="text-blue-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Attendance Windows</p>
              <p className="text-slate-500 text-xs">Set open & close times for each day</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {TRAINING_DAYS.map((date) => {
            const w = windows[date];
            const present = dayCount(date);
            return (
              <div key={date} className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm">{dayLabel(date)}</p>
                  <p className="text-slate-600 text-xs font-mono">{date}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {w ? (
                    <div className="text-right">
                      <div className={`text-xs font-bold px-2 py-0.5 rounded-md inline-block mb-1 ${w.isEnabled ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-700/50 text-slate-500'}`}>
                        {w.isEnabled ? 'Enabled' : 'Disabled'}
                      </div>
                      <p className="text-slate-400 text-xs">
                        {new Date(w.openTime).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        {' – '}
                        {new Date(w.closeTime).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </p>
                    </div>
                  ) : (
                    <span className="text-slate-600 text-xs">Not set</span>
                  )}
                  <span className="text-slate-600 text-xs">{present}/{students.length} present</span>
                  <button
                    onClick={() => openWindowEditor(date)}
                    className="flex items-center gap-1.5 bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-indigo-300 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                  >
                    <Edit2 size={12} /> {w ? 'Edit' : 'Set'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Section 2: Attendance Matrix Table ──────────────────────────── */}
      <div className="bg-slate-900 border border-white/[0.05] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Calendar size={16} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Attendance Register</p>
              <p className="text-slate-500 text-xs">Ilorin Cohort · July 19–25, 2026 · Click any cell to toggle</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddStudent(true)}
              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
            >
              <UserPlus size={12} /> Add Student
            </button>
            <button
              onClick={() => exportAttendanceCSV(students, records)}
              className="flex items-center gap-1.5 bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-indigo-300 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
            >
              <Download size={12} /> Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left font-semibold sticky left-0 bg-slate-950 w-12">#</th>
                <th className="px-4 py-3 text-left font-semibold sticky left-12 bg-slate-950 min-w-[200px]">Name</th>
                {TRAINING_DAYS.map((date) => (
                  <th key={date} className="px-3 py-3 text-center font-semibold whitespace-nowrap min-w-[90px]">
                    <div>{dayLabel(date).split(' ')[0]}</div>
                    <div className="text-slate-600 font-normal">{dayLabel(date).split(' ').slice(1).join(' ')}</div>
                  </th>
                ))}
                <th className="px-3 py-3 text-center font-semibold">Total</th>
                <th className="px-3 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {students.map((name, idx) => (
                <tr key={name} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs sticky left-0 bg-slate-900 group-hover:bg-slate-900/80 w-12">{idx + 1}</td>
                  <td className="px-4 py-3 text-white font-medium text-xs sticky left-12 bg-slate-900 group-hover:bg-slate-900/80">{name}</td>
                  {TRAINING_DAYS.map((date) => {
                    const rec = records[date]?.[name];
                    return (
                      <td key={date} className="px-3 py-3 text-center">
                        <button
                          onClick={() => toggleCell(name, date)}
                          disabled={cellSaving}
                          title={rec
                            ? `Present · ${new Date(rec.submittedAt).toLocaleTimeString()}${rec.adminOverride ? ' (admin)' : ''}`
                            : 'Absent · Click to mark present'}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-all hover:scale-110 ${
                            rec
                              ? rec.adminOverride
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-white/[0.04] text-slate-700 border border-white/[0.06] hover:border-white/20'
                          }`}
                        >
                          {rec ? <CheckCircle2 size={14} /> : <Minus size={14} />}
                        </button>
                      </td>
                    );
                  })}
                  <td className="px-3 py-3 text-center">
                    <span className={`text-xs font-black ${
                      studentTotal(name) === 7 ? 'text-emerald-400' :
                      studentTotal(name) >= 4 ? 'text-yellow-400' : 'text-slate-500'
                    }`}>
                      {studentTotal(name)}/7
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button
                      onClick={() => deleteStudent(name)}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Remove student"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={TRAINING_DAYS.length + 3} className="px-4 py-12 text-center text-slate-500 text-sm">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
            {/* Day totals footer */}
            <tfoot className="bg-slate-950/60 border-t border-white/[0.06]">
              <tr>
                <td className="px-4 py-3 sticky left-0 bg-slate-950/60" />
                <td className="px-4 py-3 text-slate-500 text-xs font-bold uppercase tracking-wider sticky left-12 bg-slate-950/60">Total Present</td>
                {TRAINING_DAYS.map((date) => (
                  <td key={date} className="px-3 py-3 text-center">
                    <span className="text-white font-black text-xs">{dayCount(date)}</span>
                    <span className="text-slate-600 text-xs">/{students.length}</span>
                  </td>
                ))}
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── Window Editor Modal ──────────────────────────────────────────── */}
      {editingWindow && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setEditingWindow(null)} />
          <div className="relative bg-slate-900 border border-white/10 rounded-3xl p-8 w-full max-w-sm shadow-2xl">
            <button onClick={() => setEditingWindow(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-500/10 rounded-xl"><Clock size={18} className="text-indigo-400" /></div>
              <div>
                <p className="text-white font-black">Set Attendance Window</p>
                <p className="text-slate-500 text-xs">{dayLabel(editingWindow)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1.5 block">Open Time (WAT)</label>
                <input
                  type="time"
                  value={windowForm.openTime}
                  onChange={(e) => setWindowForm((p) => ({ ...p, openTime: e.target.value }))}
                  className="w-full bg-slate-950 border border-white/[0.07] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1.5 block">Close Time (WAT)</label>
                <input
                  type="time"
                  value={windowForm.closeTime}
                  onChange={(e) => setWindowForm((p) => ({ ...p, closeTime: e.target.value }))}
                  className="w-full bg-slate-950 border border-white/[0.07] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setWindowForm((p) => ({ ...p, isEnabled: !p.isEnabled }))}
                  className={`w-11 h-6 rounded-full border transition-all relative ${windowForm.isEnabled ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${windowForm.isEnabled ? 'left-5' : 'left-0.5'}`} />
                </div>
                <span className="text-slate-300 text-sm font-semibold">Enable attendance for this day</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingWindow(null)}
                className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300 font-semibold text-sm transition-all hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                disabled={savingWindow || !windowForm.openTime || !windowForm.closeTime}
                onClick={saveWindow}
                className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {savingWindow ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Student Modal ────────────────────────────────────────────── */}
      {showAddStudent && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowAddStudent(false)} />
          <div className="relative bg-slate-900 border border-white/10 rounded-3xl p-8 w-full max-w-sm shadow-2xl">
            <button onClick={() => setShowAddStudent(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500/10 rounded-xl"><UserPlus size={18} className="text-emerald-400" /></div>
              <p className="text-white font-black">Add Student</p>
            </div>
            <input
              type="text"
              value={addStudentName}
              onChange={(e) => setAddStudentName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addStudent()}
              placeholder="Full name…"
              className="w-full bg-slate-950 border border-white/[0.07] rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setShowAddStudent(false)} className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300 font-semibold text-sm transition-all hover:bg-white/10">Cancel</button>
              <button
                disabled={!addStudentName.trim() || addingStudent}
                onClick={addStudent}
                className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {addingStudent ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceAdminTab;
