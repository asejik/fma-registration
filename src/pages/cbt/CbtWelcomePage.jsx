import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import {
  BookOpen,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Loader2,
  LogOut,
  Lock,
} from 'lucide-react';

const RULES = [
  { icon: '⏱️', text: '25 minutes total time. The exam will auto-submit when time is up.' },
  { icon: '🎯', text: 'Each question carries equal marks. Total score is 60.' },
  { icon: '🔀', text: 'You may navigate back and forth between questions at any time.' },
  { icon: '⚠️', text: 'Do not refresh or close the browser during the exam.' },
  { icon: '💡', text: 'Unanswered questions at the end will count as incorrect.' },
];

const CbtWelcomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        navigate('/cbt/login');
        return;
      }
      setUser(u);

      try {
        let profileDoc = await getDoc(doc(db, 'cbt_users', u.uid));
        let data = profileDoc.exists() ? profileDoc.data() : null;

        // Auto-recovery: If cbt_users profile is missing, try to rebuild from students collection
        if (!data) {
          console.warn('CBT: Profile missing for UID:', u.uid, '. Attempting auto-recovery...');
          const email = (u.email || '').toLowerCase().trim();
          if (email) {
            const q = query(collection(db, 'students'), where('email', '==', email));
            const snap = await getDocs(q);
            if (!snap.empty) {
              const sData = snap.docs[0].data();
              data = {
                uid: u.uid,
                fullName: sData.fullName || u.displayName || 'Participant',
                email: email,
                cohort: sData.cohort || 'Ilorin',
                activated: true,
                createdAt: new Date().toISOString(),
                hasTakenExam: false,
              };
              await setDoc(doc(db, 'cbt_users', u.uid), data, { merge: true });
            }
          }
        }

        if (data) {
          setProfile(data);
          if (data.hasTakenExam) {
            navigate('/cbt/results-submitted');
            return;
          }
        } else {
          // If still no profile found, redirect to activation page
          navigate('/cbt/activate');
          return;
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/cbt/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06090f] flex items-center justify-center">
        <Loader2 size={36} className="text-indigo-400 animate-spin" />
      </div>
    );
  }

  const firstName = (profile?.fullName || user?.displayName || 'Participant').split(' ')[0];
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-[#06090f] flex flex-col px-4 py-10 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-indigo-900/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-900/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto w-full flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <img
              src="/favicon.png"
              alt="FMA Logo"
              className="h-10 w-10 rounded-xl object-cover"
            />
            <div>
              <p className="text-white font-bold text-sm leading-tight">Freedom Ministry Academy</p>
              <p className="text-slate-500 text-xs">CBT Examination Portal</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs transition-colors"
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>

        {/* Welcome message */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 mb-6 backdrop-blur-xl">
          <p className="text-indigo-400 font-semibold text-sm mb-1">{greeting},</p>
          <h1 className="text-3xl font-black text-white mb-1">{firstName} 👋</h1>
          {profile && (
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className="inline-flex items-center gap-1.5 bg-indigo-500/15 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full border border-indigo-500/20">
                {profile.email}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-violet-500/15 text-violet-300 text-xs font-bold px-3 py-1 rounded-full border border-violet-500/20">
                {profile.cohort} Cohort
              </span>
            </div>
          )}
        </div>

        {/* Instructions card */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 mb-6 backdrop-blur-xl flex-1">
          <div className="flex items-center gap-2.5 mb-5">
            <BookOpen size={18} className="text-indigo-400" />
            <h2 className="text-white font-bold text-lg">Exam Instructions</h2>
          </div>

          <ul className="space-y-3.5 mb-6">
            {RULES.map((rule, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-base leading-relaxed shrink-0">{rule.icon}</span>
                <p className="text-slate-300 text-sm leading-relaxed">{rule.text}</p>
              </li>
            ))}
          </ul>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/[0.06]">
            {[
              { label: 'Questions', value: '60', icon: <CheckCircle2 size={14} className="text-emerald-400" /> },
              { label: 'Duration', value: '25 mins', icon: <Clock size={14} className="text-yellow-400" /> },
              { label: 'Total Score', value: '60 Marks', icon: <AlertTriangle size={14} className="text-indigo-400" /> },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4 text-center">
                <div className="flex justify-center mb-2">{stat.icon}</div>
                <p className="text-white font-black text-xl">{stat.value}</p>
                <p className="text-slate-500 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Closed Portal Banner */}
        <div className="w-full bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center space-y-3 shadow-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 text-red-400 mb-1">
            <Lock size={24} />
          </div>
          <h3 className="text-xl font-black text-white">Examination Window Closed</h3>
          <p className="text-slate-300 text-sm leading-relaxed max-w-md mx-auto">
            The official CBT examination period for this cohort has ended. New exam attempts are no longer being accepted.
          </p>
          <p className="text-slate-500 text-xs pt-1">
            If you missed the exam or experienced technical issues, please contact the academy administration.
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-5">
          Freedom Ministry Academy &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default CbtWelcomePage;
