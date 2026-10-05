import React, { useRef, useState, useEffect } from 'react';
import { ArrowDown, ShoppingBag, Sparkles, MapPin, Compass } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Banner } from '../types';

interface CinematicHeroProps {
  banner?: Banner;
  onExploreClick: () => void;
  onShopClick: () => void;
}

interface FloatingSpice {
  type: 'chilli_hero' | 'chilli_small' | 'turmeric' | 'coriander' | 'cumin' | 'clove';
  x: number;
  y: number;
  depth: number; // 0.3 (far) to 1.8 (near)
  rot: number;
  rotSpeed: number;
  phase: number;
  speed: number;
  scale: number;
}

export const CinematicHero: React.FC<CinematicHeroProps> = ({
  banner,
  onExploreClick,
  onShopClick
}) => {
  const { language } = useLanguage();
  const isKn = language === 'kn';

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState({ targetX: 0, targetY: 0 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  // Multi-depth floating whole spices and volumetric golden light canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initial Floating Spices Field
    const spices: FloatingSpice[] = [
      // The Primary Hero Chilli (Centered)
      { type: 'chilli_hero', x: width * 0.5, y: height * 0.48, depth: 1.4, rot: -0.25, rotSpeed: 0.003, phase: 0, speed: 0.02, scale: width < 640 ? 1.6 : 2.4 },
      // Secondary chillies floating at different depths
      { type: 'chilli_small', x: width * 0.18, y: height * 0.32, depth: 0.9, rot: 0.45, rotSpeed: -0.004, phase: 1.2, speed: 0.018, scale: 1.1 },
      { type: 'chilli_small', x: width * 0.82, y: height * 0.62, depth: 0.8, rot: -0.85, rotSpeed: 0.005, phase: 2.5, speed: 0.022, scale: 0.95 },
      // Turmeric roots
      { type: 'turmeric', x: width * 0.28, y: height * 0.68, depth: 1.1, rot: 0.3, rotSpeed: 0.0035, phase: 0.8, speed: 0.015, scale: 1.3 },
      { type: 'turmeric', x: width * 0.78, y: height * 0.28, depth: 0.7, rot: -0.4, rotSpeed: -0.004, phase: 3.1, speed: 0.019, scale: 0.85 },
      // Coriander seeds (multiple depths)
      { type: 'coriander', x: width * 0.38, y: height * 0.22, depth: 1.2, rot: 0, rotSpeed: 0.008, phase: 1.8, speed: 0.025, scale: 1.3 },
      { type: 'coriander', x: width * 0.62, y: height * 0.76, depth: 1.0, rot: 0, rotSpeed: -0.007, phase: 2.2, speed: 0.02, scale: 1.1 },
      { type: 'coriander', x: width * 0.12, y: height * 0.78, depth: 0.6, rot: 0, rotSpeed: 0.006, phase: 4.1, speed: 0.017, scale: 0.8 },
      { type: 'coriander', x: width * 0.88, y: height * 0.45, depth: 0.5, rot: 0, rotSpeed: -0.009, phase: 0.4, speed: 0.024, scale: 0.75 },
      // Cumin seeds
      { type: 'cumin', x: width * 0.45, y: height * 0.74, depth: 0.9, rot: 0.6, rotSpeed: 0.01, phase: 3.4, speed: 0.028, scale: 1.2 },
      { type: 'cumin', x: width * 0.65, y: height * 0.26, depth: 0.8, rot: -0.5, rotSpeed: -0.008, phase: 1.6, speed: 0.023, scale: 1.0 },
      // Cloves
      { type: 'clove', x: width * 0.22, y: height * 0.52, depth: 0.75, rot: 0.8, rotSpeed: 0.005, phase: 2.8, speed: 0.016, scale: 0.9 }
    ];

    // Swirling spice dust & aroma particles (warm saffron gold & paprika red)
    const dustCount = width < 640 ? 45 : 95;
    const dust = Array.from({ length: dustCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -0.25 - Math.random() * 0.45,
      size: 1.2 + Math.random() * 2.8,
      alpha: 0.2 + Math.random() * 0.55,
      color: ['#D49B28', '#E28330', '#C0392B', '#E5A93C', '#C5A059'][Math.floor(Math.random() * 5)],
      pulse: Math.random() * Math.PI * 2
    }));

    let time = 0;

    const drawChilli = (c: CanvasRenderingContext2D, isHero: boolean) => {
      c.beginPath();
      c.moveTo(-50, 16);
      c.bezierCurveTo(-20, -18, 20, -26, 60, -8);
      c.bezierCurveTo(72, -3, 75, 5, 62, 10);
      c.bezierCurveTo(30, 22, -10, 26, -50, 16);
      c.closePath();

      const bodyGrad = c.createLinearGradient(-50, -15, 65, 15);
      bodyGrad.addColorStop(0, '#5C0F06');
      bodyGrad.addColorStop(0.25, '#92180A');
      bodyGrad.addColorStop(0.55, '#C42814');
      bodyGrad.addColorStop(0.85, '#E03C22');
      bodyGrad.addColorStop(1, '#8C1508');
      c.fillStyle = bodyGrad;
      c.fill();

      // Curved Stem
      c.beginPath();
      c.moveTo(-50, 16);
      c.quadraticCurveTo(-65, 22, -72, 34);
      c.strokeStyle = '#4A5D32';
      c.lineWidth = 3.4;
      c.stroke();

      // Skin sheen
      c.beginPath();
      c.moveTo(-20, -6);
      c.quadraticCurveTo(15, -12, 45, -2);
      c.strokeStyle = 'rgba(255, 220, 200, 0.42)';
      c.lineWidth = 1.8;
      c.stroke();
    };

    const drawTurmeric = (c: CanvasRenderingContext2D) => {
      c.beginPath();
      c.moveTo(-30, 0);
      c.bezierCurveTo(-25, -16, -6, -18, 14, -12);
      c.bezierCurveTo(28, -6, 34, 6, 28, 14);
      c.bezierCurveTo(16, 20, -12, 18, -30, 0);
      c.closePath();

      const grad = c.createRadialGradient(-6, 0, 4, 0, 0, 32);
      grad.addColorStop(0, '#F5B838');
      grad.addColorStop(0.6, '#D49020');
      grad.addColorStop(1, '#8C520E');
      c.fillStyle = grad;
      c.fill();

      // Root rings
      c.strokeStyle = 'rgba(90, 50, 10, 0.35)';
      c.lineWidth = 1.4;
      [-12, 0, 14].forEach(rx => {
        c.beginPath();
        c.arc(rx, 2, 9, -Math.PI / 3, Math.PI / 3);
        c.stroke();
      });
    };

    const drawCoriander = (c: CanvasRenderingContext2D) => {
      c.beginPath();
      c.arc(0, 0, 11, 0, Math.PI * 2);
      const grad = c.createRadialGradient(-3, -3, 2, 0, 0, 12);
      grad.addColorStop(0, '#EAD19E');
      grad.addColorStop(0.5, '#C8A362');
      grad.addColorStop(1, '#8D6D34');
      c.fillStyle = grad;
      c.fill();

      c.strokeStyle = 'rgba(100, 70, 30, 0.4)';
      c.lineWidth = 1.0;
      for (let a = -8; a <= 8; a += 4) {
        c.beginPath();
        c.ellipse(0, 0, Math.abs(a), 11, 0, 0, Math.PI * 2);
        c.stroke();
      }
    };

    const drawCumin = (c: CanvasRenderingContext2D) => {
      c.beginPath();
      c.moveTo(-16, 0);
      c.quadraticCurveTo(0, -5, 16, 0);
      c.quadraticCurveTo(0, 5, -16, 0);
      c.closePath();
      const grad = c.createLinearGradient(-16, 0, 16, 0);
      grad.addColorStop(0, '#6A4423');
      grad.addColorStop(0.5, '#9A6335');
      grad.addColorStop(1, '#533418');
      c.fillStyle = grad;
      c.fill();
    };

    const drawClove = (c: CanvasRenderingContext2D) => {
      c.beginPath();
      c.rect(-2.5, -4, 5, 16);
      c.fillStyle = '#422415';
      c.fill();
      c.beginPath();
      c.arc(0, -6, 5, 0, Math.PI * 2);
      c.fillStyle = '#733E23';
      c.fill();
    };

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // 1. Warm Radiance Atmospheric Spotlight in Canvas
      const auraGrad = ctx.createRadialGradient(
        width / 2 + mousePos.targetX * 40,
        height * 0.45 + mousePos.targetY * 40,
        30,
        width / 2,
        height * 0.5,
        Math.max(width, height) * 0.7
      );
      auraGrad.addColorStop(0, 'rgba(235, 165, 60, 0.28)');
      auraGrad.addColorStop(0.35, 'rgba(215, 95, 40, 0.16)');
      auraGrad.addColorStop(0.7, 'rgba(190, 55, 30, 0.06)');
      auraGrad.addColorStop(1, 'rgba(250, 246, 238, 0)');
      ctx.fillStyle = auraGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Render Swirling Spice Dust Particles
      dust.forEach(d => {
        d.pulse += 0.035;
        d.x += d.vx;
        d.y += d.vy;
        if (d.y < -15) {
          d.y = height + 15;
          d.x = Math.random() * width;
        }
        if (d.x < -15) d.x = width + 15;
        if (d.x > width + 15) d.x = -15;

        const alpha = d.alpha + Math.sin(d.pulse) * 0.14;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fillStyle = d.color;
        ctx.globalAlpha = Math.max(0.08, Math.min(0.85, alpha));
        ctx.shadowColor = d.color;
        ctx.shadowBlur = d.size * 3;
        ctx.fill();
      });
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      // 3. Render Floating Whole Spices with Multi-Layer Parallax & Depth
      spices.forEach(sp => {
        sp.rot += sp.rotSpeed;
        sp.phase += sp.speed;

        // Subtle harmonic floating motion + mouse parallax scaled by depth
        const px = sp.x + Math.sin(sp.phase) * 15 + mousePos.targetX * 35 * sp.depth;
        const py = sp.y + Math.cos(sp.phase * 0.8) * 12 + mousePos.targetY * 25 * sp.depth;

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(sp.rot);
        ctx.scale(sp.scale, sp.scale);

        // Realistic soft shadow
        ctx.shadowColor = 'rgba(70, 30, 15, 0.28)';
        ctx.shadowBlur = 24 * sp.depth;
        ctx.shadowOffsetY = 16 * sp.depth;

        switch (sp.type) {
          case 'chilli_hero':
            drawChilli(ctx, true);
            break;
          case 'chilli_small':
            drawChilli(ctx, false);
            break;
          case 'turmeric':
            drawTurmeric(ctx);
            break;
          case 'coriander':
            drawCoriander(ctx);
            break;
          case 'cumin':
            drawCumin(ctx);
            break;
          case 'clove':
            drawClove(ctx);
            break;
        }

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [mousePos]);

  // Track mouse coordinates for subtle parallax
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setMousePos({ targetX: x, targetY: y });
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[92vh] lg:min-h-[96vh] w-full bg-gradient-to-b from-[#FAF4E8] via-[#FAF6EE] to-[#F5ECE0] text-[#1F1610] flex flex-col justify-between overflow-hidden select-none border-b border-[#DFC7A2]/60"
    >
      {/* Background Volumetric Canvas & Floating Whole Spices */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Warm Saffron & Terracotta Ambient Lighting Cones */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-amber-400/20 via-orange-500/10 to-transparent blur-[140px] rounded-full pointer-events-none z-1" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-red-600/8 blur-[130px] rounded-full pointer-events-none z-1" />

      {/* Top Header Kicker Bar */}
      <div className="relative z-10 pt-8 sm:pt-12 px-4 sm:px-8 max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center space-x-2.5 text-xs font-mono tracking-widest text-[#8B3214] uppercase">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8B3214] animate-ping" />
          <span className="font-bold">
            {isKn ? 'ಕರ್ನಾಟಕದ ಸಾಂಪ್ರದಾಯಿಕ ಕಲ್ಲಿನ ಮಸಾಲೆಗಳು' : 'HERITAGE STONE-GROUND SPICES'}
          </span>
          <span className="text-[#DFC7A2]">/</span>
          <span className="text-[#5C483B] font-sans tracking-normal hidden sm:inline">
            {isKn ? 'ಬೆಂಗಳೂರು' : 'Bengaluru'}
          </span>
        </div>

        <div className="text-right text-[11px] font-mono text-[#8C6D53] tracking-wider hidden sm:flex items-center space-x-2">
          <Compass className="w-3.5 h-3.5 text-[#8B3214]" />
          <span>CHAPTER 01 · ORIGIN</span>
        </div>
      </div>

      {/* Center Cinematic Kinetic Typography & Live Commercial Entrance */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 text-center my-auto py-10 sm:py-16">
        <div
          className={`transition-all duration-700 delay-100 ${
            loaded ? 'opacity-100 translate-y-0 filter-none' : 'opacity-0 translate-y-6 blur-xs'
          }`}
        >
          <p className="text-xs sm:text-sm font-mono tracking-[0.28em] text-[#8B3214] uppercase mb-4 sm:mb-6 font-bold">
            {isKn ? 'ಪ್ರತಿಯೊಂದು ಸ್ವಾದಕ್ಕೂ ಒಂದು ಪವಿತ್ರ ಮೂಲವಿದೆ' : 'EVERY FLAVOUR HAS AN ORIGIN'}
          </p>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[#1F1610] leading-[1.08] text-balance">
            {isKn ? (
              <>
                ಕಾಳು ಮಸಾಲೆಯಿಂದ <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B3214] via-[#C0392B] to-[#D49B28]">
                  ನಿಮ್ಮ ಅಡುಗೆ ಮನೆಗೆ.
                </span>
              </>
            ) : (
              <>
                From Whole Spice <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B3214] via-[#C0392B] to-[#D49B28]">
                  to Your Kitchen.
                </span>
              </>
            )}
          </h1>
        </div>

        <div
          className={`transition-all duration-700 delay-300 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="text-xs sm:text-sm md:text-base text-[#5C483B] max-w-xl mx-auto mt-6 sm:mt-8 font-normal leading-relaxed">
            {isKn
              ? 'ಸಾಂಪ್ರದಾಯಿಕ ಕಲ್ಲಿನ ಬೀಸುವ ವಿಧಾನ, ಹದವಾದ ಮಂದ ಉರಿ ಮತ್ತು ನೈಸರ್ಗಿಕ ಸುವಾಸನೆ. ಕರ್ನಾಟಕದ ಅಪ್ಪಟ ಮನೆ ಮಸಾಲೆಗಳ ಅದ್ಭುತ ಕಥೆ.'
              : 'Experience the living transformation of single-origin spices. Wood-fire cured and granite stone-milled in micro-batches to awaken pure, unadulterated aroma.'}
          </p>

          {/* Action Buttons */}
          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-5">
            <button
              onClick={onExploreClick}
              type="button"
              className="group relative inline-flex items-center space-x-3 px-8 py-4 rounded-full bg-[#8B3214] hover:bg-[#72270E] text-white font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 shadow-xl shadow-[#8B3214]/25 hover:scale-104 cursor-pointer w-full sm:w-auto justify-center"
            >
              <span>{isKn ? 'ಪಯಣವನ್ನು ವೀಕ್ಷಿಸಿ' : 'Watch the Transformation'}</span>
              <ArrowDown className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-1.5" />
            </button>

            <button
              onClick={onShopClick}
              type="button"
              className="inline-flex items-center space-x-2.5 px-7 py-4 rounded-full bg-[#FAF6EE] hover:bg-[#F2E8D8] text-[#1F1610] border border-[#DFC7A2] text-xs sm:text-sm font-bold tracking-wider transition-all duration-300 hover:scale-102 cursor-pointer shadow-xs w-full sm:w-auto justify-center"
            >
              <ShoppingBag className="w-4 h-4 text-[#8B3214]" />
              <span>{isKn ? 'ಮಸಾಲೆಗಳನ್ನು ಖರೀದಿಸಿ' : 'Shop All Spices'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Scroll Prompt Bar */}
      <div className="relative z-10 pb-6 sm:pb-8 px-4 sm:px-8 max-w-7xl mx-auto w-full flex items-center justify-between text-xs text-[#5C483B] font-mono">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#8B3214] animate-pulse" />
          <span className="font-semibold">
            {isKn ? 'ಸ್ಕ್ರೋಲ್ ಮಾಡಿ ಪಯಣವನ್ನು ಅನುಭವಿಸಿ' : 'SCROLL TO EXPERIENCE THE JOURNEY'}
          </span>
        </div>

        <div className="flex items-center space-x-2 animate-bounce text-[#8B3214]">
          <span className="text-[11px] font-sans font-bold hidden sm:inline">SCROLL DOWN</span>
          <ArrowDown className="w-4 h-4" />
        </div>
      </div>
    </section>
  );
};
