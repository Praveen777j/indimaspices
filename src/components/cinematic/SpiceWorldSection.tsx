import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../../contexts/LanguageContext';
import { Sparkles } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const SpiceWorldSection: React.FC = () => {
  const { language } = useLanguage();
  const isKn = language === 'kn';

  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chilliRef = useRef<HTMLDivElement>(null);
  const turmericRef = useRef<HTMLDivElement>(null);
  const pepperRef = useRef<HTMLDivElement>(null);
  const corianderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const chilli = chilliRef.current;
    const turmeric = turmericRef.current;
    const pepper = pepperRef.current;
    const coriander = corianderRef.current;

    if (!section) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) return;

      const mm = gsap.matchMedia();

      // Desktop: Elegant parallax as user naturally scrolls
      mm.add('(min-width: 768px)', () => {
        if (chilli) {
          gsap.to(chilli, {
            y: -50,
            rotation: 15,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1
            }
          });
        }

        if (turmeric) {
          gsap.to(turmeric, {
            y: -35,
            rotation: -10,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2
            }
          });
        }

        if (pepper) {
          gsap.to(pepper, {
            y: -60,
            rotation: 45,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.9
            }
          });
        }

        if (coriander) {
          gsap.to(coriander, {
            y: -40,
            rotation: -20,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.1
            }
          });
        }
      });
    }, section);

    return () => ctx.revert();
  }, [isKn]);

  return (
    <section
      ref={sectionRef}
      className="spice-world-section relative w-full min-h-[95vh] bg-[#FAF6EE] text-[#2C1810] py-20 px-4 sm:px-6 lg:px-8 overflow-hidden select-none flex items-center justify-center"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 50% 50%, rgba(255, 253, 249, 0.95) 0%, rgba(250, 246, 238, 0.98) 85%)'
      }}
    >
      {/* Background warm ambiance */}
      <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-red-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Floating Tactile Spices around the stage */}
      {/* 1. Whole Byadgi Chilli (Top Right) */}
      <div
        ref={chilliRef}
        className="absolute top-12 right-6 sm:right-16 md:right-24 w-36 sm:w-48 md:w-56 pointer-events-none z-10 filter drop-shadow-[0_15px_30px_rgba(44,24,16,0.15)] opacity-85"
      >
        <svg viewBox="0 0 240 200" className="w-full h-auto">
          <defs>
            <linearGradient id="swChilli" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DF2915" />
              <stop offset="50%" stopColor="#A8180A" />
              <stop offset="100%" stopColor="#540B05" />
            </linearGradient>
          </defs>
          <path d="M 140 30 Q 160 10 175 15 Q 165 35 150 45 Z" fill="#4B6331" />
          <path
            d="M 145 40 C 175 70 200 120 180 155 C 160 185 110 180 80 190 C 110 170 150 150 145 120 C 135 80 115 55 145 40 Z"
            fill="url(#swChilli)"
          />
          <path d="M 140 70 Q 165 110 155 140" stroke="rgba(255,160,120,0.3)" strokeWidth="3" fill="none" />
        </svg>
      </div>

      {/* 2. Golden Turmeric (Bottom Left) */}
      <div
        ref={turmericRef}
        className="absolute bottom-12 left-6 sm:left-16 md:left-24 w-32 sm:w-44 md:w-52 pointer-events-none z-10 filter drop-shadow-[0_15px_30px_rgba(217,119,6,0.15)] opacity-85"
      >
        <svg viewBox="0 0 200 180" className="w-full h-auto">
          <defs>
            <linearGradient id="swTurmeric" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
          </defs>
          <path
            d="M 40 100 C 50 65 90 55 130 65 C 160 75 170 110 155 130 C 140 150 100 155 70 145 C 50 135 35 115 40 100 Z"
            fill="url(#swTurmeric)"
          />
          <path d="M 70 85 Q 85 110 75 130" stroke="#78350F" strokeWidth="2" fill="none" opacity="0.5" />
          <path d="M 110 80 Q 120 105 115 125" stroke="#78350F" strokeWidth="2" fill="none" opacity="0.5" />
        </svg>
      </div>

      {/* 3. Black Pepper Pearl (Top Left) */}
      <div
        ref={pepperRef}
        className="absolute top-20 left-8 sm:left-24 w-16 sm:w-24 pointer-events-none z-10 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.2)] opacity-80"
      >
        <svg viewBox="0 0 80 80" className="w-full h-auto">
          <radialGradient id="swPepper" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#4A4540" />
            <stop offset="50%" stopColor="#25211E" />
            <stop offset="100%" stopColor="#0F0D0C" />
          </radialGradient>
          <circle cx="40" cy="40" r="34" fill="url(#swPepper)" />
          <circle cx="32" cy="30" r="3" fill="rgba(255,255,255,0.25)" />
        </svg>
      </div>

      {/* 4. Coriander Seed Cluster (Bottom Right) */}
      <div
        ref={corianderRef}
        className="absolute bottom-16 right-8 sm:right-28 w-24 sm:w-36 pointer-events-none z-10 filter drop-shadow-[0_10px_20px_rgba(180,130,50,0.15)] opacity-80"
      >
        <svg viewBox="0 0 120 120" className="w-full h-auto">
          <radialGradient id="swCoriander" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#E2B770" />
            <stop offset="60%" stopColor="#B4823A" />
            <stop offset="100%" stopColor="#6C4918" />
          </radialGradient>
          <ellipse cx="45" cy="50" rx="20" ry="24" transform="rotate(-15 45 50)" fill="url(#swCoriander)" />
          <ellipse cx="75" cy="65" rx="22" ry="26" transform="rotate(20 75 65)" fill="url(#swCoriander)" />
        </svg>
      </div>

      {/* Central Content */}
      <div
        ref={containerRef}
        className="relative z-20 max-w-4xl mx-auto text-center px-4 sm:px-6"
      >
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#FAF0E1] border border-[#DFC7A2] text-[#8B3214] text-xs font-semibold tracking-widest uppercase mb-6 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#993300]" />
          <span>{isKn ? 'ಕಾಳುಗಳ ಜಗತ್ತು' : 'The Spice World'}</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#2C1810] leading-[1.15] mb-6 text-balance">
          {isKn
            ? 'ಅಪ್ಪಟ ಕಾಳುಗಳ ಸುಗಂಧ ಸೌಂದರ್ಯ.'
            : 'The Soul of Indian Cooking.'}
        </h2>

        <p className="font-serif italic text-base sm:text-xl md:text-2xl text-[#6B4E3D] leading-relaxed max-w-2xl mx-auto font-normal">
          {isKn
            ? 'ನೈಸರ್ಗಿಕ ಕೆಂಪು ಬ್ಯಾಡಗಿ ಮೆಣಸು, ಮಲೆನಾಡಿನ ಅರಿಶಿನ, ಕೊಡಗಿನ ಕಾಳುಮೆಣಸು ಮತ್ತು ಪರಿಮಳದ ಕೊತ್ತಂಬರಿ — ನೈಜ ರುಚಿಯ ಸಂಗಮ.'
            : 'Rich Byadgi red chillies, golden turmeric rhizomes, Tellicherry black pepper, and toasted coriander in their pristine, natural form.'}
        </p>

        {/* 4 Clean Annotation Pods */}
        <div className="mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
          <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#E8DFD3] shadow-xs text-center">
            <p className="text-[#993300] font-serif font-bold text-sm sm:text-base">
              {isKn ? 'ಬ್ಯಾಡಗಿ ಮೆಣಸು' : 'Byadgi Chilli'}
            </p>
            <p className="text-[11px] text-[#8C7667] mt-1 font-normal">
              {isKn ? 'ನೈಸರ್ಗಿಕ ಕೆಂಪು ಬಣ್ಣ' : 'Rich Crimson Colour'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#E8DFD3] shadow-xs text-center">
            <p className="text-[#993300] font-serif font-bold text-sm sm:text-base">
              {isKn ? 'ಅಪ್ಪಟ ಅರಿಶಿನ' : 'Pure Turmeric'}
            </p>
            <p className="text-[11px] text-[#8C7667] mt-1 font-normal">
              {isKn ? 'ಮಣ್ಣಿನ ನೈಜ ಸತ್ವ' : 'Golden Earth Essence'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#E8DFD3] shadow-xs text-center">
            <p className="text-[#993300] font-serif font-bold text-sm sm:text-base">
              {isKn ? 'ಕಾಳುಮೆಣಸು' : 'Black Pepper'}
            </p>
            <p className="text-[11px] text-[#8C7667] mt-1 font-normal">
              {isKn ? 'ತೀಕ್ಷ್ಣ ಸುವಾಸನೆ' : 'Bold Piquant Depth'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#E8DFD3] shadow-xs text-center">
            <p className="text-[#993300] font-serif font-bold text-sm sm:text-base">
              {isKn ? 'ಕೊತ್ತಂಬರಿ ಬೀಜ' : 'Coriander'}
            </p>
            <p className="text-[11px] text-[#8C7667] mt-1 font-normal">
              {isKn ? 'ತಾಜಾ ಸುಗಂಧ' : 'Citrus Floral Aroma'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
