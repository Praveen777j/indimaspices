import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../../contexts/LanguageContext';
import { Sparkles } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const SpiceProcessingJourney: React.FC = () => {
  const { language } = useLanguage();
  const isKn = language === 'kn';

  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Stage references
  const stageWholeRef = useRef<HTMLDivElement>(null);
  const stagePrepRef = useRef<HTMLDivElement>(null);
  const stageGrindRef = useRef<HTMLDivElement>(null);
  const stageBlendRef = useRef<HTMLDivElement>(null);
  const stagePackRef = useRef<HTMLDivElement>(null);

  // Grinder wheel SVG
  const grinderWheelRef = useRef<SVGGElement>(null);

  // Active step tracker for UI feedback
  const [activeStep, setActiveStep] = useState(0);

  // Interactive Particle Simulation on Canvas (Sparks, fragments, powder spill & blending vortex)
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

    // Particle pool for powder streams and grinder fragments
    interface Particle {
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

    const particles: Particle[] = [];
    const colors = ['#C41E10', '#E53E3E', '#F59E0B', '#D97706', '#B45309', '#FBBF24'];

    const spawnPowderBurst = (cx: number, cy: number, count = 3) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2.5 + 0.8;
        particles.push({
          x: cx + (Math.random() - 0.5) * 20,
          y: cy + (Math.random() - 0.5) * 20,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed + 1.2, // gravity
          size: Math.random() * 3 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          life: 0,
          maxLife: 60 + Math.random() * 40
        });
      }
    };

    let tick = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      tick++;

      // Emit continuous fine spice powder stream from center stage
      if (tick % 2 === 0 && particles.length < 180) {
        spawnPowderBurst(width * 0.5, height * 0.45, 2);
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy += 0.04; // gravity drift
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        if (p.life >= p.maxLife || p.y > height + 20) {
          particles.splice(i, 1);
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

  // GSAP ScrollTrigger Sequence
  useEffect(() => {
    const section = sectionRef.current;
    const whole = stageWholeRef.current;
    const prep = stagePrepRef.current;
    const grind = stageGrindRef.current;
    const blend = stageBlendRef.current;
    const pack = stagePackRef.current;
    const grinderWheel = grinderWheelRef.current;

    if (!section || !whole || !prep || !grind || !blend || !pack) return;

    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      // Set initial state
      gsap.set([prep, grind, blend, pack], { opacity: 0, scale: 0.9, y: 30, display: 'none' });
      gsap.set(whole, { opacity: 1, scale: 1, y: 0, display: 'block' });

      // Master Scroll-driven timeline for the journey with limited pin distance
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: isMobile ? '+=80%' : '+=170%', // Limited distance, then releases naturally!
          scrub: 0.75,
          pin: !isMobile, // Brief desktop pin, natural release
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress;
            if (p < 0.22) setActiveStep(0);
            else if (p < 0.44) setActiveStep(1);
            else if (p < 0.68) setActiveStep(2);
            else if (p < 0.88) setActiveStep(3);
            else setActiveStep(4);
          }
        }
      });

      // 1 -> 2: Whole moves into Preparation
      tl.to(whole, {
        opacity: 0,
        scale: 0.85,
        y: -40,
        duration: 0.4,
        onComplete: () => {
          if (whole) whole.style.display = 'none';
        },
        onReverseComplete: () => {
          if (whole) whole.style.display = 'block';
        }
      })
        .set(prep, { display: 'block' })
        .to(prep, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.4
        })

        // 2 -> 3: Preparation moves into Grinding (WOW Moment)
        .to(prep, {
          opacity: 0,
          scale: 0.85,
          y: -40,
          duration: 0.4,
          onComplete: () => {
            if (prep) prep.style.display = 'none';
          },
          onReverseComplete: () => {
            if (prep) prep.style.display = 'block';
          }
        })
        .set(grind, { display: 'block' })
        .to(grind, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.4
        });

      // Grinder wheel continuous rotation linked to scroll during grind phase
      if (grinderWheel) {
        tl.to(
          grinderWheel,
          {
            rotation: 720,
            transformOrigin: '50% 50%',
            ease: 'none',
            duration: 1
          },
          '-=0.2'
        );
      }

      // 3 -> 4: Grinding powder spills into Blending Vortex
      tl.to(grind, {
        opacity: 0,
        scale: 0.85,
        y: -40,
        duration: 0.4,
        onComplete: () => {
          if (grind) grind.style.display = 'none';
        },
        onReverseComplete: () => {
          if (grind) grind.style.display = 'block';
        }
      })
        .set(blend, { display: 'block' })
        .to(blend, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.4
        })

        // 4 -> 5: Blending into Packaging
        .to(blend, {
          opacity: 0,
          scale: 0.85,
          y: -40,
          duration: 0.4,
          onComplete: () => {
            if (blend) blend.style.display = 'none';
          },
          onReverseComplete: () => {
            if (blend) blend.style.display = 'block';
          }
        })
        .set(pack, { display: 'block' })
        .to(pack, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.4
        });
    }, section);

    return () => ctx.revert();
  }, [isKn]);

  const stepLabels = [
    { en: '1. Whole Spice', kn: '೧. ಅಪ್ಪಟ ಕಾಳು' },
    { en: '2. Preparation', kn: '೨. ಶುದ್ಧೀಕರಣ' },
    { en: '3. Mill Grinding', kn: '೩. ಕಲ್ಲಿನ ಬೀಸುವಿಕೆ' },
    { en: '4. Blending', kn: '೪. ಸುವಾಸನೆಯ ಸಮ್ಮಿಲನ' },
    { en: '5. Sealed Pack', kn: '೫. ಸಿದ್ಧ ಪ್ಯಾಕೆಟ್' }
  ];

  return (
    <section
      ref={sectionRef}
      className="spice-process-section relative w-full min-h-[95vh] sm:min-h-screen bg-[#160B06] text-[#FAF3E8] py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden select-none flex items-center justify-center"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 50% 50%, rgba(85, 30, 10, 0.45) 0%, rgba(22, 11, 6, 0.98) 85%)'
      }}
    >
      {/* Background canvas for live particle powder spill and trails */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Warm ambient stage glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-red-600/15 via-amber-600/15 to-orange-500/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div
        ref={containerRef}
        className="relative z-20 max-w-5xl mx-auto w-full flex flex-col items-center justify-center"
      >
        {/* Step Indicator Header Pills */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 mb-8 sm:mb-12 overflow-x-auto max-w-full px-2 py-1 scrollbar-none">
          {stepLabels.map((lbl, idx) => (
            <div
              key={idx}
              className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono tracking-wider uppercase transition-all duration-300 border ${
                activeStep === idx
                  ? 'bg-amber-600/30 border-amber-400 text-amber-200 shadow-md shadow-amber-900/50 scale-105'
                  : 'bg-black/30 border-amber-900/40 text-amber-400/50'
              }`}
            >
              {isKn ? lbl.kn : lbl.en}
            </div>
          ))}
        </div>

        {/* STAGE CONTAINER (Swap visually via GSAP, DOM stays mounted) */}
        <div className="relative w-full min-h-[380px] sm:min-h-[440px] flex items-center justify-center text-center">
          {/* 1. WHOLE SPICE STAGE */}
          <div ref={stageWholeRef} className="w-full max-w-2xl mx-auto space-y-6">
            <div className="relative mx-auto w-48 h-48 sm:w-60 sm:h-60 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-red-600/20 to-amber-500/10 blur-xl" />
              <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-2xl">
                <defs>
                  <linearGradient id="wholeChilli" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E53E3E" />
                    <stop offset="50%" stopColor="#9B1C1C" />
                    <stop offset="100%" stopColor="#4A0E0E" />
                  </linearGradient>
                </defs>
                <path d="M 85 30 Q 105 10 120 15 Q 110 35 95 45 Z" fill="#4B6331" />
                <path
                  d="M 90 45 C 115 65 140 100 135 140 C 130 170 95 190 85 195 C 90 175 110 155 108 125 C 105 85 85 60 90 45 Z"
                  fill="url(#wholeChilli)"
                />
              </svg>
            </div>
            <div>
              <p className="text-amber-400 font-mono text-xs uppercase tracking-widest">
                {isKn ? 'ಹಂತ ೧ • ಮೂಲ ಸ್ವರೂಪ' : 'STAGE 01 • THE ORIGIN'}
              </p>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#FAF3E8] mt-2">
                {isKn ? 'ಅಪ್ಪಟ ಕಾಳುಗಳು.' : 'WHOLE.'}
              </h2>
              <p className="font-serif italic text-base sm:text-lg text-amber-200/90 max-w-md mx-auto mt-2 font-normal">
                {isKn
                  ? 'ನೈಸರ್ಗಿಕವಾಗಿ ಒಣಗಿಸಿದ ಬ್ಯಾಡಗಿ ಮೆಣಸು, ಅರಿಶಿನ ಮತ್ತು ಸಾಂಬಾರ ಕಾಳುಗಳು.'
                  : 'Sun-ripened, fragrant whole spices arriving directly from verified harvests.'}
              </p>
            </div>
          </div>

          {/* 2. PREPARATION & CLEANING STAGE */}
          <div ref={stagePrepRef} className="w-full max-w-2xl mx-auto space-y-6">
            <div className="relative mx-auto w-48 h-48 sm:w-60 sm:h-60 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-600/20 to-orange-500/10 blur-xl" />
              <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-2xl">
                <defs>
                  <linearGradient id="prepBasket" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#A16207" />
                    <stop offset="100%" stopColor="#451A03" />
                  </linearGradient>
                </defs>
                {/* Winnowing platter / bamboo moram silhouette */}
                <ellipse cx="100" cy="140" rx="75" ry="35" fill="url(#prepBasket)" stroke="#CA8A04" strokeWidth="2.5" />
                <path d="M 30 135 Q 100 80 170 135" stroke="#EAB308" strokeWidth="2" fill="none" opacity="0.6" />
                {/* Spices in tray */}
                <circle cx="70" cy="130" r="8" fill="#C41E10" />
                <circle cx="95" cy="125" r="9" fill="#D97706" />
                <circle cx="120" cy="132" r="7.5" fill="#E2B770" />
                <circle cx="140" cy="138" r="6" fill="#1C1917" />
                <circle cx="85" cy="142" r="7" fill="#C41E10" />
              </svg>
            </div>
            <div>
              <p className="text-amber-400 font-mono text-xs uppercase tracking-widest">
                {isKn ? 'ಹಂತ ೨ • ಸಿದ್ಧತೆ' : 'STAGE 02 • PREPARATION'}
              </p>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#FAF3E8] mt-2">
                {isKn ? 'ಆಯ್ಕೆ ಮತ್ತು ಸ್ವಚ್ಛತೆ.' : 'CLEANED & SELECTED.'}
              </h2>
              <p className="font-serif italic text-base sm:text-lg text-amber-200/90 max-w-md mx-auto mt-2 font-normal">
                {isKn
                  ? 'ದೂಳು, ಕಸವಿಲ್ಲದೆ ಕೈಯಿಂದ ಆಯ್ದು ಸ್ವಚ್ಛಗೊಳಿಸಿದ ಸಾಂಬಾರ ಪದಾರ್ಥಗಳು.'
                  : 'Hand-sorted and winnowed to ensure only clean whole ingredients enter the mill.'}
              </p>
            </div>
          </div>

          {/* 3. GRINDING STAGE (MAJOR WOW MOMENT) */}
          <div ref={stageGrindRef} className="w-full max-w-2xl mx-auto space-y-6">
            <div className="relative mx-auto w-52 h-52 sm:w-64 sm:h-64 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-600/30 via-red-600/20 to-transparent blur-2xl" />

              {/* Traditional Chakki / Mill Stone Assembly */}
              <svg viewBox="0 0 240 240" className="w-full h-full filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)]">
                <defs>
                  <radialGradient id="baseStoneGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#44403C" />
                    <stop offset="70%" stopColor="#292524" />
                    <stop offset="100%" stopColor="#1C1917" />
                  </radialGradient>
                  <radialGradient id="topStoneGrad" cx="45%" cy="45%" r="55%">
                    <stop offset="0%" stopColor="#78716C" />
                    <stop offset="50%" stopColor="#57534E" />
                    <stop offset="90%" stopColor="#292524" />
                    <stop offset="100%" stopColor="#1C1917" />
                  </radialGradient>
                </defs>

                {/* Bottom Base Mill Stone */}
                <circle cx="120" cy="120" r="105" fill="url(#baseStoneGrad)" stroke="#78716C" strokeWidth="2.5" />
                {/* Discharge ring where powder flows */}
                <circle cx="120" cy="120" r="95" fill="none" stroke="#D97706" strokeWidth="3" opacity="0.6" strokeDasharray="6 4" />

                {/* Rotating Top Grinding Stone */}
                <g ref={grinderWheelRef} transform="translate(120, 120)">
                  <circle cx="0" cy="0" r="80" fill="url(#topStoneGrad)" stroke="#A8A29E" strokeWidth="2" />
                  {/* Traditional Radial Stone Grooves */}
                  <line x1="-60" y1="0" x2="60" y2="0" stroke="#292524" strokeWidth="3" opacity="0.7" />
                  <line x1="0" y1="-60" x2="0" y2="60" stroke="#292524" strokeWidth="3" opacity="0.7" />
                  <line x1="-45" y1="-45" x2="45" y2="45" stroke="#292524" strokeWidth="3" opacity="0.7" />
                  <line x1="-45" y1="45" x2="45" y2="-45" stroke="#292524" strokeWidth="3" opacity="0.7" />

                  {/* Central Feed Hole (Where spices drop in) */}
                  <circle cx="0" cy="0" r="22" fill="#1C1917" stroke="#CA8A04" strokeWidth="2" />
                  {/* Whole chilli fragment entering feed hole */}
                  <circle cx="-4" cy="-4" r="7" fill="#C41E10" />
                  <circle cx="5" cy="5" r="5" fill="#F59E0B" />

                  {/* Traditional Wooden Handle Peg */}
                  <circle cx="55" cy="0" r="11" fill="#78350F" stroke="#FDE047" strokeWidth="2" />
                  <circle cx="55" cy="0" r="4" fill="#B45309" />
                </g>
              </svg>
            </div>
            <div>
              <p className="text-amber-400 font-mono text-xs uppercase tracking-widest">
                {isKn ? 'ಹಂತ ೩ • ಕಲ್ಲಿನ ಬೀಸುವಿಕೆ' : 'STAGE 03 • THE MILL'}
              </p>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#FAF3E8] mt-2">
                {isKn ? 'ಕಲ್ಲಿನಲ್ಲಿ ನುಣ್ಣಗೆ ಬೀಸುವಿಕೆ.' : 'THE GRINDING MOMENT.'}
              </h2>
              <p className="font-serif italic text-base sm:text-lg text-amber-200/90 max-w-md mx-auto mt-2 font-normal">
                {isKn
                  ? 'ಸಾಂಪ್ರದಾಯಿಕ ಕಲ್ಲಿನ ಚಲನೆಯಿಂದ ಕಾಳುಗಳು ಒಡೆದು, ನೈಸರ್ಗಿಕ ತೈಲಗಳ ಸುವಾಸನೆಯೊಂದಿಗೆ ಪುಡಿಯಾಗುತ್ತವೆ.'
                  : 'As the stones turn, whole spices break apart into rich, aromatic fragments and fine powder.'}
              </p>
            </div>
          </div>

          {/* 4. BLENDING STAGE (Converging Streams) */}
          <div ref={stageBlendRef} className="w-full max-w-2xl mx-auto space-y-6">
            <div className="relative mx-auto w-48 h-48 sm:w-60 sm:h-60 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-600/25 via-amber-500/20 to-red-600/25 blur-xl" />
              {/* Converging vortex visual */}
              <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-2xl">
                <defs>
                  <linearGradient id="vortexRed" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C41E10" />
                    <stop offset="100%" stopColor="#7F1D1D" />
                  </linearGradient>
                  <linearGradient id="vortexGold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#B45309" />
                  </linearGradient>
                </defs>
                <path d="M 30 50 Q 80 100 100 100 Q 120 100 170 50" stroke="url(#vortexRed)" strokeWidth="12" fill="none" strokeLinecap="round" />
                <path d="M 30 150 Q 80 100 100 100 Q 120 100 170 150" stroke="url(#vortexGold)" strokeWidth="10" fill="none" strokeLinecap="round" />
                <circle cx="100" cy="100" r="28" fill="#993300" stroke="#FDE047" strokeWidth="2.5" />
                <circle cx="100" cy="100" r="16" fill="#F59E0B" />
              </svg>
            </div>
            <div>
              <p className="text-amber-400 font-mono text-xs uppercase tracking-widest">
                {isKn ? 'ಹಂತ ೪ • ಸಮ್ಮಿಲನ' : 'STAGE 04 • BLENDING'}
              </p>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#FAF3E8] mt-2">
                {isKn ? 'ಸುವಾಸನೆ ಒಂದಾಗುವ ಕ್ಷಣ.' : 'FLAVOUR COMES TOGETHER.'}
              </h2>
              <p className="font-serif italic text-base sm:text-lg text-amber-200/90 max-w-md mx-auto mt-2 font-normal">
                {isKn
                  ? 'ಮೆಣಸು, ಅರಿಶಿನ, ಕೊತ್ತಂಬರಿ ಮತ್ತು ಸುಗಂಧ ಪದಾರ್ಥಗಳ ಸಮತೋಲಿತ ಮಿಶ್ರಣ.'
                  : 'Multiple aromatic streams converge in balanced proportions to create signature spice blends.'}
              </p>
            </div>
          </div>

          {/* 5. PACKAGING STAGE */}
          <div ref={stagePackRef} className="w-full max-w-2xl mx-auto space-y-6">
            <div className="relative mx-auto w-48 h-48 sm:w-60 sm:h-60 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/20 to-red-600/15 blur-xl" />
              {/* Premium sealed pouch silhouette with official seal */}
              <svg viewBox="0 0 200 220" className="w-full h-full filter drop-shadow-2xl">
                <defs>
                  <linearGradient id="pouchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2E1B11" />
                    <stop offset="60%" stopColor="#1E120B" />
                    <stop offset="100%" stopColor="#110A06" />
                  </linearGradient>
                  <linearGradient id="goldSeal" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FDE047" />
                    <stop offset="50%" stopColor="#D97706" />
                    <stop offset="100%" stopColor="#78350F" />
                  </linearGradient>
                </defs>
                {/* Pouch shape */}
                <path
                  d="M 45 40 L 155 40 L 165 190 Q 100 205 35 190 Z"
                  fill="url(#pouchGrad)"
                  stroke="#CA8A04"
                  strokeWidth="2"
                />
                {/* Top heat seal texture */}
                <rect x="42" y="36" width="116" height="12" rx="3" fill="#3D2417" stroke="#EAB308" strokeWidth="1.5" />
                {/* Gold branding seal */}
                <circle cx="100" cy="115" r="26" fill="url(#goldSeal)" stroke="#FEF08A" strokeWidth="1.5" />
                <text x="100" y="120" fontFamily="serif" fontSize="11" fontWeight="bold" fill="#1C1917" textAnchor="middle">
                  INDIMA
                </text>
              </svg>
            </div>
            <div>
              <p className="text-amber-400 font-mono text-xs uppercase tracking-widest">
                {isKn ? 'ಹಂತ ೫ • ಪರಿಪೂರ್ಣತೆ' : 'STAGE 05 • FINISHED'}
              </p>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#FAF3E8] mt-2">
                {isKn ? 'ಅಡುಗೆ ಮನೆಗೆ ಸಿದ್ಧ.' : 'SEALED FOR FRESHNESS.'}
              </h2>
              <p className="font-serif italic text-base sm:text-lg text-amber-200/90 max-w-md mx-auto mt-2 font-normal">
                {isKn
                  ? 'ನೈಸರ್ಗಿಕ ಸುವಾಸನೆಯು ಉಳಿಯುವಂತೆ ಸುರಕ್ಷಿತವಾಗಿ ಪ್ಯಾಕ್ ಮಾಡಲ್ಪಟ್ಟಿದೆ.'
                  : 'Sealed to preserve essential volatile aromatics until the moment you open it in your kitchen.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
