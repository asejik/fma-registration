import React from 'react';
import { Routes, Route } from 'react-router-dom';

// IMPORT YOUR PAGES
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import SuccessPage from './pages/SuccessPage';
import Dashboard from './pages/Dashboard';
import UKSuccessPage from './pages/UKSuccessPage'; // <--- 1. IMPORT THIS

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/success" element={<SuccessPage />} />

      {/* 2. ADD THIS NEW ROUTE */}
      <Route path="/uk-success" element={<UKSuccessPage />} />

      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;