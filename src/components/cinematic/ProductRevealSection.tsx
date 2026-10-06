import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../contexts/CartContext';
import { Product } from '../../types';
import { ShoppingBag, Sparkles, Check, ArrowDown } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ProductRevealSectionProps {
  products: Product[];
  onOpenDetails: (product: Product) => void;
  onExploreCatalogue: () => void;
}

export const ProductRevealSection: React.FC<ProductRevealSectionProps> = ({
  products,
  onOpenDetails,
  onExploreCatalogue
}) => {
  const { language } = useLanguage();
  const isKn = language === 'kn';
  const { addItem, setIsCartOpen } = useCart();

  const [addedSuccess, setAddedSuccess] = useState(false);

  // Pick the signature or best-selling product from live database
  const featuredProduct: Product | undefined =
    products.find(p => p.badges?.includes('bestseller') && p.active !== false) ||
    products.find(p => p.badges?.includes('featured') && p.active !== false) ||
    products.find(p => p.id === 'prod-bisibelebath') ||
    products[0];

  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const packageWrapperRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const pkg = packageWrapperRef.current;
    const details = detailsRef.current;

    if (!section || !pkg || !details) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set([pkg, details], { opacity: 1, scale: 1, y: 0, x: 0 });
        return;
      }

      const mm = gsap.matchMedia();

      // Desktop: Controlled pin and focus reveal
      mm.add('(min-width: 768px)', () => {
        gsap.set(pkg, { opacity: 0, scale: 0.88, y: 30 });
        gsap.set(details, { opacity: 0, x: 25 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=85%', // Short pin, releases cleanly
            scrub: 0.8,
            pin: true,
            anticipatePin: 1
          }
        });

        tl.to(pkg, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out'
        }).to(
          details,
          {
            opacity: 1,
            x: 0,
            duration: 0.7,
            ease: 'power2.out'
          },
          '-=0.3'
        );
      });

      // Mobile: Smooth stagger without pin
      mm.add('(max-width: 767px)', () => {
        gsap.from([pkg, details], {
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'bottom 60%',
            toggleActions: 'play none none reverse'
          },
          opacity: 0,
          y: 25,
          stagger: 0.2,
          duration: 0.8,
          ease: 'power2.out'
        });
      });
    }, section);

    return () => ctx.revert();
  }, [isKn, featuredProduct?.id]);

  if (!featuredProduct) return null;

  const handleAddToCart = () => {
    addItem(featuredProduct, 1);
    setIsCartOpen(true);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const name = isKn ? featuredProduct.name_kn || featuredProduct.name_en : featuredProduct.name_en;
  const desc = isKn ? featuredProduct.description_kn || featuredProduct.description_en : featuredProduct.description_en;
  const imgUrl =
    featuredProduct.images?.[0] ||
    featuredProduct.image_url ||
    '/indima-logo.svg';

  const discount = featuredProduct.discount_percentage || (featuredProduct.mrp > featuredProduct.price
    ? Math.round(((featuredProduct.mrp - featuredProduct.price) / featuredProduct.mrp) * 100)
    : 0);

  return (
    <section
      ref={sectionRef}
      className="product-reveal-section relative w-full min-h-[92vh] sm:min-h-screen bg-[#FAF6EE] text-[#2C1810] py-20 px-4 sm:px-6 lg:px-8 overflow-hidden select-none flex items-center justify-center"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 50% 50%, rgba(255, 253, 249, 0.98) 0%, rgba(250, 246, 238, 0.98) 85%)'
      }}
    >
      {/* Background warm soft glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/10 via-red-600/5 to-transparent blur-[120px] rounded-full pointer-events-none" />

      {/* Main Grid */}
      <div
        ref={containerRef}
        className="relative z-10 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center"
      >
        {/* Left Column: Live Indima Product Package Showcase */}
        <div
          ref={packageWrapperRef}
          className="lg:col-span-6 relative flex items-center justify-center"
        >
          <div className="relative group p-4 sm:p-6 rounded-3xl bg-[#FFFDF9] border border-[#E8DFD3] shadow-xl shadow-[#2C1810]/5 max-w-sm sm:max-w-md w-full">
            {/* Signature Heritage Tag */}
            <div className="absolute top-4 left-4 z-10 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#993300] text-white text-[11px] font-bold tracking-wider uppercase shadow-xs">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{isKn ? 'ಸಿದ್ಧ ಪರಿಶುದ್ಧ ಮಸಾಲೆ' : 'Pure Spice Blend'}</span>
            </div>

            {/* Product Image */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#FAF6EE] border border-[#E8DFD3]/80">
              <img
                src={imgUrl}
                alt={name}
                className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
                onError={e => {
                  (e.target as HTMLImageElement).src = '/indima-logo.svg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2C1810]/40 via-transparent to-transparent pointer-events-none" />

              {/* Weight Pill */}
              <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-[#FFFDF9]/95 border border-[#DFC7A2] text-[#2C1810] text-xs font-mono font-medium shadow-xs">
                {featuredProduct.weight || '200g'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Narrative & CTA Payoff */}
        <div ref={detailsRef} className="lg:col-span-6 space-y-5">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 text-[#993300] font-mono text-xs uppercase tracking-widest font-semibold">
              <span>{isKn ? 'ಸಿದ್ಧ ಉತ್ಪನ್ನ' : 'The Finished Product'}</span>
              <span>•</span>
              <span className="text-[#2B5329]">
                {featuredProduct.stock > 0
                  ? isKn ? 'ಲಭ್ಯವಿದೆ' : 'In Stock'
                  : isKn ? 'ಖಾಲಿಯಾಗಿದೆ' : 'Sold Out'}
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#2C1810] leading-[1.2]">
              {name}
            </h2>
          </div>

          <p className="text-xs sm:text-sm lg:text-base text-[#6B4E3D] leading-relaxed font-normal">
            {desc || (isKn
              ? 'ಸಾಂಪ್ರದಾಯಿಕ ವಿಧಾನದಲ್ಲಿ ಸಿದ್ಧಪಡಿಸಿದ ಪರಿಶುದ್ಧ ಮಸಾಲೆ ಪುಡಿ.'
              : 'Handcrafted with traditional care to preserve essential aroma and authentic homemade flavour.')}
          </p>

          {/* Pricing Pod */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF9] border border-[#DFC7A2] shadow-xs flex items-center justify-between">
            <div>
              <div className="flex items-baseline space-x-3">
                <span className="font-serif text-3xl sm:text-4xl font-bold text-[#993300]">
                  ₹{featuredProduct.price}
                </span>
                {featuredProduct.mrp > featuredProduct.price && (
                  <span className="text-sm sm:text-base text-[#8C7667] line-through font-normal">
                    ₹{featuredProduct.mrp}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#8C7667] mt-0.5 font-normal">
                {isKn ? 'ತೆರಿಗೆ ಸೇರಿದೆ • ಪ್ಯಾನ್‌-ಇಂಡಿಯಾ ವಿತರಣೆ' : 'Inclusive of all taxes • Pan-India Delivery'}
              </p>
            </div>

            {discount > 0 && (
              <div className="px-3 py-1.5 rounded-xl bg-[#EAF2EB] border border-[#CDE0D0] text-[#2B5329] text-xs font-bold font-mono">
                {discount}% OFF
              </div>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={featuredProduct.stock <= 0}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3.5 rounded-full text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer shadow-md ${
                addedSuccess
                  ? 'bg-[#2B5329] text-white'
                  : 'bg-[#993300] hover:bg-[#7A1F1D] text-white hover:scale-102 active:scale-98'
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
              onClick={onExploreCatalogue}
              className="flex items-center justify-center space-x-2 px-6 py-3.5 rounded-full bg-[#FAF0E1] hover:bg-[#F3E2CE] text-[#8B3214] text-xs sm:text-sm font-bold tracking-wider uppercase border border-[#DFC7A2] transition-all hover:scale-102 cursor-pointer"
            >
              <span>{isKn ? 'ಎಲ್ಲಾ ಮಸಾಲೆಗಳನ್ನು ನೋಡಿ' : 'Explore the Collection'}</span>
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
