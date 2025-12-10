import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import InfoSection from '../components/InfoSection';
import RegistrationForm from '../components/RegistrationForm';

const LandingPage = () => {
  // State to hold the pre-selected value
  const [selectedCohort, setSelectedCohort] = useState("");

  // The function that InfoSection will call
  const handleCohortSelect = (cohortName) => {
    setSelectedCohort(cohortName);
    // Smooth scroll to register section
    document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="font-sans antialiased text-slate-900 bg-slate-950 selection:bg-blue-500 selection:text-white">
      <Navbar />
      <Hero />

      {/* Pass the handler to InfoSection */}
      <InfoSection onSelectCohort={handleCohortSelect} />

      {/* Pass the selected value to the Form */}
      <RegistrationForm prefilledCohort={selectedCohort} />

      <footer className="py-8 bg-black text-center text-slate-600 text-sm">
        <p>&copy; 2025 Freedom Ministry Academy. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;