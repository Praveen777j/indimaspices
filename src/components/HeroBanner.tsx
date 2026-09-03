import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, HeartHandshake, Leaf, Flame, Activity, Tag, MapPin, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Banner } from '../types';

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

  useEffect(() => {
    setVideoError(false);
  }, [banner?.media_url, banner?.media_type]);

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
    <section id="hero-section" className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Clean Modern Hero Container */}
      <div className="bg-[#FFFDF9] border border-[#E8DFD3] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm relative overflow-hidden">
        {/* Subtle Warm Amber Glow in Corner */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 blur-3xl rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          {/* Left Column: Pure Spice Story & CTAs */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            {/* Location & Purity Pill */}
            <div className="inline-flex items-center space-x-2 bg-[#FAF7F2] border border-[#DFCFC0] px-3.5 py-1.5 rounded-full text-xs font-bold text-[#8B3214] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <MapPin className="w-3.5 h-3.5 text-[#8B3214]" />
              <span>{badgeText}</span>
              <span className="text-[#DFCFC0]">|</span>
              <span className="text-[#2B5329] font-bold">{isKn ? '100% ರಾಸಾಯನಿಕ-ಮುಕ್ತ' : '0% Chemicals'}</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1F1610] leading-[1.18]">
              {titleText}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-[#5C483B] leading-relaxed max-w-2xl font-normal">
              {subtitleText}
            </p>

            {/* Trust Highlights Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="flex items-center space-x-2 text-xs font-semibold text-[#1F1610]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isKn ? 'ಕಲ್ಲಿನ ಬೀಸುವಿಕೆಯಿಂದ ತೈಲಾಂಶ ಸಂರಕ್ಷಣೆ' : 'Stone-ground: Volatile oils intact'}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-[#1F1610]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isKn ? 'ಯಾವುದೇ ಕೃತಕ ಬಣ್ಣ ಅಥವಾ ಹುಡಿ ಇಲ್ಲ' : 'No synthetic dyes, husk or fillers'}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-[#1F1610]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isKn ? '50% ಕಡಿಮೆ ಪ್ರಮಾಣದಲ್ಲೇ ಅದ್ಭುತ ರುಚಿ' : 'Use 50% less: Rich, deep natural taste'}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-[#1F1610]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isKn ? 'ಬೆಂಗಳೂರಿನಲ್ಲಿ ಮನೆ ಮನೆಗೆ ನೇರ ವಿತರಣೆ' : 'Bengaluru Doorstep Fresh Delivery'}</span>
              </div>
            </div>

            {/* Offer highlight strip if configured */}
            {offerText && (
              <div className="bg-[#FAF3E0] border border-[#DFC7A2] rounded-2xl p-3 max-w-xl flex items-center space-x-3 shadow-2xs">
                <div className="p-2 rounded-xl bg-[#8B3214]/10 text-[#8B3214] shrink-0">
                  <Flame className="w-4 h-4 text-[#8B3214]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#1F1610]">{offerText}</p>
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

            {/* Call to Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <button
                onClick={onShopClick}
                id="hero-shop-now-btn"
                className="px-6 py-3 rounded-full bg-[#8B3214] hover:bg-[#6E240D] text-white font-bold text-xs sm:text-sm shadow-md flex items-center space-x-2 transition-all transform hover:-translate-y-0.5 cursor-pointer active:scale-95"
              >
                <span>{primaryBtnText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {secondaryBtnText && (
                <button
                  onClick={onOffersClick}
                  id="hero-offers-btn"
                  className="px-5 py-3 rounded-full bg-[#FAF7F2] hover:bg-[#F3ECE0] text-[#8B3214] border border-[#DFCFC0] font-bold text-xs sm:text-sm transition-all flex items-center space-x-2 cursor-pointer active:scale-95"
                >
                  <Tag className="w-4 h-4 text-[#8B3214]" />
                  <span>{secondaryBtnText}</span>
                </button>
              )}

              <button
                onClick={scrollToHealth}
                id="hero-health-why-btn"
                className="px-5 py-3 rounded-full bg-[#FAF7F2] hover:bg-[#EAF2EB] text-[#2B5329] border border-[#CDE0D0] font-bold text-xs sm:text-sm transition-all flex items-center space-x-2 cursor-pointer"
              >
                <Leaf className="w-4 h-4 text-[#2B5329]" />
                <span>{isKn ? 'ರಾಸಾಯನಿಕ ಮಸಾಲೆಗಳು ಏಕೆ ಹಾನಿಕರ?' : 'Why Chemical Spices Harm Us'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Visual Product / Video Showcase Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden border border-[#E8DFD3] shadow-md aspect-4/3 lg:aspect-square bg-[#FAF7F2] group">
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
                  alt="Pure Stone-Ground Spices"
                  onError={e => {
                    if ((e.currentTarget as HTMLImageElement).src !== fallbackImg) {
                      (e.currentTarget as HTMLImageElement).src = fallbackImg;
                    }
                  }}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Floating Bottom Card: Fresh Micro-Batch Proof */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-1.5 text-[#8B3214] font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isKn ? 'ತಾಜಾ ಕಲ್ಲಿನ ಬೀಸುವಿಕೆ' : 'Cold Stone-Milled'}</span>
                  </div>
                  <p className="text-[11px] text-[#5C483B] mt-0.5">
                    {isKn ? 'ಪ್ರತಿ ವಾರ ಸಣ್ಣ ಬ್ಯಾಚ್‌ಗಳಲ್ಲಿ ತಯಾರಿಕೆ' : 'Ground weekly in Basavanagudi & Bengaluru'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-[#1F1610]">100% Pure</div>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
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
