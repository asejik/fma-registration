import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Trophy, Clock, Target } from 'lucide-react';

const CbtResultsSubmittedPage = () => {
  const { state } = useLocation();
  const { score, correct, total, duration, name } = state || {};

  // Determine grade label
  const getGrade = (s) => {
    if (s >= 90) return { label: 'Distinction', color: 'text-yellow-400' };
    if (s >= 75) return { label: 'Credit', color: 'text-emerald-400' };
    if (s >= 60) return { label: 'Merit', color: 'text-blue-400' };
    if (s >= 50) return { label: 'Pass', color: 'text-indigo-400' };
    return { label: 'Below Pass', color: 'text-red-400' };
  };

  const grade = getGrade(score);

  return (
    <div className="min-h-screen bg-[#06090f] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-900/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-900/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src="/favicon.png" alt="FMA Logo" className="h-14 w-14 rounded-2xl object-cover" />
        </div>

        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <CheckCircle2 size={40} className="text-emerald-400" />
            </div>
          </div>

          <h1 className="text-2xl font-black text-white mb-1">Exam Completed!</h1>
          {name && (
            <p className="text-slate-400 text-sm mb-6">
              Well done, <span className="text-white font-semibold">{name.split(' ')[0]}</span>. Your results have been recorded.
            </p>
          )}

          {/* Score ring */}
          {score !== undefined && (
            <>
              <div className="flex justify-center my-6">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="url(#scoreGrad)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(score / 100) * 263.9} 263.9`}
                    />
                    <defs>
                      <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white">{score}%</span>
                    <span className={`text-xs font-bold ${grade.color}`}>{grade.label}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { icon: <Target size={14} className="text-indigo-400" />, label: 'Correct', value: `${correct}/${total}` },
                  { icon: <Trophy size={14} className="text-yellow-400" />, label: 'Score', value: `${score}%` },
                  { icon: <Clock size={14} className="text-slate-400" />, label: 'Duration', value: duration || 'N/A' },
                ].map((s) => (
                  <div key={s.label} className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-3">
                    <div className="flex justify-center mb-1">{s.icon}</div>
                    <p className="text-white font-black text-sm">{s.value}</p>
                    <p className="text-slate-500 text-[10px] mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          <p className="text-slate-400 text-xs leading-relaxed mb-6">
            Your results have been sent to your exam administrator. You will be contacted with further information.
          </p>

          <Link
            to="/"
            className="block w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3.5 rounded-xl transition-all text-sm"
          >
            Return to Home
          </Link>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Freedom Ministry Academy &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default CbtResultsSubmittedPage;
