import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../../services/firebase';
import { collection, getDocs, query, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import {
  Users,
  Search,
  Filter,
  Download,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  LogOut,
  ShieldCheck,
  Trash2,
  RotateCcw,
  AlertTriangle,
  X
} from 'lucide-react';

// ─── CSV Export ────────────────────────────────────────────────────────────
function exportCSV(data) {
  const headers = ['#', 'Full Name', 'Email', 'Cohort', 'Score (/60)', 'Duration', 'Date', 'Time', 'Auto Submitted'];
  const rows = data.map((r, i) => {
    const dt = r.submittedAt ? new Date(r.submittedAt) : null;
    return [
      i + 1,
      `"${r.fullName || ''}"`,
      `"${r.email || ''}"`,
      r.cohort || '',
      r.score ?? '',
      `"${r.duration || ''}"`,
      dt ? dt.toLocaleDateString() : '',
      dt ? dt.toLocaleTimeString() : '',
      r.autoSubmitted ? 'Yes' : 'No',
    ].join(',');
  });
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `FMA_CBT_Results_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Excel-like TSV Export (opens in Excel) ────────────────────────────────
function exportExcel(data) {
  const headers = ['#', 'Full Name', 'Email', 'Cohort', 'Score (/60)', 'Duration', 'Date', 'Time', 'Auto Submitted'];
  const rows = data.map((r, i) => {
    const dt = r.submittedAt ? new Date(r.submittedAt) : null;
    return [
      i + 1,
      r.fullName || '',
      r.email || '',
      r.cohort || '',
      r.score ?? '',
      r.duration || '',
      dt ? dt.toLocaleDateString() : '',
      dt ? dt.toLocaleTimeString() : '',
      r.autoSubmitted ? 'Yes' : 'No',
    ].join('\t');
  });
  const tsv = [headers.join('\t'), ...rows].join('\n');
  const blob = new Blob([tsv], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `FMA_CBT_Results_${new Date().toISOString().slice(0, 10)}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── PDF Print ────────────────────────────────────────────────────────────
function exportPDF(data) {
  const rows = data.map((r, i) => {
    const dt = r.submittedAt ? new Date(r.submittedAt) : null;
    return `
      <tr>
        <td>${i + 1}</td>
        <td>${r.fullName || '-'}</td>
        <td>${r.email || '-'}</td>
        <td>${r.cohort || '-'}</td>
        <td style="font-weight:bold">${r.score ?? '-'} / 60</td>
        <td>${r.duration || '-'}</td>
        <td>${dt ? dt.toLocaleDateString() : '-'} ${dt ? dt.toLocaleTimeString() : ''}</td>
        <td>${r.autoSubmitted ? 'Auto' : 'Manual'}</td>
      </tr>`;
  }).join('');

  const html = `
    <!DOCTYPE html><html><head>
    <title>FMA CBT Results</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 11px; padding: 20px; }
      h1 { font-size: 18px; margin-bottom: 4px; }
      p { color: #666; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #1e1b4b; color: white; padding: 8px 6px; text-align: left; font-size: 10px; text-transform: uppercase; }
      td { padding: 7px 6px; border-bottom: 1px solid #eee; }
      tr:nth-child(even) td { background: #f8f8ff; }
    </style>
    </head><body>
    <h1>FMA CBT Examination Results</h1>
    <p>Generated: ${new Date().toLocaleString()} &mdash; Total Participants: ${data.length}</p>
    <table>
      <thead><tr>
        <th>#</th><th>Name</th><th>Email</th><th>Cohort</th>
        <th>Score (/60)</th><th>Duration</th><th>Date & Time</th><th>Submit Type</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    </body></html>`;

  const printWin = window.open('', '_blank');
  printWin.document.write(html);
  printWin.document.close();
  printWin.focus();
  setTimeout(() => printWin.print(), 400);
}

// ─── Component ─────────────────────────────────────────────────────────────
const COHORTS = ['All', 'Lagos', 'Ilorin', 'UK'];

const CbtAdminDashboard = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [search, setSearch] = useState('');
  const [cohortFilter, setCohortFilter] = useState('All');
  const [sortField, setSortField] = useState('submittedAt');
  const [sortDir, setSortDir] = useState('desc');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, result: null, loading: false });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && user.email === 'admin@fma.com') {
        setIsAdmin(true);
        setAuthLoading(false);
      } else {
        navigate('/cbt/admin-login');
      }
    });
    return () => unsub();
  }, [navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchResults = async () => {
      try {
        const q = query(collection(db, 'cbt_results'), orderBy('submittedAt', 'desc'));
        const snap = await getDocs(q);
        setResults(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [isAdmin]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/cbt/admin-login');
  };

  // ── Filter + Sort ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let data = [...results];

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (r) =>
          (r.fullName || '').toLowerCase().includes(q) ||
          (r.email || '').toLowerCase().includes(q)
      );
    }
    if (cohortFilter !== 'All') data = data.filter((r) => r.cohort === cohortFilter);

    data.sort((a, b) => {
      let av = a[sortField] ?? '';
      let bv = b[sortField] ?? '';
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  }, [results, search, cohortFilter, sortField, sortDir]);

  // ── Stats (Dynamic: changes as filters change) ────────────────────────
  const stats = useMemo(() => {
    if (!filtered.length) return { total: 0, avg: 0, highest: 0 };
    const avg = (filtered.reduce((a, r) => a + (r.score || 0), 0) / filtered.length).toFixed(1);
    const highest = Math.max(...filtered.map((r) => r.score || 0));
    return { total: filtered.length, avg, highest };
  }, [filtered]);


  const handleDelete = (result) => {
    setDeleteModal({ show: true, result, loading: false });
  };

  const confirmDelete = async () => {
    const { result } = deleteModal;
    if (!result) return;

    try {
      setDeleteModal(prev => ({ ...prev, loading: true }));
      const uid = result.uid || result.id;
      
      await deleteDoc(doc(db, 'cbt_results', uid));
      await updateDoc(doc(db, 'cbt_users', uid), {
        hasTakenExam: false,
        lastScore: null
      });

      try {
          await deleteDoc(doc(db, 'cbt_progress', uid));
      } catch (e) { /* ignore */ }

      setResults(prev => prev.filter(r => (r.uid || r.id) !== uid));
      setDeleteModal({ show: false, result: null, loading: false });
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete. Please check your connection.');
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ field }) =>
    sortField === field ? (
      sortDir === 'asc' ? (
        <ChevronUp size={12} className="text-indigo-400" />
      ) : (
        <ChevronDown size={12} className="text-indigo-400" />
      )
    ) : (
      <ChevronDown size={12} className="text-slate-600" />
    );

  // ── Early Returns (AFTER hooks) ─────────────────────────────────────────
  if (authLoading || (isAdmin && loading)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Securing session...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-8">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src="/favicon.png" alt="FMA" className="h-10 w-10 rounded-xl object-cover" />
            <div>
              <h1 className="text-xl font-black text-white">FMA CBT Results</h1>
              <p className="text-slate-500 text-xs">Examination Administration Dashboard</p>
            </div>
          </div>

          {/* Export dropdown */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold px-4 py-2.5 rounded-xl transition-all text-sm"
            >
              <LogOut size={15} />
              Logout
            </button>
            <div className="relative">
              <button
                onClick={() => setShowExportMenu((v) => !v)}
                className="flex items-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-semibold px-4 py-2.5 rounded-xl transition-all text-sm"
              >
                <Download size={15} />
                Export Results
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-[#0e1116] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                  {[
                    { label: 'Export as CSV', icon: <FileText size={13} />, action: () => { exportCSV(filtered); setShowExportMenu(false); } },
                    { label: 'Export as Excel', icon: <FileSpreadsheet size={13} />, action: () => { exportExcel(filtered); setShowExportMenu(false); } },
                    { label: 'Print / PDF', icon: <Download size={13} />, action: () => { exportPDF(filtered); setShowExportMenu(false); } },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors text-left"
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats Grid ─────────────────────────────────────────────── */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { title: 'Total Participants', value: stats.total, icon: <Users size={20} />, color: 'text-blue-400 bg-blue-500/10' },
              { title: 'Average Score', value: stats.avg, icon: <TrendingUp size={20} />, color: 'text-indigo-400 bg-indigo-500/10' },
              { title: 'Highest Score', value: stats.highest, icon: <Award size={20} />, color: 'text-yellow-400 bg-yellow-500/10' },
            ].map((s) => (
              <div key={s.title} className="bg-slate-900 border border-white/[0.05] rounded-2xl p-6 flex items-center gap-5">
                <div className={`p-3.5 rounded-2xl ${s.color}`}>{s.icon}</div>
                <div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{s.title}</p>
                  <p className="text-3xl font-black text-white mt-1">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Filters ──────────────────────────────────────────────────── */}
        <div className="bg-slate-900 border border-white/[0.05] rounded-2xl p-5 flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full bg-slate-950 border border-white/[0.06] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Cohort filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-500 shrink-0" />
            <select
              value={cohortFilter}
              onChange={(e) => setCohortFilter(e.target.value)}
              className="bg-slate-950 border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              {COHORTS.map((c) => <option key={c} value={c}>{c === 'All' ? 'All Cohorts' : c}</option>)}
            </select>
          </div>

          <span className="text-slate-500 text-xs ml-auto">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ── Table ────────────────────────────────────────────────────── */}
        <div className="bg-slate-900 border border-white/[0.05] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider">
                <tr>
                  {[
                    { label: '#', field: null },
                    { label: 'Name', field: 'fullName' },
                    { label: 'Email', field: 'email' },
                    { label: 'Cohort', field: 'cohort' },
                    { label: 'Score (/60)', field: 'score' },
                    { label: 'Duration', field: 'durationSeconds' },
                    { label: 'Date & Time', field: 'submittedAt' },
                    { label: 'Submit', field: null },
                    { label: 'Actions', field: null },
                  ].map((col) => (
                    <th
                      key={col.label}
                      onClick={() => col.field && toggleSort(col.field)}
                      className={`px-4 py-3 text-left font-semibold ${col.field ? 'cursor-pointer hover:text-white transition-colors select-none' : ''}`}
                    >
                      <span className="flex items-center gap-1">
                        {col.label}
                        {col.field && <SortIcon field={col.field} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((r, i) => {
                  const dt = r.submittedAt ? new Date(r.submittedAt) : null;
                  return (
                    <tr key={r.id} className="hover:bg-white/[0.025] transition-colors">
                      <td className="px-4 py-3.5 text-slate-400 font-mono text-xs">{i + 1}</td>
                      <td className="px-4 py-3.5 text-white font-semibold">{r.fullName || '-'}</td>
                      <td className="px-4 py-3.5 text-slate-400">{r.email || '-'}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                          r.cohort === 'Lagos' ? 'bg-blue-500/15 text-blue-300' :
                          r.cohort === 'UK' ? 'bg-red-500/15 text-red-300' :
                          'bg-purple-500/15 text-purple-300'
                        }`}>
                          {r.cohort || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-base font-black ${(r.score || 0) >= 30 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {r.score ?? '-'}<span className="text-[10px] text-slate-500 ml-0.5">/ 60</span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-xs">
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {r.duration || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-xs">
                        {dt ? (
                          <div>
                            <div>{dt.toLocaleDateString()}</div>
                            <div className="text-slate-600">{dt.toLocaleTimeString()}</div>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${r.autoSubmitted ? 'bg-orange-500/15 text-orange-300' : 'bg-slate-700/50 text-slate-400'}`}>
                          {r.autoSubmitted ? 'Auto' : 'Manual'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => handleDelete(r)}
                          title="Delete result & reset user status"
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-slate-500 text-sm">
                      No results found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── CUSTOM DELETE MODAL ─────────────────────────────────────── */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => !deleteModal.loading && setDeleteModal({ show: false, result: null, loading: false })}
          />
          
          <div className="relative bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 fade-in duration-300">
            <button 
              onClick={() => setDeleteModal({ show: false, result: null, loading: false })}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-red-500/15 border border-red-500/20 flex items-center justify-center mb-6">
                <AlertTriangle size={40} className="text-red-500" />
              </div>

              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Are you sure?</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                You are about to delete the result for <span className="text-white font-bold">{deleteModal.result?.fullName}</span>. 
                This will reset their exam status and allow them to <span className="text-red-400 font-bold underline decoration-red-500/30">retake the test</span> immediately.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  disabled={deleteModal.loading}
                  onClick={() => setDeleteModal({ show: false, result: null, loading: false })}
                  className="flex-1 px-6 py-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 font-bold text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  disabled={deleteModal.loading}
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-sm transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
                >
                  {deleteModal.loading ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Yes, Delete & Reset"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CbtAdminDashboard;
