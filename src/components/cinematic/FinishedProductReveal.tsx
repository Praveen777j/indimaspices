import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../contexts/CartContext';
import { Product } from '../../types';
import { ShoppingBag, Eye, ArrowDown, Sparkles, Check, Flame } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface FinishedProductRevealProps {
  products: Product[];
  onOpenDetails: (product: Product) => void;
  onExploreCatalogue: () => void;
}

export const FinishedProductReveal: React.FC<FinishedProductRevealProps> = ({
  products,
  onOpenDetails,
  onExploreCatalogue
}) => {
  const { language } = useLanguage();
  const isKn = language === 'kn';
  const { addItem, setIsCartOpen } = useCart();

  const [addedSuccess, setAddedSuccess] = useState(false);

  // Pick the authoritative featured or best-selling product from live database
  const heroProduct: Product | undefined =
    products.find(p => p.badges?.includes('bestseller') && p.active !== false) ||
    products.find(p => p.badges?.includes('featured') && p.active !== false) ||
    products.find(p => p.id === 'prod-bisibelebath') ||
    products[0];

  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const imgWrapper = imageWrapperRef.current;
    const details = detailsRef.current;

    if (!section || !imgWrapper || !details) return;

    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      gsap.set(imgWrapper, { scale: 0.85, opacity: 0, y: 40 });
      gsap.set(details, { opacity: 0, x: 30 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: isMobile ? '+=60%' : '+=100%', // Moderate desktop pin, then natural release
          scrub: 0.7,
          pin: !isMobile,
          anticipatePin: 1
        }
      });

      tl.to(imgWrapper, {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out'
      }).to(
        details,
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power2.out'
        },
        '-=0.4'
      );
    }, section);

    return () => ctx.revert();
  }, [isKn, heroProduct?.id]);

  if (!heroProduct) return null;

  const handleAddToCart = () => {
    addItem(heroProduct, 1);
    setIsCartOpen(true);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2200);
  };

  const name = isKn ? heroProduct.name_kn || heroProduct.name_en : heroProduct.name_en;
  const desc = isKn ? heroProduct.description_kn || heroProduct.description_en : heroProduct.description_en;
  const imgUrl =
    heroProduct.images?.[0] ||
    heroProduct.image_url ||
    '/indima-logo.svg';

  const discount = heroProduct.discount_percentage || (heroProduct.mrp > heroProduct.price
    ? Math.round(((heroProduct.mrp - heroProduct.price) / heroProduct.mrp) * 100)
    : 0);

  return (
    <section
      ref={sectionRef}
      className="product-reveal-section relative w-full min-h-[92vh] sm:min-h-screen bg-[#1F120A] text-[#FAF3E8] py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden select-none flex items-center justify-center"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 50% 45%, rgba(95, 35, 12, 0.45) 0%, rgba(26, 14, 8, 0.98) 85%)'
      }}
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div
        ref={containerRef}
        className="relative z-20 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center"
      >
        {/* Left Column: Live Cloudinary/Product Media Showcase */}
        <div
          ref={imageWrapperRef}
          className="lg:col-span-6 relative flex items-center justify-center"
        >
          {/* Subtle pedestal glow */}
          <div className="absolute w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-gradient-to-tr from-amber-500/25 via-red-600/20 to-transparent blur-3xl pointer-events-none" />

          {/* Product Image Card */}
          <div className="relative group p-4 sm:p-6 rounded-3xl bg-[#2B170E]/80 border border-amber-600/30 backdrop-blur-md shadow-2xl overflow-hidden max-w-md w-full">
            {/* Live Bestseller/Special Tag */}
            <div className="absolute top-4 left-4 z-10 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#993300] text-white text-[10px] sm:text-xs font-bold tracking-wider uppercase shadow-md">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{isKn ? 'ಜನಪ್ರಿಯ ಮಸಾಲೆ' : 'Signature Heritage Blend'}</span>
            </div>

            {/* Product Image */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black/30 border border-amber-900/30">
              <img
                src={imgUrl}
                alt={name}
                className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
                onError={e => {
                  (e.target as HTMLImageElement).src = '/indima-logo.svg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

              {/* Weight pill overlay */}
              <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/70 border border-amber-500/40 text-amber-200 text-xs font-mono font-medium backdrop-blur-md">
                {heroProduct.weight || '200g'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Product Details & Commerce Actions */}
        <div ref={detailsRef} className="lg:col-span-6 space-y-5 sm:space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 text-amber-400 font-mono text-xs uppercase tracking-widest">
              <span>{isKn ? 'ಸಿದ್ಧ ಉತ್ಪನ್ನ' : 'THE FINISHED PRODUCT'}</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">
                {heroProduct.stock > 0
                  ? isKn ? 'ಲಭ್ಯವಿದೆ' : 'In Stock'
                  : isKn ? 'ಖಾಲಿಯಾಗಿದೆ' : 'Sold Out'}
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#FAF3E8] leading-[1.15]">
              {name}
            </h2>
          </div>

          <p className="text-xs sm:text-sm lg:text-base text-amber-100/80 leading-relaxed font-normal">
            {desc || (isKn
              ? 'ಸಾಂಪ್ರದಾಯಿಕ ವಿಧಾನದಲ್ಲಿ ತಯಾರಿಸಿದ ಪರಿಶುದ್ಧ ಮಸಾಲೆ ಪುಡಿ.'
              : 'Authentic stone-milled blend preserving natural aroma and wholesome taste.')}
          </p>

          {/* Pricing & Savings Bento Pod */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#2A180E]/90 border border-amber-600/30 flex items-center justify-between">
            <div>
              <div className="flex items-baseline space-x-3">
                <span className="font-serif text-3xl sm:text-4xl font-bold text-amber-300">
                  ₹{heroProduct.price}
                </span>
                {heroProduct.mrp > heroProduct.price && (
                  <span className="text-sm sm:text-base text-amber-400/50 line-through">
                    ₹{heroProduct.mrp}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-amber-300/60 mt-0.5">
                {isKn ? 'ತೆರಿಗೆ ಸೇರಿದೆ • ಪ್ಯಾನ್‌-ಇಂಡಿಯಾ ವಿತರಣೆ' : 'Inclusive of all taxes • Pan-India Delivery'}
              </p>
            </div>

            {discount > 0 && (
              <div className="px-3 py-1.5 rounded-xl bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-mono">
                {discount}% OFF
              </div>
            )}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={heroProduct.stock <= 0}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3.5 rounded-full text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer shadow-xl ${
                addedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-[#993300] to-[#B84005] hover:from-[#B84005] hover:to-[#D94E07] text-[#FFFDF9] hover:scale-105 active:scale-95'
              }`}
            >
              {addedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>{isKn ? 'ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಲಾಗಿದೆ!' : 'Added to Cart!'}</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-white" />
                  <span>{isKn ? 'ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ' : 'Add to Cart'}</span>
                </>
              )}
            </button>

            <button
              onClick={() => onOpenDetails(heroProduct)}
              className="flex items-center justify-center space-x-2 px-5 py-3.5 rounded-full bg-[#2A180E] hover:bg-[#3A2214] text-amber-200 text-xs sm:text-sm font-semibold tracking-wide border border-amber-500/30 transition-all hover:scale-105 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span>{isKn ? 'ವಿವರಗಳನ್ನು ನೋಡಿ' : 'View Details'}</span>
            </button>
          </div>

          {/* Natural Transition into Storefront Catalogue */}
          <div className="pt-4 border-t border-amber-800/30 flex items-center justify-between">
            <p className="text-xs text-amber-300/70">
              {isKn ? 'ಇನ್ನಷ್ಟು ಮಸಾಲೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ:' : 'Continue to full catalog:'}
            </p>
            <button
              onClick={onExploreCatalogue}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer group"
            >
              <span>{isKn ? 'ಅಂಗಡಿಗೆ ಮುಂದುವರಿಯಿರಿ' : 'Explore Indima Store'}</span>
              <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
