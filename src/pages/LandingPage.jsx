import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';

const LandingPage = () => {
  return (
    <div className="font-sans antialiased text-slate-900 bg-slate-50 selection:bg-blue-500 selection:text-white">
      <Navbar />
      <Hero />

      {/* Placeholder for next steps */}
      <div id="register" className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white opacity-50">Next Sections Loading...</p>
      </div>
    </div>
  );
};

export default LandingPage;