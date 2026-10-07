import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../../contexts/LanguageContext';
import { Banner } from '../../types';
import { Sparkles, ArrowDown } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface BrandFilmHeroProps {
  banner?: Banner;
  onExploreClick: () => void;
}

export const BrandFilmHero: React.FC<BrandFilmHeroProps> = ({ banner, onExploreClick }) => {
  const { language } = useLanguage();
  const isKn = language === 'kn';

  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const logoWrapperRef = useRef<HTMLDivElement>(null);
  const titleWrapperRef = useRef<HTMLDivElement>(null);
  const backdropGlowRef = useRef<HTMLDivElement>(null);

  // Admin banner title override if provided
  const adminTitle = isKn ? banner?.title_kn : banner?.title_en;

  useEffect(() => {
    const section = sectionRef.current;
    const logoEl = logoWrapperRef.current;
    const titleEl = titleWrapperRef.current;
    const glowEl = backdropGlowRef.current;

    if (!section || !logoEl || !titleEl) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set([logoEl, titleEl], { opacity: 1, y: 0, scale: 1 });
        return;
      }

      // Initial state
      gsap.set(logoEl, { opacity: 0, scale: 0.92, y: 20 });
      gsap.set(titleEl, { opacity: 0, y: 25 });
      if (glowEl) gsap.set(glowEl, { opacity: 0, scale: 0.85 });

      // Entrance animation on page load
      const enterTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      enterTl
        .to(glowEl, { opacity: 1, scale: 1, duration: 1.6, ease: 'power2.out' }, 0)
        .to(logoEl, { opacity: 1, scale: 1, y: 0, duration: 1.4 }, 0.2)
        .to(titleEl, { opacity: 1, y: 0, duration: 1.2 }, 0.5);

      // Desktop: Controlled, smooth scroll response that cleanly releases
      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px)', () => {
        const scrollTl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=85%', // Moderate distance, releases completely
            scrub: 0.8,
            pin: true,
            anticipatePin: 1
          }
        });

        scrollTl
          .to(logoEl, {
            scale: 1.05,
            y: -15,
            opacity: 0.9,
            ease: 'power1.inOut'
          }, 0)
          .to(titleEl, {
            y: -10,
            opacity: 0.85,
            ease: 'power1.inOut'
          }, 0);
      });

      mm.add('(max-width: 767px)', () => {
        // Mobile: Clean non-pinned fluid behavior
        gsap.to(logoEl, {
          y: -10,
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: 1
          }
        });
      });
    }, section);

    return () => ctx.revert();
  }, [isKn]);

  return (
    <section
      ref={sectionRef}
      className="brand-film-hero relative w-full min-h-[92vh] sm:min-h-screen bg-[#FAF6EE] text-[#2C1810] flex items-center justify-center overflow-hidden select-none"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 50% 40%, rgba(245, 235, 220, 0.95) 0%, rgba(250, 246, 238, 0.98) 75%)'
      }}
    >
      {/* Subtle organic warmth & texture behind logo */}
      <div
        ref={backdropGlowRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] sm:w-[680px] h-[480px] sm:h-[680px] bg-gradient-to-tr from-amber-500/10 via-orange-600/5 to-amber-700/10 blur-[100px] rounded-full pointer-events-none"
      />

      {/* Main Content Container */}
      <div
        ref={containerRef}
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center py-16 sm:py-24"
      >
        {/* Subtle Heritage Tag */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#FAF0E1] border border-[#DFC7A2] text-[#8B3214] text-[11px] sm:text-xs font-semibold tracking-widest uppercase mb-8 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#993300]" />
          <span>{isKn ? 'ಮೂರು ದಶಕಗಳ ಸುವಾಸನೆ' : 'Three Decades of Experience'}</span>
          <span className="text-[#C5A059]">•</span>
          <span>{isKn ? 'ಕರ್ನಾಟಕ' : 'Karnataka'}</span>
        </div>

        {/* Official Indima Logo Reveal */}
        <div
          ref={logoWrapperRef}
          className="relative mb-6 sm:mb-8"
        >
          <div className="relative p-4 sm:p-6 rounded-3xl bg-[#FFFDF9]/90 border border-[#E8DFD3] shadow-xl shadow-[#2C1810]/5 backdrop-blur-xs">
            <img
              src="/indima-logo.svg"
              alt="Indima Spice Co."
              className="h-24 sm:h-32 md:h-40 w-auto object-contain drop-shadow-[0_8px_20px_rgba(44,24,16,0.12)]"
              onError={e => {
                const target = e.target as HTMLImageElement;
                if (!target.src.endsWith('/indima-brand-logo.jpg')) {
                  target.src = '/indima-brand-logo.jpg';
                }
              }}
            />
          </div>
        </div>

        {/* Editorial Welcome & Statement */}
        <div ref={titleWrapperRef} className="space-y-3 sm:space-y-4 max-w-2xl">
          <p className="text-xs sm:text-sm font-mono uppercase tracking-[0.25em] text-[#993300] font-semibold">
            {isKn ? 'ಪರಿಶುದ್ಧ ಪರಂಪರೆ' : 'Authentic Indian Spices'}
          </p>

          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#2C1810] leading-[1.15] text-balance">
            {isKn ? 'ಇಂದಿಮಾಗೆ ಸುಸ್ವಾಗತ' : 'Welcome to Indima'}
          </h1>

          <p className="font-serif italic text-base sm:text-xl text-[#6B4E3D] max-w-xl mx-auto leading-relaxed pt-1 font-normal">
            {isKn
              ? '“ಸಾಂಪ್ರದಾಯಿಕ ಬೇರುಗಳಿಂದ ಮೂಡಿದ ಅಪ್ಪಟ ಮಸಾಲೆಗಳು. ನಮ್ಮ ಪ್ರೀತಿಯ ಅಡುಗೆಗಾಗಿ.”'
              : '“Spices rooted in tradition. Made for the food we love.”'}
          </p>

          {adminTitle && adminTitle !== (isKn ? 'ಇಂದಿಮಾಗೆ ಸುಸ್ವಾಗತ' : 'Welcome to Indima') && (
            <p className="text-xs sm:text-sm text-[#8C7667] max-w-lg mx-auto pt-2 font-normal">
              {adminTitle}
            </p>
          )}
        </div>

        {/* Bottom Scroll Guidance */}
        <div className="mt-12 sm:mt-16 flex flex-col items-center text-[#8C7667] space-y-1.5 cursor-pointer" onClick={onExploreClick}>
          <span className="text-[10px] tracking-widest uppercase font-mono font-medium">
            {isKn ? 'ಕಥೆಯನ್ನು ತಿಳಿಯಲು ಕೆಳಗೆ ಸ್ಕ್ರಾಲ್ ಮಾಡಿ' : 'Scroll Down to Discover'}
          </span>
          <ArrowDown className="w-4 h-4 animate-bounce text-[#993300]" />
        </div>
      </div>
    </section>
  );
};
