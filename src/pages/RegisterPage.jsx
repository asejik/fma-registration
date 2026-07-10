import React, { useState, useEffect } from 'react';
import { PaystackButton } from 'react-paystack';
import { db } from '../services/firebase';
import { serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowLeft, Globe } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSaving, setIsSaving] = useState(false);

  // AUTOMATED CLOSURE SCRIPT
  const isLagosClosed = new Date() > new Date('2026-02-27T23:59:59+01:00');
  const isUKClosed = new Date() > new Date('2026-04-29T23:59:59+01:00');
  const isIlorinClosed = new Date() > new Date('2026-07-13T01:00:00+01:00');
  const allRegistrationsClosed = isLagosClosed && isUKClosed && isIlorinClosed;

  // CONFIGURATION
  const AMOUNT_NGN = 20000;
  const PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  const GOOGLE_SCRIPT_URL = import.meta.env.VITE_REGISTRATION_SHEET_URL;

  // Dynamic initialization logic
  let defaultCohort = searchParams.get('cohort') || 'Ilorin';
  if ((isLagosClosed && defaultCohort === 'Lagos') || (isUKClosed && defaultCohort === 'UK') || (isIlorinClosed && defaultCohort === 'Ilorin')) {
      defaultCohort = 'Ilorin'; // Force fallback; will be blocked by allRegistrationsClosed guard
  }

  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', address: '',
    city: '', maritalStatus: '', occupation: '',
    cohort: defaultCohort
  });

  const isUK = formData.cohort === 'UK';

  useEffect(() => {
    const cohortParam = searchParams.get('cohort');
    if (cohortParam) {
      if ((isLagosClosed && cohortParam === 'Lagos') || (isUKClosed && cohortParam === 'UK') || (isIlorinClosed && cohortParam === 'Ilorin')) {
         setFormData(prev => ({ ...prev, cohort: 'Ilorin' }));
      } else {
         setFormData(prev => ({ ...prev, cohort: cohortParam }));
      }
    }
  }, [searchParams, isLagosClosed, isUKClosed, isIlorinClosed]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePaystackSuccess = async (reference) => {
    await saveRegistration({
      ...formData,
      paymentReference: reference.reference,
      amountPaid: AMOUNT_NGN,
      status: 'paid',
      currency: 'NGN'
    }, '/success');
  };

  const handleUKSubmit = async (e) => {
    e.preventDefault();
    if(!formData.fullName || !formData.email || !formData.phone) {
        alert("Please fill in all required fields.");
        return;
    }

    await saveRegistration({
      ...formData,
      paymentReference: 'PENDING_TRANSFER',
      amountPaid: 20,
      status: 'pending',
      currency: 'GBP'
    }, '/uk-success');
  };

  const saveRegistration = async (dataToSave, redirectPath) => {
    setIsSaving(true);
    const finalData = { ...dataToSave, dateString: new Date().toISOString() };

    try {
      // Use paymentReference as the ID for Paystack to prevent reuse. 
      // For UK 'PENDING_TRANSFER', generate a unique ID to avoid collisions.
      const isRealRef = dataToSave.paymentReference && dataToSave.paymentReference !== 'PENDING_TRANSFER';
      const docId = isRealRef ? dataToSave.paymentReference : `UK-REG-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      
      await setDoc(doc(db, "students", docId), {
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
    subaccount: "ACCT_cpxpivjkswnoekf",
    text: "PAY ₦" + AMOUNT_NGN.toLocaleString(),
    onSuccess: handlePaystackSuccess,
    onClose: () => console.log("Closed"),
    metadata: { 
      ...formData,
      custom_fields: [
        { display_name: "Cohort", variable_name: "cohort", value: formData.cohort },
        { display_name: "Full Name", variable_name: "full_name", value: formData.fullName },
        { display_name: "Phone", variable_name: "phone", value: formData.phone }
      ] 
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-20 px-4 flex justify-center items-center relative overflow-hidden">

      <Link to="/" className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 transition-colors z-20">
        <ArrowLeft size={20} /> Back to Home
      </Link>

      {isSaving && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center z-[100]">
            <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
            <h3 className="text-xl font-bold text-white">Processing Registration...</h3>
        </div>
      )}

      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">

        <div className="bg-gradient-to-r from-blue-900/50 to-slate-900/50 p-8 border-b border-white/5 text-center">
            <h1 className="text-3xl font-black text-white tracking-tight">STUDENT REGISTRATION</h1>
            <p className="text-slate-400 mt-2">Secure your seat for the upcoming cohort.</p>
        </div>

        {allRegistrationsClosed ? (
          <div className="p-10 flex flex-col items-center justify-center text-center gap-6">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
              <AlertCircle size={32} className="text-slate-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white mb-2">Registration is Closed</h2>
              <p className="text-slate-400 max-w-sm">
                Registration for all 2026 Freedom Ministry Academy cohorts is now closed. Thank you for your interest.
              </p>
            </div>
            <Link to="/" className="mt-2 px-8 py-3 rounded-full bg-slate-800 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-700 transition-all font-semibold">
              Back to Home
            </Link>
          </div>
        ) : (

        <div className="p-8 md:p-10 space-y-8">
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

            {/* AUTOMATED TIME-BASED RENDER */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Lagos', 'Ilorin'].map((c) => {
                    const isClosed = (c === 'Lagos' && isLagosClosed) || (c === 'Ilorin' && isIlorinClosed);

                    return (
                        <label
                            key={c}
                            className={`border rounded-xl p-4 flex flex-col items-center justify-center gap-1 transition-all
                                ${isClosed ? 'opacity-40 cursor-not-allowed bg-slate-950 border-white/5'
                                : formData.cohort === c ? 'bg-blue-600/20 border-blue-500 cursor-pointer'
                                : 'bg-slate-950 border-white/10 hover:border-white/30 cursor-pointer'}`
                            }
                        >
                            <input
                                type="radio"
                                name="cohort"
                                value={c}
                                checked={formData.cohort === c}
                                onChange={handleInputChange}
                                className="hidden"
                                disabled={isClosed}
                            />
                            <span className={`font-bold uppercase ${isClosed ? 'text-slate-500 line-through' : 'text-white'}`}>
                                {c}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">
                                {c === 'Lagos' && isLagosClosed ? 'CLOSED' : c === 'Ilorin' && isIlorinClosed ? 'CLOSED' : 'July 2026'}
                            </span>
                        </label>
                    );
                })}

                <label className={`border rounded-xl p-4 flex flex-col items-center justify-center gap-1 transition-all
                    ${isUKClosed ? 'opacity-40 cursor-not-allowed bg-slate-950 border-white/5'
                    : isUK ? 'bg-red-600/20 border-red-500 cursor-pointer'
                    : 'bg-slate-950 border-white/10 hover:border-white/30 cursor-pointer'}`
                }>
                    <input
                        type="radio"
                        name="cohort"
                        value="UK"
                        checked={isUK}
                        onChange={handleInputChange}
                        className="hidden"
                        disabled={isUKClosed}
                    />
                    <span className={`font-bold flex items-center gap-2 ${isUKClosed ? 'text-slate-500 line-through' : 'text-white'}`}>
                        <Globe size={14}/> UK
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                        {isUKClosed ? 'CLOSED' : 'May 2026'}
                    </span>
                </label>
            </div>

            {isUK ? (
                <button
                    onClick={handleUKSubmit}
                    className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-black text-lg py-5 rounded-xl shadow-lg transform transition-all active:scale-[0.98] flex justify-center items-center gap-3"
                >
                    SUBMIT REGISTRATION (£20)
                </button>
            ) : (
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
        )}
      </div>
    </div>
  );
};

export default RegisterPage;