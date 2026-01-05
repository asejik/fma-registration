import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
import logo from '../assets/images/fma-logo.png';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 py-4 px-4 md:px-12 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-3 shadow-lg">

        <div className="flex items-center gap-3">
          <Link to="/">
            <img src={logo} alt="FMA Logo" className="w-12 h-12 object-contain" />
          </Link>
          <span className="text-white font-bold tracking-wider text-lg hidden sm:block drop-shadow-md">
            FMA <span className="text-blue-400">ACADEMY</span>
          </span>
        </div>

        {/* CHANGED: Link to Register Page */}
        <Link
          to="/register"
          className="bg-white text-blue-900 px-6 py-2 rounded-full font-bold hover:bg-blue-50 transition-transform transform hover:scale-105 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
        >
          Register Now
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;