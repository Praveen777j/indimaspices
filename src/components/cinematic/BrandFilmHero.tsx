import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../../contexts/LanguageContext';
import { Banner } from '../../types';
import { Play, Sparkles, ChevronDown, Volume2, VolumeX } from 'lucide-react';

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoWrapperRef = useRef<HTMLDivElement>(null);
  const titleWrapperRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Admin banner media if available
  const adminVideoUrl = banner?.media_type === 'video' ? banner?.media_url : null;
  const adminHeroTitle = isKn ? banner?.title_kn : banner?.title_en;

  // Ambient gold & spice particle canvas
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

    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 25 : 60;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 0.6,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -Math.random() * 0.45 - 0.15,
      alpha: Math.random() * 0.6 + 0.2,
      color: Math.random() > 0.4 ? 'rgba(235, 175, 75,' : 'rgba(185, 45, 15,'
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${p.alpha})`;
        ctx.fill();
      }
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
    const container = containerRef.current;
    const logoEl = logoWrapperRef.current;
    const titleEl = titleWrapperRef.current;
    const subEl = subtitleRef.current;
    const tagEl = taglineRef.current;
    const scrollInd = scrollIndicatorRef.current;

    if (!section || !container || !logoEl || !titleEl) return;

    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      // Initial state
      gsap.set(logoEl, { opacity: 0, scale: 0.88, filter: 'blur(10px)' });
      gsap.set(titleEl, { opacity: 0, y: 35, letterSpacing: '0.25em' });
      gsap.set(subEl, { opacity: 0, y: 20 });
      gsap.set(tagEl, { opacity: 0 });

      // Entrance animation on mount
      const enterTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      enterTl
        .to(logoEl, {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: 1.4,
          delay: 0.2
        })
        .to(
          titleEl,
          {
            opacity: 1,
            y: 0,
            letterSpacing: '0.08em',
            duration: 1.2
          },
          '-=0.6'
        )
        .to(
          subEl,
          {
            opacity: 1,
            y: 0,
            duration: 0.9
          },
          '-=0.7'
        )
        .to(
          tagEl,
          {
            opacity: 1,
            duration: 0.8
          },
          '-=0.5'
        );

      // Scroll-driven progression that cleanly releases
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: isMobile ? '+=60%' : '+=90%',
          scrub: 0.7,
          pin: !isMobile, // Pin briefly on desktop, release naturally
          anticipatePin: 1
        }
      });

      scrollTl
        .to(logoEl, {
          scale: 1.08,
          y: -25,
          opacity: 0.85,
          ease: 'power1.inOut'
        })
        .to(
          titleEl,
          {
            scale: 0.96,
            y: -15,
            ease: 'power1.inOut'
          },
          0
        )
        .to(
          scrollInd,
          {
            opacity: 0,
            y: 20,
            duration: 0.3
          },
          0
        );
    }, section);

    return () => ctx.revert();
  }, [isKn]);

  return (
    <section
      ref={sectionRef}
      className="brand-film-section relative w-full min-h-[92vh] sm:min-h-screen bg-[#1A0E08] text-[#F5EBE1] overflow-hidden flex items-center justify-center select-none"
      style={{
        backgroundImage:
          'radial-gradient(circle at 50% 40%, rgba(85, 30, 10, 0.45) 0%, rgba(26, 14, 8, 0.98) 75%)'
      }}
    >
      {/* Film grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none mix-blend-screen"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '4px 4px'
        }}
      />

      {/* Warm ambient spice particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Subtle radial glow sweeps */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[750px] h-[500px] sm:h-[750px] bg-gradient-to-r from-amber-600/15 via-red-800/10 to-amber-700/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Content Container */}
      <div
        ref={containerRef}
        className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center py-16 sm:py-24"
      >
        {/* Subtle Heritage Monogram / Badge */}
        <div
          ref={taglineRef}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-950/60 border border-amber-600/30 text-amber-200/90 text-[10px] sm:text-xs font-medium tracking-widest uppercase mb-6 sm:mb-8 backdrop-blur-md shadow-lg"
        >
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>{isKn ? 'ಮೂರು ದಶಕಗಳ ಸುವಾಸನೆ' : 'Three Decades of Flavour'}</span>
          <span className="text-amber-500/50">•</span>
          <span>{isKn ? 'ಕರ್ನಾಟಕ' : 'Karnataka'}</span>
        </div>

        {/* SHOT 1: Official Indima Logo Reveal */}
        <div
          ref={logoWrapperRef}
          className="relative mb-6 sm:mb-10 transition-transform duration-300"
        >
          {/* Soft brass & gold rim glow */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-amber-500/20 via-orange-600/15 to-transparent rounded-3xl blur-xl" />

          {/* Official Logo */}
          <div className="relative p-3 sm:p-5 rounded-2xl bg-[#26140B]/80 border border-[#D9A74A]/30 backdrop-blur-md shadow-2xl shadow-black/80">
            <img
              src="/indima-logo.svg"
              alt="Indima Spice Co."
              className="h-20 sm:h-28 md:h-36 w-auto object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)]"
              onError={e => {
                // Graceful fallback to png or brand logo
                const target = e.target as HTMLImageElement;
                if (!target.src.endsWith('/indima-brand-logo.jpg')) {
                  target.src = '/indima-brand-logo.jpg';
                }
              }}
            />
          </div>
        </div>

        {/* SHOT 2: Editorial Welcome Title */}
        <div ref={titleWrapperRef} className="space-y-3 sm:space-y-4 max-w-3xl">
          <p className="text-[11px] sm:text-xs tracking-[0.3em] uppercase text-amber-300/80 font-mono font-medium">
            {isKn ? 'ಪರಿಶುದ್ಧ ಪರಂಪರೆಗೆ' : 'Cinematic Prologue'}
          </p>

          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#FAF3E8] leading-[1.1] text-balance">
            {isKn ? 'ಇಂದಿಮಾಗೆ ಸುಸ್ವಾಗತ' : 'Welcome to Indima'}
          </h1>

          <p
            ref={subtitleRef}
            className="font-serif italic text-base sm:text-xl md:text-2xl text-amber-200/90 max-w-xl mx-auto pt-1 font-normal"
          >
            {isKn
              ? '“ತಾಯಿಯ ಪ್ರೀತಿಯಷ್ಟೇ ಪರಿಶುದ್ಧ”'
              : '“Pure as mother’s love”'}
          </p>

          {/* Live Admin Title if configured */}
          {adminHeroTitle && adminHeroTitle !== (isKn ? 'ಇಂದಿಮಾಗೆ ಸುಸ್ವಾಗತ' : 'Welcome to Indima') && (
            <p className="text-xs sm:text-sm text-amber-100/70 max-w-lg mx-auto pt-2 font-normal">
              {adminHeroTitle}
            </p>
          )}
        </div>

        {/* Action Controls & Scroll Guidance */}
        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center gap-3.5 sm:gap-5 z-20">
          <button
            onClick={onExploreClick}
            className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-[#993300] to-[#B84005] hover:from-[#B84005] hover:to-[#D94E07] text-[#FFFDF9] text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-300 shadow-xl shadow-red-950/60 hover:shadow-orange-700/40 hover:scale-105 active:scale-95 cursor-pointer border border-amber-400/20"
          >
            {isKn ? 'ಮಸಾಲೆಗಳ ಲೋಕಕ್ಕೆ ಪ್ರವೇಶಿಸಿ' : 'Enter the Spice Journey'}
          </button>

          {/* If Admin uploaded a video, show watch option */}
          {adminVideoUrl && (
            <button
              onClick={() => setIsVideoOpen(true)}
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-full bg-[#2A170D]/90 hover:bg-[#382012] text-amber-200 text-xs font-semibold tracking-wide border border-amber-500/30 transition-all hover:scale-105 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{isKn ? 'ವಿಡಿಯೋ ವೀಕ್ಷಿಸಿ' : 'Watch Brand Film'}</span>
            </button>
          )}
        </div>

        {/* Bottom Scroll Prompt */}
        <div
          ref={scrollIndicatorRef}
          className="mt-10 sm:mt-16 flex flex-col items-center text-amber-300/60 space-y-1.5 transition-opacity"
        >
          <span className="text-[10px] tracking-widest uppercase font-mono">
            {isKn ? 'ಕೆಳಗೆ ಸ್ಕ್ರಾಲ್ ಮಾಡಿ' : 'Scroll Down to Begin'}
          </span>
          <ChevronDown className="w-4 h-4 animate-bounce text-amber-400" />
        </div>
      </div>

      {/* Admin Video Modal if clicked */}
      {isVideoOpen && adminVideoUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8">
          <div className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden border border-amber-600/30 shadow-2xl">
            <button
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition-colors"
              aria-label="Close video"
            >
              ✕
            </button>
            <video
              src={adminVideoUrl}
              controls
              autoPlay
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
};
