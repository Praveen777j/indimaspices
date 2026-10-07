import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../../contexts/LanguageContext';
import { Sparkles } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const BrandStorySection: React.FC = () => {
  const { language } = useLanguage();
  const isKn = language === 'kn';

  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const storyRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const numEl = numberRef.current;
    const headEl = headlineRef.current;
    const storyEl = storyRef.current;

    if (!section || !numEl || !headEl || !storyEl) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set([numEl, headEl, storyEl], { opacity: 1, y: 0, scale: 1 });
        return;
      }

      const mm = gsap.matchMedia();

      // Desktop: Controlled pin and typographic transformation
      mm.add('(min-width: 768px)', () => {
        gsap.set(numEl, { opacity: 0.25, scale: 0.95 });
        gsap.set(headEl, { opacity: 0.3, y: 20 });
        gsap.set(storyEl, { opacity: 0, y: 30 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=75%', // Short, releases cleanly
            scrub: 0.8,
            pin: true,
            anticipatePin: 1
          }
        });

        tl.to(numEl, {
          opacity: 1,
          scale: 1,
          ease: 'power2.out',
          duration: 0.5
        })
          .to(
            headEl,
            {
              opacity: 1,
              y: 0,
              ease: 'power2.out',
              duration: 0.5
            },
            '-=0.3'
          )
          .to(
            storyEl,
            {
              opacity: 1,
              y: 0,
              ease: 'power2.out',
              duration: 0.6
            },
            '-=0.2'
          );
      });

      // Mobile: Staggered reveal without pinning
      mm.add('(max-width: 767px)', () => {
        gsap.from([numEl, headEl, storyEl], {
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'bottom 70%',
            toggleActions: 'play none none reverse'
          },
          opacity: 0,
          y: 20,
          stagger: 0.15,
          duration: 0.8,
          ease: 'power2.out'
        });
      });
    }, section);

    return () => ctx.revert();
  }, [isKn]);

  return (
    <section
      ref={sectionRef}
      id="brand-story"
      className="brand-story-section relative w-full min-h-[90vh] bg-[#F7F1E5] text-[#2C1810] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 overflow-hidden select-none"
      style={{
        backgroundImage:
          'radial-gradient(circle at 50% 50%, rgba(255, 253, 249, 0.9) 0%, rgba(247, 241, 229, 0.98) 80%)'
      }}
    >
      {/* Background warm earthen tones */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-700/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div
        ref={containerRef}
        className="relative z-10 max-w-4xl mx-auto w-full text-center flex flex-col items-center"
      >
        {/* Heritage Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#FFFDF9] border border-[#DFC7A2] text-[#8B3214] text-xs font-semibold tracking-widest uppercase mb-6 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#993300]" />
          <span>{isKn ? 'ನಮ್ಮ ಪರಂಪರೆ' : 'Brand Heritage'}</span>
        </div>

        {/* Large "30+" Typographic Moment */}
        <div
          ref={numberRef}
          className="font-serif text-6xl sm:text-8xl md:text-9xl font-bold tracking-tight text-[#993300]/90 leading-none select-none my-2"
        >
          30+
        </div>

        {/* Transformation Typography */}
        <h2
          ref={headlineRef}
          className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#2C1810] leading-[1.2] mt-4 max-w-2xl text-balance"
        >
          {isKn
            ? 'ಮೂರು ದಶಕಗಳ ಅಪಾರ ಅನುಭವ ಮತ್ತು ಸುವಾಸನೆಯ ಪಯಣ.'
            : 'Three Decades of Experience in Authentic Spices.'}
        </h2>

        {/* Brand Belief Statement */}
        <p
          ref={storyRef}
          className="font-serif italic text-base sm:text-xl md:text-2xl text-[#6B4E3D] max-w-2xl mx-auto mt-6 leading-relaxed font-normal"
        >
          {isKn
            ? '“ಉತ್ತಮ ಆಹಾರವು ಉತ್ತಮ ಸಾಂಬಾರ ಪದಾರ್ಥಗಳಿಂದಲೇ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ ಎಂಬ ಸರಳ ನಂಬಿಕೆ — ನಮ್ಮ ಮೂರು ದಶಕಗಳ ಅಚಲ ಬದ್ಧತೆ.”'
            : '“Built around a simple belief — good food begins with good spices.”'}
        </p>

        {/* Subtle Decorative Elements */}
        <div className="mt-10 pt-6 border-t border-[#DFC7A2]/50 flex items-center justify-center space-x-6 text-[#8C7667] text-xs font-mono uppercase tracking-widest">
          <span>{isKn ? 'ಅಪ್ಪಟ ಕಾಳುಗಳು' : 'Whole Ingredients'}</span>
          <span>•</span>
          <span>{isKn ? 'ನೈಜ ಸುವಾಸನೆ' : 'Honest Flavour'}</span>
          <span>•</span>
          <span>{isKn ? 'ಮನೆಯ ಅಡುಗೆ' : 'Home Kitchens'}</span>
        </div>
      </div>
    </section>
  );
};
