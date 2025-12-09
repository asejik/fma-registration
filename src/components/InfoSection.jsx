import React from 'react';
import { MapPin, Calendar, Clock, ArrowRight } from 'lucide-react';

const InfoSection = () => {
  return (
    <section className="relative py-20 bg-slate-950 overflow-hidden">
      {/* Decorative Background Blobs (The "Energy") */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">

        {/* 1. Brief Intro Text */}
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

          <div className="space-y-6 text-lg text-slate-300 leading-relaxed font-light">
            <p>
              Welcome to <strong className="text-white">FREEDOM MINISTRY ACADEMY</strong>. This is more than a class—it is a spiritual training ground where God shapes men and women for Kingdom assignment.
            </p>
            <p>
              Throughout Scripture, every man God used greatly was first formed privately. Moses had his wilderness, David his fields. <strong className="text-white">Preparation is God’s pattern.</strong>
            </p>
            <p>
              In this atmosphere, you will be stretched, challenged, and transformed. We raise believers who don't just work for God, but walk with Him.
            </p>
          </div>
        </div>

        {/* 2. The Cohort Cards (Grid Layout) */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">

          {/* Card 1: Lagos (High Energy Gradient) */}
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
              <p className="text-slate-400 mb-8">The Center of Excellence</p>

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

              <div className="mt-8 pt-8 border-t border-white/10 flex items-center gap-2 text-orange-400 font-bold text-sm uppercase tracking-wide group-hover:gap-4 transition-all">
                Select This Cohort <ArrowRight size={16} />
              </div>
            </div>
          </div>

          {/* Card 2: Ilorin (Cool/Deep Gradient) */}
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
              <p className="text-slate-400 mb-8">The State of Harmony</p>

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

              <div className="mt-8 pt-8 border-t border-white/10 flex items-center gap-2 text-cyan-400 font-bold text-sm uppercase tracking-wide group-hover:gap-4 transition-all">
                Select This Cohort <ArrowRight size={16} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default InfoSection;