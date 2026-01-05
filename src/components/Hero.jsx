import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import Countdown from './Countdown';
import { Link } from 'react-router-dom';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';

// --- IMPORT YOUR IMAGES HERE ---
import hero1 from '../assets/images/hero1.jpg'; // Adjust extension if .png or .webp
import hero2 from '../assets/images/hero2.jpg';
import hero3 from '../assets/images/hero3.jpg';

const Hero = () => {
  const slides = [
    {
      id: 1,
      image: hero1, // Use the imported variable, NOT a string
      title: "POTENTIAL BECOMES PURPOSE",
      subtitle: "Join the next generation of Kingdom leaders."
    },
    {
      id: 2,
      image: hero2,
      title: "LAGOS & ILORIN 2026",
      subtitle: "Two locations. One mandate. Get ready."
    },
    {
      id: 3,
      image: hero3,
      title: "INTENTIONAL PREPARATION",
      subtitle: "6 Days of intensive spiritual training."
    }
  ];

  const scrollToRegister = () => {
    document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-900">
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={true}
        className="h-full w-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative h-full w-full">
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-linear transform scale-100 hover:scale-110"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                 {/* Dark Overlay */}
                 <div className="absolute inset-0 bg-black/60 md:bg-black/50 mix-blend-multiply" />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              </div>

              {/* Text Content */}
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto mt-6">
                <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-semibold tracking-wider mb-4 backdrop-blur-sm animate-fade-in-up">
                  FREEDOM MINISTRY ACADEMY
                </span>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight mb-4 drop-shadow-2xl">
                  {slide.title}
                </h1>

                <p className="text-lg md:text-2xl text-gray-200 max-w-2xl font-light mb-6 leading-relaxed">
                  {slide.subtitle}
                </p>

                <div className="mb-10">
                  <Countdown />
                </div>

                <div className="flex gap-4">
                  {/* REPLACE the old <button> with this <Link> */}
                  <Link
                    to="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:shadow-[0_0_30px_rgba(37,99,235,0.7)]"
                  >
                    Register Now
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Hero;