import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ShoppingBag, ArrowDown, Sparkles, Check, ChevronRight, Compass, Filter, Sun, Flame, Layers, Package, Utensils } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { Product } from '../types';
import {
  rawSpicesImg,
  spiceCleanImg,
  stoneGrindImg,
  spiceBlendImg,
  spicePackImg,
  spiceKitchenImg
} from '../assets/images';

gsap.registerPlugin(ScrollTrigger);

interface ScrollSpiceJourneyProps {
  products?: Product[];
  onOpenProduct?: (product: Product) => void;
  onExploreCatalog?: () => void;
}

export const ScrollSpiceJourney: React.FC<ScrollSpiceJourneyProps> = ({
  products = [],
  onOpenProduct,
  onExploreCatalog
}) => {
  const { language } = useLanguage();
  const isKn = language === 'kn';
  const { addItem } = useCart();

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Scene DOM element references
  const scene1Ref = useRef<HTMLDivElement | null>(null);
  const scene2Ref = useRef<HTMLDivElement | null>(null);
  const scene3Ref = useRef<HTMLDivElement | null>(null);
  const scene4Ref = useRef<HTMLDivElement | null>(null);
  const scene5Ref = useRef<HTMLDivElement | null>(null);
  const scene6Ref = useRef<HTMLDivElement | null>(null);
  const scene7Ref = useRef<HTMLDivElement | null>(null);
  const scene8Ref = useRef<HTMLDivElement | null>(null);

  // Mill stone reference for direct rotation
  const millStoneRef = useRef<SVGSVGElement | null>(null);

  // HUD progress state
  const [hudProgress, setHudProgress] = useState(0);
  const [activeChapter, setActiveChapter] = useState('WHOLE SPICE');
  const [isLightScene, setIsLightScene] = useState(true);
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  // Progress ref for the canvas animation loop (avoids stale closures or effect re-runs)
  const progressRef = useRef(0);

  // Pick actual catalog product for the final reveal
  const featuredProduct: Product =
    products.find(p => p.active && (p.name_en?.toLowerCase().includes('sambar') || p.name_en?.toLowerCase().includes('rasam'))) ||
    products.find(p => p.active) || {
      id: 'indima-sambar-powder',
      sku: 'IND-SAM-250',
      name_en: 'Traditional Sambar Powder',
      name_kn: 'ಸಾಂಪ್ರದಾಯಿಕ ಸಾಂಬಾರ್ ಪುಡಿ',
      price: 145,
      mrp: 165,
      discount_percentage: 12,
      weight: '250g',
      shelf_life: '12 Months',
      storage_en: 'Store in an airtight container in a cool, dry place.',
      storage_kn: 'ತಂಪಾದ, ಒಣ ಜಾಗದಲ್ಲಿ ಗಾಳಿಯಾಡದ ಪಾತ್ರೆಯಲ್ಲಿ ಸಂಗ್ರಹಿಸಿ.',
      traditional_info_en: 'Crafted according to ancestral Bengaluru recipes.',
      traditional_info_kn: 'ಪಾರಂಪರಿಕ ಬೆಂಗಳೂರು ಪಾಕವಿಧಾನದಂತೆ ತಯಾರಿಸಲ್ಪಟ್ಟಿದೆ.',
      description_en: 'Stone-ground with authentic Byadgi chillies, Salem turmeric, and fragrant coriander.',
      description_kn: 'ಬ್ಯಾಡಗಿ ಮೆಣಸಿನಕಾಯಿ ಮತ್ತು ಪರಿಶುದ್ಧ ಧನಿಯಾ ಕಾಳುಗಳಿಂದ ತಯಾರಿಸಿದ ಅಪ್ಪಟ ಸಾಂಬಾರ್ ಪುಡಿ.',
      ingredients_en: 'Byadgi chilli, coriander seeds, cumin, turmeric, fenugreek, curry leaves, copra',
      ingredients_kn: 'ಬ್ಯಾಡಗಿ ಮೆಣಸಿನಕಾಯಿ, ಧನಿಯಾ ಕಾಳುಗಳು, ಜೀರಿಗೆ, ಅರಿಶಿನ, ಮೆಂತ್ಯ, ಕರಿಬೇವಿನ ಎಲೆಗಳು, ಕೊಬ್ಬರಿ',
      images: [spicePackImg],
      badges: ['bestseller', 'homemade'],
      rating: 5,
      review_count: 84,
      active: true,
      stock: 50,
      low_stock_threshold: 10,
      category_id: 'blends'
    };

  // GSAP Master Timeline connecting all 8 real DOM scenes
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const pin = pinRef.current;
    if (!wrapper || !pin) return;

    const ctx = gsap.context(() => {
      // 1. Establish robust initial DOM states: Scene 1 visible, Scenes 2-8 waiting
      gsap.set(scene1Ref.current, { autoAlpha: 1, scale: 1, y: 0, zIndex: 10 });
      gsap.set(scene2Ref.current, { autoAlpha: 0, scale: 0.96, y: 30, zIndex: 11 });
      gsap.set(scene3Ref.current, { autoAlpha: 0, scale: 0.96, y: 30, zIndex: 12 });
      gsap.set(scene4Ref.current, { autoAlpha: 0, scale: 0.96, y: 30, zIndex: 13 });
      gsap.set(scene5Ref.current, { autoAlpha: 0, scale: 0.96, y: 30, zIndex: 14 });
      gsap.set(scene6Ref.current, { autoAlpha: 0, scale: 0.96, y: 30, zIndex: 15 });
      gsap.set(scene7Ref.current, { autoAlpha: 0, scale: 0.96, y: 30, zIndex: 16 });
      gsap.set(scene8Ref.current, { autoAlpha: 0, scale: 0.96, y: 30, zIndex: 17 });

      // 2. Build one master ScrollTrigger scrubbed timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: self => {
            const p = self.progress;
            progressRef.current = p;
            setHudProgress(Math.round(p * 100));

            // Rotate grinding mill stone directly
            if (millStoneRef.current) {
              gsap.set(millStoneRef.current, { rotation: p * 720 });
            }

            // Update chapter name and lighting
            if (p < 0.14) {
              setActiveChapter('WHOLE SPICE');
              setIsLightScene(true);
            } else if (p < 0.28) {
              setActiveChapter('PREPARATION');
              setIsLightScene(true);
            } else if (p < 0.42) {
              setActiveChapter('GENTLE ROAST');
              setIsLightScene(false);
            } else if (p < 0.56) {
              setActiveChapter('STONE MILLING');
              setIsLightScene(false);
            } else if (p < 0.7) {
              setActiveChapter('SPICE POWDER');
              setIsLightScene(false);
            } else if (p < 0.84) {
              setActiveChapter('HERITAGE BLEND');
              setIsLightScene(false);
            } else if (p < 0.94) {
              setActiveChapter('PACKAGING');
              setIsLightScene(true);
            } else {
              setActiveChapter('YOUR KITCHEN');
              setIsLightScene(true);
            }
          }
        }
      });

      // Master continuous timeline animating each scene in sequence
      // Timeline duration: 14 units (approx 1.75 units per scene)

      // Scene 1 -> Scene 2 (around progress 0.14)
      tl.to(scene1Ref.current, { autoAlpha: 0, scale: 1.05, y: -30, duration: 1 }, 1.2)
        .to(scene2Ref.current, { autoAlpha: 1, scale: 1, y: 0, duration: 1 }, 1.2)

      // Scene 2 -> Scene 3 (around progress 0.28)
        .to(scene2Ref.current, { autoAlpha: 0, scale: 1.05, y: -30, duration: 1 }, 3.0)
        .to(scene3Ref.current, { autoAlpha: 1, scale: 1, y: 0, duration: 1 }, 3.0)

      // Scene 3 -> Scene 4 (around progress 0.42)
        .to(scene3Ref.current, { autoAlpha: 0, scale: 1.05, y: -30, duration: 1 }, 4.8)
        .to(scene4Ref.current, { autoAlpha: 1, scale: 1, y: 0, duration: 1 }, 4.8)

      // Scene 4 -> Scene 5 (around progress 0.56)
        .to(scene4Ref.current, { autoAlpha: 0, scale: 1.05, y: -30, duration: 1 }, 6.6)
        .to(scene5Ref.current, { autoAlpha: 1, scale: 1, y: 0, duration: 1 }, 6.6)

      // Scene 5 -> Scene 6 (around progress 0.70)
        .to(scene5Ref.current, { autoAlpha: 0, scale: 1.05, y: -30, duration: 1 }, 8.4)
        .to(scene6Ref.current, { autoAlpha: 1, scale: 1, y: 0, duration: 1 }, 8.4)

      // Scene 6 -> Scene 7 (around progress 0.84)
        .to(scene6Ref.current, { autoAlpha: 0, scale: 1.05, y: -30, duration: 1 }, 10.2)
        .to(scene7Ref.current, { autoAlpha: 1, scale: 1, y: 0, duration: 1 }, 10.2)

      // Scene 7 -> Scene 8 (around progress 0.94)
        .to(scene7Ref.current, { autoAlpha: 0, scale: 1.05, y: -30, duration: 1 }, 12.0)
        .to(scene8Ref.current, { autoAlpha: 1, scale: 1, y: 0, duration: 1 }, 12.0);

      // Force recalculation of scroll offsets once layout settles
      ScrollTrigger.refresh();
    }, wrapper);

    return () => {
      ctx.revert();
    };
  }, []);

  // Ambient Particle Canvas (Runs independently in rAF without re-running on scroll state changes)
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

    const count = width < 640 ? 40 : 80;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -0.2 - Math.random() * 0.4,
      size: 1.2 + Math.random() * 2.8,
      color: ['#D49B28', '#C0392B', '#E28330', '#C5A059'][Math.floor(Math.random() * 4)],
      alpha: 0.15 + Math.random() * 0.45
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

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
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleAddToCart = () => {
    if (!featuredProduct) return;
    addItem(featuredProduct, 1);
    setIsAddedToCart(true);
    setTimeout(() => setIsAddedToCart(false), 2400);
  };

  return (
    <section
      id="scroll-journey-section"
      ref={wrapperRef}
      className="journey-wrapper relative w-full h-[600vh]"
    >
      {/* Pinned Viewport Container (Remains pinned on screen for 600vh scroll) */}
      <div
        ref={pinRef}
        className="journey-pin sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between select-none bg-gradient-to-b from-[#FAF4E8] via-[#F8EFE2] to-[#F3E5D4]"
      >
        {/* Background Ambient Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

        {/* Top HUD: Chapter Name & Real-Time Progress Indicator */}
        <div className="relative z-30 pt-6 sm:pt-8 px-4 sm:px-8 max-w-7xl mx-auto w-full flex items-center justify-between text-xs font-mono">
          <div
            className={`flex items-center space-x-2.5 font-bold tracking-widest uppercase transition-colors duration-300 ${
              isLightScene ? 'text-[#8B3214]' : 'text-amber-300'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full animate-ping ${
                isLightScene ? 'bg-[#8B3214]' : 'bg-amber-400'
              }`}
            />
            <span>{isKn ? 'ಪವಿತ್ರ ಪಯಣ' : 'THE TRANSFORMATION'}</span>
            <span className="opacity-40">/</span>
            <span className={`font-sans tracking-normal ${isLightScene ? 'text-[#5C483B]' : 'text-stone-300'}`}>
              {activeChapter}
            </span>
          </div>

          <div
            className={`flex items-center space-x-3 transition-colors duration-300 ${
              isLightScene ? 'text-[#5C483B]' : 'text-stone-300'
            }`}
          >
            <span className="hidden sm:inline font-sans text-[11px] tracking-widest uppercase font-bold">
              {isKn ? 'ಸ್ಕ್ರೋಲ್ ಪ್ರಗತಿ' : 'SCROLL PROGRESS'}
            </span>
            <span
              className={`font-bold text-sm font-mono ${
                isLightScene ? 'text-[#8B3214]' : 'text-amber-300'
              }`}
            >
              {hudProgress}%
            </span>
          </div>
        </div>

        {/* Right Rail: Interactive Scrubbing Track Timeline */}
        <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center space-y-3 pointer-events-none">
          <div className="w-1.5 h-44 bg-black/15 rounded-full overflow-hidden relative">
            <div
              className="w-full bg-gradient-to-b from-[#8B3214] via-[#D49B28] to-[#8B3214] rounded-full transition-all duration-150"
              style={{ height: `${Math.max(8, hudProgress)}%` }}
            />
          </div>
          <span
            className={`text-[10px] font-mono uppercase rotate-90 origin-center translate-y-3 font-bold ${
              isLightScene ? 'text-[#8B3214]' : 'text-amber-300'
            }`}
          >
            TIMELINE
          </span>
        </div>

        {/* ALL 8 SCENES PERMANENTLY IN THE DOM (Transitioned via GSAP Timeline) */}
        <div className="journey-scenes absolute inset-0 w-full h-full">

          {/* ══════════════════════════════════════════════════════════
              SCENE 1: WHOLE SPICE (Chapter 01)
              ══════════════════════════════════════════════════════════ */}
          <div
            ref={scene1Ref}
            className="scene scene-1 absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-8"
          >
            <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-6 space-y-4 text-center md:text-left">
                <div className="inline-flex items-center space-x-2 text-xs font-mono tracking-widest text-[#8B3214] uppercase font-bold">
                  <Compass className="w-3.5 h-3.5" />
                  <span>{isKn ? 'ಹಂತ ೦೧ · ಕಾಳು ಮಸಾಲೆ' : 'SCENE 01 · WHOLE SPICE'}</span>
                </div>
                <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1F1610] leading-tight">
                  {isKn ? 'ಕಾಳು ಮಸಾಲೆಗಳ ಪವಿತ್ರ ಮೂಲ.' : 'It starts with the whole spice.'}
                </h2>
                <p className="text-xs sm:text-sm text-[#5C483B] max-w-md leading-relaxed font-normal">
                  {isKn
                    ? 'ಬ್ಯಾಡಗಿ ಮೆಣಸಿನಕಾಯಿ, ಸುವಾಸನಾಭರಿತ ಧನಿಯಾ ಮತ್ತು ಅರಿಶಿನ ಕೊಂಬುಗಳು. ಪ್ರತಿಯೊಂದು ರುಚಿಗೂ ಒಂದು ನೈಸರ್ಗಿಕ ಆರಂಭವಿದೆ.'
                    : 'Single-origin Byadgi chillies, Salem turmeric fingers, and plump coriander seeds harvested directly from Karnataka generational growers.'}
                </p>
                <div className="pt-2 flex items-center justify-center md:justify-start space-x-4 text-xs font-mono text-[#8C6D53]">
                  <span>WHOLE</span>
                  <span className="text-[#DFC7A2]">·</span>
                  <span>UNPROCESSED</span>
                  <span className="text-[#DFC7A2]">·</span>
                  <span>FARM DIRECT</span>
                </div>
              </div>

              <div className="md:col-span-6 flex justify-center">
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden shadow-2xl border border-[#DFC7A2] bg-[#1F1610]">
                  <img
                    src={rawSpicesImg}
                    alt="Whole Karnataka Spices"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1F1610] via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider">
                      BYADGI CHILLI & CORIANDER
                    </p>
                    <p className="text-xs font-bold text-white/90">Pure Essential Oil Density</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              SCENE 2: PREPARATION & WINNOWING (Chapter 02)
              ══════════════════════════════════════════════════════════ */}
          <div
            ref={scene2Ref}
            className="scene scene-2 absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-8"
          >
            <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-6 space-y-4 text-center md:text-left">
                <div className="inline-flex items-center space-x-2 text-xs font-mono tracking-widest text-[#8B3214] uppercase font-bold">
                  <Filter className="w-3.5 h-3.5" />
                  <span>{isKn ? 'ಹಂತ ೦೨ · ಪರಿಶುದ್ಧತೆ' : 'SCENE 02 · PREPARATION'}</span>
                </div>
                <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1F1610] leading-tight">
                  {isKn ? 'ಕೈಯಿಂದ ಆರಿಸುವ ತಾಳ್ಮೆ.' : 'Prepared with patience.'}
                </h2>
                <p className="text-xs sm:text-sm text-[#5C483B] max-w-md leading-relaxed font-normal">
                  {isKn
                    ? 'ಸಾಂಪ್ರದಾಯಿಕ ಮೊರದಲ್ಲಿ ಕೇರಿ ತೊಟ್ಟು, ಧೂಳು ಮತ್ತು ಕಸವನ್ನು ಕೈಯಿಂದಲೇ ಆರಿಸಿ ಕೇವಲ ಪರಿಶುದ್ಧ ಕಾಳುಗಳನ್ನು ಮಾತ್ರ ಮುಂದುವರಿಸಲಾಗುತ್ತದೆ.'
                    : 'Sorted and winnowed by hand in traditional bamboo trays. Stems, hollow seeds, and dust are separated so only clean whole spice kernels proceed.'}
                </p>
                <div className="pt-2 flex items-center justify-center md:justify-start space-x-4 text-xs font-mono text-[#8C6D53]">
                  <span>HAND SORTED</span>
                  <span className="text-[#DFC7A2]">·</span>
                  <span>WINNOWED</span>
                  <span className="text-[#DFC7A2]">·</span>
                  <span>NO CHAFF</span>
                </div>
              </div>

              <div className="md:col-span-6 flex justify-center">
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden shadow-2xl border border-[#DFC7A2] bg-[#1F1610]">
                  <img
                    src={spiceCleanImg}
                    alt="Winnowing Spices"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1F1610] via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider">
                      TRADITIONAL WINNOWING
                    </p>
                    <p className="text-xs font-bold text-white/90">De-stemmed & Naturally Cleaned</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              SCENE 3: GENTLE ROASTING & EMBERS (Chapter 03)
              ══════════════════════════════════════════════════════════ */}
          <div
            ref={scene3Ref}
            className="scene scene-3 absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-b from-[#2E160E] via-[#3E1C11] to-[#220E08] text-white"
          >
            <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-6 space-y-4 text-center md:text-left">
                <div className="inline-flex items-center space-x-2 text-xs font-mono tracking-widest text-amber-400 uppercase font-bold">
                  <Sun className="w-3.5 h-3.5" />
                  <span>{isKn ? 'ಹಂತ ೦೩ · ಮಂದ ಉರಿ' : 'SCENE 03 · GENTLE ROAST'}</span>
                </div>
                <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                  {isKn ? 'ಹದವಾದ ಮಂದ ಉರಿ.' : 'Gently warmed over embers.'}
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 max-w-md leading-relaxed font-light">
                  {isKn
                    ? 'ಬಿಸಿಲಿನಲ್ಲಿ ಒಣಗಿಸಿ, ಸಾಂಪ್ರದಾಯಿಕ ಕಬ್ಬಿಣದ ಬಾಣಲೆಯಲ್ಲಿ ಮಂದ ಉರಿಯಲ್ಲಿ ಹುರಿಯಲಾಗುತ್ತದೆ. ಕಾಳುಗಳು ಸುಡದೆ ಸುಗಂಧ ತೈಲಗಳು ಎಚ್ಚರಗೊಳ್ಳುತ್ತವೆ.'
                    : 'Sun-cured and slowly toasted in seasoned cast-iron kadai over gentle embers. Low heat awakens aromatic terpenes without scorching the delicate skins.'}
                </p>
                <div className="pt-2 flex items-center justify-center md:justify-start space-x-4 text-xs font-mono text-amber-300">
                  <span>SLOW WARMTH</span>
                  <span className="text-stone-500">·</span>
                  <span>AROMA AWAKENING</span>
                  <span className="text-stone-500">·</span>
                  <span>CAST IRON</span>
                </div>
              </div>

              <div className="md:col-span-6 flex justify-center">
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden shadow-2xl border border-amber-600/40 bg-stone-900">
                  <img
                    src={rawSpicesImg}
                    alt="Spices Warming on Embers"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_0%,rgba(40,15,5,0.7)_100%]" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                      WOOD-FIRE ROASTED
                    </p>
                    <p className="text-xs font-bold text-white/90">Aromas Awakened at Source</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              SCENE 4: THE GRANITE STONE MILL (Chapter 04) — THE WOW MOMENT
              ══════════════════════════════════════════════════════════ */}
          <div
            ref={scene4Ref}
            className="scene scene-4 absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-b from-[#1C1816] via-[#2A2421] to-[#120F0E] text-white"
          >
            <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-6 space-y-4 text-center md:text-left">
                <div className="inline-flex items-center space-x-2 text-xs font-mono tracking-widest text-amber-400 uppercase font-bold">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{isKn ? 'ಹಂತ ೦೪ · ಕಲ್ಲಿನ ಬೀಸುವಿಕೆ' : 'SCENE 04 · STONE MILLING'}</span>
                </div>
                <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-red-400 leading-tight">
                  {isKn ? 'ಕಾಳು → ಅಪ್ಪಟ ಪುಡಿ' : 'WHOLE → GROUND'}
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 max-w-md leading-relaxed font-light">
                  {isKn
                    ? 'ನೈಸರ್ಗಿಕ ಗ್ರಾನೈಟ್ ಕಲ್ಲಿನಲ್ಲಿ ನಿಧಾನವಾಗಿ ಬೀಸಲಾಗುತ್ತದೆ. ಯಾವುದೇ ಹೆಚ್ಚಿನ ಶಾಖವಿಲ್ಲದೆ ಮಸಾಲೆಯ ಬಣ್ಣ, ಸುವಾಸನೆ ಮತ್ತು ನೈಜ ರುಚಿ ಹಾಗೆಯೇ ಉಳಿಯುತ್ತದೆ.'
                    : 'Natural granite millstone rotates with your scroll, crushing whole spices without extreme industrial friction. The delicate nutrition and aroma remain intact.'}
                </p>
                <div className="pt-2 flex items-center justify-center md:justify-start space-x-4 text-xs font-mono text-amber-400">
                  <span>COOL MILLING</span>
                  <span className="text-stone-600">·</span>
                  <span>GRANITE STONE</span>
                  <span className="text-stone-600">·</span>
                  <span>NO BURNING</span>
                </div>
              </div>

              {/* Dynamic Rotating Granite Mill Stone Graphic */}
              <div className="md:col-span-6 flex justify-center">
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full flex items-center justify-center bg-stone-900 border-4 border-stone-700 shadow-2xl overflow-hidden">
                  <img
                    src={stoneGrindImg}
                    alt="Granite Stone Mill"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                  {/* Rotating Granite Upper Stone */}
                  <svg
                    ref={millStoneRef}
                    viewBox="0 0 200 200"
                    className="w-56 h-56 sm:w-64 sm:h-64 relative z-10 transition-transform duration-75"
                  >
                    <circle cx="100" cy="100" r="90" fill="#3D3734" stroke="#665F5A" strokeWidth="4" />
                    <circle cx="100" cy="100" r="70" fill="none" stroke="#25211F" strokeWidth="3" strokeDasharray="6 8" />
                    <circle cx="100" cy="100" r="50" fill="none" stroke="#524B46" strokeWidth="2" strokeDasharray="4 6" />
                    {/* Center Aperture */}
                    <circle cx="100" cy="100" r="22" fill="#141110" />
                    {/* Wooden Turning Peg Handle */}
                    <circle cx="155" cy="100" r="14" fill="#996033" stroke="#C4844E" strokeWidth="2" />
                  </svg>
                  {/* Exploding Red & Gold Micro-fragments */}
                  <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_30%,rgba(192,57,43,0.3)_100%] pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              SCENE 5: SPICE POWDER DYNAMICS (Chapter 05)
              ══════════════════════════════════════════════════════════ */}
          <div
            ref={scene5Ref}
            className="scene scene-5 absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-b from-[#8B230B] via-[#701605] to-[#450C03] text-white"
          >
            <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-6 space-y-4 text-center md:text-left">
                <div className="inline-flex items-center space-x-2 text-xs font-mono tracking-widest text-amber-300 uppercase font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isKn ? 'ಹಂತ ೦೫ · ಪರಿಶುದ್ಧ ಪುಡಿ' : 'SCENE 05 · SPICE POWDER'}</span>
                </div>
                <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                  {isKn ? 'ದಟ್ಟವಾದ ನೈಸರ್ಗಿಕ ಬಣ್ಣ.' : 'Vibrant, pure powder.'}
                </h2>
                <p className="text-xs sm:text-sm text-stone-200 max-w-md leading-relaxed font-light">
                  {isKn
                    ? 'ಕಲ್ಲಿನಲ್ಲಿ ಬೀಸಿದ ನಂತರ ಮಸಾಲೆಯೊಳಗಿನ ನೈಸರ್ಗಿಕ ತೈಲ ಮತ್ತು ಅಪ್ಪಟ ಬಣ್ಣ ಹರಿಯುತ್ತದೆ. ಯಾವುದೇ ಕೃತಕ ಬಣ್ಣಗಳ ಅಗತ್ಯವೇ ಇಲ್ಲ.'
                    : 'Dense crimson Byadgi red and golden turmeric oils flow freely in fine particle streams, exhibiting natural vibrancy without artificial dyes.'}
                </p>
                <div className="pt-2 flex items-center justify-center md:justify-start space-x-4 text-xs font-mono text-amber-200">
                  <span>UNADULTERATED</span>
                  <span className="text-red-300">·</span>
                  <span>OIL DENSE</span>
                  <span className="text-red-300">·</span>
                  <span>PURE TEXTURE</span>
                </div>
              </div>

              <div className="md:col-span-6 flex justify-center">
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden shadow-2xl border border-amber-400/40 bg-red-950">
                  <img
                    src={spiceBlendImg}
                    alt="Cascading Spice Powder"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider">
                      FRESH STONE POWDER
                    </p>
                    <p className="text-xs font-bold text-white/90">Rich Texture & Volatile Aromas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              SCENE 6: BLENDING VORTEX (Chapter 06)
              ══════════════════════════════════════════════════════════ */}
          <div
            ref={scene6Ref}
            className="scene scene-6 absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-b from-[#2A160F] via-[#3C1E14] to-[#1E0D07] text-white"
          >
            <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-6 space-y-4 text-center md:text-left">
                <div className="inline-flex items-center space-x-2 text-xs font-mono tracking-widest text-amber-400 uppercase font-bold">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{isKn ? 'ಹಂತ ೦೬ · ಮಿಶ್ರಣ' : 'SCENE 06 · HERITAGE BLEND'}</span>
                </div>
                <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                  {isKn ? 'ಸಮತೋಲಿತ ಪಾರಂಪರಿಕ ರುಚಿ.' : 'Flavour comes together.'}
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 max-w-md leading-relaxed font-light">
                  {isKn
                    ? 'ಶತಮಾನಗಳ ಹಳೆಯ ಕರ್ನಾಟಕ ಪಾಕವಿಧಾನದ ಅಳತೆಯಲ್ಲಿ ಬೆರೆಸಿದ ಮಸಾಲೆಗಳು. ಬಿಸಿಬೇಳೆಬಾತ್, ಸಾಂಬಾರ್ ಮತ್ತು ರಸಂಗೆ ಬೇಕಾದ ನೈಜ ಸಮತೋಲನ.'
                    : 'Ground spices converge in micro-batches with roasted copra, Malnad cloves, and stone flower according to sacred regional Karnataka culinary balance.'}
                </p>
                <div className="pt-2 flex items-center justify-center md:justify-start space-x-4 text-xs font-mono text-amber-400">
                  <span>SACRED RATIOS</span>
                  <span className="text-stone-600">·</span>
                  <span>MICRO-BATCH</span>
                  <span className="text-stone-600">·</span>
                  <span>KITCHEN HERITAGE</span>
                </div>
              </div>

              <div className="md:col-span-6 flex justify-center">
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden shadow-2xl border border-[#DFC7A2]/40 bg-stone-900">
                  <img
                    src={spiceBlendImg}
                    alt="Heritage Blend"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                      HERITAGE FORMULATION
                    </p>
                    <p className="text-xs font-bold text-white/90">Harmonized Karnataka Proportions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              SCENE 7: PACKAGING & AROMA SEAL (Chapter 07)
              ══════════════════════════════════════════════════════════ */}
          <div
            ref={scene7Ref}
            className="scene scene-7 absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-8"
          >
            <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-6 space-y-4 text-center md:text-left">
                <div className="inline-flex items-center space-x-2 text-xs font-mono tracking-widest text-[#8B3214] uppercase font-bold">
                  <Package className="w-3.5 h-3.5" />
                  <span>{isKn ? 'ಹಂತ ೦೭ · ಪ್ಯಾಕಿಂಗ್' : 'SCENE 07 · PACKAGING'}</span>
                </div>
                <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1F1610] leading-tight">
                  {isKn ? 'ಸುವಾಸನೆಯ ಶಾಶ್ವತ ಲಾಕ್.' : 'Sealed at the source.'}
                </h2>
                <p className="text-xs sm:text-sm text-[#5C483B] max-w-md leading-relaxed font-normal">
                  {isKn
                    ? 'ಬೀಸಿದ ಕೆಲವೇ ಸಮಯದಲ್ಲಿ ಗಾಳಿ, ಬೆಳಕು ಮತ್ತು ತೇವಾಂಶ ತಾಗದಂತೆ ವಿಶೇಷ ಸುವಾಸನೆ-ಲಾಕ್ ಕವರ್‌ಗಳಲ್ಲಿ ಪ್ಯಾಕ್ ಮಾಡಲಾಗುತ್ತದೆ.'
                    : 'Multi-layer aroma-barrier pouches are sealed within hours of milling to lock in volatile oils and fresh aroma until you open them at home.'}
                </p>
                <div className="pt-2 flex items-center justify-center md:justify-start space-x-4 text-xs font-mono text-[#8C6D53]">
                  <span>AROMA LOCKED</span>
                  <span className="text-[#DFC7A2]">·</span>
                  <span>OXYGEN BARRIER</span>
                  <span className="text-[#DFC7A2]">·</span>
                  <span>FRESH PACKED</span>
                </div>
              </div>

              <div className="md:col-span-6 flex justify-center">
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden shadow-2xl border border-[#DFC7A2] bg-[#FAF7F2]">
                  <img
                    src={spicePackImg}
                    alt="Aroma Sealed Pack"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider">
                      SEALED FOR FRESHNESS
                    </p>
                    <p className="text-xs font-bold text-white/90">Airtight Pouch Protection</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              SCENE 8: COMMERCIAL PRODUCT REVEAL & YOUR KITCHEN (Chapter 08)
              ══════════════════════════════════════════════════════════ */}
          <div
            ref={scene8Ref}
            className="scene scene-8 absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-8"
          >
            <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-6 space-y-4 text-center md:text-left">
                <div className="inline-flex items-center space-x-2 text-xs font-mono tracking-widest text-[#8B3214] uppercase font-bold">
                  <Utensils className="w-3.5 h-3.5" />
                  <span>{isKn ? 'ಹಂತ ೦೮ · ನಿಮ್ಮ ಅಡುಗೆಗೆ' : 'SCENE 08 · TO YOUR KITCHEN'}</span>
                </div>
                <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1F1610] leading-tight">
                  {isKn ? 'ನಿಮ್ಮ ಕುಟುಂಬದ ಅಡುಗೆಗೆ ಸಿದ್ಧ.' : 'Ready for your kitchen.'}
                </h2>
                <p className="text-xs sm:text-sm text-[#5C483B] max-w-md leading-relaxed font-normal">
                  {isKn
                    ? 'ಕಲ್ಲಿನಿಂದ ನಿಮ್ಮ ಸಾಂಬಾರ್ ಪಾತ್ರೆಗೆ. ತುಪ್ಪದ ಒಗ್ಗರಣೆಯ ಸುವಾಸನೆ ನಿಮ್ಮ ಮನೆಯನ್ನು ತುಂಬುತ್ತದೆ.'
                    : 'From our granite mill to your simmering brass pot. Pure comforting aroma that delights your family at the dining table.'}
                </p>

                {/* Direct Action Link to Catalogue */}
                <div className="pt-2 flex items-center justify-center md:justify-start">
                  <button
                    type="button"
                    onClick={onExploreCatalog}
                    className="inline-flex items-center space-x-2 text-xs font-bold text-[#8B3214] hover:text-[#72270E] transition-colors cursor-pointer"
                  >
                    <span>{isKn ? 'ಎಲ್ಲಾ ಮಸಾಲೆಗಳ ಸಂಗ್ರಹ ವೀಕ್ಷಿಸಿ' : 'Explore Full Spice Collection'}</span>
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Commercial Product Card Reveal with Real Cart & Details */}
              <div className="md:col-span-6 flex justify-center">
                <div className="w-full max-w-sm bg-[#FFFDF9] border border-[#DFC7A2] p-5 sm:p-6 rounded-3xl shadow-2xl space-y-4 pointer-events-auto">
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#8B3214]">
                    <span>INDIMA CRAFT</span>
                    <span className="text-[#2B5329] bg-[#EAF2EB] px-2 py-0.5 rounded-full">IN STOCK</span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <img
                      src={(featuredProduct.images && featuredProduct.images[0]) || spicePackImg}
                      alt={featuredProduct.name_en}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl border border-[#DFC7A2] bg-[#FAF7F2] shrink-0 shadow-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-serif text-base sm:text-lg font-bold text-[#1F1610] truncate">
                        {isKn ? featuredProduct.name_kn : featuredProduct.name_en}
                      </h3>
                      <p className="text-xs text-[#5C483B] line-clamp-1 mt-0.5">
                        {isKn ? featuredProduct.description_kn : featuredProduct.description_en}
                      </p>
                      <div className="mt-1.5 flex items-center space-x-2">
                        <span className="font-mono font-bold text-base text-[#8B3214]">
                          ₹{featuredProduct.price}
                        </span>
                        <span className="text-[11px] text-[#7A6455]">({featuredProduct.weight})</span>
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart & View Details */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="flex items-center justify-center space-x-1.5 py-3 px-3 rounded-2xl bg-[#8B3214] hover:bg-[#72270E] text-white font-bold text-xs transition-all shadow-md cursor-pointer"
                    >
                      {isAddedToCart ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{isKn ? 'ಸೇರಿಸಲಾಗಿದೆ' : 'Added!'}</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>{isKn ? 'ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ' : 'Add to Cart'}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenProduct && featuredProduct) {
                          onOpenProduct(featuredProduct);
                        } else if (onExploreCatalog) {
                          onExploreCatalog();
                        }
                      }}
                      className="flex items-center justify-center space-x-1 py-3 px-3 rounded-2xl bg-[#FAF6EE] hover:bg-[#F2E8D8] text-[#1F1610] text-xs font-bold border border-[#DFC7A2] transition-colors cursor-pointer shadow-xs"
                    >
                      <span>{isKn ? 'ವಿವರಗಳು' : 'Details'}</span>
                      <ChevronRight className="w-4 h-4 text-[#8B3214]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Pinned Footer */}
        <div
          className={`relative z-30 pb-6 sm:pb-8 px-4 sm:px-8 max-w-7xl mx-auto w-full flex items-center justify-between text-xs font-mono transition-colors duration-300 ${
            isLightScene ? 'text-[#7A6455]' : 'text-stone-400'
          }`}
        >
          <span className="truncate">
            {isKn
              ? 'ಪ್ರಕೃತಿಯಿಂದ ನಿಮ್ಮ ಮನೆಯ ತಟ್ಟೆಯವರೆಗೆ · ಇಂದಿಮಾ'
              : 'Nature to Dining Table · Indima Spice Co.'}
          </span>

          <button
            type="button"
            onClick={onExploreCatalog}
            className={`flex items-center space-x-1.5 transition-colors cursor-pointer font-bold ${
              isLightScene ? 'text-[#8B3214] hover:text-[#72270E]' : 'text-amber-300 hover:text-amber-200'
            }`}
          >
            <span>{isKn ? 'ಎಲ್ಲಾ ಮಸಾಲೆಗಳ ಸಂಗ್ರಹ' : 'Full Catalogue'}</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
