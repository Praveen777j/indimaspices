import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../../contexts/LanguageContext';
import { Sparkles } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const SpiceWorldIngredients: React.FC = () => {
  const { language } = useLanguage();
  const isKn = language === 'kn';

  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<HTMLDivElement>(null);
  const mgRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const fg = fgRef.current;
    const mg = mgRef.current;
    const bg = bgRef.current;

    if (!section || !fg || !mg || !bg) return;

    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      // Parallax scroll timeline that releases cleanly
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: isMobile ? '+=60%' : '+=110%',
          scrub: 0.8,
          pin: !isMobile, // Limited desktop pin, then natural release
          anticipatePin: 1
        }
      });

      // Background elements move subtly
      tl.to(bg, { y: -40, ease: 'none' }, 0);

      // Midground elements move moderately with rotation
      tl.to(mg, { y: -90, ease: 'none' }, 0);

      // Foreground elements move fast with dynamic camera depth
      tl.to(fg, { y: -160, scale: 1.05, ease: 'none' }, 0);

      // Rotate individual macro elements smoothly
      gsap.to('.spice-chilli', {
        rotation: 25,
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      });

      gsap.to('.spice-pepper', {
        rotation: 360,
        x: 40,
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      });

      gsap.to('.spice-coriander', {
        rotation: -45,
        y: -30,
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      });
    }, section);

    return () => ctx.revert();
  }, [isKn]);

  return (
    <section
      ref={sectionRef}
      className="spice-origin-section relative w-full min-h-[92vh] sm:min-h-screen bg-[#1F1009] text-[#FAF3E8] py-20 px-4 sm:px-6 lg:px-8 overflow-hidden select-none flex items-center justify-center"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 50% 40%, rgba(95, 35, 12, 0.45) 0%, rgba(26, 13, 7, 0.98) 85%)'
      }}
    >
      {/* BACKGROUND LAYER (Deep, slow parallax) */}
      <div ref={bgRef} className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/6 left-1/12 w-80 h-80 bg-amber-600/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-1/5 right-1/10 w-96 h-96 bg-red-700/10 blur-[140px] rounded-full" />

        {/* Floating tiny cumin seeds in background */}
        <svg
          className="absolute top-1/4 left-1/5 w-10 h-10 opacity-30 blur-[1px]"
          viewBox="0 0 40 40"
        >
          <path
            d="M 10 25 Q 20 12 30 18 Q 22 28 10 25 Z"
            fill="#B47834"
          />
        </svg>
        <svg
          className="absolute bottom-1/3 right-1/4 w-8 h-8 opacity-25 blur-[1px]"
          viewBox="0 0 40 40"
        >
          <path
            d="M 12 22 Q 22 10 32 16 Q 24 26 12 22 Z"
            fill="#B47834"
          />
        </svg>
      </div>

      {/* MIDGROUND LAYER (Medium speed & prominent ingredients) */}
      <div ref={mgRef} className="absolute inset-0 pointer-events-none z-10">
        {/* Floating Macro Byadgi Chilli - Top Right */}
        <div className="spice-chilli absolute top-12 right-6 sm:right-24 md:right-32 w-44 sm:w-60 md:w-72 filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.7)] opacity-85">
          <svg viewBox="0 0 300 240" className="w-full h-auto">
            <defs>
              <linearGradient id="chilliMgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#DF2915" />
                <stop offset="45%" stopColor="#A8180A" />
                <stop offset="85%" stopColor="#680D05" />
                <stop offset="100%" stopColor="#3A0602" />
              </linearGradient>
            </defs>
            {/* Stem */}
            <path d="M 180 35 Q 205 10 225 15 Q 210 40 190 50 Z" fill="#4B6331" />
            {/* Curving Wrinkled Byadgi Body */}
            <path
              d="M 185 45 C 220 80 250 140 220 185 C 190 225 130 220 90 230 C 130 205 180 180 170 140 C 160 90 140 60 185 45 Z"
              fill="url(#chilliMgGrad)"
            />
            {/* Wrinkle highlights */}
            <path d="M 175 80 Q 205 125 195 160" stroke="rgba(255,160,120,0.35)" strokeWidth="4" fill="none" />
          </svg>
        </div>

        {/* Floating Coriander Seeds Cluster - Bottom Left */}
        <div className="spice-coriander absolute bottom-16 left-6 sm:left-20 md:left-28 w-32 sm:w-44 md:w-52 filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)] opacity-80">
          <svg viewBox="0 0 200 200" className="w-full h-auto">
            <defs>
              <radialGradient id="corianderMgGrad" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#E2B770" />
                <stop offset="50%" stopColor="#B4823A" />
                <stop offset="100%" stopColor="#5B3810" />
              </radialGradient>
            </defs>
            <ellipse cx="60" cy="70" rx="30" ry="34" transform="rotate(-15 60 70)" fill="url(#corianderMgGrad)" />
            <ellipse cx="120" cy="85" rx="34" ry="38" transform="rotate(25 120 85)" fill="url(#corianderMgGrad)" />
            <ellipse cx="90" cy="140" rx="32" ry="36" transform="rotate(-5 90 140)" fill="url(#corianderMgGrad)" />
            {/* Striation lines */}
            <path d="M 110 65 Q 120 85 115 110" stroke="#7A4E1B" strokeWidth="2" fill="none" opacity="0.6" />
            <path d="M 125 68 Q 135 88 130 112" stroke="#7A4E1B" strokeWidth="2" fill="none" opacity="0.6" />
          </svg>
        </div>

        {/* Rolling Tellicherry Black Pepper Pearl - Top Left */}
        <div className="spice-pepper absolute top-20 left-10 sm:left-32 w-16 sm:w-24 md:w-28 filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)] opacity-85">
          <svg viewBox="0 0 100 100" className="w-full h-auto">
            <defs>
              <radialGradient id="pepperMgGrad" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#5A524C" />
                <stop offset="35%" stopColor="#2E2824" />
                <stop offset="80%" stopColor="#151210" />
                <stop offset="100%" stopColor="#080706" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="42" fill="url(#pepperMgGrad)" />
            {/* Pepper textured bumpy wrinkles */}
            <path d="M 35 25 Q 45 30 40 40" stroke="#6E645C" strokeWidth="2" fill="none" opacity="0.4" />
            <path d="M 55 35 Q 65 42 60 55" stroke="#6E645C" strokeWidth="2" fill="none" opacity="0.4" />
            <path d="M 30 55 Q 40 65 45 75" stroke="#6E645C" strokeWidth="2" fill="none" opacity="0.3" />
            {/* Specular highlight dot */}
            <circle cx="38" cy="35" r="4" fill="rgba(255,255,255,0.25)" />
          </svg>
        </div>
      </div>

      {/* FOREGROUND LAYER (Fast, macro depth, blurred near camera edges) */}
      <div ref={fgRef} className="absolute inset-0 pointer-events-none z-20">
        {/* Giant Out-of-Focus Turmeric Chunk at Bottom Right */}
        <div className="absolute -bottom-10 -right-10 w-48 sm:w-72 md:w-88 opacity-40 blur-[3px]">
          <svg viewBox="0 0 240 240" className="w-full h-auto">
            <path
              d="M 50 160 C 80 110 140 100 180 120 C 220 140 240 180 220 220 C 180 250 120 240 70 220 Z"
              fill="#D97706"
            />
          </svg>
        </div>

        {/* Ambient floating spice particles */}
        <div className="absolute top-1/3 left-1/3 w-3 h-3 rounded-full bg-amber-400/50 blur-[0.5px]" />
        <div className="absolute top-2/3 right-1/3 w-2.5 h-2.5 rounded-full bg-red-500/50 blur-[0.5px]" />
        <div className="absolute bottom-1/4 left-1/2 w-4 h-4 rounded-full bg-amber-300/40 blur-[1px]" />
      </div>

      {/* CENTER EDITORIAL TEXT (Clean, legible, authentic) */}
      <div
        ref={containerRef}
        className="relative z-30 max-w-4xl mx-auto text-center px-4 sm:px-6"
      >
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-950/70 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-widest uppercase mb-6 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{isKn ? 'ಕಾಳುಗಳ ಜಗತ್ತು' : 'Spice World'}</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#FAF3E8] leading-[1.15] mb-6 text-balance">
          {isKn
            ? 'ಅಪ್ಪಟ ಕಾಳುಗಳ ಸುಗಂಧ ಸೌಂದರ್ಯ.'
            : 'THE ARTISTRY OF WHOLE SPICES.'}
        </h2>

        <p className="font-serif italic text-base sm:text-xl md:text-2xl text-amber-200/90 leading-relaxed max-w-2xl mx-auto font-normal">
          {isKn
            ? 'ಬ್ಯಾಡಗಿಯ ಕೆಂಪು ಮೆಣಸು, ಮಲೆನಾಡಿನ ಅರಿಶಿನ, ಕೊಡಗಿನ ಕಾಳುಮೆಣಸು ಮತ್ತು ಪರಿಮಳದ ಕೊತ್ತಂಬರಿ — ನೈಸರ್ಗಿಕ ಸುವಾಸನೆಯ ಸಂಗಮ.'
            : 'Deep red Byadgi chillies, golden turmeric, Tellicherry black pepper, and fragrant coriander seeds in their pristine, natural state.'}
        </p>

        {/* 4 Feature Tags */}
        <div className="mt-10 sm:mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
          <div className="p-3.5 rounded-2xl bg-[#2A180E]/70 border border-amber-600/20 backdrop-blur-md text-center">
            <p className="text-amber-400 font-serif font-bold text-sm sm:text-base">
              {isKn ? 'ಬ್ಯಾಡಗಿ ಮೆಣಸು' : 'Byadgi Chilli'}
            </p>
            <p className="text-[11px] text-amber-200/70 mt-0.5">
              {isKn ? 'ನೈಸರ್ಗಿಕ ಕೆಂಪು ಬಣ್ಣ' : 'Vibrant Crimson Hue'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#2A180E]/70 border border-amber-600/20 backdrop-blur-md text-center">
            <p className="text-amber-400 font-serif font-bold text-sm sm:text-base">
              {isKn ? 'ಅಪ್ಪಟ ಅರಿಶಿನ' : 'Pure Turmeric'}
            </p>
            <p className="text-[11px] text-amber-200/70 mt-0.5">
              {isKn ? 'ಮಣ್ಣಿನ ನೈಜ ಸತ್ವ' : 'Golden Earth Essence'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#2A180E]/70 border border-amber-600/20 backdrop-blur-md text-center">
            <p className="text-amber-400 font-serif font-bold text-sm sm:text-base">
              {isKn ? 'ಕೊತ್ತಂಬರಿ ಬೀಜ' : 'Coriander'}
            </p>
            <p className="text-[11px] text-amber-200/70 mt-0.5">
              {isKn ? 'ತಾಜಾ ಸುಗಂಧ' : 'Delicate Floral Aroma'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#2A180E]/70 border border-amber-600/20 backdrop-blur-md text-center">
            <p className="text-amber-400 font-serif font-bold text-sm sm:text-base">
              {isKn ? 'ಕೊಡಗು ಮೆಣಸು' : 'Tellicherry Pepper'}
            </p>
            <p className="text-[11px] text-amber-200/70 mt-0.5">
              {isKn ? 'ತೀಕ್ಷ್ಣ ಸುವಾಸನೆ' : 'Bold Piquant Depth'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
