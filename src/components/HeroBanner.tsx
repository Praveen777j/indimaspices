import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, HeartHandshake, Leaf, Flame, Activity, Tag, MapPin, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Banner } from '../types';
import { SpiceParticlesCanvas } from './SpiceParticlesCanvas';

interface HeroBannerProps {
  banner?: Banner;
  onShopClick: () => void;
  onOffersClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  banner,
  onShopClick,
  onOffersClick
}) => {
  const { language, t } = useLanguage();
  const [videoError, setVideoError] = useState(false);
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });
  const cardContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVideoError(false);
  }, [banner?.media_url, banner?.media_type]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardContainerRef.current) return;
    const rect = cardContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tiltX = -((y - centerY) / centerY) * 8;
    const tiltY = ((x - centerX) / centerX) * 8;
    setCardTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setCardTilt({ x: 0, y: 0 });
  };

  const isVideo = banner?.media_type === 'video' && !videoError;
  const isKn = language === 'kn';

  const titleText = isKn
    ? (banner?.title_kn || banner?.title_en || 'ಬೆಂಗಳೂರಿನಲ್ಲಿ ಕಲ್ಲಿನಲ್ಲಿ ಬೀಸಿದ ಅಪ್ಪಟ ಮನೆಯ ಮಸಾಲೆಗಳು')
    : (banner?.title_en || banner?.title_kn || 'Pure Homemade Spices, Stone-Ground with Love in Bengaluru');

  const subtitleText = isKn
    ? (banner?.subtitle_kn || banner?.subtitle_en || 'ಸಾಂಪ್ರದಾಯಿಕ ಒಲೆ ಉರಿಯಲ್ಲಿ ಹುರಿದ, ನೈಸರ್ಗಿಕ ಕಲ್ಲಿನಲ್ಲಿ ಬೀಸಿದ 100% ಶುದ್ಧ ಮಸಾಲೆಗಳು. ಯಾವುದೇ ಕೃತಕ ಬಣ್ಣಗಳು, ರಾಸಾಯನಿಕ ಸಂರಕ್ಷಕಗಳು ಅಥವಾ ಕಲಬೆರಕೆ ಇಲ್ಲ.')
    : (banner?.subtitle_en || banner?.subtitle_kn || 'Wood-fire roasted, cold stone-ground in micro-batches in Bengaluru. 100% natural with zero artificial dyes, chemicals, or fillers. The rich nostalgic aroma of grandma\'s kitchen.');

  const badgeText = isKn
    ? (banner?.badge_kn || banner?.badge_en || 'ಬೆಂಗಳೂರಿನಲ್ಲಿ ಕೈಯಿಂದ ತಯಾರಿಸಲ್ಪಟ್ಟಿದೆ')
    : (banner?.badge_en || banner?.badge_kn || 'Handcrafted in Bengaluru');

  const primaryBtnText = isKn
    ? (banner?.primary_btn_text_kn || banner?.primary_btn_text_en || 'ಶುದ್ಧ ಮಸಾಲೆಗಳನ್ನು ಖರೀದಿಸಿ')
    : (banner?.primary_btn_text_en || banner?.primary_btn_text_kn || 'Explore Pure Spices');

  const secondaryBtnText = isKn
    ? (banner?.secondary_btn_text_kn || banner?.secondary_btn_text_en || 'ಕೊಡುಗೆಗಳನ್ನು ನೋಡಿ')
    : (banner?.secondary_btn_text_en || banner?.secondary_btn_text_kn || 'View Festive Offers');

  const offerText = isKn
    ? (banner?.offer_text_kn || banner?.offer_text_en)
    : (banner?.offer_text_en || banner?.offer_text_kn);

  const bgImage = banner?.media_url || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1600&auto=format&fit=crop&q=80';
  const fallbackImg = banner?.fallback_image || bgImage;

  const scrollToHealth = () => {
    const el = document.getElementById('health-truth-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero-section" className="py-4 sm:py-8 px-3.5 sm:px-6 lg:px-8 max-w-7xl 2xl:max-w-[1500px] mx-auto w-full relative">
      {/* Clean Modern 3D Hero Container */}
      <div className="bg-[#FFFDF9] border border-[#DFC7A2] rounded-3xl p-5 sm:p-8 lg:p-12 shadow-sm relative overflow-hidden">
        {/* Interactive Floating Spice Particle Atmosphere */}
        <SpiceParticlesCanvas particleCount={30} opacity={0.65} />

        {/* Subtle Warm Amber Glow in Corner */}
        <div className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-amber-400/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#8B3214]/5 blur-3xl rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center relative z-10">
          {/* Left Column: Pure Spice Story & CTAs */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            {/* Location & Purity Pill */}
            <div className="inline-flex items-center space-x-1.5 sm:space-x-2 bg-[#FAF7F2] border border-[#DFCFC0] px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold text-[#8B3214] shadow-2xs max-w-full">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0"></span>
              <MapPin className="w-3.5 h-3.5 text-[#8B3214] shrink-0" />
              <span className="truncate">{badgeText}</span>
              <span className="text-[#DFCFC0] shrink-0">|</span>
              <span className="text-[#2B5329] font-bold shrink-0">{isKn ? '100% ನೈಸರ್ಗಿಕ' : 'Authentic Spices'}</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1F1610] leading-[1.2] text-balance">
              {titleText}
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm lg:text-base text-[#5C483B] leading-relaxed max-w-2xl font-normal">
              {subtitleText}
            </p>

            {/* Trust Highlights Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 pt-1">
              <div className="flex items-center space-x-2 text-xs font-semibold text-[#1F1610]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isKn ? 'ಆಯ್ಕೆ ಮಾಡಿದ ಗುಣಮಟ್ಟದ ಕಾಳುಗಳು' : 'Carefully selected whole spices'}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-[#1F1610]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isKn ? 'ಕರ್ನಾಟಕದ ಸಾಂಪ್ರದಾಯಿಕ ರುಚಿ' : 'Traditional Karnataka flavours'}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-[#1F1610]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isKn ? 'ದಿನನಿತ್ಯದ ಮನೆ ಊಟಕ್ಕೆ ಸೂಕ್ತ' : 'Crafted for everyday family meals'}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-[#1F1610]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isKn ? 'ಮನೆ ಬಾಗಿಲಿಗೆ ತಾಜಾ ವಿತರಣೆ' : 'Doorstep fresh delivery'}</span>
              </div>
            </div>

            {/* Offer highlight strip if configured */}
            {offerText && (
              <div className="bg-[#FAF3E0] border border-[#DFC7A2] rounded-2xl p-3 max-w-xl flex items-center space-x-3 shadow-2xs">
                <div className="p-2 rounded-xl bg-[#8B3214]/10 text-[#8B3214] shrink-0">
                  <Flame className="w-4 h-4 text-[#8B3214]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#1F1610] truncate">{offerText}</p>
                </div>
                <button
                  type="button"
                  onClick={onOffersClick}
                  className="text-xs font-bold text-[#8B3214] hover:underline shrink-0 cursor-pointer"
                >
                  {isKn ? 'ಕೊಡುಗೆ ನೋಡಿ →' : 'View Offers →'}
                </button>
              </div>
            )}

            {/* Call to Action Buttons: Responsive and touch-friendly */}
            <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3.5">
              <button
                onClick={onShopClick}
                id="hero-shop-now-btn"
                className="px-6 py-3 rounded-full bg-[#8B3214] hover:bg-[#6E240D] text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 cursor-pointer active:scale-95 min-h-[44px]"
              >
                <span>{primaryBtnText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {secondaryBtnText && (
                <button
                  onClick={onOffersClick}
                  id="hero-offers-btn"
                  className="px-5 py-3 rounded-full bg-[#FAF7F2] hover:bg-[#F3ECE0] text-[#8B3214] border border-[#DFCFC0] font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95 min-h-[44px]"
                >
                  <Tag className="w-4 h-4 text-[#8B3214]" />
                  <span>{secondaryBtnText}</span>
                </button>
              )}

              <button
                onClick={scrollToHealth}
                id="hero-health-why-btn"
                className="px-5 py-3 rounded-full bg-[#FAF7F2] hover:bg-[#EAF2EB] text-[#2B5329] border border-[#CDE0D0] font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 cursor-pointer min-h-[44px]"
              >
                <Leaf className="w-4 h-4 text-[#2B5329]" />
                <span className="truncate">{isKn ? 'ರಾಸಾಯನಿಕ ಮಸಾಲೆಗಳು ಏಕೆ ಹಾನಿಕರ?' : 'Why Chemical Spices Harm Us'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: 3D Interactive Product / Video Showcase Card */}
          <div
            className="lg:col-span-5 w-full perspective-[1000px]"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div
              ref={cardContainerRef}
              style={{
                transform: `rotateX(${cardTilt.x}deg) rotateY(${cardTilt.y}deg)`,
                transition: 'transform 0.15s ease-out'
              }}
              className="relative rounded-3xl overflow-hidden border border-[#DFC7A2] shadow-xl aspect-4/3 lg:aspect-square bg-[#FAF7F2] group w-full"
            >
              {isVideo ? (
                <video
                  key={banner?.media_url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  onError={() => setVideoError(true)}
                  poster={fallbackImg}
                  className="w-full h-full object-cover"
                >
                  <source src={banner?.media_url} type="video/mp4" />
                </video>
              ) : (
                <img
                  key={bgImage}
                  src={bgImage}
                  alt={isKn ? "ಅಪ್ಪಟ ಕಲ್ಲಿನಲ್ಲಿ ಬೀಸಿದ ಮಸಾಲೆಗಳು - Indima Spice Co." : "Indima Spice Co. Pure Stone-Ground Spices"}
                  title={isKn ? "ಅಪ್ಪಟ ಕಲ್ಲಿನಲ್ಲಿ ಬೀಸಿದ ಮಸಾಲೆಗಳು" : "Indima Spice Co. Pure Stone-Ground Spices"}
                  loading="lazy"
                  width={600}
                  height={600}
                  onError={e => {
                    if ((e.currentTarget as HTMLImageElement).src !== fallbackImg) {
                      (e.currentTarget as HTMLImageElement).src = fallbackImg;
                    }
                  }}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Floating Bottom Card: Fresh Micro-Batch Proof */}
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 p-3 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <div className="flex items-center space-x-1.5 text-[#8B3214] font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{isKn ? 'ತಾಜಾ ಕಲ್ಲಿನ ಬೀಸುವಿಕೆ' : 'Cold Stone-Milled'}</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-[#5C483B] mt-0.5 truncate">
                    {isKn ? 'ಪ್ರತಿ ವಾರ ಸಣ್ಣ ಬ್ಯಾಚ್‌ಗಳಲ್ಲಿ ತಯಾರಿಕೆ' : 'Ground weekly in Bengaluru'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs sm:text-sm font-black text-[#1F1610]">100% Pure</div>
                  <span className="text-[9px] sm:text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {isKn ? 'ಶುದ್ಧತೆ ಗ್ಯಾರಂಟಿ' : 'Guaranteed'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

