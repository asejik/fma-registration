import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import InfoSection from '../components/InfoSection';
// REMOVE: import RegistrationForm ...

const LandingPage = () => {
  return (
    <div className="font-sans antialiased text-slate-900 bg-slate-950 selection:bg-blue-500 selection:text-white">
      <Navbar />
      <Hero />
      <InfoSection />
      {/* REMOVED: RegistrationForm */}

      <footer className="py-8 bg-black text-center text-slate-600 text-sm">
        <p>&copy; 2026 Freedom Ministry Academy. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;