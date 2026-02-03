import React, { useState, useEffect } from 'react';
import { PaystackButton } from 'react-paystack';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowLeft, Globe } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSaving, setIsSaving] = useState(false);

  // CONFIGURATION
  const AMOUNT_NGN = 20000;
  const PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzfpjqsOc92UOMikXJH9z7kiPJH48EI3bhu3mHGoVaHC4Plha4HIiqyIsQciBxOJcZqbQ/exec";

  const initialCohort = searchParams.get('cohort') || 'Lagos';

  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', address: '',
    city: '', maritalStatus: '', occupation: '',
    cohort: initialCohort
  });

  // Helper to check if UK is selected
  const isUK = formData.cohort === 'UK';

  useEffect(() => {
    const cohortParam = searchParams.get('cohort');
    if (cohortParam) setFormData(prev => ({ ...prev, cohort: cohortParam }));
  }, [searchParams]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- 1. PAYSTACK SUCCESS (LAGOS/ILORIN) ---
  const handlePaystackSuccess = async (reference) => {
    await saveRegistration({
      ...formData,
      paymentReference: reference.reference,
      amountPaid: AMOUNT_NGN,
      status: 'paid', // Auto-verified
      currency: 'NGN'
    }, '/success');
  };

  // --- 2. MANUAL SUBMIT (UK) ---
  const handleUKSubmit = async (e) => {
    e.preventDefault();
    // Validate fields manually since we aren't using Paystack's form validation
    if(!formData.fullName || !formData.email || !formData.phone) {
        alert("Please fill in all required fields.");
        return;
    }

    await saveRegistration({
      ...formData,
      paymentReference: 'PENDING_TRANSFER',
      amountPaid: 20,
      status: 'pending', // Manual verification needed
      currency: 'GBP'
    }, '/uk-success'); // Redirect to new UK page
  };

  // --- SHARED SAVE LOGIC ---
  const saveRegistration = async (dataToSave, redirectPath) => {
    setIsSaving(true);
    const finalData = { ...dataToSave, dateString: new Date().toISOString() };

    try {
      await addDoc(collection(db, "students"), {
        ...finalData,
        registeredAt: serverTimestamp()
      });

      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData)
      });

      navigate(redirectPath);

    } catch (error) {
      console.error(error);
      setIsSaving(false);
      alert("Error saving registration. Please check your connection.");
    }
  };

  const componentProps = {
    email: formData.email,
    amount: AMOUNT_NGN * 100,
    publicKey: PUBLIC_KEY,
    subaccount: "ACCT_cpxpivjkswnoekf", // Your Subaccount Code
    text: "PAY ₦" + AMOUNT_NGN.toLocaleString(),
    onSuccess: handlePaystackSuccess,
    onClose: () => console.log("Closed"),
    metadata: { custom_fields: [{ display_name: "Cohort", variable_name: "cohort", value: formData.cohort }] }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-20 px-4 flex justify-center items-center relative overflow-hidden">

      <Link to="/" className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 transition-colors z-20">
        <ArrowLeft size={20} /> Back to Home
      </Link>

      {/* Processing Overlay */}
      {isSaving && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center z-[100]">
            <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
            <h3 className="text-xl font-bold text-white">Processing Registration...</h3>
        </div>
      )}

      {/* Background */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">

        <div className="bg-gradient-to-r from-blue-900/50 to-slate-900/50 p-8 border-b border-white/5 text-center">
            <h1 className="text-3xl font-black text-white tracking-tight">STUDENT REGISTRATION</h1>
            <p className="text-slate-400 mt-2">Secure your seat for the upcoming cohort.</p>
        </div>

        <div className="p-8 md:p-10 space-y-8">
            {/* Same Inputs as before (Name, Email, Phone, etc.) */}
            <div className="grid md:grid-cols-2 gap-4">
                <input name="fullName" value={formData.fullName} onChange={handleInputChange} required type="text" className="bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none" placeholder="Full Name" />
                <input name="email" value={formData.email} onChange={handleInputChange} required type="email" className="bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none" placeholder="Email Address" />
                <input name="phone" value={formData.phone} onChange={handleInputChange} required type="tel" className="bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none" placeholder="Phone Number" />
                <select name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange} required className="bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none">
                    <option value="">Marital Status...</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Engaged">Engaged</option>
                </select>
            </div>

            <div className="space-y-2">
                 <input name="occupation" value={formData.occupation} onChange={handleInputChange} required type="text" className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none" placeholder="What do you do?" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <input name="city" value={formData.city} onChange={handleInputChange} required type="text" className="bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none" placeholder="City" />
                <input name="address" value={formData.address} onChange={handleInputChange} required type="text" className="bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none" placeholder="Address" />
            </div>

            {/* UPDATED COHORT SELECTION (3 GRID ITEMS) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Lagos', 'Ilorin'].map((c) => (
                    <label key={c} className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-1 transition-all ${formData.cohort === c ? 'bg-blue-600/20 border-blue-500' : 'bg-slate-950 border-white/10 hover:border-white/30'}`}>
                        <input type="radio" name="cohort" value={c} checked={formData.cohort === c} onChange={handleInputChange} className="hidden" />
                        <span className="font-bold text-white uppercase">{c}</span>
                        <span className="text-[10px] text-slate-400">{c === 'Lagos' ? 'March' : 'July'} 2026</span>
                    </label>
                ))}

                {/* UK OPTION */}
                <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-1 transition-all ${isUK ? 'bg-red-600/20 border-red-500' : 'bg-slate-950 border-white/10 hover:border-white/30'}`}>
                    <input type="radio" name="cohort" value="UK" checked={isUK} onChange={handleInputChange} className="hidden" />
                    <span className="font-bold text-white flex items-center gap-2"><Globe size={14}/> UK</span>
                    <span className="text-[10px] text-slate-400">May 2026</span>
                </label>
            </div>

            {/* DYNAMIC ACTION BUTTON */}
            {isUK ? (
                // UK: MANUAL SUBMIT BUTTON
                <button
                    onClick={handleUKSubmit}
                    className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-black text-lg py-5 rounded-xl shadow-lg transform transition-all active:scale-[0.98] flex justify-center items-center gap-3"
                >
                    SUBMIT REGISTRATION (£20)
                </button>
            ) : (
                // NIGERIA: PAYSTACK BUTTON
                <div className="space-y-2">
                    <PaystackButton
                        {...componentProps}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-lg py-5 rounded-xl shadow-lg transform transition-all active:scale-[0.98] flex justify-center items-center gap-3"
                    />
                    <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                        <AlertCircle size={12}/> Secured by Paystack
                    </p>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;