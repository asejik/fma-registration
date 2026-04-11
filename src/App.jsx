import React from 'react';
import { Routes, Route } from 'react-router-dom';

// IMPORT YOUR PAGES
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import SuccessPage from './pages/SuccessPage';
import Dashboard from './pages/Dashboard';
import UKSuccessPage from './pages/UKSuccessPage';

// CBT Pages
import CbtActivatePage from './pages/cbt/CbtActivatePage';
import CbtLoginPage from './pages/cbt/CbtLoginPage';
import CbtWelcomePage from './pages/cbt/CbtWelcomePage';
import CbtExamPage from './pages/cbt/CbtExamPage';
import CbtResultsSubmittedPage from './pages/cbt/CbtResultsSubmittedPage';
import CbtAdminDashboard from './pages/cbt/CbtAdminDashboard';

function App() {
  return (
    <Routes>
      {/* ── Main Site ────────────────────────────────────────────────── */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/uk-success" element={<UKSuccessPage />} />
      <Route path="/dashboard" element={<Dashboard />} />

      {/* ── CBT Portal ───────────────────────────────────────────────── */}
      <Route path="/cbt" element={<CbtLoginPage />} />
      <Route path="/cbt/activate" element={<CbtActivatePage />} />
      <Route path="/cbt/login" element={<CbtLoginPage />} />
      <Route path="/cbt/welcome" element={<CbtWelcomePage />} />
      <Route path="/cbt/exam" element={<CbtExamPage />} />
      <Route path="/cbt/results-submitted" element={<CbtResultsSubmittedPage />} />
      <Route path="/cbt/admin" element={<CbtAdminDashboard />} />
    </Routes>
  );
}

export default App;