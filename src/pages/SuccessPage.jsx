import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Home, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';

const SuccessPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <Navbar />

      <div className="flex-grow flex items-center justify-center px-4 relative overflow-hidden">
        {/* Confetti / Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-lg w-full bg-slate-900/50 backdrop-blur-xl border border-green-500/30 rounded-3xl p-10 text-center shadow-2xl animate-fade-in-up">

          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
            <CheckCircle size={48} className="text-green-400" />
          </div>

          <h1 className="text-4xl font-black text-white mb-4 tracking-tight">
            YOU ARE IN!
          </h1>

          <p className="text-lg text-slate-300 mb-8 leading-relaxed">
            Payment successful. Your seat at Freedom Ministry Academy has been secured.
          </p>

          <div className="bg-slate-950/50 rounded-xl p-6 mb-8 border border-white/5">
            <p className="text-sm text-slate-400 mb-2">Next Steps:</p>
            <p className="text-white font-medium">
              We have sent a confirmation email to your inbox. It contains your receipt and further instructions.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              to="/"
              className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors flex justify-center items-center gap-2"
            >
              <Home size={18} /> Back to Home
            </Link>
          </div>

        </div>
      </div>

      <footer className="py-6 text-center text-slate-600 text-xs relative z-10">
        <p>&copy; 2026 Freedom Ministry Academy.</p>
      </footer>
    </div>
  );
};

export default SuccessPage;