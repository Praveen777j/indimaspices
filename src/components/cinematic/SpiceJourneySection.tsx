import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../../contexts/LanguageContext';
import { Sparkles, ArrowDown } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const SpiceJourneySection: React.FC = () => {
  const { language } = useLanguage();
  const isKn = language === 'kn';

  // Sub-scene section references
  const mainWrapperRef = useRef<HTMLDivElement>(null);
  const subSceneWholeRef = useRef<HTMLDivElement>(null);
  const subSceneProcessRef = useRef<HTMLDivElement>(null);
  const subSceneGrindRef = useRef<HTMLDivElement>(null);

  // Canvas for dynamic powder cascade & particle flow in Sub-scene 3
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // CSS 3D Grinder rotating elements
  const grinder3DRef = useRef<HTMLDivElement>(null);

  // -------------------------------------------------------------
  // Dynamic Canvas: Powder Flow & Fragment Explosion in Sub-Scene 3
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', onResize);

    interface PowderParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      life: number;
      maxLife: number;
    }

    const powderStream: PowderParticle[] = [];
    const spiceColors = [
      '#C41E10', // Deep Byadgi Red
      '#DF2915', // Vivid Chilli Red
      '#F59E0B', // Golden Turmeric
      '#D97706', // Warm Amber
      '#E2B770', // Roasted Coriander
      '#993300'  // Ground Paprika
    ];

    const spawnPowder = (originX: number, originY: number, count = 3) => {
      for (let i = 0; i < count; i++) {
        const spread = (Math.random() - 0.5) * 80;
        const angle = Math.PI * 0.5 + (Math.random() - 0.5) * 0.8; // generally downwards
        const speed = Math.random() * 2.8 + 1.2;
        powderStream.push({
          x: originX + spread,
          y: originY + (Math.random() - 0.5) * 15,
          vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 0.8,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 3.2 + 0.8,
          color: spiceColors[Math.floor(Math.random() * spiceColors.length)],
          alpha: 1,
          life: 0,
          maxLife: 80 + Math.random() * 50
        });
      }
    };

    let tick = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      tick++;

      // Emit continuous fluid powder stream from the grinder's discharge rim
      if (powderStream.length < 220) {
        spawnPowder(width * 0.5, height * 0.38, 2);
      }

      for (let i = powderStream.length - 1; i >= 0; i--) {
        const p = powderStream[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985; // air drag
        p.vy += 0.045; // gentle gravity cascade
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        if (p.life >= p.maxLife || p.y > height + 20) {
          powderStream.splice(i, 1);
        }
      }
      ctx.globalAlpha = 1;

      animId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // -------------------------------------------------------------
  // GSAP ScrollTrigger: 3 Independent Sub-Scenes That Release Pins
  // -------------------------------------------------------------
  useEffect(() => {
    const mainWrapper = mainWrapperRef.current;
    const scene1 = subSceneWholeRef.current;
    const scene2 = subSceneProcessRef.current;
    const scene3 = subSceneGrindRef.current;
    const grinder3D = grinder3DRef.current;

    if (!mainWrapper || !scene1 || !scene2 || !scene3) return;

    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      // -----------------------------------------------------------
      // SUB-SCENE 1: WHOLE SPICE
      // Pins briefly on desktop, animates whole spice push-in, releases!
      // -----------------------------------------------------------
      const tl1 = gsap.timeline({
        scrollTrigger: {
          trigger: scene1,
          start: 'top top',
          end: isMobile ? '+=40%' : '+=75%',
          scrub: 0.7,
          pin: !isMobile,
          anticipatePin: 1
        }
      });

      tl1.to('.whole-spice-camera', {
        scale: 1.18,
        y: -25,
        ease: 'power1.inOut'
      })
      .to('.whole-spice-text', {
        y: -15,
        opacity: 0.9,
        ease: 'power1.inOut'
      }, 0);

      // -----------------------------------------------------------
      // SUB-SCENE 2: PROCESSING & WINNOWING
      // Pins briefly on desktop, spices feed & scatter, releases!
      // -----------------------------------------------------------
      const tl2 = gsap.timeline({
        scrollTrigger: {
          trigger: scene2,
          start: 'top top',
          end: isMobile ? '+=40%' : '+=75%',
          scrub: 0.7,
          pin: !isMobile,
          anticipatePin: 1
        }
      });

      tl2.to('.processing-tray', {
        scale: 1.08,
        rotation: 4,
        ease: 'power1.inOut'
      })
      .to('.processing-spices-cluster', {
        y: 35,
        scale: 0.95,
        opacity: 0.85,
        ease: 'power1.inOut'
      }, 0);

      // -----------------------------------------------------------
      // SUB-SCENE 3: GRINDING (WOW MOMENT) WITH CSS 3D & CANVAS
      // Mill stone visibly turns in 3D perspective, creates powder, releases!
      // -----------------------------------------------------------
      const tl3 = gsap.timeline({
        scrollTrigger: {
          trigger: scene3,
          start: 'top top',
          end: isMobile ? '+=50%' : '+=90%',
          scrub: 0.75,
          pin: !isMobile,
          anticipatePin: 1
        }
      });

      if (grinder3D) {
        tl3.to(grinder3D, {
          rotation: 720,
          ease: 'none',
          duration: 1
        });
      }

      tl3.to('.grind-crush-fragments', {
        scale: 1.25,
        opacity: 1,
        y: 20,
        ease: 'power2.out'
      }, 0)
      .to('.grind-powder-burst', {
        opacity: 1,
        scale: 1.15,
        ease: 'power2.out'
      }, 0.2);

    }, mainWrapper);

    return () => ctx.revert();
  }, [isKn]);

  return (
    <section
      ref={mainWrapperRef}
      className="spice-journey-section relative w-full bg-[#180C07] text-[#FAF3E8] select-none"
    >
      {/* ========================================================= */}
      {/* SUB-SCENE 1: WHOLE SPICE TRANSFORMATION                   */}
      {/* ========================================================= */}
      <div
        ref={subSceneWholeRef}
        className="spice-journey-subscene whole-spice-subscene relative w-full min-h-[92vh] sm:min-h-screen flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 50% 45%, rgba(85, 30, 10, 0.5) 0%, rgba(24, 12, 7, 0.98) 85%)'
        }}
      >
        {/* Ambient atmospheric glow */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto w-full text-center flex flex-col items-center">
          {/* Sub-scene step tag */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-950/70 border border-amber-500/30 text-amber-300 text-xs font-mono uppercase tracking-widest mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isKn ? 'ಹಂತ ೧ • ಮೂಲ ಸ್ವರೂಪ' : 'CHAPTER 01 • WHOLE SPICE'}</span>
          </div>

          {/* Whole Spice Visual Stage */}
          <div className="whole-spice-camera relative w-60 h-60 sm:w-80 sm:h-80 flex items-center justify-center my-4">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-red-600/25 via-amber-600/20 to-transparent blur-2xl" />

            {/* Whole Byadgi Chilli & Turmeric Root Composition */}
            <svg viewBox="0 0 240 240" className="w-full h-full filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.7)]">
              <defs>
                <linearGradient id="chilliS1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#DF2915" />
                  <stop offset="50%" stopColor="#9B1C1C" />
                  <stop offset="100%" stopColor="#4A0E0E" />
                </linearGradient>
                <linearGradient id="turmericS1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="60%" stopColor="#D97706" />
                  <stop offset="100%" stopColor="#78350F" />
                </linearGradient>
              </defs>

              {/* Whole Turmeric Rhizome in background */}
              <path
                d="M 60 140 C 70 100 110 90 150 100 C 180 110 195 145 180 170 C 160 195 110 200 80 185 Z"
                fill="url(#turmericS1)"
              />
              <path d="M 90 120 Q 105 150 95 175" stroke="#78350F" strokeWidth="2.5" fill="none" opacity="0.6" />
              <path d="M 130 115 Q 145 145 135 170" stroke="#78350F" strokeWidth="2.5" fill="none" opacity="0.6" />

              {/* Bold Byadgi Whole Chilli curling across foreground */}
              <path d="M 105 35 Q 125 15 145 20 Q 130 45 115 55 Z" fill="#4B6331" />
              <path
                d="M 110 55 C 145 80 175 125 160 170 C 145 205 100 215 80 220 C 110 195 135 175 130 140 C 125 95 100 70 110 55 Z"
                fill="url(#chilliS1)"
              />
              <path d="M 115 90 Q 145 135 135 175" stroke="rgba(255,160,120,0.35)" strokeWidth="4" fill="none" />
            </svg>
          </div>

          {/* Sub-scene Statement */}
          <div className="whole-spice-text space-y-3 max-w-xl">
            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#FAF3E8]">
              {isKn ? 'ಅಪ್ಪಟ ಕಾಳುಗಳು.' : 'WHOLE.'}
            </h2>
            <p className="font-serif italic text-base sm:text-xl text-amber-200/90 leading-relaxed font-normal">
              {isKn
                ? 'ಪ್ರಕೃತಿಯಿಂದ ಆಯ್ದ ಬ್ಯಾಡಗಿ ಕೆಂಪು ಮೆಣಸು ಮತ್ತು ಮಲೆನಾಡಿನ ಅರಿಶಿನ — ಯಾವುದೇ ಸಂಸ್ಕರಣೆ ಇಲ್ಲದ ಮೂಲ ಸತ್ವ.'
                : 'Sun-dried Byadgi red chillies and golden turmeric roots in their pure, unadulterated botanical state.'}
            </p>
          </div>

          <div className="mt-8 flex items-center space-x-1.5 text-xs text-amber-400/60 font-mono">
            <span>{isKn ? 'ಮುಂದಿನ ಹಂತಕ್ಕೆ ಸ್ಕ್ರಾಲ್ ಮಾಡಿ' : 'Scroll to Continue'}</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SUB-SCENE 2: PROCESSING & PREPARATION TRANSFORMATION       */}
      {/* ========================================================= */}
      <div
        ref={subSceneProcessRef}
        className="spice-journey-subscene processing-subscene relative w-full min-h-[92vh] sm:min-h-screen flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 50% 50%, rgba(95, 35, 12, 0.45) 0%, rgba(20, 10, 5, 0.98) 85%)'
        }}
      >
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-600/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto w-full text-center flex flex-col items-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-950/70 border border-amber-500/30 text-amber-300 text-xs font-mono uppercase tracking-widest mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isKn ? 'ಹಂತ ೨ • ಆಯ್ಕೆ & ಶುದ್ಧೀಕರಣ' : 'CHAPTER 02 • PROCESSING'}</span>
          </div>

          {/* Processing Winnowing Tray Visual */}
          <div className="processing-tray relative w-60 h-60 sm:w-80 sm:h-80 flex items-center justify-center my-4">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-600/20 via-orange-500/15 to-transparent blur-2xl" />

            <svg viewBox="0 0 240 240" className="w-full h-full filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.7)]">
              <defs>
                <linearGradient id="trayBamboo" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#A16207" />
                  <stop offset="60%" stopColor="#713F12" />
                  <stop offset="100%" stopColor="#3F2007" />
                </linearGradient>
              </defs>

              {/* Handcrafted bamboo winnowing tray */}
              <ellipse cx="120" cy="150" rx="90" ry="45" fill="url(#trayBamboo)" stroke="#EAB308" strokeWidth="2.5" />
              <path d="M 35 145 Q 120 75 205 145" stroke="#FDE047" strokeWidth="2" fill="none" opacity="0.6" />

              {/* Spices moving into sorting cluster */}
              <g className="processing-spices-cluster">
                <circle cx="85" cy="140" r="10" fill="#C41E10" />
                <circle cx="115" cy="132" r="12" fill="#D97706" />
                <circle cx="145" cy="142" r="9" fill="#E2B770" />
                <circle cx="170" cy="150" r="8" fill="#1C1917" />
                <circle cx="100" cy="155" r="9" fill="#C41E10" />
                <circle cx="130" cy="155" r="8" fill="#D97706" />
              </g>
            </svg>
          </div>

          <div className="space-y-3 max-w-xl">
            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#FAF3E8]">
              {isKn ? 'ಆಯ್ಕೆ ಮತ್ತು ಸಿದ್ಧತೆ.' : 'PREPARATION.'}
            </h2>
            <p className="font-serif italic text-base sm:text-xl text-amber-200/90 leading-relaxed font-normal">
              {isKn
                ? 'ಕೈಯಿಂದ ಆಯ್ದು, ಸ್ವಚ್ಛಗೊಳಿಸಿ, ಬೀಸುವಿಕೆಗೆ ಸಿದ್ಧಪಡಿಸಿದ ಪರಿಶುದ್ಧ ಪದಾರ್ಥಗಳು.'
                : 'Winnowed, hand-sorted, and carefully prepared to feed cleanly into the traditional mill.'}
            </p>
          </div>

          <div className="mt-8 flex items-center space-x-1.5 text-xs text-amber-400/60 font-mono">
            <span>{isKn ? 'ಮುಂದಿನ ಹಂತಕ್ಕೆ ಸ್ಕ್ರಾಲ್ ಮಾಡಿ' : 'Scroll to Grind'}</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SUB-SCENE 3: GRINDING (WOW MOMENT) WITH CSS 3D & CANVAS   */}
      {/* ========================================================= */}
      <div
        ref={subSceneGrindRef}
        className="spice-journey-subscene grinding-subscene relative w-full min-h-[96vh] sm:min-h-screen flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 50% 50%, rgba(85, 25, 8, 0.5) 0%, rgba(18, 9, 5, 0.98) 85%)'
        }}
      >
        {/* Dynamic Canvas for fluid spice powder stream & particle physics */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* Stage ambient back-lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-r from-red-600/20 via-amber-600/20 to-orange-500/15 blur-[140px] rounded-full pointer-events-none" />

        <div className="relative z-20 max-w-4xl mx-auto w-full text-center flex flex-col items-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-950/70 border border-amber-500/30 text-amber-300 text-xs font-mono uppercase tracking-widest mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isKn ? 'ಹಂತ ೩ • ಕಲ್ಲಿನ ಬೀಸುವಿಕೆ' : 'CHAPTER 03 • THE GRINDING MOMENT'}</span>
          </div>

          {/* CSS 3D Chakki / Grinder Assembly */}
          <div
            className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center my-4"
            style={{ perspective: '1000px' }}
          >
            {/* Soft contact glow under stones */}
            <div className="absolute inset-0 rounded-full bg-amber-600/25 blur-3xl" />

            {/* CSS 3D Tilting Stage Container */}
            <div
              className="relative w-full h-full flex items-center justify-center"
              style={{
                transform: 'rotateX(25deg) rotateY(-5deg)',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Bottom Stationary Stone */}
              <div className="absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-gradient-to-b from-[#3E3834] to-[#1C1815] border-4 border-[#574F4A] shadow-[0_25px_50px_rgba(0,0,0,0.85)] flex items-center justify-center">
                {/* Outer discharge channel with spice powder rim */}
                <div className="absolute inset-2 rounded-full border-2 border-dashed border-amber-500/40 opacity-70" />
              </div>

              {/* Rotating Top Grinding Stone (Animates with ScrollTrigger) */}
              <div
                ref={grinder3DRef}
                className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br from-[#6B635E] via-[#48423E] to-[#25211E] border-2 border-[#8C827B] shadow-2xl flex items-center justify-center"
                style={{
                  boxShadow: '0 15px 35px rgba(0,0,0,0.7), inset 0 2px 8px rgba(255,255,255,0.2)'
                }}
              >
                {/* Radial Stone Grooves */}
                <div className="absolute w-full h-0.5 bg-[#1C1917]/70" />
                <div className="absolute w-0.5 h-full bg-[#1C1917]/70" />
                <div className="absolute w-full h-0.5 bg-[#1C1917]/70 rotate-45" />
                <div className="absolute w-full h-0.5 bg-[#1C1917]/70 -rotate-45" />

                {/* Central Feeding Cavity (Where spices break apart) */}
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#171412] border-2 border-amber-500/50 flex items-center justify-center shadow-inner">
                  {/* Whole spices entering and fracturing into fragments */}
                  <div className="grind-crush-fragments flex items-center justify-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  </div>
                </div>

                {/* Traditional Wooden Handle Peg */}
                <div
                  className="absolute top-5 right-5 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#6C3411] border-2 border-amber-400 shadow-lg flex items-center justify-center"
                  style={{ transform: 'translateZ(15px)' }}
                >
                  <div className="w-2 h-2 rounded-full bg-[#3B1A05]" />
                </div>
              </div>
            </div>
          </div>

          {/* Grinding Statement */}
          <div className="grind-powder-burst space-y-3 max-w-xl">
            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#FAF3E8]">
              {isKn ? 'ಕಲ್ಲಿನಲ್ಲಿ ನುಣ್ಣಗೆ ಬೀಸುವಿಕೆ.' : 'THE GRINDING MOMENT.'}
            </h2>
            <p className="font-serif italic text-base sm:text-xl text-amber-200/90 leading-relaxed font-normal">
              {isKn
                ? 'ಕಲ್ಲುಗಳು ತಿರುಗುತ್ತಿದ್ದಂತೆ ಕಾಳುಗಳು ಒಡೆದು, ನೈಸರ್ಗಿಕ ತೈಲಗಳ ಸುವಾಸನೆಯುಕ್ತ ನುಣ್ಣನೆಯ ಪುಡಿಯಾಗಿ ಹರಿಯುತ್ತದೆ.'
                : 'As the stones rotate, whole spices break apart into rich fragments and cascade into fine, aromatic spice powder.'}
            </p>
          </div>

          <div className="mt-8 flex items-center space-x-1.5 text-xs text-amber-400/80 font-mono">
            <span>{isKn ? 'ಸಿದ್ಧ ಉತ್ಪನ್ನವನ್ನು ನೋಡಿ' : 'Release & Glides Into Store'}</span>
            <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
          </div>
        </div>
      </div>
    </section>
  );
};
