import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Home, Mail, Copy, Globe } from 'lucide-react';
import Navbar from '../components/Navbar';

const UKSuccessPage = () => {
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    // alert("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <Navbar />

      <div className="flex-grow flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* UK Theme Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-xl w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl animate-fade-in-up">

          <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-blue-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(220,38,38,0.3)]">
            <Globe size={40} className="text-white" />
          </div>

          <h1 className="text-3xl font-black text-white mb-2 text-center tracking-tight">
            APPLICATION RECEIVED
          </h1>

          <p className="text-slate-300 mb-8 text-center leading-relaxed">
            Please complete your UK registration by making a payment of <strong className="text-white">£20</strong> to the account below.
          </p>

          {/* BANK DETAILS CARD */}
          <div className="bg-slate-950 border border-white/10 rounded-xl pt-16 pb-6 px-6 mb-8 relative group hover:border-blue-500/30 transition-colors overflow-hidden">
            <div className="absolute top-0 right-0 p-3 bg-gradient-to-r from-red-600 to-blue-800 text-white text-xs font-bold rounded-bl-2xl shadow-lg">
              CLC UK ACCOUNT
            </div>

            <div className="space-y-5 text-sm">
              {/* NEW: Account Name */}
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-slate-400 font-medium uppercase tracking-wider text-xs">Account Name</span>
                <span className="text-white font-bold text-base text-right">Citizens of Light Church</span>
              </div>

              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-slate-400 font-medium uppercase tracking-wider text-xs">Bank Name</span>
                <span className="text-white font-bold text-base">Metro Bank</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-slate-400 font-medium uppercase tracking-wider text-xs">Account No</span>
                <div className="flex items-center gap-3">
                  <span className="text-white font-mono font-bold text-xl tracking-widest">53556809</span>
                  <button onClick={() => handleCopy('53556809')} className="p-2 hover:bg-white/10 rounded-lg transition-colors group/btn">
                    <Copy size={16} className="text-slate-400 group-hover/btn:text-blue-400 transition-colors"/>
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-slate-400 font-medium uppercase tracking-wider text-xs">Sort Code</span>
                <div className="flex items-center gap-3">
                  <span className="text-white font-mono font-bold text-xl tracking-widest">230580</span>
                  <button onClick={() => handleCopy('230580')} className="p-2 hover:bg-white/10 rounded-lg transition-colors group/btn">
                    <Copy size={16} className="text-slate-400 group-hover/btn:text-blue-400 transition-colors"/>
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-400 font-medium uppercase tracking-wider text-xs">Reference</span>
                <span className="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-md font-mono font-bold border border-yellow-500/30">"FMA"</span>
              </div>
            </div>
          </div>

          {/* INSTRUCTIONS */}
          <div className="bg-blue-900/20 rounded-xl p-6 mb-8 border border-blue-500/30 flex gap-4 items-start">
            <div className="p-3 bg-blue-500/20 rounded-full shrink-0">
                <Mail size={20} className="text-blue-400" />
            </div>
            <div>
                <h4 className="text-white font-bold mb-2">
                Final Step: Confirmation
                </h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                After transfer, email <strong className="text-white underlineDecoration-blue-500">fmaunitedkingdom@gmail.com</strong> with the <u>Account Name</u> used for the transfer. We will reply to confirm your seat.
                </p>
            </div>
          </div>

          <Link
            to="/"
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 rounded-xl transition-all flex justify-center items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home size={18} /> Back to Home
          </Link>

        </div>
      </div>
    </div>
  );
};

export default UKSuccessPage;