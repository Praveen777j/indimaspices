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
  const cardRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const statementRef = useRef<HTMLParagraphElement>(null);
  const decorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const card = cardRef.current;
    const headline = headlineRef.current;
    const statement = statementRef.current;
    const decor = decorRef.current;

    if (!section || !card || !headline || !statement) return;

    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      gsap.set(card, { opacity: 0, y: 40, scale: 0.96 });
      gsap.set(headline, { opacity: 0, y: 25 });
      gsap.set(statement, { opacity: 0, y: 20 });
      if (decor) gsap.set(decor, { opacity: 0, scale: 0.9 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          end: isMobile ? 'bottom 85%' : '+=70%',
          scrub: 0.7,
          pin: !isMobile, // Brief desktop pin that releases cleanly
          anticipatePin: 1
        }
      });

      tl.to(card, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1,
        ease: 'power2.out'
      })
        .to(
          headline,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out'
          },
          '-=0.6'
        )
        .to(
          statement,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out'
          },
          '-=0.5'
        );

      if (decor) {
        tl.to(
          decor,
          {
            opacity: 0.7,
            scale: 1,
            duration: 0.8,
            ease: 'power2.out'
          },
          '-=0.7'
        );
      }
    }, section);

    return () => ctx.revert();
  }, [isKn]);

  return (
    <section
      ref={sectionRef}
      className="brand-story-section relative w-full min-h-[90vh] bg-[#21120B] text-[#F5EBE1] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 overflow-hidden select-none"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-amber-600/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-700/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Center Story Card */}
      <div
        ref={cardRef}
        className="relative max-w-4xl mx-auto w-full bg-[#2A180E]/90 border border-amber-600/25 rounded-3xl p-6 sm:p-12 md:p-16 shadow-2xl backdrop-blur-md text-center"
      >
        {/* Subtle Heritage Crest */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-950/70 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-widest uppercase mb-6">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{isKn ? 'ನಮ್ಮ ಪರಂಪರೆ' : '30-Year Brand Heritage'}</span>
        </div>

        {/* Main Headline */}
        <h2
          ref={headlineRef}
          className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#FAF3E8] leading-[1.15] mb-6"
        >
          {isKn
            ? 'ಮೂರು ದಶಕಗಳ ಸುವಾಸನೆಯ ಪಯಣ.'
            : 'THREE DECADES OF FLAVOUR.'}
        </h2>

        {/* Narrative Statement */}
        <p
          ref={statementRef}
          className="font-serif italic text-base sm:text-xl md:text-2xl text-amber-200/90 leading-relaxed max-w-2xl mx-auto font-normal"
        >
          {isKn
            ? '“ಉತ್ತಮ ಆಹಾರವು ಉತ್ತಮ ಸಾಂಬಾರ ಪದಾರ್ಥಗಳಿಂದಲೇ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ ಎಂಬ ಸರಳ ನಂಬಿಕೆ — ನಮ್ಮ ಮೂರು ದಶಕಗಳ ಅಚಲ ಬದ್ಧತೆ.”'
            : '“Built around a simple belief — good food begins with good spices.”'}
        </p>

        {/* Subtle Decorative Spice Flourish */}
        <div
          ref={decorRef}
          className="mt-8 pt-6 border-t border-amber-700/25 flex items-center justify-center space-x-6 text-amber-300/60 text-xs font-mono uppercase tracking-widest"
        >
          <span>{isKn ? 'ಅಪ್ಪಟ ಕಾಳುಗಳು' : 'Whole Ingredients'}</span>
          <span>•</span>
          <span>{isKn ? 'ನೈಜ ರುಚಿ' : 'True Flavour'}</span>
          <span>•</span>
          <span>{isKn ? 'ಮನೆಯ ಅಡುಗೆ' : 'Home Kitchens'}</span>
        </div>
      </div>
    </section>
  );
};
