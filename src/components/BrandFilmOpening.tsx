import React, { useRef, useEffect, useState } from 'react';
import { ArrowDown, Sparkles, MapPin, ShoppingBag, Play } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { BusinessSettings, Banner } from '../types';
import { indimaBrandLogoImg } from '../assets/images';

interface BrandFilmOpeningProps {
  settings?: BusinessSettings;
  banner?: Banner;
  onExploreClick: () => void;
  onShopClick?: () => void;
}

export const BrandFilmOpening: React.FC<BrandFilmOpeningProps> = ({
  settings,
  banner,
  onExploreClick,
  onShopClick
}) => {
  const { language } = useLanguage();
  const isKn = language === 'kn';

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // Ambient Dark/Warm Golden Particles & Light Sweep Canvas
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

    const count = width < 640 ? 40 : 75;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -0.2 - Math.random() * 0.4,
      size: 1.2 + Math.random() * 2.8,
      color: ['#E5A93C', '#D49B28', '#C0392B', '#E28330', '#C5A059'][Math.floor(Math.random() * 5)],
      alpha: 0.15 + Math.random() * 0.55
    }));

    let time = 0;
    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // Warm radial spotlight around center logo
      const spotGrad = ctx.createRadialGradient(
        width / 2,
        height * 0.42,
        20,
        width / 2,
        height * 0.42,
        Math.max(width, height) * 0.65
      );
      spotGrad.addColorStop(0, 'rgba(215, 140, 45, 0.25)');
      spotGrad.addColorStop(0.35, 'rgba(140, 50, 20, 0.12)');
      spotGrad.addColorStop(1, 'rgba(18, 12, 9, 0)');
      ctx.fillStyle = spotGrad;
      ctx.fillRect(0, 0, width, height);

      // Render glowing floating aroma dust
      particles.forEach(p => {
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
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.size * 2.5;
        ctx.fill();
      });
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Admin Synchronized Content
  const businessName = settings?.business_name || 'Indima Spice Co.';

  // If admin has set custom active banner title/subtitle, use it
  const bannerHeadline = banner?.title_en
    ? (isKn ? (banner.title_kn || banner.title_en) : banner.title_en)
    : null;

  const bannerSubtitle = banner?.subtitle_en
    ? (isKn ? (banner.subtitle_kn || banner.subtitle_en) : banner.subtitle_en)
    : null;

  const bannerCta = banner?.primary_btn_text_en
    ? (isKn ? (banner.primary_btn_text_kn || banner.primary_btn_text_en) : banner.primary_btn_text_en)
    : null;

  const hasAdminVideo = banner?.media_type === 'video' && Boolean(banner?.media_url);

  return (
    <section
      id="brand-film-opening"
      className="relative min-h-[96vh] w-full bg-gradient-to-b from-[#140E0A] via-[#1E130D] to-[#2A160F] text-[#FFF9F2] flex flex-col justify-between overflow-hidden select-none border-b border-amber-900/40"
    >
      {/* Background Atmosphere Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Cinematic Golden Radiance Halo */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-500/15 blur-[180px] rounded-full pointer-events-none z-1" />

      {/* Top Heritage Kicker Bar */}
      <div className="relative z-10 pt-8 sm:pt-12 px-4 sm:px-8 max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-mono tracking-widest text-amber-400 uppercase font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <span>{businessName}</span>
          <span className="text-stone-600">/</span>
          <span className="text-stone-400 font-sans tracking-normal hidden sm:inline">
            {settings?.city || 'Bengaluru, Karnataka'}
          </span>
        </div>

        <div className="text-right text-[11px] font-mono text-amber-300/90 tracking-wider flex items-center space-x-2">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span>~30 YEARS OF EXPERIENCE</span>
        </div>
      </div>

      {/* Center Cinematic Opening: Prominent Logo + Light Sweep + Welcome */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 text-center my-auto py-10 sm:py-16">
        {/* Step 1: Real Admin Video OR Prominent Indima Brand Logo with Light Sweep */}
        {hasAdminVideo && banner?.media_url ? (
          <div className="mb-8 flex flex-col items-center">
            <div className="relative w-full max-w-2xl aspect-video rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-2xl bg-black">
              {banner.media_url.includes('youtube.com') || banner.media_url.includes('youtu.be') ? (
                <iframe
                  src={banner.media_url.replace('watch?v=', 'embed/')}
                  title="Indima Brand Video"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={banner.media_url}
                  controls
                  className="w-full h-full object-cover"
                  poster={banner.fallback_image || indimaBrandLogoImg}
                />
              )}
            </div>
          </div>
        ) : (
          <div
            className={`transition-all duration-1000 delay-100 mb-8 sm:mb-10 flex flex-col items-center ${
              loaded ? 'opacity-100 scale-100 translate-y-0 filter-none' : 'opacity-0 scale-90 translate-y-8 blur-sm'
            }`}
          >
            <div className="relative group p-2.5 rounded-3xl bg-gradient-to-b from-[#2C1D16] to-[#1A100B] border-2 border-amber-500/40 shadow-2xl shadow-amber-950/70 hover:border-amber-400 transition-colors">
              {/* Shimmer Light Sweep Overlay */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                <div className="w-full h-full bg-gradient-to-r from-transparent via-amber-200/30 to-transparent -translate-x-full animate-[shimmer_3.5s_infinite]" />
              </div>

              <img
                src={indimaBrandLogoImg}
                alt={businessName}
                className="w-28 h-28 sm:w-36 sm:h-36 object-contain rounded-2xl p-1 bg-white"
              />
            </div>
          </div>
        )}

        {/* Step 2: Welcome to Indima + Brand Tagline */}
        <div
          className={`transition-all duration-1000 delay-300 space-y-4 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-xs sm:text-sm font-mono tracking-[0.3em] text-amber-400 uppercase font-bold">
            {isKn ? 'ಇಂದಿಮಾ ಸಾಂಬಾರ್ ಕಂಪನಿಗೆ ಸ್ವಾಗತ' : 'WELCOME TO INDIMA SPICE CO.'}
          </p>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-tight text-balance">
            {bannerHeadline ? (
              bannerHeadline
            ) : isKn ? (
              <>
                ತಾಯಿಯ ಪ್ರೀತಿಯಷ್ಟೇ <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200">
                  ಪರಿಶುದ್ಧ ಮಸಾಲೆಗಳು.
                </span>
              </>
            ) : (
              <>
                Pure as mother&apos;s love. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200">
                  Rooted in Karnataka.
                </span>
              </>
            )}
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-stone-300 max-w-xl mx-auto font-light leading-relaxed pt-2">
            {bannerSubtitle ||
              (isKn
                ? 'ಸುಮಾರು ಮೂರು ದಶಕಗಳ ಅನುಭವದೊಂದಿಗೆ, ದಿನನಿತ್ಯದ ಅಡುಗೆಗೆ ಪ್ರೀತಿಯಿಂದ ಸಿದ್ಧಪಡಿಸಲಾಗುವ ಮನೆ ಮಸಾಲೆಗಳು.'
                : 'Three decades of experience. Built around a simple belief: good food begins with good spices. Crafted with care for family dining tables.')}
          </p>

          {/* Action Buttons */}
          <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
            <button
              onClick={onExploreClick}
              type="button"
              className="inline-flex items-center space-x-3 px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-[#140E0A] font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-xl shadow-amber-950/50 hover:scale-104 cursor-pointer w-full sm:w-auto justify-center"
            >
              <span>{bannerCta || (isKn ? 'ನಮ್ಮ ಕಥೆ ತಿಳಿಯಿರಿ' : 'Explore Our Story')}</span>
              <ArrowDown className="w-4 h-4" />
            </button>

            {onShopClick && (
              <button
                onClick={onShopClick}
                type="button"
                className="inline-flex items-center space-x-2.5 px-7 py-4 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs sm:text-sm font-bold tracking-wider uppercase transition-all hover:scale-102 cursor-pointer w-full sm:w-auto justify-center"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>{isKn ? 'ಮಸಾಲೆಗಳ ಅಂಗಡಿ' : 'Shop All Spices'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Scroll Prompt Bar */}
      <div className="relative z-10 pb-6 sm:pb-8 px-4 sm:px-8 max-w-7xl mx-auto w-full flex items-center justify-between text-xs text-stone-400 font-mono">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>{isKn ? 'ಕೆಳಗೆ ಸ್ಕ್ರೋಲ್ ಮಾಡಿ' : 'SCROLL DOWN TO DISCOVER OUR JOURNEY'}</span>
        </div>

        <div className="flex items-center space-x-1.5 animate-bounce text-amber-400 font-bold">
          <span className="text-[11px] font-sans hidden sm:inline">SCROLL DOWN</span>
          <ArrowDown className="w-4 h-4" />
        </div>
      </div>
    </section>
  );
};
