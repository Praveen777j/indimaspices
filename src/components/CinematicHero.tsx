import React, { useRef, useState, useEffect } from 'react';
import { ArrowDown, ShoppingBag, Sparkles, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Banner } from '../types';

interface CinematicHeroProps {
  banner?: Banner;
  onExploreClick: () => void;
  onShopClick: () => void;
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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Floating Hero Chilli & Ambient Gold Dust Particles Canvas
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

    // Particle field
    const count = width < 640 ? 30 : 65;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.2 - Math.random() * 0.35,
      size: 1 + Math.random() * 2.2,
      alpha: 0.15 + Math.random() * 0.45,
      color: Math.random() > 0.4 ? '#D49B28' : '#C0392B',
      pulse: Math.random() * Math.PI * 2
    }));

    let time = 0;
    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // Deep ambient spotlight in center
      const centerGrad = ctx.createRadialGradient(
        width / 2 + mousePos.targetX * 30,
        height / 2 + mousePos.targetY * 30,
        20,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.65
      );
      centerGrad.addColorStop(0, 'rgba(197, 85, 34, 0.18)');
      centerGrad.addColorStop(0.4, 'rgba(139, 50, 20, 0.08)');
      centerGrad.addColorStop(1, 'rgba(18, 13, 10, 0)');
      ctx.fillStyle = centerGrad;
      ctx.fillRect(0, 0, width, height);

      // Render glowing floating particles
      particles.forEach(p => {
        p.pulse += 0.03;
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentAlpha = p.alpha + Math.sin(p.pulse) * 0.12;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.05, Math.min(0.8, currentAlpha));
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.size * 3;
        ctx.fill();
      });

      // Render Floating 3D Hero Byadgi Chilli in the center
      const chilliX = width / 2 + mousePos.targetX * 25;
      const chilliY = height / 2 + Math.sin(time) * 12 + mousePos.targetY * 20;
      const chilliRot = -0.22 + Math.sin(time * 0.8) * 0.08 + mousePos.targetX * 0.1;
      const chilliScale = width < 640 ? 1.4 : 2.1;

      ctx.save();
      ctx.translate(chilliX, chilliY);
      ctx.rotate(chilliRot);
      ctx.scale(chilliScale, chilliScale);

      // Soft realistic drop shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
      ctx.shadowBlur = 35;
      ctx.shadowOffsetY = 24;

      // Curved chilli body
      ctx.beginPath();
      ctx.moveTo(-50, 16);
      ctx.bezierCurveTo(-20, -18, 20, -26, 60, -8);
      ctx.bezierCurveTo(72, -3, 75, 5, 62, 10);
      ctx.bezierCurveTo(30, 22, -10, 26, -50, 16);
      ctx.closePath();

      // Deep rich red shading
      const bodyGrad = ctx.createLinearGradient(-50, -15, 65, 15);
      bodyGrad.addColorStop(0, '#5A0E05');
      bodyGrad.addColorStop(0.2, '#8E170A');
      bodyGrad.addColorStop(0.5, '#BD2512');
      bodyGrad.addColorStop(0.8, '#D83820');
      bodyGrad.addColorStop(1, '#8E170A');
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Wrinkled skin sheen & highlights
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.moveTo(-20, -6);
      ctx.quadraticCurveTo(15, -12, 45, -2);
      ctx.strokeStyle = 'rgba(255, 200, 180, 0.38)';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Stem (calyx)
      ctx.beginPath();
      ctx.moveTo(-50, 16);
      ctx.quadraticCurveTo(-65, 22, -72, 34);
      ctx.strokeStyle = '#4A5D32';
      ctx.lineWidth = 3.2;
      ctx.stroke();

      ctx.restore();
      ctx.globalAlpha = 1;

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
    setMousePos({ x: e.clientX, y: e.clientY, targetX: x, targetY: y });
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[90vh] lg:min-h-[94vh] w-full bg-[#120D0A] text-[#FFF9F2] flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Dynamic Canvas Background & Floating Hero Chilli */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Subtle Cinematic Vignette Overlay */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_0%,rgba(10,7,5,0.75)_100%] pointer-events-none z-1" />

      {/* Top Header Spacing / Kicker */}
      <div className="relative z-10 pt-10 sm:pt-14 px-4 sm:px-8 max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center space-x-2.5 text-xs font-mono tracking-widest text-[#D49B28] uppercase">
          <span className="w-2 h-2 rounded-full bg-[#D49B28] animate-pulse" />
          <span>{isKn ? 'ಕರ್ನಾಟಕದ ನೈಜ ಪರಂಪರೆ' : 'INDIMA HERITAGE CRAFT'}</span>
          <span className="text-stone-600">/</span>
          <span className="text-stone-400 font-sans tracking-normal hidden sm:inline">
            {isKn ? 'ಬೆಂಗಳೂರು' : 'Bengaluru'}
          </span>
        </div>

        <div className="text-right text-[11px] font-mono text-stone-400 tracking-wider hidden sm:block">
          <span>CHAPTER 01</span>
          <span className="text-stone-600 mx-1.5">·</span>
          <span>ORIGIN</span>
        </div>
      </div>

      {/* Center Cinematic Kinetic Typography */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 text-center my-auto py-12 sm:py-16">
        <p className="text-xs sm:text-sm font-mono tracking-[0.25em] text-[#D49B28] uppercase mb-4 sm:mb-6">
          {isKn ? 'ಪ್ರತಿಯೊಂದು ಸ್ವಾದಕ್ಕೂ ಒಂದು ಪವಿತ್ರ ಮೂಲವಿದೆ' : 'EVERY FLAVOUR HAS AN ORIGIN'}
        </p>

        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[#FFFDF9] leading-[1.08] text-balance">
          {isKn ? (
            <>
              ಕಾಳು ಮಸಾಲೆಯಿಂದ <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D49B28] via-[#E28330] to-[#C0392B]">
                ನಿಮ್ಮ ಅಡುಗೆ ಮನೆಗೆ.
              </span>
            </>
          ) : (
            <>
              From Whole Spice <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D49B28] via-[#E28330] to-[#C0392B]">
                to Your Kitchen.
              </span>
            </>
          )}
        </h1>

        <p className="text-xs sm:text-sm md:text-base text-stone-300/85 max-w-xl mx-auto mt-6 sm:mt-8 font-light leading-relaxed">
          {isKn
            ? 'ಸಾಂಪ್ರದಾಯಿಕ ಕಲ್ಲಿನ ಬೀಸುವ ವಿಧಾನ, ಹದವಾದ ಮಂದ ಉರಿ ಮತ್ತು ನೈಸರ್ಗಿಕ ಸುವಾಸನೆ. ಯಾವುದೇ ಕೃತಕ ಬಣ್ಣಗಳಿಲ್ಲದೆ ತಯಾರಿಸಿದ ಅಪ್ಪಟ ಮಸಾಲೆಗಳು.'
            : 'Experience the living transformation of single-origin spices. Wood-fire cured and granite stone-milled in micro-batches to awaken pure, unadulterated aroma.'}
        </p>

        {/* Action Buttons */}
        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-5">
          <button
            onClick={onExploreClick}
            type="button"
            className="group relative inline-flex items-center space-x-3 px-7 py-3.5 rounded-full bg-[#D49B28] hover:bg-[#E5AA35] text-[#120D0A] font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 shadow-lg shadow-amber-900/40 hover:scale-103 cursor-pointer w-full sm:w-auto justify-center"
          >
            <span>{isKn ? 'ಪಯಣವನ್ನು ವೀಕ್ಷಿಸಿ' : 'Explore the Journey'}</span>
            <ArrowDown className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-1" />
          </button>

          <button
            onClick={onShopClick}
            type="button"
            className="inline-flex items-center space-x-2.5 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/20 backdrop-blur-md text-xs sm:text-sm font-semibold tracking-wider transition-all duration-300 hover:scale-102 cursor-pointer w-full sm:w-auto justify-center"
          >
            <ShoppingBag className="w-4 h-4 text-amber-300" />
            <span>{isKn ? 'ಮಸಾಲೆಗಳನ್ನು ಖರೀದಿಸಿ' : 'Shop All Spices'}</span>
          </button>
        </div>
      </div>

      {/* Bottom Scroll Prompt Bar */}
      <div className="relative z-10 pb-6 sm:pb-8 px-4 sm:px-8 max-w-7xl mx-auto w-full flex items-center justify-between text-xs text-stone-400 font-mono">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D49B28]" />
          <span>{isKn ? 'ಸ್ಕ್ರೋಲ್ ಮಾಡಿ ಪಯಣವನ್ನು ಅನುಭವಿಸಿ' : 'SCROLL TO EXPERIENCE THE FILM'}</span>
        </div>

        <div className="flex items-center space-x-2 animate-bounce">
          <ArrowDown className="w-4 h-4 text-[#D49B28]" />
        </div>
      </div>
    </section>
  );
};
