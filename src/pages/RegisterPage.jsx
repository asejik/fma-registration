import React, { useState, useEffect } from 'react'; // Added useEffect
import { PaystackButton } from 'react-paystack';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, Link, useSearchParams } from 'react-router-dom'; // Added useSearchParams
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // Hook to read URL params
  const [isSaving, setIsSaving] = useState(false);

  // CONFIGURATION
  const AMOUNT = 20000;
  const PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzfpjqsOc92UOMikXJH9z7kiPJH48EI3bhu3mHGoVaHC4Plha4HIiqyIsQciBxOJcZqbQ/exec";

  // Determine initial cohort from URL (Default to Lagos if empty)
  const initialCohort = searchParams.get('cohort') === 'Ilorin' ? 'Ilorin' : 'Lagos';

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    maritalStatus: '',
    occupation: '',
    cohort: initialCohort // <--- USES THE URL VALUE NOW
  });

  // Update state if URL changes while on the page
  useEffect(() => {
    const cohortParam = searchParams.get('cohort');
    if (cohortParam && (cohortParam === 'Lagos' || cohortParam === 'Ilorin')) {
      setFormData(prev => ({ ...prev, cohort: cohortParam }));
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSuccess = async (reference) => {
    setIsSaving(true);

    const finalData = {
        ...formData,
        paymentReference: reference.reference,
        amountPaid: AMOUNT,
        status: 'paid',
        dateString: new Date().toISOString()
    };

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

      navigate('/success');

    } catch (error) {
      console.error(error);
      setIsSaving(false);
      alert("Error saving registration. Please contact admin.");
    }
  };

  const componentProps = {
    email: formData.email,
    amount: AMOUNT * 100,
    publicKey: PUBLIC_KEY,
    subaccount: "ACCT_cpxpivjkswnoekf", // Your Subaccount Code
    text: "PAY ₦" + AMOUNT.toLocaleString(),
    onSuccess: handleSuccess,
    onClose: () => console.log("Closed"),
    metadata: {
        custom_fields: [
            { display_name: "Phone", variable_name: "phone", value: formData.phone },
            { display_name: "Cohort", variable_name: "cohort", value: formData.cohort }
        ]
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-20 px-4 flex justify-center items-center relative overflow-hidden">

      <Link to="/" className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 transition-colors z-20">
        <ArrowLeft size={20} /> Back to Home
      </Link>

      {isSaving && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl flex flex-col items-center shadow-2xl">
                <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
                <h3 className="text-xl font-bold text-white">Processing Registration...</h3>
                <p className="text-slate-400 text-sm mt-2">Please do not close this window.</p>
            </div>
        </div>
      )}

      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">

        <div className="bg-gradient-to-r from-blue-900/50 to-slate-900/50 p-8 border-b border-white/5 text-center">
            <h1 className="text-3xl font-black text-white tracking-tight">STUDENT REGISTRATION</h1>
            <p className="text-slate-400 mt-2">Secure your seat for the upcoming cohort.</p>
        </div>

        <div className="p-8 md:p-10 space-y-8">

            <div className="grid md:grid-cols-2 gap-4">
                <input name="fullName" onChange={handleInputChange} required type="text" className="bg-slate-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500" placeholder="Full Name" />
                <input name="email" onChange={handleInputChange} required type="email" className="bg-slate-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500" placeholder="Email Address" />
                <input name="phone" onChange={handleInputChange} required type="tel" className="bg-slate-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500" placeholder="Phone Number" />
                <select name="maritalStatus" onChange={handleInputChange} required className="bg-slate-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500">
                    <option value="">Marital Status...</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Engaged">Engaged</option>
                </select>
            </div>

            <div className="space-y-2">
                 <input name="occupation" onChange={handleInputChange} required type="text" className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500" placeholder="What do you do?" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <input name="city" onChange={handleInputChange} required type="text" className="bg-slate-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500" placeholder="City" />
                <input name="address" onChange={handleInputChange} required type="text" className="bg-slate-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500" placeholder="Address" />
            </div>

            {/* COHORT SELECTION: Now controlled by state */}
            <div className="grid grid-cols-2 gap-4">
                <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${formData.cohort === 'Lagos' ? 'bg-blue-600/20 border-blue-500' : 'bg-slate-950 border-white/10 hover:border-white/30'}`}>
                    <input type="radio" name="cohort" value="Lagos" checked={formData.cohort === 'Lagos'} onChange={handleInputChange} className="hidden" />
                    <span className="font-bold text-white">LAGOS</span>
                    <span className="text-xs text-slate-400">March 2026</span>
                </label>
                <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${formData.cohort === 'Ilorin' ? 'bg-purple-600/20 border-purple-500' : 'bg-slate-950 border-white/10 hover:border-white/30'}`}>
                    <input type="radio" name="cohort" value="Ilorin" checked={formData.cohort === 'Ilorin'} onChange={handleInputChange} className="hidden" />
                    <span className="font-bold text-white">ILORIN</span>
                    <span className="text-xs text-slate-400">July 2026</span>
                </label>
            </div>

            <PaystackButton
                {...componentProps}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-lg py-5 rounded-xl shadow-lg transform transition-all active:scale-[0.98] flex justify-center items-center gap-3"
            />

            <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <AlertCircle size={12}/> Secured by Paystack
            </p>

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;