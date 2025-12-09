import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import InfoSection from '../components/InfoSection'; // Import the new component

const LandingPage = () => {
  return (
    <div className="font-sans antialiased text-slate-900 bg-slate-950 selection:bg-blue-500 selection:text-white">
      <Navbar />
      <Hero />
      <InfoSection />

      {/* Placeholder for Registration Form */}
      <div id="register" className="min-h-screen bg-slate-950 flex items-center justify-center border-t border-white/5">
        <p className="text-white opacity-50">Registration Form Loading...</p>
      </div>
    </div>
  );
};

export default LandingPage;