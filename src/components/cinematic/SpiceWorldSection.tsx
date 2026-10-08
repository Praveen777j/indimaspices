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
  const chilliCardRef = useRef<HTMLDivElement>(null);
  const turmericCardRef = useRef<HTMLDivElement>(null);
  const pepperCardRef = useRef<HTMLDivElement>(null);
  const corianderCardRef = useRef<HTMLDivElement>(null);
  const backgroundLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const chilli = chilliCardRef.current;
    const turmeric = turmericCardRef.current;
    const pepper = pepperCardRef.current;
    const coriander = corianderCardRef.current;
    const bg = backgroundLayerRef.current;

    if (!section) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) return;

      const mm = gsap.matchMedia();

      // Desktop: Camera-like depth & parallax as real spices move toward the viewer
      mm.add('(min-width: 768px)', () => {
        if (bg) {
          gsap.to(bg, {
            y: 60,
            scale: 1.05,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2
            }
          });
        }

        if (chilli) {
          gsap.to(chilli, {
            y: -70,
            scale: 1.15,
            rotation: 6,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.9
            }
          });
        }

        if (turmeric) {
          gsap.to(turmeric, {
            y: -50,
            scale: 1.12,
            rotation: -5,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.1
            }
          });
        }

        if (pepper) {
          gsap.to(pepper, {
            y: -85,
            scale: 1.2,
            rotation: 12,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.8
            }
          });
        }

        if (coriander) {
          gsap.to(coriander, {
            y: -60,
            scale: 1.14,
            rotation: -8,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1
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
      className="spice-world-section relative w-full min-h-[96vh] bg-[#1A0E08] text-[#FFFDF9] py-24 px-4 sm:px-6 lg:px-8 overflow-hidden select-none flex items-center justify-center"
    >
      {/* DEEP ATMOSPHERIC MACRO TEXTURE LAYER */}
      <div
        ref={backgroundLayerRef}
        className="absolute inset-0 w-full h-full opacity-35 pointer-events-none will-change-transform bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1600&auto=format&fit=crop&q=80")',
          filter: 'blur(3px) brightness(0.65)'
        }}
      />
      <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#1A0E08]/70 to-[#1A0E08] pointer-events-none" />

      {/* TACTILE REAL SPICE MEDIA IN FOREGROUND WITH PARALLAX (Desktop only, hidden on mobile to avoid overlapping central text) */}
      {/* 1. Real Byadgi Whole Chilli (Top Right Foreground) */}
      <div
        ref={chilliCardRef}
        className="hidden md:block absolute top-12 right-4 sm:right-12 md:right-20 w-44 sm:w-60 md:w-72 pointer-events-none z-10 filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.65)]"
      >
        <div className="relative rounded-3xl overflow-hidden border border-amber-500/25 bg-[#26140B]/85 backdrop-blur-md p-2.5 shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&auto=format&fit=crop&q=80"
            alt={isKn ? 'ಅಪ್ಪಟ ಬ್ಯಾಡಗಿ ಮೆಣಸಿನಕಾಯಿ' : 'Authentic Byadgi Chilli'}
            className="w-full h-36 sm:h-44 md:h-52 object-cover rounded-2xl"
          />
          <div className="p-2.5 text-left">
            <p className="text-xs font-bold text-amber-300 font-serif">
              {isKn ? 'ಬ್ಯಾಡಗಿ ಕೆಂಪು ಮೆಣಸು' : 'Byadgi Whole Chillies'}
            </p>
            <p className="text-[10px] text-amber-100/70 font-mono mt-0.5">
              {isKn ? 'ನೈಸರ್ಗಿಕ ಕೆಂಪು ಬಣ್ಣ • ಮೃದು ತೀಕ್ಷ್ಣತೆ' : 'Karnataka GI Tagged • Deep Crimson Aroma'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Real Golden Turmeric Rhizome (Bottom Left Foreground) */}
      <div
        ref={turmericCardRef}
        className="hidden md:block absolute bottom-12 left-4 sm:left-12 md:left-20 w-44 sm:w-56 md:w-68 pointer-events-none z-10 filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.65)]"
      >
        <div className="relative rounded-3xl overflow-hidden border border-amber-500/25 bg-[#26140B]/85 backdrop-blur-md p-2.5 shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80"
            alt={isKn ? 'ಅಪ್ಪಟ ಅರಿಶಿನ' : 'Pure Golden Turmeric'}
            className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-2xl"
          />
          <div className="p-2.5 text-left">
            <p className="text-xs font-bold text-amber-300 font-serif">
              {isKn ? 'ಮಲೆನಾಡಿನ ಅರಿಶಿನ' : 'Golden Turmeric Roots'}
            </p>
            <p className="text-[10px] text-amber-100/70 font-mono mt-0.5">
              {isKn ? 'ನೈಸರ್ಗಿಕ ಕರ್ಕ್ಯುಮಿನ್ • ಶುದ್ಧ ಸುವಾಸನೆ' : 'Natural Curcumin • Earthy Warmth'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Real Black Tellicherry Pepper (Top Left Floating) */}
      <div
        ref={pepperCardRef}
        className="hidden md:block absolute top-20 left-6 sm:left-16 w-36 sm:w-48 pointer-events-none z-10 filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.65)]"
      >
        <div className="relative rounded-2xl overflow-hidden border border-amber-500/20 bg-[#26140B]/90 backdrop-blur-md p-2 shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop&q=80"
            alt={isKn ? 'ಕೊಡಗಿನ ಕಾಳುಮೆಣಸು' : 'Tellicherry Black Pepper'}
            className="w-full h-24 sm:h-32 object-cover rounded-xl"
          />
          <div className="p-2 text-left">
            <p className="text-[11px] font-bold text-amber-300 font-serif">
              {isKn ? 'ಕೊಡಗಿನ ಕಾಳುಮೆಣಸು' : 'Black Pepper Pearls'}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Real Toasted Coriander Seeds (Bottom Right Floating) */}
      <div
        ref={corianderCardRef}
        className="hidden md:block absolute bottom-16 right-6 sm:right-20 w-36 sm:w-48 pointer-events-none z-10 filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.65)]"
      >
        <div className="relative rounded-2xl overflow-hidden border border-amber-500/20 bg-[#26140B]/90 backdrop-blur-md p-2 shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=600&auto=format&fit=crop&q=80"
            alt={isKn ? 'ಪರಿಮಳದ ಕೊತ್ತಂಬರಿ' : 'Toasted Coriander'}
            className="w-full h-24 sm:h-32 object-cover rounded-xl"
          />
          <div className="p-2 text-left">
            <p className="text-[11px] font-bold text-amber-300 font-serif">
              {isKn ? 'ಪರಿಮಳದ ಕೊತ್ತಂಬರಿ' : 'Toasted Coriander'}
            </p>
          </div>
        </div>
      </div>

      {/* CENTRAL CINEMATIC CONTENT */}
      <div
        ref={containerRef}
        className="relative z-20 max-w-4xl mx-auto text-center px-4 sm:px-6"
      >
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#26140B]/85 border border-amber-500/35 text-amber-300 text-xs font-semibold tracking-widest uppercase mb-4 sm:mb-6 shadow-lg backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{isKn ? 'ಅಪ್ಪಟ ಕಾಳುಗಳ ಜಗತ್ತು' : 'The Spice World'}</span>
        </div>

        <h2 className="font-serif text-2xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#FFFDF9] leading-[1.2] mb-4 sm:mb-6 text-balance drop-shadow-xl">
          {isKn
            ? 'ಅಪ್ಪಟ ಕಾಳುಗಳ ಸುಗಂಧ ಸೌಂದರ್ಯ.'
            : 'The Soul of Indian Cooking.'}
        </h2>

        <p className="font-serif italic text-sm sm:text-xl md:text-2xl text-amber-100/90 leading-relaxed max-w-2xl mx-auto font-normal drop-shadow-lg px-2">
          {isKn
            ? '“ನೈಸರ್ಗಿಕ ಕೆಂಪು ಬ್ಯಾಡಗಿ ಮೆಣಸು, ಮಲೆನಾಡಿನ ಅರಿಶಿನ, ಕೊಡಗಿನ ಕಾಳುಮೆಣಸು ಮತ್ತು ಪರಿಮಳದ ಕೊತ್ತಂಬರಿ — ನೈಜ ರುಚಿಯ ಸಂಗಮ.”'
            : '“Rich Byadgi red chillies, golden turmeric rhizomes, Tellicherry black pepper, and toasted coriander in their pristine, natural form.”'}
        </p>

        {/* 4 Clean Attribute Pods with Spice Photo Thumbnails on Mobile */}
        <div className="mt-8 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 max-w-3xl mx-auto">
          <div className="p-3 sm:p-4 rounded-2xl bg-[#26140B]/85 border border-amber-500/25 backdrop-blur-md shadow-lg text-center flex flex-col items-center">
            <div className="md:hidden w-12 h-12 rounded-xl overflow-hidden mb-2 border border-amber-500/30">
              <img
                src="https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=400&auto=format&fit=crop&q=80"
                alt="Byadgi Chilli"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-amber-300 font-serif font-bold text-xs sm:text-base">
              {isKn ? 'ಬ್ಯಾಡಗಿ ಮೆಣಸು' : 'Byadgi Chilli'}
            </p>
            <p className="text-[10px] sm:text-[11px] text-amber-100/70 mt-0.5 sm:mt-1 font-normal">
              {isKn ? 'ನೈಸರ್ಗಿಕ ಕೆಂಪು ಬಣ್ಣ' : 'Rich Crimson Colour'}
            </p>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-[#26140B]/85 border border-amber-500/25 backdrop-blur-md shadow-lg text-center flex flex-col items-center">
            <div className="md:hidden w-12 h-12 rounded-xl overflow-hidden mb-2 border border-amber-500/30">
              <img
                src="https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&auto=format&fit=crop&q=80"
                alt="Pure Turmeric"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-amber-300 font-serif font-bold text-xs sm:text-base">
              {isKn ? 'ಅಪ್ಪಟ ಅರಿಶಿನ' : 'Pure Turmeric'}
            </p>
            <p className="text-[10px] sm:text-[11px] text-amber-100/70 mt-0.5 sm:mt-1 font-normal">
              {isKn ? 'ಮಣ್ಣಿನ ನೈಜ ಸತ್ವ' : 'Golden Earth Essence'}
            </p>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-[#26140B]/85 border border-amber-500/25 backdrop-blur-md shadow-lg text-center flex flex-col items-center">
            <div className="md:hidden w-12 h-12 rounded-xl overflow-hidden mb-2 border border-amber-500/30">
              <img
                src="https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=400&auto=format&fit=crop&q=80"
                alt="Black Pepper"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-amber-300 font-serif font-bold text-xs sm:text-base">
              {isKn ? 'ಕಾಳುಮೆಣಸು' : 'Black Pepper'}
            </p>
            <p className="text-[10px] sm:text-[11px] text-amber-100/70 mt-0.5 sm:mt-1 font-normal">
              {isKn ? 'ತೀಕ್ಷ್ಣ ಸುವಾಸನೆ' : 'Bold Piquant Depth'}
            </p>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-[#26140B]/85 border border-amber-500/25 backdrop-blur-md shadow-lg text-center flex flex-col items-center">
            <div className="md:hidden w-12 h-12 rounded-xl overflow-hidden mb-2 border border-amber-500/30">
              <img
                src="https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=400&auto=format&fit=crop&q=80"
                alt="Coriander"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-amber-300 font-serif font-bold text-xs sm:text-base">
              {isKn ? 'ಕೊತ್ತಂಬರಿ ಬೀಜ' : 'Coriander'}
            </p>
            <p className="text-[10px] sm:text-[11px] text-amber-100/70 mt-0.5 sm:mt-1 font-normal">
              {isKn ? 'ತಾಜಾ ಸುಗಂಧ' : 'Citrus Floral Aroma'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
