import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../../contexts/LanguageContext';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface StatementItem {
  id: number;
  textEn: string;
  subEn: string;
  textKn: string;
  subKn: string;
  ingredient: 'chilli' | 'turmeric' | 'coriander' | 'powder';
}

const STATEMENTS: StatementItem[] = [
  {
    id: 1,
    textEn: 'THREE DECADES OF EXPERIENCE.',
    subEn: 'Rooted in heritage traditions passed down through generations.',
    textKn: 'ಮೂರು ದಶಕಗಳ ಅಪಾರ ಅನುಭವ.',
    subKn: 'ತಲೆಮಾರುಗಳಿಂದ ಬಂದ ಸಾಂಪ್ರದಾಯಿಕ ಅಡುಗೆಯ ಸತ್ವ.',
    ingredient: 'chilli'
  },
  {
    id: 2,
    textEn: 'GOOD FOOD BEGINS WITH GOOD SPICES.',
    subEn: 'Carefully selected whole spices that form the soul of every recipe.',
    textKn: 'ಉತ್ತಮ ಅಡುಗೆಗೆ ಅಪ್ಪಟ ಮಸಾಲೆಗಳೇ ಮೂಲ.',
    subKn: 'ಪ್ರತಿ ಸಾಂಬಾರ್, ರಸಂಗೆ ಜೀವತುಂಬುವ ನೈಸರ್ಗಿಕ ಕಾಳುಗಳು.',
    ingredient: 'turmeric'
  },
  {
    id: 3,
    textEn: 'FROM WHOLE INGREDIENTS...',
    subEn: 'Sun-dried chillies, golden turmeric, and fragrant coriander seeds.',
    textKn: 'ಸಂಪೂರ್ಣ ನೈಸರ್ಗಿಕ ಕಾಳುಗಳಿಂದ...',
    subKn: 'ಅಪ್ಪಟ ಬ್ಯಾಡಗಿ ಮೆಣಸು, ಅರಿಶಿನ ಮತ್ತು ಸುಗಂಧ ಕೊತ್ತಂಬರಿ.',
    ingredient: 'coriander'
  },
  {
    id: 4,
    textEn: 'TO THE FLAVOUR IN YOUR KITCHEN.',
    subEn: 'Freshly ground to bring authentic nostalgia to every plate.',
    textKn: 'ನಿಮ್ಮ ಅಡುಗೆ ಮನೆಯ ಪರಿಪೂರ್ಣ ರುಚಿಯವರೆಗೆ.',
    subKn: 'ಪ್ರತಿ ತುತ್ತಿನಲ್ಲೂ ತಾಯಿಯ ಕೈರುಚಿಯ ನೈಜ ಸುವಾಸನೆ.',
    ingredient: 'powder'
  }
];

