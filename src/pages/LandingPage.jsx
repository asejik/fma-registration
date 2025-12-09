import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import InfoSection from '../components/InfoSection';
import RegistrationForm from '../components/RegistrationForm'; // Import it

const LandingPage = () => {
  return (
    <div className="font-sans antialiased text-slate-900 bg-slate-950 selection:bg-blue-500 selection:text-white">
      <Navbar />
      <Hero />
      <InfoSection />
      <RegistrationForm />

      {/* Simple Footer */}
      <footer className="py-8 bg-black text-center text-slate-600 text-sm">
        <p>&copy; 2025 Freedom Ministry Academy. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;