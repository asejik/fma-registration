import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  setDoc,
} from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import {
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';

const COHORTS = ['Lagos', 'Ilorin', 'UK'];

const CbtActivatePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    cohort: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.email || !formData.cohort || !formData.password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setStatus('loading');

    try {
      // 1. Verify the participant exists in Firestore (students collection)
      const studentsRef = collection(db, 'students');
      const q = query(
        studentsRef,
        where('email', '==', formData.email.toLowerCase().trim()),
        where('cohort', '==', formData.cohort)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setErrorMsg(
          'No registration found for this email and cohort. Please ensure you used your registered email and selected the correct cohort.'
        );
        setStatus('error');
        return;
      }

      // 2. Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email.toLowerCase().trim(),
        formData.password
      );
      const user = userCredential.user;

      // 3. Get fullName from the student record
      const studentDoc = snapshot.docs[0].data();

      // 4. Update auth display name
      await updateProfile(user, { displayName: studentDoc.fullName || '' });

      // 5. Save CBT user profile in Firestore
      await setDoc(doc(db, 'cbt_users', user.uid), {
        uid: user.uid,
        fullName: studentDoc.fullName || '',
        email: formData.email.toLowerCase().trim(),
        cohort: formData.cohort,
        activated: true,
        createdAt: new Date().toISOString(),
        hasTakenExam: false,
      });

      // 6. Mark activation on the student record
      await updateDoc(snapshot.docs[0].ref, { cbtActivated: true });

      setStatus('success');
      setTimeout(() => navigate('/cbt/login'), 2500);
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg(
          'An account already exists for this email. Please log in instead.'
        );
      } else if (err.code === 'auth/invalid-email') {
        setErrorMsg('Please enter a valid email address.');
      } else {
        setErrorMsg(
          err.message || 'An error occurred. Please try again.'
        );
      }
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#06090f] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

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
              <ShieldCheck size={20} className="text-indigo-400" />
              <span className="text-indigo-400 text-sm font-semibold uppercase tracking-widest">
                FMA CBT Portal
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-2">
              Activate CBT Account
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Use your registered email address to set up your exam account.
            </p>
          </div>

          {/* Success State */}
          {status === 'success' ? (
            <div className="px-8 py-12 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Account Activated!</h2>
              <p className="text-slate-400 text-sm">
                Your CBT account has been activated. Redirecting you to the login
                page…
              </p>
              <div className="w-8 h-1 rounded-full bg-indigo-500 animate-pulse mt-2" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Registered Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="yourname@email.com"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
                />
              </div>

              {/* Cohort */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Cohort
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {COHORTS.map((c) => (
                    <label
                      key={c}
                      className={`cursor-pointer border rounded-xl py-2.5 flex items-center justify-center text-sm font-bold transition-all ${
                        formData.cohort === c
                          ? 'bg-indigo-600/25 border-indigo-500 text-white'
                          : 'bg-white/[0.03] border-white/10 text-slate-400 hover:border-white/25'
                      }`}
                    >
                      <input
                        type="radio"
                        name="cohort"
                        value={c}
                        checked={formData.cohort === c}
                        onChange={handleChange}
                        className="hidden"
                      />
                      {c}
                    </label>
                  ))}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Create Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Minimum 6 characters"
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
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Re-enter your password"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 pr-11 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {(status === 'error' || errorMsg) && (
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
                    Activating Account…
                  </>
                ) : (
                  <>
                    Activate My Account
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-500 pt-1">
                Already activated?{' '}
                <Link
                  to="/cbt/login"
                  className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                >
                  Log in here
                </Link>
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Freedom Ministry Academy &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default CbtActivatePage;