export const HeritageStoryVisual: React.FC = () => {
  const { language } = useLanguage();
  const isKn = language === 'kn';

  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const statementsContainerRef = useRef<HTMLDivElement>(null);
  const visualsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    const statementsEl = statementsContainerRef.current;
    const visualsEl = visualsContainerRef.current;

    if (!section || !container || !statementsEl || !visualsEl) return;

    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      const statementCards = gsap.utils.toArray<HTMLElement>('.statement-card', statementsEl);
      const visualCards = gsap.utils.toArray<HTMLElement>('.visual-element', visualsEl);

      if (isMobile) {
        // Mobile: Clean staggered reveal without pinning trap
        statementCards.forEach((card) => {
          gsap.from(card, {
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              end: 'bottom 60%',
              toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: 'power2.out'
          });
        });
      } else {
        // Desktop: Controlled pinning with smooth statement scrubbing
        // Initially hide all except first
        statementCards.forEach((card, idx) => {
          gsap.set(card, {
            opacity: idx === 0 ? 1 : 0,
            y: idx === 0 ? 0 : 40,
            position: 'absolute',
            inset: 0
          });
        });

        visualCards.forEach((vis, idx) => {
          gsap.set(vis, {
            opacity: idx === 0 ? 1 : 0,
            scale: idx === 0 ? 1 : 0.85,
            rotation: idx === 0 ? 0 : 15,
            position: 'absolute',
            inset: 0
          });
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=140%', // Moderate pin distance that releases cleanly
            scrub: 0.8,
            pin: true,
            anticipatePin: 1
          }
        });

        // Sequence through the 4 statements
        for (let i = 0; i < statementCards.length - 1; i++) {
          const currentText = statementCards[i];
          const nextText = statementCards[i + 1];
          const currentVis = visualCards[i];
          const nextVis = visualCards[i + 1];

          tl.to(
            currentText,
            { opacity: 0, y: -30, duration: 0.5, ease: 'power2.in' },
            `step-${i}`
          )
            .to(
              currentVis,
              { opacity: 0, scale: 0.8, rotation: -20, duration: 0.5, ease: 'power2.in' },
              `step-${i}`
            )
            .to(
              nextText,
              { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
              `step-${i}+=0.3`
            )
            .to(
              nextVis,
              { opacity: 1, scale: 1, rotation: 0, duration: 0.6, ease: 'power2.out' },
              `step-${i}+=0.3`
            );
        }
      }
    }, section);

    return () => ctx.revert();
  }, [isKn]);

  return (
    <section
      ref={sectionRef}
      className="heritage-section relative w-full min-h-screen bg-[#180D07] text-[#FAF3E8] py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden select-none flex items-center justify-center"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 50% 50%, rgba(65, 25, 10, 0.5) 0%, rgba(24, 13, 7, 0.98) 80%)'
      }}
    >
      {/* Background depth motes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/10 w-72 h-72 bg-amber-500/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/10 w-80 h-80 bg-red-600/10 blur-[120px] rounded-full" />
      </div>

      <div
        ref={containerRef}
        className="relative z-10 max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center min-h-[480px]"
      >
        {/* Left Column: Visual Spice Stage */}
        <div className="md:col-span-6 relative flex items-center justify-center min-h-[340px] sm:min-h-[420px]">
          {/* Subtle Stage Pedestal Glow */}
          <div className="absolute w-64 sm:w-80 h-64 sm:h-80 rounded-full bg-gradient-to-tr from-amber-600/20 via-orange-500/15 to-transparent blur-2xl" />

          <div
            ref={visualsContainerRef}
            className="relative w-full h-[320px] sm:h-[400px] flex items-center justify-center"
          >
            {/* Visual 1: Whole Byadgi Chilli */}
            <div className="visual-element flex flex-col items-center justify-center">
              <div className="relative p-6 rounded-3xl bg-[#29160D]/80 border border-amber-600/30 backdrop-blur-md shadow-2xl">
                <svg
                  viewBox="0 0 200 200"
                  className="w-48 h-48 sm:w-60 sm:h-60 filter drop-shadow-[0_15px_25px_rgba(180,30,10,0.5)]"
                >
                  <defs>
                    <linearGradient id="chilliGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#C41E10" />
                      <stop offset="50%" stopColor="#8A1308" />
                      <stop offset="100%" stopColor="#540B05" />
                    </linearGradient>
                    <linearGradient id="stemGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#4A6B2F" />
                      <stop offset="100%" stopColor="#2E441B" />
                    </linearGradient>
                  </defs>
                  {/* Stem */}
                  <path
                    d="M 100 30 Q 115 15 130 20 Q 120 35 105 45 Z"
                    fill="url(#stemGrad)"
                  />
                  {/* Calyx */}
                  <path
                    d="M 90 40 Q 100 48 115 42 Q 110 52 95 48 Z"
                    fill="#3B5724"
                  />
                  {/* Curving Byadgi Chilli Body */}
                  <path
                    d="M 95 44 C 115 60 135 95 130 135 C 125 165 95 185 85 190 C 90 175 110 155 108 125 C 105 85 85 60 95 44 Z"
                    fill="url(#chilliGrad)"
                  />
                  {/* Highlights */}
                  <path
                    d="M 105 65 Q 120 95 118 130"
                    stroke="rgba(255, 140, 100, 0.4)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 text-amber-300 text-[10px] font-mono tracking-widest uppercase whitespace-nowrap">
                  {isKn ? 'ಬ್ಯಾಡಗಿ ಕೆಂಪು ಮೆಣಸು' : 'Byadgi Whole Chilli'}
                </div>
              </div>
            </div>

            {/* Visual 2: Golden Turmeric Root */}
            <div className="visual-element flex flex-col items-center justify-center">
              <div className="relative p-6 rounded-3xl bg-[#29160D]/80 border border-amber-600/30 backdrop-blur-md shadow-2xl">
                <svg
                  viewBox="0 0 200 200"
                  className="w-48 h-48 sm:w-60 sm:h-60 filter drop-shadow-[0_15px_25px_rgba(217,119,6,0.5)]"
                >
                  <defs>
                    <linearGradient id="turmericGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="45%" stopColor="#D97706" />
                      <stop offset="100%" stopColor="#92400E" />
                    </linearGradient>
                  </defs>
                  {/* Rhizome body */}
                  <path
                    d="M 50 110 C 60 80 90 70 120 75 C 150 80 165 110 155 135 C 145 155 115 165 85 155 C 60 145 45 125 50 110 Z"
                    fill="url(#turmericGrad)"
                  />
                  {/* Branching fingers */}
                  <path
                    d="M 115 75 C 125 55 145 50 155 65 C 160 75 145 85 130 85 Z"
                    fill="url(#turmericGrad)"
                  />
                  <path
                    d="M 70 85 C 65 65 80 50 95 60 C 100 70 90 85 80 85 Z"
                    fill="url(#turmericGrad)"
                  />
                  {/* Ring textures */}
                  <path d="M 75 100 Q 85 125 75 140" stroke="#78350F" strokeWidth="2.5" fill="none" opacity="0.6" />
                  <path d="M 100 90 Q 110 120 105 145" stroke="#78350F" strokeWidth="2.5" fill="none" opacity="0.6" />
                  <path d="M 125 95 Q 135 115 130 135" stroke="#78350F" strokeWidth="2.5" fill="none" opacity="0.6" />
                </svg>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 text-amber-300 text-[10px] font-mono tracking-widest uppercase whitespace-nowrap">
                  {isKn ? 'ಅಪ್ಪಟ ಮಲೆನಾಡು ಅರಿಶಿನ' : 'Golden Turmeric Root'}
                </div>
              </div>
            </div>

            {/* Visual 3: Coriander Seeds Cluster */}
            <div className="visual-element flex flex-col items-center justify-center">
              <div className="relative p-6 rounded-3xl bg-[#29160D]/80 border border-amber-600/30 backdrop-blur-md shadow-2xl">
                <svg
                  viewBox="0 0 200 200"
                  className="w-48 h-48 sm:w-60 sm:h-60 filter drop-shadow-[0_15px_25px_rgba(180,130,50,0.5)]"
                >
                  <defs>
                    <radialGradient id="seedGrad" cx="40%" cy="40%" r="60%">
                      <stop offset="0%" stopColor="#E2B770" />
                      <stop offset="60%" stopColor="#B4823A" />
                      <stop offset="100%" stopColor="#6C4918" />
                    </radialGradient>
                  </defs>
                  {/* Multiple Coriander Seeds with ridge lines */}
                  <g transform="translate(100, 100)">
                    <ellipse cx="-25" cy="-20" rx="20" ry="24" transform="rotate(-15)" fill="url(#seedGrad)" />
                    <ellipse cx="25" cy="-15" rx="22" ry="26" transform="rotate(25)" fill="url(#seedGrad)" />
                    <ellipse cx="-10" cy="30" rx="23" ry="25" transform="rotate(5)" fill="url(#seedGrad)" />
                    <ellipse cx="35" cy="25" rx="18" ry="22" transform="rotate(-30)" fill="url(#seedGrad)" />
                    <ellipse cx="-45" cy="15" rx="16" ry="19" transform="rotate(40)" fill="url(#seedGrad)" />
                  </g>
                </svg>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 text-amber-300 text-[10px] font-mono tracking-widest uppercase whitespace-nowrap">
                  {isKn ? 'ಸುಗಂಧ ಕೊತ್ತಂಬರಿ ಬೀಜ' : 'Roasted Coriander Seeds'}
                </div>
              </div>
            </div>

            {/* Visual 4: Fine Spice Powder & Aromatics */}
            <div className="visual-element flex flex-col items-center justify-center">
              <div className="relative p-6 rounded-3xl bg-[#29160D]/80 border border-amber-600/30 backdrop-blur-md shadow-2xl">
                <svg
                  viewBox="0 0 200 200"
                  className="w-48 h-48 sm:w-60 sm:h-60 filter drop-shadow-[0_15px_25px_rgba(200,60,15,0.6)]"
                >
                  <defs>
                    <linearGradient id="powderGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8A1308" />
                      <stop offset="50%" stopColor="#C43B10" />
                      <stop offset="100%" stopColor="#F59E0B" />
                    </linearGradient>
                  </defs>
                  {/* Harmonious spice powder swirl */}
                  <path
                    d="M 40 140 Q 70 80 110 95 T 165 70 Q 150 140 100 155 Z"
                    fill="url(#powderGrad)"
                    opacity="0.95"
                  />
                  {/* Floating powder motes */}
                  <circle cx="55" cy="65" r="4" fill="#F59E0B" />
                  <circle cx="140" cy="50" r="3" fill="#EF4444" />
                  <circle cx="160" cy="115" r="5" fill="#D97706" />
                  <circle cx="75" cy="165" r="3.5" fill="#F59E0B" />
                </svg>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 text-amber-300 text-[10px] font-mono tracking-widest uppercase whitespace-nowrap">
                  {isKn ? 'ಸಿದ್ಧ ಪರಿಶುದ್ಧ ಮಸಾಲೆ ಪುಡಿ' : 'Fresh Ground Flavour'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Statement Text Stage */}
        <div className="md:col-span-6 relative min-h-[220px] sm:min-h-[280px] flex items-center">
          <div
            ref={statementsContainerRef}
            className="relative w-full h-full flex items-center"
          >
            {STATEMENTS.map((item, index) => (
              <div
                key={item.id}
                className="statement-card w-full flex flex-col justify-center space-y-4"
              >
                <div className="flex items-center space-x-3 text-amber-400/80 font-mono text-xs tracking-widest uppercase">
                  <span>STEP 0{index + 1}</span>
                  <span className="w-8 h-px bg-amber-500/40" />
                  <span>{isKn ? 'ಪರಂಪರೆ' : 'Heritage'}</span>
                </div>

                <h3 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#FAF3E8] leading-[1.15]">
                  {isKn ? item.textKn : item.textEn}
                </h3>

                <p className="font-serif italic text-sm sm:text-lg text-amber-200/90 leading-relaxed font-normal">
                  {isKn ? item.subKn : item.subEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
