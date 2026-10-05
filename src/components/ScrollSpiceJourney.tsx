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

  // The Master Cinematic Camera Rig
  const cameraRigRef = useRef<HTMLDivElement | null>(null);

  // The Travelling Hero Spice Actor (Byadgi Chilli)
  const heroChilliRef = useRef<HTMLDivElement | null>(null);

  // Scene Stages & Props
  const winnowingTrayRef = useRef<HTMLDivElement | null>(null);
  const roastingKadaiRef = useRef<HTMLDivElement | null>(null);
  const grinderStageRef = useRef<HTMLDivElement | null>(null);
  const millStoneRef = useRef<SVGSVGElement | null>(null);
  const chilliShardsRef = useRef<HTMLDivElement | null>(null);
  const powderPlumeRef = useRef<HTMLDivElement | null>(null);
  const blendingVortexRef = useRef<HTMLDivElement | null>(null);
  const pouchStageRef = useRef<HTMLDivElement | null>(null);
  const goldenSealSweepRef = useRef<HTMLDivElement | null>(null);
  const productRevealRef = useRef<HTMLDivElement | null>(null);

  // Text Chapter Overlays
  const text1Ref = useRef<HTMLDivElement | null>(null);
  const text2Ref = useRef<HTMLDivElement | null>(null);
  const text3Ref = useRef<HTMLDivElement | null>(null);
  const text4Ref = useRef<HTMLDivElement | null>(null);
  const text5Ref = useRef<HTMLDivElement | null>(null);
  const text6Ref = useRef<HTMLDivElement | null>(null);
  const text7Ref = useRef<HTMLDivElement | null>(null);
  const text8Ref = useRef<HTMLDivElement | null>(null);

  // HUD state
  const [hudProgress, setHudProgress] = useState(0);
  const [activeChapter, setActiveChapter] = useState('WHOLE SPICE');
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  // Progress ref for ambient canvas
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

  // GSAP Master Timeline: Continuous Physical World Navigation
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const pin = pinRef.current;
    if (!wrapper || !pin) return;

    const ctx = gsap.context(() => {
      // 1. Establish initial actor & prop positions
      gsap.set(cameraRigRef.current, { scale: 1, x: 0, y: 0 });
      gsap.set(heroChilliRef.current, { x: 0, y: 0, scale: 1, rotation: -12, autoAlpha: 1 });

      // Props initial states
      gsap.set(winnowingTrayRef.current, { autoAlpha: 0, y: 80, scale: 0.9 });
      gsap.set(roastingKadaiRef.current, { autoAlpha: 0, y: 80, scale: 0.9 });
      gsap.set(grinderStageRef.current, { autoAlpha: 0, scale: 0.7, y: 60 });
      gsap.set(chilliShardsRef.current, { autoAlpha: 0, scale: 0.3 });
      gsap.set(powderPlumeRef.current, { autoAlpha: 0, scale: 0.4 });
      gsap.set(blendingVortexRef.current, { autoAlpha: 0, scale: 0.7 });
      gsap.set(pouchStageRef.current, { autoAlpha: 0, scale: 0.8, y: 40 });
      gsap.set(goldenSealSweepRef.current, { scaleX: 0 });
      gsap.set(productRevealRef.current, { autoAlpha: 0, scale: 0.85, y: 30 });

      // Typography initial states
      gsap.set(text1Ref.current, { autoAlpha: 1, y: 0 });
      gsap.set(text2Ref.current, { autoAlpha: 0, y: 25 });
      gsap.set(text3Ref.current, { autoAlpha: 0, y: 25 });
      gsap.set(text4Ref.current, { autoAlpha: 0, y: 25 });
      gsap.set(text5Ref.current, { autoAlpha: 0, y: 25 });
      gsap.set(text6Ref.current, { autoAlpha: 0, y: 25 });
      gsap.set(text7Ref.current, { autoAlpha: 0, y: 25 });
      gsap.set(text8Ref.current, { autoAlpha: 0, y: 25 });

      // 2. Master Continuous Scrubbed Timeline
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

            // Directly rotate granite grinding stone
            if (millStoneRef.current) {
              gsap.set(millStoneRef.current, { rotation: p * 1080 });
            }

            // HUD chapter names
            if (p < 0.14) setActiveChapter('WHOLE SPICE');
            else if (p < 0.28) setActiveChapter('PREPARATION');
            else if (p < 0.42) setActiveChapter('GENTLE ROAST');
            else if (p < 0.56) setActiveChapter('STONE MILLING');
            else if (p < 0.70) setActiveChapter('SPICE POWDER');
            else if (p < 0.84) setActiveChapter('HERITAGE BLEND');
            else if (p < 0.94) setActiveChapter('PACKAGING');
            else setActiveChapter('YOUR KITCHEN');
          }
        }
      });

      // ═════════════════════════════════════════════════════════════════
      // TRANSITION 1 → 2: PHYSICAL MOVEMENT TO WINNOWING TRAY (p: ~0.14)
      // The hero chilli physically glides across the viewport into the bamboo tray!
      // ═════════════════════════════════════════════════════════════════
      tl.to(heroChilliRef.current, {
        x: -120,
        y: 60,
        rotation: 32,
        scale: 1.15,
        duration: 1.5,
        ease: 'power1.inOut'
      }, 0.5)
      .to(winnowingTrayRef.current, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 1.2
      }, 0.7)
      .to(cameraRigRef.current, {
        x: 40,
        y: -20,
        duration: 1.5
      }, 0.5)
      .to(text1Ref.current, { autoAlpha: 0, y: -20, duration: 0.8 }, 0.8)
      .to(text2Ref.current, { autoAlpha: 1, y: 0, duration: 0.8 }, 1.2);

      // ═════════════════════════════════════════════════════════════════
      // TRANSITION 2 → 3: TRAVEL FROM TRAY TO ROASTING KADAI (p: ~0.28)
      // The chilli lifts from the tray and travels rightward onto hot embers kadai
      // ═════════════════════════════════════════════════════════════════
      tl.to(heroChilliRef.current, {
        x: 130,
        y: 20,
        rotation: -18,
        scale: 1.1,
        duration: 1.5,
        ease: 'power1.inOut'
      }, 2.3)
      .to(winnowingTrayRef.current, {
        autoAlpha: 0,
        y: 60,
        scale: 0.85,
        duration: 1.0
      }, 2.3)
      .to(roastingKadaiRef.current, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 1.2
      }, 2.5)
      .to(cameraRigRef.current, {
        x: -50,
        y: -10,
        duration: 1.5
      }, 2.3)
      .to(text2Ref.current, { autoAlpha: 0, y: -20, duration: 0.8 }, 2.5)
      .to(text3Ref.current, { autoAlpha: 1, y: 0, duration: 0.8 }, 2.9);

      // ═════════════════════════════════════════════════════════════════
      // TRANSITION 3 → 4: TRAVEL INTO THE GRANITE MILL (p: ~0.42)
      // Chilli lifts, camera rushes forward, centering on the massive granite mill
      // ═════════════════════════════════════════════════════════════════
      tl.to(heroChilliRef.current, {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 0.75,
        duration: 1.5,
        ease: 'power1.inOut'
      }, 4.1)
      .to(roastingKadaiRef.current, {
        autoAlpha: 0,
        y: 60,
        scale: 0.85,
        duration: 1.0
      }, 4.1)
      .to(grinderStageRef.current, {
        autoAlpha: 1,
        scale: 1,
        y: 0,
        duration: 1.2
      }, 4.2)
      .to(cameraRigRef.current, {
        x: 0,
        y: -15,
        scale: 1.3,
        duration: 1.5
      }, 4.1)
      .to(text3Ref.current, { autoAlpha: 0, y: -20, duration: 0.8 }, 4.3)
      .to(text4Ref.current, { autoAlpha: 1, y: 0, duration: 0.8 }, 4.7);

      // ═════════════════════════════════════════════════════════════════
      // TRANSITION 4 → 5: REAL GRINDING TRANSFORMATION (p: ~0.56)
      // Whole chilli shatters into shards -> Shards disperse -> Powder plumes burst!
      // ═════════════════════════════════════════════════════════════════
      tl.to(heroChilliRef.current, {
        autoAlpha: 0,
        scale: 0.3,
        duration: 0.6
      }, 5.8)
      .to(chilliShardsRef.current, {
        autoAlpha: 1,
        scale: 1.4,
        duration: 0.8,
        ease: 'power2.out'
      }, 5.8)
      .to(powderPlumeRef.current, {
        autoAlpha: 1,
        scale: 1.8,
        duration: 1.2,
        ease: 'power2.out'
      }, 6.0)
      .to(chilliShardsRef.current, {
        autoAlpha: 0,
        scale: 2.2,
        duration: 0.6
      }, 6.6)
      .to(grinderStageRef.current, {
        autoAlpha: 0,
        scale: 1.4,
        duration: 0.8
      }, 6.8)
      .to(cameraRigRef.current, {
        scale: 1.1,
        y: 0,
        duration: 1.2
      }, 6.0)
      .to(text4Ref.current, { autoAlpha: 0, y: -20, duration: 0.8 }, 6.0)
      .to(text5Ref.current, { autoAlpha: 1, y: 0, duration: 0.8 }, 6.5);

      // ═════════════════════════════════════════════════════════════════
      // TRANSITION 5 → 6: POWDER CONVERGES INTO BLENDING VORTEX (p: ~0.70)
      // Multi-stream particle vortex spirals inward
      // ═════════════════════════════════════════════════════════════════
      tl.to(powderPlumeRef.current, {
        autoAlpha: 0,
        scale: 2.5,
        duration: 0.8
      }, 7.7)
      .to(blendingVortexRef.current, {
        autoAlpha: 1,
        scale: 1,
        rotation: 360,
        duration: 1.4,
        ease: 'power1.inOut'
      }, 7.7)
      .to(text5Ref.current, { autoAlpha: 0, y: -20, duration: 0.8 }, 7.7)
      .to(text6Ref.current, { autoAlpha: 1, y: 0, duration: 0.8 }, 8.2);

      // ═════════════════════════════════════════════════════════════════
      // TRANSITION 6 → 7: BLEND FUNNELS INTO PACKAGING & SEALS (p: ~0.84)
      // Blended vortex funnels into pouch, golden heat seal sweeps across top
      // ═════════════════════════════════════════════════════════════════
      tl.to(blendingVortexRef.current, {
        autoAlpha: 0,
        scale: 0.4,
        y: 60,
        duration: 0.9
      }, 9.3)
      .to(pouchStageRef.current, {
        autoAlpha: 1,
        scale: 1,
        y: 0,
        duration: 1.2
      }, 9.4)
      .to(goldenSealSweepRef.current, {
        scaleX: 1,
        duration: 0.8,
        ease: 'power2.inOut'
      }, 10.0)
      .to(text6Ref.current, { autoAlpha: 0, y: -20, duration: 0.8 }, 9.5)
      .to(text7Ref.current, { autoAlpha: 1, y: 0, duration: 0.8 }, 10.0);

      // ═════════════════════════════════════════════════════════════════
      // TRANSITION 7 → 8: COMMERCIAL PRODUCT REVEAL & TO KITCHEN (p: ~0.94)
      // Camera pulls back, pouch morphs into the actual Indima product hero
      // ═════════════════════════════════════════════════════════════════
      tl.to(pouchStageRef.current, {
        autoAlpha: 0,
        scale: 0.85,
        duration: 0.6
      }, 11.2)
      .to(productRevealRef.current, {
        autoAlpha: 1,
        scale: 1,
        y: 0,
        duration: 1.2,
        ease: 'back.out(1.2)'
      }, 11.3)
      .to(cameraRigRef.current, {
        scale: 1,
        x: 0,
        y: 0,
        duration: 1.2
      }, 11.2)
      .to(text7Ref.current, { autoAlpha: 0, y: -20, duration: 0.8 }, 11.2)
      .to(text8Ref.current, { autoAlpha: 1, y: 0, duration: 0.8 }, 11.7);

      ScrollTrigger.refresh();
    }, wrapper);

    return () => {
      ctx.revert();
    };
  }, []);

  // Ambient Golden Warm Particle Canvas
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

    const count = width < 640 ? 30 : 60;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -0.2 - Math.random() * 0.35,
      size: 1.2 + Math.random() * 2.5,
      color: ['#E5A93C', '#D49B28', '#C0392B', '#C5A059'][Math.floor(Math.random() * 4)],
      alpha: 0.15 + Math.random() * 0.4
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
      className="journey-wrapper relative w-full h-[620vh]"
    >
      {/* Light Yellowish Heritage Pinned Viewport Stage */}
      <div
        ref={pinRef}
        className="journey-pin sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between select-none bg-gradient-to-b from-[#FDF8EE] via-[#FAF3DE] to-[#F5E8D0] text-[#1F1610]"
      >
        {/* Soft Golden Sunshine Radiance Cones */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[750px] h-[550px] bg-gradient-to-b from-amber-300/20 via-orange-300/10 to-transparent blur-[140px] rounded-full pointer-events-none z-1" />
        <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-amber-400/15 blur-[120px] rounded-full pointer-events-none z-1" />

        {/* Ambient Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

        {/* Top HUD: Real-time chapter & Progress */}
        <div className="relative z-30 pt-6 sm:pt-8 px-4 sm:px-8 max-w-7xl mx-auto w-full flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2.5 font-bold tracking-widest text-[#8B3214] uppercase">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B3214] animate-ping" />
            <span>{isKn ? 'ಪವಿತ್ರ ಪಯಣ' : 'THE LIVING TRANSFORMATION'}</span>
            <span className="text-[#DFC7A2]">/</span>
            <span className="font-sans text-[#5C483B] tracking-normal font-semibold">{activeChapter}</span>
          </div>

          <div className="flex items-center space-x-3 text-[#5C483B]">
            <span className="hidden sm:inline font-sans text-[11px] tracking-widest uppercase font-bold">
              {isKn ? 'ಸ್ಕ್ರೋಲ್ ಪ್ರಗತಿ' : 'SCROLL PROGRESS'}
            </span>
            <span className="font-bold text-sm font-mono text-[#8B3214] bg-[#FAF6EE] px-2.5 py-1 rounded-full border border-[#DFC7A2] shadow-2xs">
              {hudProgress}%
            </span>
          </div>
        </div>

        {/* Right Rail: Timeline Scrubber */}
        <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center space-y-3 pointer-events-none">
          <div className="w-1.5 h-44 bg-[#DFC7A2]/50 rounded-full overflow-hidden relative">
            <div
              className="w-full bg-gradient-to-b from-[#8B3214] via-[#D49B28] to-[#8B3214] rounded-full transition-all duration-150"
              style={{ height: `${Math.max(8, hudProgress)}%` }}
            />
          </div>
          <span className="text-[10px] font-mono uppercase rotate-90 origin-center translate-y-3 font-bold text-[#8B3214]">
            TIMELINE
          </span>
        </div>

        {/* ═════════════════════════════════════════════════════════════════
            THE CONTINUOUS CINEMATIC CAMERA RIG
            Holds all physical props and moves like a movie camera operator!
            ═════════════════════════════════════════════════════════════════ */}
        <div
          ref={cameraRigRef}
          className="camera-rig absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none z-10"
        >
          {/* 1. THE TRAVELLING HERO CHILLI (The physical protagonist of the journey!) */}
          <div
            ref={heroChilliRef}
            className="hero-spice-actor absolute z-25 flex items-center justify-center filter drop-shadow-xl"
          >
            <svg viewBox="0 0 160 80" className="w-36 h-20 sm:w-52 sm:h-28">
              {/* Stem */}
              <path d="M 25 35 Q 12 30 5 18" stroke="#4A5D32" strokeWidth="4.5" fill="none" strokeLinecap="round" />
              {/* Chilli Body */}
              <path
                d="M 25 35 C 55 12, 105 8, 145 28 C 158 35, 155 42, 142 45 C 105 52, 60 55, 25 35 Z"
                fill="url(#byadgiGrad)"
              />
              {/* Natural Skin Highlights */}
              <path d="M 50 24 Q 95 18 130 32" stroke="rgba(255,220,200,0.45)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
              <defs>
                <linearGradient id="byadgiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6E1208" />
                  <stop offset="30%" stopColor="#9C1A0C" />
                  <stop offset="70%" stopColor="#CE2D18" />
                  <stop offset="100%" stopColor="#8C1307" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* 2. SCENE 2 PROP: TRADITIONAL BAMBOO WINNOWING TRAY (MORAM) */}
          <div
            ref={winnowingTrayRef}
            className="absolute z-15 flex flex-col items-center justify-center"
            style={{ transform: 'translate(-120px, 80px)' }}
          >
            <div className="w-60 h-36 sm:w-84 sm:h-48 rounded-full border-4 border-[#C5A059] bg-[#F7EAD0]/90 shadow-2xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:12px_12px] opacity-40" />
              {/* Floating coriander & clean seeds inside tray */}
              <div className="flex space-x-3 z-10 opacity-70">
                <div className="w-3.5 h-3.5 rounded-full bg-[#C6A15E] shadow-xs" />
                <div className="w-3 h-3 rounded-full bg-[#D49B28] shadow-xs" />
                <div className="w-4 h-4 rounded-full bg-[#C6A15E] shadow-xs" />
              </div>
            </div>
            <p className="text-[10px] font-mono font-bold text-[#8B3214] mt-2 bg-[#FFFDF9]/90 px-3 py-0.5 rounded-full border border-[#DFC7A2]">
              TRADITIONAL BAMBOO MORAM
            </p>
          </div>

          {/* 3. SCENE 3 PROP: ROASTING CAST-IRON KADAI WITH GLOWING EMBERS */}
          <div
            ref={roastingKadaiRef}
            className="absolute z-15 flex flex-col items-center justify-center"
            style={{ transform: 'translate(130px, 40px)' }}
          >
            <div className="w-64 h-32 sm:w-88 sm:h-44 rounded-full bg-gradient-to-b from-[#2E1E17] to-[#150D0A] border-4 border-[#5E3828] shadow-2xl flex items-center justify-center relative overflow-hidden">
              {/* Glowing Warm Embers in Kadai */}
              <div className="absolute inset-0 bg-radial-[circle_at_center,rgba(240,110,20,0.6)_0%,transparent_70%]" />
              {/* Rising Heat Waves */}
              <div className="flex space-x-6 z-10 animate-pulse text-amber-300">
                <Sun className="w-5 h-5 text-amber-400" />
                <Flame className="w-6 h-6 text-orange-400" />
              </div>
            </div>
            <p className="text-[10px] font-mono font-bold text-[#8B3214] mt-2 bg-[#FFFDF9]/90 px-3 py-0.5 rounded-full border border-[#DFC7A2]">
              SLOW EMBER ROASTING
            </p>
          </div>

          {/* 4. SCENE 4 PROP: THE GRANITE CHAKKI STONE MILL (THE WOW MOMENT) */}
          <div
            ref={grinderStageRef}
            className="grinder-stage absolute z-20 flex flex-col items-center justify-center"
          >
            <div className="relative w-64 h-64 sm:w-88 sm:h-88 rounded-full flex items-center justify-center bg-[#2B2623] border-8 border-[#524B46] shadow-2xl">
              {/* Lower Stationary Stone Texture */}
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(#48423D_2px,transparent_2px)] [background-size:14px_14px] opacity-50" />

              {/* Upper Rotating Granite Stone (Rotates with scroll progress!) */}
              <svg
                ref={millStoneRef}
                viewBox="0 0 200 200"
                className="w-56 h-56 sm:w-76 sm:h-76 relative z-10 filter drop-shadow-2xl"
              >
                <circle cx="100" cy="100" r="92" fill="#3A3430" stroke="#706862" strokeWidth="5" />
                {/* Chiseled Grooves on Granite */}
                <circle cx="100" cy="100" r="74" fill="none" stroke="#25211E" strokeWidth="3" strokeDasharray="8 10" />
                <circle cx="100" cy="100" r="54" fill="none" stroke="#5C534D" strokeWidth="2.5" strokeDasharray="5 7" />
                {/* Center Aperture where Whole Spice Enters */}
                <circle cx="100" cy="100" r="26" fill="#141110" stroke="#8C8178" strokeWidth="3" />
                {/* Wooden Turning Peg */}
                <circle cx="158" cy="100" r="15" fill="#A06E42" stroke="#D29A68" strokeWidth="3" />
              </svg>
            </div>
            <p className="text-[11px] font-mono font-bold text-[#8B3214] mt-3 bg-[#FFFDF9]/95 px-4 py-1 rounded-full border border-[#DFC7A2] shadow-sm">
              NATURAL GRANITE STONE MILL
            </p>
          </div>

          {/* 5. SCENE 4->5 TRANSFORMATION: CHILLI SHATTERS INTO FRACTURED SHARDS */}
          <div
            ref={chilliShardsRef}
            className="absolute z-26 flex items-center justify-center pointer-events-none"
          >
            <div className="relative w-40 h-40">
              {/* Radial Shatter Shards */}
              <div className="absolute top-2 left-6 w-8 h-4 bg-[#A81F0F] rounded-sm rotate-45 shadow-md" />
              <div className="absolute top-12 right-4 w-7 h-4 bg-[#C52B19] rounded-sm -rotate-30 shadow-md" />
              <div className="absolute bottom-6 left-8 w-9 h-3 bg-[#8C1307] rounded-sm rotate-12 shadow-md" />
              <div className="absolute bottom-10 right-8 w-6 h-5 bg-[#E03C22] rounded-sm -rotate-60 shadow-md" />
              <div className="absolute top-8 right-12 w-4 h-4 rounded-full bg-[#E5A93C] shadow-md" />
            </div>
          </div>

          {/* 6. SCENE 5 PROP: EXPANDING POWDER PLUME CLOUD */}
          <div
            ref={powderPlumeRef}
            className="absolute z-22 flex items-center justify-center pointer-events-none"
          >
            <div className="w-80 h-80 sm:w-[500px] sm:h-[500px] rounded-full bg-radial-[circle_at_center,rgba(206,45,24,0.7)_0%,rgba(229,169,60,0.5)_45%,transparent_75%] blur-xl" />
          </div>

          {/* 7. SCENE 6 PROP: THE BLENDING VORTEX (FOUR CONVERGING SPICE STREAMS) */}
          <div
            ref={blendingVortexRef}
            className="absolute z-22 flex items-center justify-center pointer-events-none"
          >
            <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-full flex items-center justify-center">
              {/* Converging Swirl Spiral SVG */}
              <svg viewBox="0 0 200 200" className="w-full h-full animate-spin [animation-duration:12s]">
                <circle cx="100" cy="100" r="85" fill="none" stroke="#C0392B" strokeWidth="8" strokeDasharray="40 25" opacity="0.85" />
                <circle cx="100" cy="100" r="65" fill="none" stroke="#E5A93C" strokeWidth="8" strokeDasharray="30 20" opacity="0.85" />
                <circle cx="100" cy="100" r="45" fill="none" stroke="#996633" strokeWidth="8" strokeDasharray="25 15" opacity="0.85" />
                <circle cx="100" cy="100" r="25" fill="none" stroke="#2E6930" strokeWidth="7" strokeDasharray="15 10" opacity="0.85" />
              </svg>
              <div className="absolute w-20 h-20 rounded-full bg-gradient-to-r from-[#C0392B] via-[#E5A93C] to-[#996633] blur-md opacity-80" />
            </div>
          </div>

          {/* 8. SCENE 7 PROP: POUCH FORMING & AIRTIGHT SEAL SWEEP */}
          <div
            ref={pouchStageRef}
            className="absolute z-23 flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="relative w-56 h-72 sm:w-68 sm:h-88 rounded-3xl bg-gradient-to-b from-[#8B170B] via-[#A82512] to-[#6F0F05] border-4 border-[#C5A059] shadow-2xl p-5 flex flex-col justify-between overflow-hidden">
              {/* Shimmering Golden Heat Seal Sweep Bar */}
              <div
                ref={goldenSealSweepRef}
                className="w-full h-3 bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-300 rounded-full shadow-lg shadow-amber-400 origin-left"
              />
              {/* Brand Stamp on Pouch */}
              <div className="text-center text-white space-y-1 my-auto">
                <p className="text-[10px] font-mono tracking-widest text-amber-300 font-bold uppercase">INDIMA CRAFT</p>
                <h4 className="font-serif text-lg font-bold">PURE HERITAGE MASALA</h4>
                <p className="text-[11px] text-amber-100/80">Aroma Sealed at Origin</p>
              </div>
              <div className="text-center">
                <span className="text-[10px] font-mono bg-white/20 text-white px-2.5 py-0.5 rounded-full border border-white/30">
                  AROMA PROTECTED
                </span>
              </div>
            </div>
          </div>

          {/* 9. SCENE 8 PROP: ACTUAL INDIMA COMMERCIAL PRODUCT REVEAL */}
          <div
            ref={productRevealRef}
            className="absolute z-30 flex items-center justify-center pointer-events-auto"
          >
            <div className="w-full max-w-sm bg-[#FFFDF9] border-2 border-[#DFC7A2] p-6 sm:p-7 rounded-3xl shadow-2xl space-y-4">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#8B3214]">
                <span>INDIMA HERITAGE</span>
                <span className="text-[#2B5329] bg-[#EAF2EB] px-2.5 py-0.5 rounded-full border border-[#CDE0D0]">
                  FRESH PACKED
                </span>
              </div>

              <div className="flex items-center space-x-4">
                <img
                  src={(featuredProduct.images && featuredProduct.images[0]) || spicePackImg}
                  alt={featuredProduct.name_en}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl border border-[#DFC7A2] bg-[#FAF7F2] shrink-0 shadow-md"
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

              <div className="grid grid-cols-2 gap-3 pt-1">
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

        {/* ═════════════════════════════════════════════════════════════════
            PERMANENT TYPOGRAPHIC CHAPTER NARRATIVE
            Smoothly transitioned in lockstep with the physical camera
            ═════════════════════════════════════════════════════════════════ */}
        <div className="relative z-25 max-w-3xl mx-auto px-4 sm:px-8 text-center my-auto pointer-events-none">
          {/* Chapter 1 */}
          <div ref={text1Ref} className="space-y-3">
            <p className="text-xs sm:text-sm font-mono tracking-[0.28em] text-[#8B3214] uppercase font-bold">
              {isKn ? 'ಹಂತ ೦೧ · ಕಾಳು ಮಸಾಲೆ' : 'SCENE 01 · WHOLE SPICE'}
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1F1610] leading-tight">
              {isKn ? 'ಕಾಳು ಮಸಾಲೆಗಳ ಪವಿತ್ರ ಮೂಲ.' : 'It starts with the whole spice.'}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C483B] max-w-md mx-auto font-normal">
              {isKn
                ? 'ಬ್ಯಾಡಗಿ ಮೆಣಸಿನಕಾಯಿ, ಸುವಾಸನಾಭರಿತ ಧನಿಯಾ ಮತ್ತು ಅರಿಶಿನ ಕೊಂಬುಗಳು.'
                : 'Whole Byadgi chillies, coriander seeds, and Salem turmeric roots.'}
            </p>
          </div>

          {/* Chapter 2 */}
          <div ref={text2Ref} className="space-y-3">
            <p className="text-xs sm:text-sm font-mono tracking-[0.28em] text-[#8B3214] uppercase font-bold">
              {isKn ? 'ಹಂತ ೦೨ · ಪರಿಶುದ್ಧತೆ' : 'SCENE 02 · PREPARATION'}
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1F1610] leading-tight">
              {isKn ? 'ಕೈಯಿಂದ ಆರಿಸುವ ತಾಳ್ಮೆ.' : 'Prepared with patience.'}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C483B] max-w-md mx-auto font-normal">
              {isKn
                ? 'ಸಾಂಪ್ರದಾಯಿಕ ಮೊರದಲ್ಲಿ ಕೇರಿ ತೊಟ್ಟು ಮತ್ತು ಧೂಳನ್ನು ಬೇರ್ಪಡಿಸುವುದು.'
                : 'Winnowed and de-stemmed by hand in traditional bamboo trays.'}
            </p>
          </div>

          {/* Chapter 3 */}
          <div ref={text3Ref} className="space-y-3">
            <p className="text-xs sm:text-sm font-mono tracking-[0.28em] text-[#8B3214] uppercase font-bold">
              {isKn ? 'ಹಂತ ೦೩ · ಮಂದ ಉರಿ' : 'SCENE 03 · GENTLE ROAST'}
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1F1610] leading-tight">
              {isKn ? 'ಹದವಾದ ಮಂದ ಉರಿ.' : 'Gently warmed over embers.'}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C483B] max-w-md mx-auto font-normal">
              {isKn
                ? 'ಕಬ್ಬಿಣದ ಬಾಣಲೆಯಲ್ಲಿ ಹದವಾಗಿ ಹುರಿದು ಸುಗಂಧ ತೈಲಗಳನ್ನು ಎಚ್ಚರಗೊಳಿಸುವುದು.'
                : 'Slow dry-toasting releases fragrant volatile oils without scorching.'}
            </p>
          </div>

          {/* Chapter 4 */}
          <div ref={text4Ref} className="space-y-3">
            <p className="text-xs sm:text-sm font-mono tracking-[0.28em] text-[#8B3214] uppercase font-bold">
              {isKn ? 'ಹಂತ ೦೪ · ಕಲ್ಲಿನ ಬೀಸುವಿಕೆ' : 'SCENE 04 · STONE MILLING'}
            </p>
            <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#8B3214] leading-tight">
              {isKn ? 'ಕಾಳು → ಅಪ್ಪಟ ಪುಡಿ' : 'WHOLE → GROUND'}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C483B] max-w-md mx-auto font-normal">
              {isKn
                ? 'ನೈಸರ್ಗಿಕ ಗ್ರಾನೈಟ್ ಕಲ್ಲಿನಲ್ಲಿ ನಿಧಾನವಾಗಿ ಬೀಸಿದ ಪರಿಮಳ.'
                : 'Granite stones rotate with your scroll, crushing whole spices into aromatic micro-particles.'}
            </p>
          </div>

          {/* Chapter 5 */}
          <div ref={text5Ref} className="space-y-3">
            <p className="text-xs sm:text-sm font-mono tracking-[0.28em] text-[#8B3214] uppercase font-bold">
              {isKn ? 'ಹಂತ ೦೫ · ಪರಿಶುದ್ಧ ಪುಡಿ' : 'SCENE 05 · SPICE POWDER'}
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1F1610] leading-tight">
              {isKn ? 'ದಟ್ಟವಾದ ನೈಸರ್ಗಿಕ ಬಣ್ಣ.' : 'Vibrant, pure powder.'}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C483B] max-w-md mx-auto font-normal">
              {isKn
                ? 'ಕಲ್ಲಿನಲ್ಲಿ ಉಳಿದ ನೈಸರ್ಗಿಕ ತೈಲಾಂಶ ಮತ್ತು ಕಣ್ಣು ಕೋರೈಸುವ ಕೆಂಪು-ಚಿನ್ನದ ಬಣ್ಣ.'
                : 'Dense natural color and oil texture cascading in air currents.'}
            </p>
          </div>

          {/* Chapter 6 */}
          <div ref={text6Ref} className="space-y-3">
            <p className="text-xs sm:text-sm font-mono tracking-[0.28em] text-[#8B3214] uppercase font-bold">
              {isKn ? 'ಹಂತ ೦೬ · ಮಿಶ್ರಣ' : 'SCENE 06 · HERITAGE BLEND'}
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1F1610] leading-tight">
              {isKn ? 'ಸಮತೋಲಿತ ಪಾರಂಪರಿಕ ರುಚಿ.' : 'Flavour comes together.'}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C483B] max-w-md mx-auto font-normal">
              {isKn
                ? 'ಶತಮಾನಗಳ ಹಳೆಯ ಕರ್ನಾಟಕ ಪಾಕವಿಧಾನದ ಅಳತೆಯಲ್ಲಿ ಬೆರೆಸಿದ ಮಸಾಲೆಗಳು.'
                : 'Multiple single-origin spice streams converge into a balanced blend.'}
            </p>
          </div>

          {/* Chapter 7 */}
          <div ref={text7Ref} className="space-y-3">
            <p className="text-xs sm:text-sm font-mono tracking-[0.28em] text-[#8B3214] uppercase font-bold">
              {isKn ? 'ಹಂತ ೦೭ · ಪ್ಯಾಕಿಂಗ್' : 'SCENE 07 · PACKAGING'}
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1F1610] leading-tight">
              {isKn ? 'ಸುವಾಸನೆಯ ಶಾಶ್ವತ ಲಾಕ್.' : 'Sealed at the source.'}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C483B] max-w-md mx-auto font-normal">
              {isKn
                ? 'ಬೀಸಿದ ಕೆಲವೇ ಸಮಯದಲ್ಲಿ ಗಾಳಿ ತಾಗದಂತೆ ಪ್ಯಾಕ್ ಮಾಡಿ ಸುವಾಸನೆ ಲಾಕ್ ಮಾಡುವುದು.'
                : 'Aroma-barrier airtight sealing preserves delicate volatile oils.'}
            </p>
          </div>

          {/* Chapter 8 */}
          <div ref={text8Ref} className="space-y-3">
            <p className="text-xs sm:text-sm font-mono tracking-[0.28em] text-[#8B3214] uppercase font-bold">
              {isKn ? 'ಹಂತ ೦೮ · ನಿಮ್ಮ ಅಡುಗೆಗೆ' : 'SCENE 08 · TO YOUR KITCHEN'}
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1F1610] leading-tight">
              {isKn ? 'ನಿಮ್ಮ ಕುಟುಂಬದ ಅಡುಗೆಗೆ ಸಿದ್ಧ.' : 'Ready for your kitchen.'}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C483B] max-w-md mx-auto font-normal">
              {isKn
                ? 'ಕಲ್ಲಿನಿಂದ ನಿಮ್ಮ ಸಾಂಬಾರ್ ಪಾತ್ರೆಗೆ. ಮನೆಯಿಡೀ ಹರಡುವ ಘಮಲು.'
                : 'From our granite mill to your simmering brass pot.'}
            </p>
          </div>
        </div>

        {/* Bottom Pinned Footer */}
        <div className="relative z-30 pb-6 sm:pb-8 px-4 sm:px-8 max-w-7xl mx-auto w-full flex items-center justify-between text-xs font-mono text-[#7A6455]">
          <span className="truncate">
            {isKn
              ? 'ಪ್ರಕೃತಿಯಿಂದ ನಿಮ್ಮ ಮನೆಯ ತಟ್ಟೆಯವರೆಗೆ · ಇಂದಿಮಾ'
              : 'Nature to Dining Table · Indima Spice Co.'}
          </span>

          <button
            type="button"
            onClick={onExploreCatalog}
            className="flex items-center space-x-1.5 transition-colors cursor-pointer font-bold text-[#8B3214] hover:text-[#72270E]"
          >
            <span>{isKn ? 'ಎಲ್ಲಾ ಮಸಾಲೆಗಳ ಸಂಗ್ರಹ' : 'Full Catalogue'}</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
