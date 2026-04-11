import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../../services/firebase';
import {
  LogIn,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';

const CbtLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | error
  const [errorMsg, setErrorMsg] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setStatus('loading');

    try {
      await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
      navigate('/cbt/welcome');
    } catch (err) {
      console.error(err);
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        setErrorMsg('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMsg('Too many failed attempts. Please try again later.');
      } else {
        setErrorMsg(err.message || 'Login failed. Please try again.');
      }
      setStatus('error');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMsg('Please enter your email address first.');
      setStatus('error');
      return;
    }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.toLowerCase().trim());
      setResetSent(true);
      setErrorMsg('');
      setStatus('idle');
    } catch (err) {
      setErrorMsg('Could not send reset email. Please check the address and try again.');
      setStatus('error');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06090f] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/favicon.png"
            alt="FMA Logo"
            className="h-16 w-16 rounded-2xl object-cover shadow-lg shadow-indigo-900/40"
          />
        </div>

        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-black/60 overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-white/[0.06]">
            <div className="flex items-center gap-3 mb-1">
              <LogIn size={18} className="text-indigo-400" />
              <span className="text-indigo-400 text-sm font-semibold uppercase tracking-widest">
                FMA CBT Portal
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-2">
              Participant Login
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Sign in to access your Computer-Based Test.
            </p>
          </div>

          <form onSubmit={handleLogin} className="px-8 py-8 space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="yourname@email.com"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 pr-11 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors mt-1"
                >
                  {resetLoading ? 'Sending…' : 'Forgot password?'}
                </button>
              </div>
            </div>

            {/* Reset sent confirmation */}
            {resetSent && (
              <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <p className="text-emerald-300 text-xs">
                  Password reset email sent! Check your inbox.
                </p>
              </div>
            )}

            {/* Error */}
            {(status === 'error' || errorMsg) && !resetSent && (
              <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-red-300 text-xs leading-relaxed">{errorMsg}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/40 text-sm mt-2"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing In…
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Sign In to Exam Portal
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-500 pt-1">
              Don&apos;t have an account?{' '}
              <Link
                to="/cbt/activate"
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
              >
                Activate here
              </Link>
            </p>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Freedom Ministry Academy &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default CbtLoginPage;
