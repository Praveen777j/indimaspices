import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../../contexts/LanguageContext';
import { Banner } from '../../types';
import { normalizeBannerContent } from '../../utils/mediaUtils';
import { Sparkles, ArrowDown, ShoppingBag, Tag } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface BrandFilmHeroProps {
  banner?: Banner;
  onExploreClick: () => void;
  logoUrl?: string;
}

export const BrandFilmHero: React.FC<BrandFilmHeroProps> = ({ banner, onExploreClick, logoUrl }) => {
  const { language } = useLanguage();
  const isKn = language === 'kn';

  const content = normalizeBannerContent(banner);

  const [videoError, setVideoError] = useState(false);
  const [imageError, setImageError] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const mediaContainerRef = useRef<HTMLDivElement>(null);
  const logoWrapperRef = useRef<HTMLDivElement>(null);
  const textContentRef = useRef<HTMLDivElement>(null);

  // Reset error states when banner changes
  useEffect(() => {
    setVideoError(false);
    setImageError(false);
  }, [banner?.media_url, banner?.media_type]);

  const showVideo = content.isVideo && !videoError;
  const activeImageUrl = imageError ? content.fallbackUrl : content.mediaUrl;

  useEffect(() => {
    const section = sectionRef.current;
    const mediaEl = mediaContainerRef.current;
    const logoEl = logoWrapperRef.current;
    const textEl = textContentRef.current;

    if (!section || !mediaEl || !logoEl || !textEl) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set([mediaEl, logoEl, textEl], { opacity: 1, scale: 1, y: 0 });
        return;
      }

      // Initial state
      gsap.set(logoEl, { opacity: 0, scale: 0.9, y: 20 });
      gsap.set(textEl, { opacity: 0, y: 25 });
      gsap.set(mediaEl, { scale: 1.05 });

      // Entrance animation on load
      const enterTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      enterTl
        .to(mediaEl, { scale: 1, duration: 1.8, ease: 'power2.out' }, 0)
        .to(logoEl, { opacity: 1, scale: 1, y: 0, duration: 1.2 }, 0.2)
        .to(textEl, { opacity: 1, y: 0, duration: 1.2 }, 0.4);

      // Desktop: Scroll-driven camera movement (slow zoom 1.0 -> 1.12 + subtle parallax)
      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px)', () => {
        const scrollTl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=85%', // Controlled distance, releases cleanly
            scrub: 0.8,
            pin: true,
            anticipatePin: 1
          }
        });

        scrollTl
          .to(
            mediaEl,
            {
              scale: 1.12,
              y: -25,
              ease: 'power1.inOut'
            },
            0
          )
          .to(
            logoEl,
            {
              y: -15,
              opacity: 0.95,
              ease: 'power1.inOut'
            },
            0
          )
          .to(
            textEl,
            {
              y: -10,
              opacity: 0.9,
              ease: 'power1.inOut'
            },
            0
          );
      });

      mm.add('(max-width: 767px)', () => {
        // Mobile: Fluid non-pinned scroll response
        gsap.to(mediaEl, {
          y: -15,
          scale: 1.06,
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: 1
          }
        });
      });
    }, section);

    return () => ctx.revert();
  }, [content.mediaUrl, showVideo, isKn]);

  const activeTitle = isKn ? content.titleKn : content.titleEn;
  const activeSubtitle = isKn ? content.subtitleKn : content.subtitleEn;
  const activeBadge = isKn ? content.badgeKn : content.badgeEn;
  const activePrimaryBtn = isKn ? content.primaryBtnTextKn : content.primaryBtnTextEn;
  const activeOffer = isKn ? content.offerTextKn : content.offerTextEn;

  const handlePrimaryClick = () => {
    if (content.primaryBtnAction?.startsWith('#')) {
      const targetId = content.primaryBtnAction.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    onExploreClick();
  };

  return (
    <section
      ref={sectionRef}
      className="brand-film-hero relative w-full min-h-[92vh] sm:min-h-screen bg-[#1F140E] text-white flex items-center justify-center overflow-hidden select-none"
    >
      {/* FULL-BLEED ADMIN MEDIA LAYER (Video or Image with camera zoom) */}
      <div
        ref={mediaContainerRef}
        className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden will-change-transform"
      >
        {showVideo ? (
          <video
            key={content.mediaUrl}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={content.posterUrl}
            onError={() => setVideoError(true)}
            className="w-full h-full object-cover object-center"
          >
            <source src={content.mediaUrl} type="video/mp4" />
          </video>
        ) : (
          <img
            key={activeImageUrl}
            src={activeImageUrl}
            alt="Indima Spice Co."
            onError={() => {
              if (!imageError) setImageError(true);
            }}
            className="w-full h-full object-cover object-center"
          />
        )}

        {/* Minimal cinematic vignette overlays for optimal contrast while keeping media vividly visible */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F140E]/85 via-[#1F140E]/30 to-[#1F140E]/55" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#1F140E]/20 to-[#1F140E]/60 pointer-events-none" />
      </div>

      {/* FOREGROUND CINEMATIC CONTENT LAYER */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center py-10 sm:py-24">
        {/* Admin Badge Pill */}
        <div className="inline-flex items-center space-x-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-[#1F140E]/75 border border-amber-400/40 text-amber-200 text-[10px] sm:text-xs font-semibold tracking-widest uppercase mb-3.5 sm:mb-6 shadow-lg backdrop-blur-md">
          <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-amber-400" />
          <span>{activeBadge}</span>
          <span className="text-amber-400/60">•</span>
          <span>{isKn ? 'ಕರ್ನಾಟಕ' : 'Karnataka'}</span>
        </div>

        {/* Official Indima Logo Reveal */}
        <div ref={logoWrapperRef} className="relative mb-3.5 sm:mb-7">
          <div className="relative p-2.5 sm:p-5 rounded-3xl bg-[#FFFDF9]/95 border border-[#E8DFD3] shadow-2xl backdrop-blur-md">
            <img
              src={logoUrl || '/indima-logo.svg'}
              alt="Indima Spice Co. Authentic Homemade Spices Logo"
              className="h-16 sm:h-28 md:h-36 w-auto object-contain drop-shadow-[0_8px_16px_rgba(44,24,16,0.18)]"
              onError={e => {
                const target = e.target as HTMLImageElement;
                if (!target.src.endsWith('/indima-brand-logo.jpg')) {
                  target.src = '/indima-brand-logo.jpg';
                }
              }}
            />
          </div>
        </div>

        {/* Editorial Welcome & Statement from Admin */}
        <div ref={textContentRef} className="space-y-2.5 sm:space-y-4 max-w-2xl text-white">
          <p className="text-[11px] sm:text-sm font-mono uppercase tracking-[0.25em] text-amber-300 font-semibold drop-shadow-md">
            {isKn ? 'ಪರಿಶುದ್ಧ ಪರಂಪರೆ' : 'Authentic Indian Spices'}
          </p>

          <h1 className="font-serif text-2xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#FFFDF9] leading-[1.2] sm:leading-[1.15] text-balance drop-shadow-lg">
            {activeTitle}
          </h1>

          <p className="font-serif italic text-xs sm:text-lg md:text-xl text-amber-100/90 max-w-xl mx-auto leading-relaxed pt-0.5 sm:pt-1 font-normal drop-shadow-md">
            {activeSubtitle}
          </p>

          {/* Admin Offer Tag Strip if configured */}
          {activeOffer && (
            <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-[11px] sm:text-xs font-semibold backdrop-blur-md mt-1.5 sm:mt-2 shadow-md">
              <Tag className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-amber-300" />
              <span>{activeOffer}</span>
            </div>
          )}

          {/* Call to Action from Admin */}
          <div className="pt-2 sm:pt-4 flex items-center justify-center space-x-3">
            <button
              onClick={handlePrimaryClick}
              className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-[#993300] hover:bg-[#B84005] text-white font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 shadow-xl shadow-red-950/60 hover:scale-105 active:scale-95 cursor-pointer flex items-center space-x-2 border border-amber-400/30"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{activePrimaryBtn}</span>
            </button>
          </div>
        </div>

        {/* Bottom Scroll Prompt */}
        <div
          className="mt-6 sm:mt-14 flex flex-col items-center text-amber-200/80 space-y-1.5 cursor-pointer hover:text-amber-100 transition-colors"
          onClick={onExploreClick}
        >
          <span className="text-[10px] tracking-widest uppercase font-mono font-medium">
            {isKn ? 'ಕಥೆಯನ್ನು ತಿಳಿಯಲು ಕೆಳಗೆ ಸ್ಕ್ರಾಲ್ ಮಾಡಿ' : 'Scroll Down to Discover'}
          </span>
          <ArrowDown className="w-4 h-4 animate-bounce text-amber-300" />
        </div>
      </div>
    </section>
  );
};
