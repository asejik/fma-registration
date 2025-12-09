import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';

const Hero = () => {
  // Placeholder images - Replace these URLS with your actual Church photos later
  const slides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2073&auto=format&fit=crop",
      title: "POTENTIAL BECOMES PURPOSE",
      subtitle: "Join the next generation of Kingdom leaders."
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop",
      title: "LAGOS & ILORIN 2026",
      subtitle: "Two locations. One mandate. Get ready."
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070&auto=format&fit=crop",
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
                 {/* Dark Overlay for text readability */}
                 <div className="absolute inset-0 bg-black/60 md:bg-black/50 mix-blend-multiply" />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              </div>

              {/* Text Content */}
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto mt-10">
                <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-semibold tracking-wider mb-4 backdrop-blur-sm animate-fade-in-up">
                  FREEDOM MINISTRY ACADEMY
                </span>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight mb-6 drop-shadow-2xl">
                  {slide.title}
                </h1>

                <p className="text-lg md:text-2xl text-gray-200 max-w-2xl font-light mb-8 leading-relaxed">
                  {slide.subtitle}
                </p>

                <div className="flex gap-4">
                  <button
                    onClick={scrollToRegister}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:shadow-[0_0_30px_rgba(37,99,235,0.7)]"
                  >
                    Join Waitlist
                  </button>
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