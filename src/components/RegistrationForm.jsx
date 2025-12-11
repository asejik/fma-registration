import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

// Receive the prop
const RegistrationForm = ({ prefilledCohort }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Added 'setValue' to the destructuring
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm();

  // Watch for changes in prefilledCohort
  useEffect(() => {
    if (prefilledCohort) {
      setValue('cohort', prefilledCohort);
    }
  }, [prefilledCohort, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(db, "registrations"), {
        ...data,
        createdAt: serverTimestamp(),
      });

      await fetch(import.meta.env.VITE_GOOGLE_SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      setIsSuccess(true);
      reset();

    } catch (err) {
      console.error("Error saving document: ", err);
      setError("Something went wrong. Please check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div id="register" className="py-20 px-4 min-h-[600px] flex items-center justify-center bg-slate-950 relative overflow-hidden">
        <div className="relative z-10 max-w-md w-full bg-slate-900/50 backdrop-blur-xl border border-green-500/30 rounded-3xl p-8 text-center shadow-2xl animate-fade-in-up">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400">
            <CheckCircle size={40} />
          </div>
          <h3 className="text-3xl font-bold text-white mb-2">You're on the list!</h3>
          <p className="text-slate-300 mb-8">
            We have received your interest details. Keep an eye on your email for the official registration announcement.
          </p>
          <button
            onClick={() => setIsSuccess(false)}
            className="text-sm text-green-400 font-bold hover:text-green-300 underline underline-offset-4"
          >
            Register another person
          </button>
        </div>
      </div>
    );
  }

  return (
    <section id="register" className="py-24 px-4 bg-slate-950 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">JOIN THE WAITLIST</h2>
          <p className="text-slate-400">
            Secure your spot in line. We will notify you the moment registration opens.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl">

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">Full Name</label>
            <input
              {...register("fullName", { required: "Name is required" })}
              type="text"
              placeholder="e.g. Sogo Ayenigba"
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
            {errors.fullName && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12}/> {errors.fullName.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">Email Address</label>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+$/i, message: "Please enter a valid email" }
              })}
              type="email"
              placeholder="sogo@example.com"
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
            {errors.email && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12}/> {errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">Phone Number</label>
            <input
              {...register("phone", { required: "Phone number is required" })}
              type="tel"
              placeholder="080 1234 5678"
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
            {errors.phone && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12}/> {errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">Preferred Cohort</label>
            <div className="relative">
              <select
                {...register("cohort", { required: "Please select a cohort" })}
                className="w-full appearance-none bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              >
                <option value="">Select a location...</option>
                <option value="Lagos">Cohort 1: Lagos (March)</option>
                <option value="Ilorin">Cohort 2: Ilorin (July)</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                ▼
              </div>
            </div>
            {errors.cohort && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12}/> {errors.cohort.message}</p>}
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Processing...
              </>
            ) : (
              "NOTIFY ME"
            )}
          </button>

          <p className="text-center text-xs text-slate-500 mt-4">
            By registering, you agree to receive FMA updates.
          </p>

        </form>
      </div>
    </section>
  );
};

export default RegistrationForm;