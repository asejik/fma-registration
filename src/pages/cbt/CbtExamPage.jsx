import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import { getRandomQuestions } from '../../data/cbtQuestions';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Send,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

const TOTAL_TIME_SECONDS = 30 * 60; // 30 minutes
const TOTAL_QUESTIONS = 60;
const OPTIONS = ['A', 'B', 'C', 'D'];

// ─── Utility: calculate score ──────────────────────────────────────────────
function calculateScore(questions, answers) {
  let correct = 0;
  questions.forEach((q) => {
    if (answers[q.id] === q.answer) correct++;
  });
  return { correct, total: questions.length, score: correct };
}

// ─── Utility: format seconds ───────────────────────────────────────────────
function formatTime(secs) {
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ─── Component ─────────────────────────────────────────────────────────────
const CbtExamPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { questionId: 'A'|'B'|'C'|'D' }
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME_SECONDS);
  const [examState, setExamState] = useState('loading'); // loading | active | submitting | submitted
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);

  // ── Auth guard + load ────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        navigate('/cbt/login');
        return;
      }
      setUser(u);

      try {
        const profileDoc = await getDoc(doc(db, 'cbt_users', u.uid));
        if (!profileDoc.exists()) {
          navigate('/cbt/login');
          return;
        }
        const data = profileDoc.data();
        setProfile(data);

        if (data.hasTakenExam) {
          navigate('/cbt/results-submitted');
          return;
        }

        // Generate deterministic set of questions per user (seeded by uid)
        // In practice: just use random shuffle — different on each login
        const qs = getRandomQuestions(TOTAL_QUESTIONS, data.cohort);
        setQuestions(qs);

        // Try to restore saved progress from Firestore
        const progressDoc = await getDoc(doc(db, 'cbt_progress', u.uid));
        if (progressDoc.exists()) {
          const saved = progressDoc.data();
          if (saved.answers) setAnswers(saved.answers);
          if (saved.timeLeft && saved.timeLeft > 0) setTimeLeft(saved.timeLeft);
          if (saved.questions && saved.questions.length === TOTAL_QUESTIONS) {
            setQuestions(saved.questions);
          }
        } else {
          // Save the question set so it's the same even if they refresh
          await setDoc(doc(db, 'cbt_progress', u.uid), {
            questions: qs,
            answers: {},
            timeLeft: TOTAL_TIME_SECONDS,
            startedAt: new Date().toISOString(),
          });
        }

        startTimeRef.current = Date.now();
        setExamState('active');
      } catch (err) {
        console.error('Exam load error', err);
        setExamState('active');
      }
    });
    return () => unsub();
  }, [navigate]);

  // ── Timer ─────────────────────────────────────────────────────────────────
  // Use a ref for submitExam to ensure the timer interval always calls the latest version
  // (avoiding stale closure with empty answers)
  const submitExamRef = useRef(submitExam);
  useEffect(() => {
    submitExamRef.current = submitExam;
  }, [submitExam]);

  useEffect(() => {
    if (examState !== 'active') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          submitExamRef.current(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examState]);

  // ── Save progress periodically ────────────────────────────────────────────
  // We use refs for timeLeft and answers to ensure the 15-second interval 
  // is stable and never reset by the 1-second clock ticks.
  const answersRef = useRef(answers);
  const timeLeftRef = useRef(timeLeft);
  
  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);

  useEffect(() => {
    if (examState !== 'active' || !user) return;
    
    const saveProgress = async () => {
      try {
        await updateDoc(doc(db, 'cbt_progress', user.uid), {
          answers: answersRef.current,
          timeLeft: timeLeftRef.current,
        });
      } catch (e) {
        // silent fail
      }
    };

    const interval = setInterval(saveProgress, 15000);
    return () => clearInterval(interval);
  }, [examState, user]);

  // ── Answer selection ──────────────────────────────────────────────────────
  const handleAnswer = useCallback(
    (qId, option) => {
      setAnswers((prev) => ({ ...prev, [qId]: option }));
    },
    []
  );

  // ── Submit ────────────────────────────────────────────────────────────────
  const submitExam = useCallback(
    async (autoSubmit = false) => {
      clearInterval(timerRef.current);
      setExamState('submitting');

      const answersSnapshot = answers; // capture current answers
      const { score, correct } = calculateScore(questions, answersSnapshot);
      const durationMs = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
      const durationSecs = Math.round(durationMs / 1000);
      const minutesTaken = Math.floor(durationSecs / 60);
      const secondsTaken = durationSecs % 60;
      const durationStr = `${minutesTaken}m ${secondsTaken}s`;

      try {
        const u = auth.currentUser;
        const profileData = profile || {};

        // Save result
        const resultData = {
          uid: u?.uid,
          fullName: profileData.fullName || u?.displayName || '',
          email: profileData.email || u?.email || '',
          cohort: profileData.cohort || '',
          score,
          correct,
          totalQuestions: questions.length,
          duration: durationStr,
          durationSeconds: durationSecs,
          submittedAt: new Date().toISOString(),
          // Audit metadata
          integrity: {
            clientStartTime: startTimeRef.current,
            clientFinishTime: Date.now(),
            version: '2.0-secured'
          },
          autoSubmitted: autoSubmit,
          answers: answersSnapshot,
        };

        await setDoc(doc(db, 'cbt_results', u.uid), resultData);

        // Mark user as having taken exam
        await updateDoc(doc(db, 'cbt_users', u.uid), {
          hasTakenExam: true,
          lastScore: score,
        });

        // Clean up progress
        await updateDoc(doc(db, 'cbt_progress', u.uid), {
          completed: true,
        });

        setExamState('submitted');
        // Sign out and redirect to results
        setTimeout(async () => {
          navigate('/cbt/results-submitted', {
            state: { score, correct, total: questions.length, duration: durationStr, name: profileData.fullName },
          });
        }, 1500);
      } catch (err) {
        console.error('Submit error', err);
        setExamState('active');
      }
    },
    [answers, questions, profile, navigate]
  );

  // ── Loading ───────────────────────────────────────────────────────────────
  if (examState === 'loading') {
    return (
      <div className="min-h-screen bg-[#06090f] flex items-center justify-center flex-col gap-4">
        <Loader2 size={40} className="text-indigo-400 animate-spin" />
        <p className="text-slate-400 text-sm">Loading your exam…</p>
      </div>
    );
  }

  if (examState === 'submitting' || examState === 'submitted') {
    return (
      <div className="min-h-screen bg-[#06090f] flex items-center justify-center flex-col gap-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center">
          <CheckCircle2 size={40} className="text-emerald-400" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-white">
            {examState === 'submitted' ? 'Exam Submitted!' : 'Submitting…'}
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            {examState === 'submitted'
              ? 'Redirecting to your results…'
              : 'Please wait, saving your answers…'}
          </p>
        </div>
        <Loader2 size={24} className="text-indigo-400 animate-spin" />
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const isWarning = timeLeft <= 300; // 5 minutes
  const answeredCount = Object.keys(answers).length;
  const progressPct = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-[#06090f] flex flex-col relative overflow-hidden">
      {/* Subtle background */}
      <div className={`absolute inset-0 transition-all duration-1000 pointer-events-none ${isWarning ? 'bg-red-950/20' : 'bg-indigo-950/10'}`} />

      {/* ── TOP BAR ────────────────────────────────────────────────────── */}
      <header className="relative z-20 bg-[#08090f]/90 backdrop-blur-xl border-b border-white/[0.06] px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <img src="/favicon.png" alt="FMA" className="h-8 w-8 rounded-lg object-cover" />
          <div className="hidden sm:block">
            <p className="text-white text-xs font-bold leading-tight">FMA CBT</p>
            <p className="text-slate-500 text-[10px]">
              {profile?.cohort} Cohort
            </p>
          </div>
        </div>

        {/* Timer */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-black text-lg transition-all ${
            isWarning
              ? 'bg-red-500/25 border border-red-500/40 text-red-300 animate-pulse'
              : 'bg-white/[0.05] border border-white/10 text-white'
          }`}
        >
          <Clock size={16} className={isWarning ? 'text-red-400' : 'text-slate-400'} />
          {formatTime(timeLeft)}
          {isWarning && (
            <span className="text-xs font-bold text-red-400 ml-1">⚠ LOW</span>
          )}
        </div>

        {/* Progress info */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-slate-400 text-xs hidden sm:block">
            {answeredCount}/{questions.length} answered
          </span>
          <button
            onClick={() => setShowSubmitConfirm(true)}
            className="flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-600/40 text-emerald-300 text-xs font-bold px-3 py-2 rounded-lg transition-all"
          >
            <Send size={12} />
            <span className="hidden sm:inline">Submit</span>
          </button>
        </div>
      </header>

      {/* ── PROGRESS BAR ───────────────────────────────────────────────── */}
      <div className="relative z-10 bg-[#0a0c13] border-b border-white/[0.04]">
        <div
          className="h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* ── MAIN CONTENT ───────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">

        {/* Question Navigator Dots (mini) */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentIdx(i)}
              title={`Question ${i + 1}`}
              className={`w-6 h-6 rounded-md text-[10px] font-bold transition-all ${
                i === currentIdx
                  ? 'bg-indigo-600 text-white scale-110 shadow-md shadow-indigo-900/60'
                  : answers[q.id]
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-600/30'
                  : 'bg-white/[0.05] text-slate-500 border border-white/[0.06] hover:border-white/20'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Question Card */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl flex-1 flex flex-col">
          {/* Question header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span className="ml-3 text-slate-600 text-xs">{currentQ?.course}</span>
            </div>
          </div>

          {/* Question text */}
          <p className="text-white text-base sm:text-lg font-semibold leading-relaxed mb-8">
            {currentQ?.question}
          </p>

          {/* Options */}
          <div className="space-y-3 flex-1">
            {OPTIONS.map((opt, i) => {
              const optionText = currentQ?.options[i];
              if (!optionText) return null;
              const isSelected = answers[currentQ.id] === opt;

              return (
                <button
                  key={opt}
                  onClick={() => handleAnswer(currentQ.id, opt)}
                  className={`w-full text-left flex items-start gap-4 p-4 rounded-2xl border transition-all group ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-900/30'
                      : 'bg-white/[0.02] border-white/[0.07] hover:bg-white/[0.05] hover:border-white/20'
                  }`}
                >
                  <span
                    className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white/[0.06] text-slate-400 group-hover:bg-white/10'
                    }`}
                  >
                    {opt}
                  </span>
                  <span
                    className={`text-sm leading-relaxed pt-0.5 transition-colors ${
                      isSelected ? 'text-white font-medium' : 'text-slate-300'
                    }`}
                  >
                    {optionText}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-4 mt-6">
          <button
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
            className="flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 text-slate-300 font-semibold px-5 py-3 rounded-xl transition-all text-sm"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <span className="text-slate-500 text-xs">
            {answeredCount} / {questions.length} answered
          </span>

          {currentIdx < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
              className="flex items-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-semibold px-5 py-3 rounded-xl transition-all text-sm"
            >
              Next
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="flex items-center gap-2 bg-emerald-600/25 hover:bg-emerald-600/35 border border-emerald-500/40 text-emerald-300 font-bold px-5 py-3 rounded-xl transition-all text-sm"
            >
              <Send size={14} />
              Submit Exam
            </button>
          )}
        </div>
      </main>

      {/* ── SUBMIT CONFIRMATION MODAL ───────────────────────────────────── */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-[#0e1116] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 rounded-full bg-yellow-500/15 flex items-center justify-center">
                <AlertTriangle size={28} className="text-yellow-400" />
              </div>
            </div>
            <h2 className="text-xl font-black text-white text-center mb-2">
              Submit Exam?
            </h2>
            <p className="text-slate-400 text-sm text-center mb-2">
              You have answered{' '}
              <span className="text-white font-bold">{answeredCount}</span> out of{' '}
              <span className="text-white font-bold">{questions.length}</span> questions.
            </p>
            {answeredCount < questions.length && (
              <p className="text-yellow-400 text-xs text-center mb-4">
                ⚠ {questions.length - answeredCount} question(s) are unanswered and will be marked incorrect.
              </p>
            )}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-slate-300 font-semibold py-3 rounded-xl transition-all text-sm"
              >
                Continue Exam
              </button>
              <button
                onClick={() => {
                  setShowSubmitConfirm(false);
                  submitExam(false);
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all text-sm"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CbtExamPage;
