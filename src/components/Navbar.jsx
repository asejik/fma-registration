import React from 'react';

const Navbar = () => {
  const scrollToRegister = () => {
    const section = document.getElementById('register');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 py-6 px-4 md:px-12 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 shadow-lg">
        {/* Logo Area */}
        <div className="flex items-center gap-2">
          {/* Replace this div with your <img src="..." /> later */}
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white text-xl">
            F
          </div>
          <span className="text-white font-bold tracking-wider text-lg hidden sm:block">
            FMA <span className="text-blue-400">ACADEMY</span>
          </span>
        </div>

        {/* CTA Button */}
        <button
          onClick={scrollToRegister}
          className="bg-white text-blue-900 px-6 py-2 rounded-full font-bold hover:bg-blue-50 transition-transform transform hover:scale-105 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
        >
          Get Notified
        </button>
      </div>
    </nav>
  );
};

export default Navbar;