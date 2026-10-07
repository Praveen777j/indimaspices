import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../../contexts/LanguageContext';
import { Sparkles, ArrowDown } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const SpiceTransformationSection: React.FC = () => {
  const { language } = useLanguage();
  const isKn = language === 'kn';

  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const grinderStoneRef = useRef<HTMLDivElement>(null);

  const [activeStage, setActiveStage] = useState<number>(0);
  const scrollDeltaRef = useRef<number>(1);
  const lastScrollProgressRef = useRef<number>(0);

  // -----------------------------------------------------------------
  // Lightweight Canvas Particle Simulation for Spice Powder Flow
  // -----------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', onResize);

    const isMobile = window.innerWidth < 768;
    const maxParticles = isMobile ? 30 : 70;

    interface PowderMote {
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

    const particles: PowderMote[] = [];
    const spiceHues = ['#993300', '#C41E10', '#D48806', '#E5A93C', '#7A1F1D', '#B38F4D'];

    const spawnPowderMote = () => {
      const originX = width * 0.5 + (Math.random() - 0.5) * 60;
      const originY = height * 0.42 + (Math.random() - 0.5) * 20;
      const dir = scrollDeltaRef.current >= 0 ? 1 : -1;

      particles.push({
        x: originX,
        y: originY,
        vx: (Math.random() - 0.5) * 1.8,
        vy: (Math.random() * 2.2 + 1.2) * dir,
        size: Math.random() * 2.8 + 0.8,
        color: spiceHues[Math.floor(Math.random() * spiceHues.length)],
        alpha: 0.9,
        life: 0,
        maxLife: 60 + Math.random() * 40
      });
    };

    let tick = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      tick++;

      // Emit motes continuously around the active grinding stage
      if (activeStage >= 2 && tick % 2 === 0 && particles.length < maxParticles) {
        spawnPowderMote();
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.alpha = Math.max(0, 0.9 * (1 - p.life / p.maxLife));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        if (p.life >= p.maxLife || p.y > height + 20 || p.y < -20) {
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
  }, [activeStage]);

  // -----------------------------------------------------------------
  // GSAP ScrollTrigger Transformation Timeline (Controlled Pinning)
  // -----------------------------------------------------------------
  useEffect(() => {
    const section = sectionRef.current;
    const stone = grinderStoneRef.current;

    if (!section) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Desktop: Controlled, reversible pin for the hero transformation
      mm.add('(min-width: 768px)', () => {
        if (prefersReducedMotion) return;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=120%', // Controlled pin distance, then releases naturally!
            scrub: 0.75,
            pin: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              const p = self.progress;
              // Track direction
              scrollDeltaRef.current = p - lastScrollProgressRef.current;
              lastScrollProgressRef.current = p;

              // Stage updates: 0 = Whole, 1 = Prep, 2 = Grinding, 3 = Powder
              if (p < 0.28) setActiveStage(0);
              else if (p < 0.55) setActiveStage(1);
              else if (p < 0.82) setActiveStage(2);
              else setActiveStage(3);
            }
          }
        });

        // 3D Grinder stone visibly turns in proportion to scroll
        if (stone) {
          tl.to(stone, {
            rotation: 720,
            ease: 'none',
            duration: 1
          }, 0);
        }

        // Scene cross-transforms
        tl.to('.stage-whole', { opacity: 0, scale: 0.9, y: -20, duration: 0.28 }, 0.15)
          .fromTo('.stage-prep', { opacity: 0, scale: 0.9, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.28 }, 0.28)
          .to('.stage-prep', { opacity: 0, scale: 0.9, y: -20, duration: 0.28 }, 0.52)
          .fromTo('.stage-grind', { opacity: 0, scale: 0.9, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.28 }, 0.55)
          .to('.stage-grind', { opacity: 0.6, scale: 0.95, duration: 0.2 }, 0.8)
          .fromTo('.stage-powder', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.2 }, 0.82);
      });

      // Mobile: Fluid non-pinned document flow
      mm.add('(max-width: 767px)', () => {
        ScrollTrigger.create({
          trigger: section,
          start: 'top 70%',
          end: 'bottom 30%',
          onUpdate: (self) => {
            const p = self.progress;
            if (p < 0.3) setActiveStage(0);
            else if (p < 0.6) setActiveStage(1);
            else setActiveStage(2);
          }
        });
      });
    }, section);

    return () => ctx.revert();
  }, [isKn]);

  const stageTabs = [
    { en: '1. Whole Spice', kn: '೧. ಅಪ್ಪಟ ಕಾಳು' },
    { en: '2. Preparation', kn: '೨. ಶುದ್ಧೀಕರಣ' },
    { en: '3. Grinding', kn: '೩. ಬೀಸುವಿಕೆ' },
    { en: '4. Pure Powder', kn: '೪. ಸಿದ್ಧ ಪುಡಿ' }
  ];

  return (
    <section
      ref={sectionRef}
      className="spice-transformation-section relative w-full min-h-[96vh] sm:min-h-screen bg-[#FBF7F0] text-[#2C1810] py-20 px-4 sm:px-6 lg:px-8 overflow-hidden select-none flex items-center justify-center"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 50% 50%, rgba(255, 253, 249, 0.98) 0%, rgba(251, 247, 240, 0.98) 85%)'
      }}
    >
      {/* Dynamic Canvas for Spice Powder Cascade */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Subtle ambient backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-20 max-w-4xl mx-auto w-full flex flex-col items-center justify-center text-center">
        {/* Transformation Header Pills */}
        <div className="flex items-center space-x-2 sm:space-x-3 mb-8 overflow-x-auto max-w-full px-2 py-1 scrollbar-none">
          {stageTabs.map((tab, idx) => (
            <div
              key={idx}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider uppercase transition-all duration-300 border ${
                activeStage === idx
                  ? 'bg-[#993300] border-[#993300] text-white shadow-xs scale-105'
                  : 'bg-[#FFFDF9] border-[#E8DFD3] text-[#8C7667]'
              }`}
            >
              {isKn ? tab.kn : tab.en}
            </div>
          ))}
        </div>

        {/* CSS 3D Traditional Mill & Grinding Visual Assembly */}
        <div
          className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center my-2"
          style={{ perspective: '1000px' }}
        >
          {/* Subtle contact drop shadow */}
          <div className="absolute inset-4 rounded-full bg-[#2C1810]/5 blur-2xl" />

          {/* 3D Tilting Stage Container */}
          <div
            className="relative w-full h-full flex items-center justify-center"
            style={{
              transform: 'rotateX(28deg) rotateY(-6deg)',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Base Stationary Mill Stone */}
            <div className="absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-gradient-to-b from-[#DFD7CF] to-[#C7BCB2] border-4 border-[#B8ACA0] shadow-xl flex items-center justify-center">
              {/* Outer discharge channel */}
              <div className="absolute inset-2 rounded-full border-2 border-dashed border-[#D48806]/50 opacity-60" />
            </div>

            {/* Rotating Top Stone (synced with ScrollTrigger) */}
            <div
              ref={grinderStoneRef}
              className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br from-[#EAE4DC] via-[#D8CEC4] to-[#BDB1A5] border-2 border-[#A89C8F] shadow-2xl flex items-center justify-center"
              style={{
                boxShadow: '0 12px 30px rgba(44,24,16,0.18), inset 0 2px 6px rgba(255,255,255,0.7)'
              }}
            >
              {/* Radial Grooves */}
              <div className="absolute w-full h-0.5 bg-[#8C7667]/40" />
              <div className="absolute w-0.5 h-full bg-[#8C7667]/40" />
              <div className="absolute w-full h-0.5 bg-[#8C7667]/40 rotate-45" />
              <div className="absolute w-full h-0.5 bg-[#8C7667]/40 -rotate-45" />

              {/* Central Aperture for Whole Spices */}
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#2C1810] border-2 border-[#D48806] flex items-center justify-center shadow-inner">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C41E10]" />
                <span className="w-2 h-2 rounded-full bg-[#D48806] ml-0.5" />
              </div>

              {/* Wooden Handle Peg */}
              <div
                className="absolute top-5 right-5 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#8B3214] border-2 border-[#DFC7A2] shadow-md flex items-center justify-center"
                style={{ transform: 'translateZ(14px)' }}
              >
                <div className="w-2 h-2 rounded-full bg-[#4A190A]" />
              </div>
            </div>
          </div>
        </div>

        {/* Narrative Statement based on Active Stage */}
        <div className="mt-6 max-w-xl min-h-[110px] flex flex-col justify-center">
          {activeStage === 0 && (
            <div className="stage-whole space-y-2">
              <h3 className="font-serif text-2xl sm:text-4xl font-bold text-[#2C1810]">
                {isKn ? 'ಅಪ್ಪಟ ಕಾಳುಗಳಿಂದ ಆರಂಭ.' : 'Whole Spices First.'}
              </h3>
              <p className="font-serif italic text-sm sm:text-lg text-[#6B4E3D] font-normal">
                {isKn
                  ? 'ಸೂರ್ಯನ ಬೆಳಕಿನಲ್ಲಿ ಒಣಗಿದ ಬ್ಯಾಡಗಿ ಮೆಣಸು, ಅರಿಶಿನ ಹಾಗೂ ಸಾಂಬಾರ ಕಾಳುಗಳು.'
                  : 'Sun-dried Byadgi chillies, golden turmeric roots, and aromatic seeds.'}
              </p>
            </div>
          )}

          {activeStage === 1 && (
            <div className="stage-prep space-y-2">
              <h3 className="font-serif text-2xl sm:text-4xl font-bold text-[#2C1810]">
                {isKn ? 'ಆಯ್ಕೆ ಮತ್ತು ಸ್ವಚ್ಛತೆ.' : 'Winnowed & Cleaned.'}
              </h3>
              <p className="font-serif italic text-sm sm:text-lg text-[#6B4E3D] font-normal">
                {isKn
                  ? 'ಕೈಯಿಂದ ಆಯ್ದು, ನೈಸರ್ಗಿಕ ಶುದ್ಧತೆಯೊಂದಿಗೆ ಬೀಸುವಿಕೆಗೆ ಸಿದ್ಧಗೊಳಿಸಲಾಗುತ್ತದೆ.'
                  : 'Hand-sorted and cleaned with traditional care before entering the mill.'}
              </p>
            </div>
          )}

          {activeStage >= 2 && (
            <div className="stage-grind space-y-2">
              <h3 className="font-serif text-2xl sm:text-4xl font-bold text-[#2C1810]">
                {isKn ? 'ಸಾಂಪ್ರದಾಯಿಕ ಬೀಸುವಿಕೆ.' : 'The Grinding Moment.'}
              </h3>
              <p className="font-serif italic text-sm sm:text-lg text-[#6B4E3D] font-normal">
                {isKn
                  ? 'ಕಲ್ಲುಗಳು ತಿರುಗುತ್ತಿದ್ದಂತೆ ಕಾಳುಗಳು ಒಡೆದು, ಸುವಾಸನೆಯುಕ್ತ ನುಣ್ಣನೆಯ ಪುಡಿಯಾಗಿ ಹರಿಯುತ್ತದೆ.'
                  : 'As the stones turn, spices fracture and release their rich aromatic oils into fine powder.'}
              </p>
            </div>
          )}
        </div>

        {/* Guidance Prompt */}
        <div className="mt-8 flex items-center space-x-1.5 text-xs text-[#8C7667] font-mono">
          <span>{isKn ? 'ಸಿದ್ಧ ಉತ್ಪನ್ನವನ್ನು ನೋಡಿ' : 'Release & Continue'}</span>
          <ArrowDown className="w-3.5 h-3.5 text-[#993300] animate-bounce" />
        </div>
      </div>
    </section>
  );
};
