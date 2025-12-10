import React, { useState } from 'react';
import { MapPin, Calendar, Clock, ArrowRight, X, BookOpen } from 'lucide-react';

// Receive the prop here
const InfoSection = ({ onSelectCohort }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // The Full Text
  const fullText = (
    <div className="space-y-6 text-lg text-slate-300 leading-relaxed font-light text-left">
      <p>
        Welcome to <strong className="text-white">FREEDOM MINISTRY ACADEMY</strong>, a place where divine purpose meets intentional preparation. This is more than a class, more than a program, and more than a gathering of believers—it is a spiritual training ground where God shapes men and women for Kingdom assignment.
      </p>
      <p>
        In order for us to fulfil everything that God has ordained for us, a great sense of intentionality has to be engaged. Throughout Scripture, every man God used greatly was first formed privately before being revealed publicly. Moses had his wilderness, David had his fields, Paul had Arabia, and even Jesus was prepared for thirty years for a three-and-a-half-year ministry. <strong className="text-white">Preparation is God’s pattern</strong>, and training is His system for raising vessels that can carry His power, His wisdom, and His agenda.
      </p>
      <p>
        Freedom Ministry Academy exists to equip, refine, and activate believers who sense a calling—whether into the five-fold ministry, leadership, or simply deeper service in the house of God. Here, we learn not just to work for God, but to walk with God and function with spiritual intelligence.
      </p>
      <p>
        In this atmosphere, you will be stretched, challenged, instructed, and transformed. You will grow in doctrine, discipline, character, and ministry skill. You will interact with the Scriptures, the Spirit, and seasoned teachers who are committed to raising you into the fullness of God’s call over your life.
      </p>
      <p>
        We believe that an equipped Christian is an effective Christian, and a trained servant produces lasting Kingdom impact. As you journey through this school, come with a heart of humility, hunger, and expectation. God is set to enlarge your capacity, deepen your conviction, and impart grace for effective ministry.
      </p>
      <p className="text-blue-400 font-bold italic">
        Welcome to the place where potential becomes purpose in motion.
      </p>
    </div>
  );

  return (
    <section className="relative py-20 bg-slate-950 overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">

        {/* 1. Brief Intro Preview */}
        <div className="mb-20 text-center max-w-4xl mx-auto">
          <h2 className="text-sm font-bold tracking-[0.2em] text-blue-400 uppercase mb-4 animate-pulse">
            The Vision
          </h2>
          <h3 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">
            WHERE POTENTIAL <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              BECOMES PURPOSE
            </span>
          </h3>

          <div className="text-lg text-slate-300 leading-relaxed font-light mb-8">
            <p>
              Welcome to <strong className="text-white">FREEDOM MINISTRY ACADEMY</strong>, a place where divine purpose meets intentional preparation. This is more than a class, more than a program, and more than a gathering of believers—it is a spiritual training ground where God shapes men and women for Kingdom assignment...
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="group inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white font-semibold tracking-wide"
          >
            <BookOpen size={18} className="text-blue-400" />
            Read Full Vision
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 2. The Cohort Cards (Grid Layout) */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">

          {/* Card 1: Lagos */}
          <div className="group relative p-1 rounded-3xl bg-gradient-to-br from-orange-500 to-pink-600 hover:scale-[1.02] transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-pink-600 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />

            <div className="relative h-full bg-slate-900/90 backdrop-blur-xl rounded-[22px] p-8 md:p-10 border border-white/10 overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <MapPin size={120} />
              </div>

              <div className="inline-block px-4 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold tracking-widest mb-6 border border-orange-500/30">
                COHORT 01
              </div>

              <h4 className="text-3xl font-black text-white mb-2">LAGOS</h4>
              {/* REMOVED: Center of Excellence */}
              <div className="mb-8" />

              <div className="space-y-4">
                <div className="flex items-center gap-4 text-slate-200">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-orange-400">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Dates</p>
                    <p className="font-semibold">March 2nd - 7th, 2025</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-slate-200">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-orange-400">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Schedule</p>
                    <p className="font-semibold">Mon - Sat (9am - 6pm)</p>
                  </div>
                </div>
              </div>

              {/* UPDATED BUTTON */}
              <button
                onClick={() => onSelectCohort('Lagos')}
                className="w-full mt-8 pt-8 border-t border-white/10 flex items-center gap-2 text-orange-400 font-bold text-sm uppercase tracking-wide group-hover:gap-4 transition-all cursor-pointer hover:bg-white/5 rounded-b-xl"
              >
                Select This Cohort <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Card 2: Ilorin */}
          <div className="group relative p-1 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600 hover:scale-[1.02] transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />

            <div className="relative h-full bg-slate-900/90 backdrop-blur-xl rounded-[22px] p-8 md:p-10 border border-white/10 overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <MapPin size={120} />
              </div>

              <div className="inline-block px-4 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold tracking-widest mb-6 border border-cyan-500/30">
                COHORT 02
              </div>

              <h4 className="text-3xl font-black text-white mb-2">ILORIN</h4>
              {/* REMOVED: State of Harmony */}
              <div className="mb-8" />

              <div className="space-y-4">
                <div className="flex items-center gap-4 text-slate-200">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Dates</p>
                    <p className="font-semibold">July 13th - 18th, 2025</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-slate-200">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Schedule</p>
                    <p className="font-semibold">Mon - Sat (9am - 6pm)</p>
                  </div>
                </div>
              </div>

              {/* UPDATED BUTTON */}
              <button
                onClick={() => onSelectCohort('Ilorin')}
                className="w-full mt-8 pt-8 border-t border-white/10 flex items-center gap-2 text-cyan-400 font-bold text-sm uppercase tracking-wide group-hover:gap-4 transition-all cursor-pointer hover:bg-white/5 rounded-b-xl"
              >
                Select This Cohort <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FULL VISION MODAL (Kept exactly as it was) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-slate-900 border border-white/10 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl p-8 md:p-10 shadow-2xl animate-fade-in-up scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-slate-800">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors"
            >
              <X size={24} />
            </button>
            <h3 className="text-2xl font-black text-white mb-6 border-b border-white/10 pb-4">
              THE VISION
            </h3>
            {fullText}
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

export default InfoSection;