import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Placeholder components (We will build these in the next step)
const LandingPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
      FMA Landing Page Coming Soon
    </h1>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* We will add /admin route later */}
      </Routes>
    </Router>
  );
}

export default App;