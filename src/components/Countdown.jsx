import React, { useState, useEffect } from 'react';

const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Target: March 2nd, 2026 at 9:00 AM
    const targetDate = new Date(2026, 2, 2, 9, 0, 0).getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  const TimeBox = ({ value, label }) => (
    <div className="flex flex-col items-center mx-2 md:mx-4">
      {/* Box */}
      <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-900/60 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
        <span className="text-2xl md:text-4xl font-black text-white font-mono tabular-nums">
          {value < 10 ? `0${value}` : value}
        </span>
      </div>
      {/* Label */}
      <span className="text-[10px] md:text-xs font-bold text-blue-300 uppercase tracking-widest mt-2">
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex flex-wrap justify-center items-center mt-8 md:mt-12 animate-fade-in-up">
        {/* Label: Horizontal on Mobile, Rotated Side-Text on Desktop */}
        <div className="w-full md:w-auto text-center mb-4 md:mb-0 md:mr-6">
            <span className="text-slate-300 font-bold tracking-widest text-sm md:writing-mode-vertical md:rotate-180 block">
                STARTS IN
            </span>
        </div>

        <div className="flex justify-center">
            <TimeBox value={timeLeft.days} label="Days" />
            <TimeBox value={timeLeft.hours} label="Hours" />
            <TimeBox value={timeLeft.minutes} label="Mins" />
            <TimeBox value={timeLeft.seconds} label="Secs" />
        </div>
    </div>
  );
};

export default Countdown;