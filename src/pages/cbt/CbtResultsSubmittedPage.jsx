import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Home } from 'lucide-react';

const CbtResultsSubmittedPage = () => {
  const { state } = useLocation();
  const { name } = state || {};

  return (
    <div className="min-h-screen bg-[#06090f] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-900/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-900/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src="/favicon.png" alt="FMA Logo" className="h-16 w-16 rounded-2xl object-cover shadow-2xl" />
        </div>

        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-3xl">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 size={48} className="text-emerald-400" />
            </div>
          </div>

          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Exam Completed!</h1>
          
          <div className="space-y-4 mb-8">
            <p className="text-slate-300 text-base leading-relaxed">
              Well done, <span className="text-white font-bold">{name?.split(' ')[0] || 'Candidate'}</span>. 
              Your examination has been successfully submitted and recorded.
            </p>
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />
            <p className="text-slate-500 text-sm">
              Your results have been securely sent to the Academy administration for review. 
              You will be contacted via your registered email with further instructions.
            </p>
          </div>

          <Link
            to="/"
            className="group flex items-center justify-center gap-2 w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-[0.98]"
          >
            <Home size={18} className="transition-transform group-hover:-translate-y-0.5" />
            Return to Home
          </Link>
        </div>

        <p className="text-center text-xs text-slate-600 mt-8 font-medium">
          Freedom Ministry Academy &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default CbtResultsSubmittedPage;
