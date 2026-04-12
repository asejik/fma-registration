import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { Lock, Loader2, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const CbtAdminLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setStatus('loading');

    // Basic client-side check to ensure only the specified admin email is used
    if (email.toLowerCase().trim() !== 'admin@fma.com') {
        setErrorMsg('Access denied. This portal is for administrators only.');
        setStatus('error');
        return;
    }

    try {
      await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
      // Success - we'll check the email again in the Dashboard to be safe
      navigate('/cbt/admin');
    } catch (err) {
      console.error(err);
      setErrorMsg('Invalid admin credentials. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#1e1b4b_0%,transparent_50%)] opacity-20 pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-indigo-600/20 rounded-2xl border border-indigo-500/30">
            <ShieldCheck size={40} className="text-indigo-400" />
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          <div className="px-8 pt-8 pb-6 border-b border-white/[0.05] text-center">
            <h1 className="text-2xl font-black text-white tracking-tight">Admin Gateway</h1>
            <p className="text-slate-500 text-sm mt-1">Authorized personnel only.</p>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@fma.com"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500 transition-all text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pr-11 text-white focus:outline-none focus:border-indigo-500 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-300 text-xs leading-relaxed">{errorMsg}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/40"
            >
              {status === 'loading' ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CbtAdminLoginPage;
