import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../services/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
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
} from 'lucide-react';

// ─── CSV Export ────────────────────────────────────────────────────────────
function exportCSV(data) {
  const headers = ['#', 'Full Name', 'Email', 'Cohort', 'Score (%)', 'Correct', 'Total Q', 'Duration', 'Date', 'Time', 'Auto Submitted'];
  const rows = data.map((r, i) => {
    const dt = r.submittedAt ? new Date(r.submittedAt) : null;
    return [
      i + 1,
      `"${r.fullName || ''}"`,
      `"${r.email || ''}"`,
      r.cohort || '',
      r.score ?? '',
      r.correct ?? '',
      r.totalQuestions ?? '',
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
  const headers = ['#', 'Full Name', 'Email', 'Cohort', 'Score (%)', 'Correct', 'Total Q', 'Duration', 'Date', 'Time', 'Auto Submitted'];
  const rows = data.map((r, i) => {
    const dt = r.submittedAt ? new Date(r.submittedAt) : null;
    return [
      i + 1,
      r.fullName || '',
      r.email || '',
      r.cohort || '',
      r.score ?? '',
      r.correct ?? '',
      r.totalQuestions ?? '',
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
        <td style="font-weight:bold;color:${r.score >= 50 ? '#16a34a' : '#dc2626'}">${r.score ?? '-'}%</td>
        <td>${r.correct ?? '-'} / ${r.totalQuestions ?? '-'}</td>
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
        <th>Score</th><th>Correct</th><th>Duration</th><th>Date & Time</th><th>Submit Type</th>
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

// ─── Grade helper ─────────────────────────────────────────────────────────
function gradeLabel(score) {
  if (score >= 90) return { label: 'Distinction', cls: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/25' };
  if (score >= 75) return { label: 'Credit', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' };
  if (score >= 60) return { label: 'Merit', cls: 'bg-blue-500/15 text-blue-300 border-blue-500/25' };
  if (score >= 50) return { label: 'Pass', cls: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25' };
  return { label: 'Fail', cls: 'bg-red-500/15 text-red-300 border-red-500/25' };
}

const COHORTS = ['All', 'Lagos', 'Ilorin', 'UK'];
const GRADES = ['All', 'Distinction', 'Credit', 'Merit', 'Pass', 'Fail'];

// ─── Component ─────────────────────────────────────────────────────────────
const CbtAdminDashboard = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cohortFilter, setCohortFilter] = useState('All');
  const [gradeFilter, setGradeFilter] = useState('All');
  const [sortField, setSortField] = useState('submittedAt');
  const [sortDir, setSortDir] = useState('desc');
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
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
  }, []);

  // ── Stats ──────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!results.length) return null;
    const avg = Math.round(results.reduce((a, r) => a + (r.score || 0), 0) / results.length);
    const highest = Math.max(...results.map((r) => r.score || 0));
    const passed = results.filter((r) => (r.score || 0) >= 50).length;
    return { total: results.length, avg, highest, passed };
  }, [results]);

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
    if (gradeFilter !== 'All') {
      data = data.filter((r) => gradeLabel(r.score || 0).label === gradeFilter);
    }

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
  }, [results, search, cohortFilter, gradeFilter, sortField, sortDir]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading CBT Results…
      </div>
    );
  }

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

        {/* ── Stats Grid ─────────────────────────────────────────────── */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Total Participants', value: stats.total, icon: <Users size={20} />, color: 'text-blue-400 bg-blue-500/10' },
              { title: 'Average Score', value: `${stats.avg}%`, icon: <TrendingUp size={20} />, color: 'text-indigo-400 bg-indigo-500/10' },
              { title: 'Highest Score', value: `${stats.highest}%`, icon: <Award size={20} />, color: 'text-yellow-400 bg-yellow-500/10' },
              { title: 'Passed (≥50%)', value: stats.passed, icon: <CheckCircle2 size={20} />, color: 'text-emerald-400 bg-emerald-500/10' },
            ].map((s) => (
              <div key={s.title} className="bg-slate-900 border border-white/[0.05] rounded-2xl p-5 flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${s.color}`}>{s.icon}</div>
                <div>
                  <p className="text-slate-400 text-xs">{s.title}</p>
                  <p className="text-2xl font-black text-white">{s.value}</p>
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

          {/* Grade filter */}
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="bg-slate-950 border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            {GRADES.map((g) => <option key={g} value={g}>{g === 'All' ? 'All Grades' : g}</option>)}
          </select>

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
                    { label: 'Score', field: 'score' },
                    { label: 'Grade', field: null },
                    { label: 'Correct', field: 'correct' },
                    { label: 'Duration', field: 'durationSeconds' },
                    { label: 'Date & Time', field: 'submittedAt' },
                    { label: 'Submit', field: null },
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
                  const grade = gradeLabel(r.score || 0);
                  return (
                    <tr key={r.id} className="hover:bg-white/[0.025] transition-colors">
                      <td className="px-4 py-3.5 text-slate-500 font-mono text-xs">{i + 1}</td>
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
                        <span className={`text-base font-black ${(r.score || 0) >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {r.score ?? '-'}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-bold px-2 py-1 rounded-md border ${grade.cls}`}>
                          {grade.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-xs">
                        {r.correct ?? '-'} / {r.totalQuestions ?? '-'}
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
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-slate-500 text-sm">
                      No results found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CbtAdminDashboard;
