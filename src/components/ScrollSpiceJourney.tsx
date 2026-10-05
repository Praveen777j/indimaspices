import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ShoppingBag, ArrowDown, Sparkles, Check, ChevronRight } from 'lucide-react';
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

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeChapter, setActiveChapter] = useState('WHOLE SPICE');
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  // Pick a featured product for the final reveal (e.g. Sambar Powder, Rasam Powder, or first product)
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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: 'bottom bottom',
      scrub: prefersReducedMotion ? 0.2 : 0.6,
      onUpdate: self => {
        const p = self.progress;
        setScrollProgress(p);

        if (p < 0.15) setActiveChapter('WHOLE SPICE');
        else if (p < 0.3) setActiveChapter('PREPARATION');
        else if (p < 0.44) setActiveChapter('GENTLE ROAST');
        else if (p < 0.58) setActiveChapter('STONE MILLING');
        else if (p < 0.72) setActiveChapter('SPICE POWDER');
        else if (p < 0.85) setActiveChapter('HERITAGE BLEND');
        else if (p < 0.94) setActiveChapter('AROMA PACKAGING');
        else setActiveChapter('YOUR KITCHEN');
      }
    });

    return () => {
      trigger.kill();
    };
  }, []);

  // HTML5 High-Performance Canvas Rendering Engine for continuous morphing
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

    // Dynamic Spice Powder Particles Field
    const particlePool = Array.from({ length: 180 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      baseX: Math.random() * width,
      baseY: Math.random() * height,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      size: 1.2 + Math.random() * 2.8,
      color: ['#D49B28', '#C0392B', '#8B3214', '#264E36', '#E28330'][Math.floor(Math.random() * 5)],
      orbitAngle: Math.random() * Math.PI * 2,
      orbitRadius: 40 + Math.random() * 220,
      orbitSpeed: 0.01 + Math.random() * 0.02
    }));

    // Rendering Loop scrubbed continuously by scrollProgress
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const p = scrollProgress; // 0.0 to 1.0

      // Dynamic cinematic camera center & zoom
      const centerX = width / 2;
      const centerY = height / 2;

      // ==========================================
      // STAGE A: WHOLE SPICE (0.0 to 0.15)
      // ==========================================
      if (p <= 0.2) {
        const stageAlpha = p < 0.15 ? 1 : Math.max(0, 1 - (p - 0.15) / 0.05);
        ctx.save();
        ctx.globalAlpha = stageAlpha;

        // Camera zooms in as user scrolls 0 -> 0.15
        const zoom = 1 + p * 2.5;
        ctx.translate(centerX, centerY);
        ctx.scale(zoom, zoom);

        // 1. Surrounding Whole Spices (Coriander, Turmeric, Cumin, Pepper)
        // Coriander seeds orbiting
        [-120, -70, 80, 130].forEach((ox, i) => {
          const oy = Math.sin(p * 5 + i) * 30 + (i % 2 === 0 ? -60 : 70);
          ctx.beginPath();
          ctx.arc(ox * (1 - p * 0.5), oy * (1 - p * 0.5), 9, 0, Math.PI * 2);
          ctx.fillStyle = '#C6A15E';
          ctx.shadowColor = 'rgba(0,0,0,0.4)';
          ctx.shadowBlur = 10;
          ctx.fill();
        });

        // Golden Turmeric root fragment
        ctx.save();
        ctx.translate(140 * (1 - p * 0.6), -80 * (1 - p * 0.4));
        ctx.rotate(0.3 + p);
        ctx.beginPath();
        ctx.ellipse(0, 0, 24, 10, 0.4, 0, Math.PI * 2);
        ctx.fillStyle = '#D49B28';
        ctx.fill();
        ctx.restore();

        // 2. The Hero Byadgi Dried Red Chilli
        // Chilli tilts and approaches camera
        ctx.save();
        ctx.rotate(-0.2 + p * 0.8);
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 15;

        // Curved Chilli Body
        ctx.beginPath();
        ctx.moveTo(-60, 18);
        ctx.bezierCurveTo(-25, -20, 25, -30, 75, -10);
        ctx.bezierCurveTo(90, -4, 94, 6, 78, 12);
        ctx.bezierCurveTo(40, 26, -12, 32, -60, 18);
        ctx.closePath();

        const chilliGrad = ctx.createLinearGradient(-60, -20, 85, 20);
        chilliGrad.addColorStop(0, '#5C0F06');
        chilliGrad.addColorStop(0.3, '#941B0C');
        chilliGrad.addColorStop(0.7, '#C52B19');
        chilliGrad.addColorStop(1, '#6F1207');
        ctx.fillStyle = chilliGrad;
        ctx.fill();

        // Highlight
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(-20, -8);
        ctx.quadraticCurveTo(20, -16, 55, -4);
        ctx.strokeStyle = 'rgba(255, 210, 190, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Stalk
        ctx.beginPath();
        ctx.moveTo(-60, 18);
        ctx.quadraticCurveTo(-78, 25, -88, 38);
        ctx.strokeStyle = '#3E5028';
        ctx.lineWidth = 3.8;
        ctx.stroke();

        ctx.restore();
        ctx.restore();
      }

      // ==========================================
      // STAGE B: PREPARATION & WINNOWING (0.15 to 0.32)
      // ==========================================
      if (p >= 0.13 && p <= 0.35) {
        const stageProgress = Math.max(0, Math.min(1, (p - 0.15) / 0.15));
        const stageAlpha =
          p < 0.15
            ? (p - 0.13) / 0.02
            : p > 0.3
            ? Math.max(0, 1 - (p - 0.3) / 0.05)
            : 1;

        ctx.save();
        ctx.globalAlpha = stageAlpha;

        // Traditional woven bamboo winnowing tray perspective in center
        ctx.save();
        ctx.translate(centerX, centerY + 20);
        ctx.scale(1, 0.45);
        ctx.beginPath();
        ctx.arc(0, 0, Math.min(width * 0.42, 280), 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(197, 160, 89, 0.08)';
        ctx.strokeStyle = 'rgba(197, 160, 89, 0.35)';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fill();
        ctx.restore();

        // Hero chilli physically traveling across and settling in center
        const chilliX = centerX - 120 + stageProgress * 120;
        const chilliY = centerY - 60 + stageProgress * 60;
        ctx.save();
        ctx.translate(chilliX, chilliY);
        ctx.rotate(stageProgress * 0.4);
        ctx.scale(1.3, 1.3);

        ctx.beginPath();
        ctx.moveTo(-45, 14);
        ctx.bezierCurveTo(-18, -15, 18, -22, 55, -7);
        ctx.bezierCurveTo(65, -3, 68, 5, 56, 9);
        ctx.bezierCurveTo(28, 20, -10, 24, -45, 14);
        ctx.closePath();
        ctx.fillStyle = '#B02514';
        ctx.fill();
        ctx.restore();

        // Particles of dust & hollow chaff separating outward
        for (let i = 0; i < 28; i++) {
          const separation = stageProgress * 260;
          const angle = (i / 28) * Math.PI * 2;
          const px = centerX + Math.cos(angle) * (60 + separation);
          const py = centerY + Math.sin(angle) * (30 + separation * 0.5);
          ctx.beginPath();
          ctx.arc(px, py, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(180, 150, 120, ' + (1 - stageProgress * 0.8) + ')';
          ctx.fill();
        }

        ctx.restore();
      }

      // ==========================================
      // STAGE C: GENTLE CURING & ROASTING (0.30 to 0.46)
      // ==========================================
      if (p >= 0.28 && p <= 0.48) {
        const stageProgress = Math.max(0, Math.min(1, (p - 0.3) / 0.14));
        const stageAlpha =
          p < 0.3
            ? (p - 0.28) / 0.02
            : p > 0.44
            ? Math.max(0, 1 - (p - 0.44) / 0.04)
            : 1;

        ctx.save();
        ctx.globalAlpha = stageAlpha;

        // Seasoned cast-iron kadai glowing with low wood-ember heat
        const kadaiGrad = ctx.createRadialGradient(
          centerX,
          centerY + 30,
          10,
          centerX,
          centerY + 30,
          180
        );
        kadaiGrad.addColorStop(0, 'rgba(230, 100, 20, 0.35)');
        kadaiGrad.addColorStop(0.5, 'rgba(180, 50, 10, 0.15)');
        kadaiGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = kadaiGrad;
        ctx.fillRect(0, 0, width, height);

        // Whole chilli & spices warming up, releasing golden aroma vapor spirals
        for (let s = 0; s < 12; s++) {
          const vaporY = centerY + 10 - stageProgress * 150 - s * 12;
          const vaporX = centerX + Math.sin(stageProgress * 8 + s) * 35;
          ctx.beginPath();
          ctx.arc(vaporX, vaporY, 2 + s * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(212, 155, 40, ' + Math.max(0, 0.6 - stageProgress * 0.5) + ')';
          ctx.fill();
        }

        ctx.restore();
      }

      // ==========================================
      // STAGE D: THE GRANITE STONE MILL (0.44 to 0.60) — WOW MOMENT!
      // ==========================================
      if (p >= 0.42 && p <= 0.62) {
        const millProgress = Math.max(0, Math.min(1, (p - 0.44) / 0.14));
        const stageAlpha =
          p < 0.44
            ? (p - 0.42) / 0.02
            : p > 0.58
            ? Math.max(0, 1 - (p - 0.58) / 0.04)
            : 1;

        ctx.save();
        ctx.globalAlpha = stageAlpha;

        // Granite Chakki / Stone Base (textured circular stone)
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.beginPath();
        ctx.arc(0, 0, Math.min(width * 0.35, 220), 0, Math.PI * 2);
        const stoneGrad = ctx.createRadialGradient(0, 0, 20, 0, 0, 220);
        stoneGrad.addColorStop(0, '#363230');
        stoneGrad.addColorStop(0.7, '#24201E');
        stoneGrad.addColorStop(1, '#151312');
        ctx.fillStyle = stoneGrad;
        ctx.shadowColor = 'rgba(0,0,0,0.85)';
        ctx.shadowBlur = 40;
        ctx.fill();

        // Upper Rotating Granite Mill Stone — rotates dynamically with scroll!
        const rotAngle = millProgress * Math.PI * 4;
        ctx.rotate(rotAngle);

        ctx.beginPath();
        ctx.arc(0, 0, Math.min(width * 0.24, 150), 0, Math.PI * 2);
        ctx.fillStyle = '#484442';
        ctx.strokeStyle = '#625D59';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.fill();

        // Wooden handle pivot on the mill stone
        ctx.beginPath();
        ctx.arc(Math.min(width * 0.16, 95), 0, 14, 0, Math.PI * 2);
        ctx.fillStyle = '#A06E42';
        ctx.fill();

        // Central feed aperture where whole chilli enters
        ctx.beginPath();
        ctx.arc(0, 0, 26, 0, Math.PI * 2);
        ctx.fillStyle = '#110F0E';
        ctx.fill();

        ctx.restore();

        // Whole chilli fracturing and shattering into bursts of fine powder
        const burstCount = 90;
        for (let b = 0; b < burstCount; b++) {
          const burstDist = millProgress * (80 + (b % 15) * 12);
          const bAngle = (b / burstCount) * Math.PI * 2 + rotAngle;
          const bx = centerX + Math.cos(bAngle) * burstDist;
          const by = centerY + Math.sin(bAngle) * burstDist;
          ctx.beginPath();
          ctx.arc(bx, by, 1.8 + Math.random() * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = b % 3 === 0 ? '#C0392B' : b % 3 === 1 ? '#D49B28' : '#8B3214';
          ctx.fill();
        }

        ctx.restore();
      }

      // ==========================================
      // STAGE E: SPICE POWDER DYNAMICS (0.58 to 0.74)
      // ==========================================
      if (p >= 0.56 && p <= 0.76) {
        const powderProgress = Math.max(0, Math.min(1, (p - 0.58) / 0.14));
        const stageAlpha =
          p < 0.58
            ? (p - 0.56) / 0.02
            : p > 0.72
            ? Math.max(0, 1 - (p - 0.72) / 0.04)
            : 1;

        ctx.save();
        ctx.globalAlpha = stageAlpha;

        // Rich cascading powder streams flowing outward and forming mounds
        particlePool.slice(0, 120).forEach((pt, idx) => {
          const flowY = centerY - 140 + ((pt.baseY + powderProgress * height * 1.2) % (height * 0.8));
          const flowX =
            centerX +
            Math.sin(flowY * 0.015 + idx) * (60 + powderProgress * 140) +
            pt.vx * 20;

          ctx.beginPath();
          ctx.arc(flowX, flowY, pt.size * (1 + powderProgress * 0.8), 0, Math.PI * 2);
          ctx.fillStyle = idx % 2 === 0 ? '#C0392B' : '#D49B28';
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = 6;
          ctx.fill();
        });

        ctx.restore();
      }

      // ==========================================
      // STAGE F: BLENDING VORTEX (0.72 to 0.87)
      // ==========================================
      if (p >= 0.7 && p <= 0.89) {
        const blendProgress = Math.max(0, Math.min(1, (p - 0.72) / 0.13));
        const stageAlpha =
          p < 0.72
            ? (p - 0.7) / 0.02
            : p > 0.85
            ? Math.max(0, 1 - (p - 0.85) / 0.04)
            : 1;

        ctx.save();
        ctx.globalAlpha = stageAlpha;

        // Swirling Golden-Red Spiral Vortex of converged spices
        particlePool.forEach((pt, i) => {
          pt.orbitAngle += pt.orbitSpeed * 3;
          const currentRadius = pt.orbitRadius * (1 - blendProgress * 0.75);
          const px = centerX + Math.cos(pt.orbitAngle) * currentRadius;
          const py = centerY + Math.sin(pt.orbitAngle) * (currentRadius * 0.7);

          ctx.beginPath();
          ctx.arc(px, py, pt.size * 1.2, 0, Math.PI * 2);
          ctx.fillStyle = pt.color;
          ctx.shadowColor = pt.color;
          ctx.shadowBlur = 8;
          ctx.fill();
        });

        ctx.restore();
      }

      // ==========================================
      // STAGE G: PACKAGING SEAL (0.85 to 0.95)
      // ==========================================
      if (p >= 0.83 && p <= 0.96) {
        const packProgress = Math.max(0, Math.min(1, (p - 0.85) / 0.09));
        const stageAlpha =
          p < 0.85
            ? (p - 0.83) / 0.02
            : p > 0.94
            ? Math.max(0, 1 - (p - 0.94) / 0.02)
            : 1;

        ctx.save();
        ctx.globalAlpha = stageAlpha;

        // Pouch outline forming in 3D
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((1 - packProgress) * 0.2);

        // Pouch Silhouette
        const pw = Math.min(width * 0.5, 240);
        const ph = Math.min(height * 0.5, 320);

        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 35;
        ctx.beginPath();
        ctx.roundRect(-pw / 2, -ph / 2, pw, ph, 18);
        const pouchGrad = ctx.createLinearGradient(-pw / 2, -ph / 2, pw / 2, ph / 2);
        pouchGrad.addColorStop(0, '#2C1D18');
        pouchGrad.addColorStop(0.5, '#45281F');
        pouchGrad.addColorStop(1, '#1A120F');
        ctx.fillStyle = pouchGrad;
        ctx.fill();

        // Metallic golden light sweep across the seal top
        const sweepY = -ph / 2 + packProgress * ph;
        ctx.strokeStyle = '#D49B28';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-pw / 2 + 10, sweepY);
        ctx.lineTo(pw / 2 - 10, sweepY);
        ctx.shadowColor = '#D49B28';
        ctx.shadowBlur = 15;
        ctx.stroke();

        ctx.restore();
        ctx.restore();
      }

      // Subtle persistent ambient floating dust
      ctx.globalAlpha = 0.35;
      particlePool.slice(0, 20).forEach(pt => {
        pt.baseY -= 0.3;
        if (pt.baseY < 0) pt.baseY = height;
        ctx.beginPath();
        ctx.arc(pt.baseX, pt.baseY, pt.size * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = '#D49B28';
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [scrollProgress]);

  const handleAddToCart = () => {
    if (!featuredProduct) return;
    addItem(featuredProduct, 1);
    setIsAddedToCart(true);
    setTimeout(() => setIsAddedToCart(false), 2400);
  };

  return (
    <section
      id="scroll-journey-section"
      ref={containerRef}
      className="relative w-full bg-[#100B08] text-[#FFF9F2] h-[550vh]"
    >
      {/* Pinned Viewport Stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
        {/* Dynamic Canvas Transformation Engine */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_20%,rgba(16,11,8,0.85)_100%] pointer-events-none z-1" />

        {/* Top Floating HUD: Chapter Name & Progress Bar */}
        <div className="relative z-10 pt-6 sm:pt-8 px-4 sm:px-8 max-w-7xl mx-auto w-full flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2 text-[#D49B28]">
            <span className="w-2 h-2 rounded-full bg-[#D49B28] animate-ping" />
            <span className="font-bold tracking-widest uppercase">
              {isKn ? 'ಪವಿತ್ರ ಪಯಣ' : 'THE TRANSFORMATION'}
            </span>
            <span className="text-stone-600">/</span>
            <span className="text-stone-300 font-sans tracking-normal">{activeChapter}</span>
          </div>

          {/* Scrubbed Percentage Indicator */}
          <div className="flex items-center space-x-3 text-stone-400">
            <span className="hidden sm:inline font-sans text-[11px] tracking-widest uppercase">
              {isKn ? 'ಸ್ಕ್ರೋಲ್ ಪ್ರಗತಿ' : 'SCROLL PROGRESS'}
            </span>
            <span className="text-[#D49B28] font-bold text-sm font-mono">
              {Math.round(scrollProgress * 100)}%
            </span>
          </div>
        </div>

        {/* Right Rail: Interactive Scrubbing Track Timeline */}
        <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center space-y-3 pointer-events-none">
          <div className="w-1 h-36 bg-stone-800 rounded-full overflow-hidden relative">
            <div
              className="w-full bg-gradient-to-b from-[#D49B28] via-[#C0392B] to-[#D49B28] rounded-full transition-all duration-150"
              style={{ height: `${Math.max(8, scrollProgress * 100)}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-stone-500 uppercase rotate-90 origin-center translate-y-3">
            TIMELINE
          </span>
        </div>

        {/* Center Typography Overlays Driven strictly by scrollProgress */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 text-center my-auto pointer-events-none">
          {/* Chapter 1: Whole Spice (0.00 - 0.15) */}
          {scrollProgress <= 0.15 && (
            <div className="space-y-3 transition-opacity duration-300">
              <p className="text-xs sm:text-sm font-mono tracking-[0.25em] text-[#D49B28] uppercase">
                {isKn ? 'ಹಂತ ೦೧ · ಕಾಳು ಮಸಾಲೆ' : 'SCENE 01 · WHOLE SPICE'}
              </p>
              <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                {isKn ? 'ಕಾಳು ಮಸಾಲೆಗಳ ಪವಿತ್ರ ಮೂಲ.' : 'It starts with the whole spice.'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto">
                {isKn
                  ? 'ಬ್ಯಾಡಗಿ ಮೆಣಸಿನಕಾಯಿ, ಸುವಾಸನಾಭರಿತ ಧನಿಯಾ ಮತ್ತು ಅರಿಶಿನ ಕೊಂಬುಗಳು.'
                  : 'Single-origin Byadgi chillies, coriander seeds, and Salem turmeric.'}
              </p>
            </div>
          )}

          {/* Chapter 2: Preparation & Sorting (0.15 - 0.30) */}
          {scrollProgress > 0.15 && scrollProgress <= 0.3 && (
            <div className="space-y-3 transition-opacity duration-300">
              <p className="text-xs sm:text-sm font-mono tracking-[0.25em] text-[#D49B28] uppercase">
                {isKn ? 'ಹಂತ ೦೨ · ಪರಿಶುದ್ಧತೆ' : 'SCENE 02 · PREPARATION'}
              </p>
              <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                {isKn ? 'ಕೈಯಿಂದ ಆರಿಸುವ ತಾಳ್ಮೆ.' : 'Prepared with patience.'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto">
                {isKn
                  ? 'ಸಾಂಪ್ರದಾಯಿಕ ಮೊರದಲ್ಲಿ ಕೇರಿ ತೊಟ್ಟು ಮತ್ತು ಧೂಳನ್ನು ತೆಗೆಯಲಾಗುತ್ತದೆ.'
                  : 'Carefully sorted and winnowed by hand before any heat or milling begins.'}
              </p>
            </div>
          )}

          {/* Chapter 3: Gentle Roasting (0.30 - 0.44) */}
          {scrollProgress > 0.3 && scrollProgress <= 0.44 && (
            <div className="space-y-3 transition-opacity duration-300">
              <p className="text-xs sm:text-sm font-mono tracking-[0.25em] text-[#D49B28] uppercase">
                {isKn ? 'ಹಂತ ೦೩ · ಮಂದ ಉರಿ' : 'SCENE 03 · GENTLE ROAST'}
              </p>
              <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                {isKn ? 'ಹದವಾದ ಮಂದ ಉರಿ.' : 'Gently warmed over embers.'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto">
                {isKn
                  ? 'ಕಾಳುಗಳು ಸುಡದೆ ಸುಗಂಧ ತೈಲಗಳು ಎಚ್ಚರಗೊಳ್ಳುವಂತೆ ಹದವಾಗಿ ಹುರಿಯುವುದು.'
                  : 'Releasing fragrant volatile terpenes without scorching delicate skins.'}
              </p>
            </div>
          )}

          {/* Chapter 4: Stone Milling (0.44 - 0.58) — WOW MOMENT */}
          {scrollProgress > 0.44 && scrollProgress <= 0.58 && (
            <div className="space-y-3 transition-opacity duration-300">
              <p className="text-xs sm:text-sm font-mono tracking-[0.25em] text-[#D49B28] uppercase">
                {isKn ? 'ಹಂತ ೦೪ · ಕಲ್ಲಿನ ಬೀಸುವಿಕೆ' : 'SCENE 04 · STONE MILLING'}
              </p>
              <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-red-400 leading-tight">
                {isKn ? 'ಕಾಳು → ಅಪ್ಪಟ ಪುಡಿ' : 'WHOLE → GROUND'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto">
                {isKn
                  ? 'ನೈಸರ್ಗಿಕ ಗ್ರಾನೈಟ್ ಕಲ್ಲಿನಲ್ಲಿ ನಿಧಾನವಾಗಿ ಬೀಸಿದ ಪರಿಮಳ.'
                  : 'Slow-speed granite stone crushes whole pods into aromatic micro-particles.'}
              </p>
            </div>
          )}

          {/* Chapter 5: Spice Powder (0.58 - 0.72) */}
          {scrollProgress > 0.58 && scrollProgress <= 0.72 && (
            <div className="space-y-3 transition-opacity duration-300">
              <p className="text-xs sm:text-sm font-mono tracking-[0.25em] text-[#D49B28] uppercase">
                {isKn ? 'ಹಂತ ೦೫ · ಪರಿಶುದ್ಧ ಪುಡಿ' : 'SCENE 05 · SPICE POWDER'}
              </p>
              <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                {isKn ? 'ದಟ್ಟವಾದ ನೈಸರ್ಗಿಕ ಬಣ್ಣ.' : 'Vibrant, pure powder.'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto">
                {isKn
                  ? 'ಯಾವುದೇ ಕೃತಕ ಬಣ್ಣಗಳಿಲ್ಲದೆ ಕಲ್ಲಿನಲ್ಲಿ ಉಳಿದ ನೈಜ ತೈಲಾಂಶ.'
                  : 'Dense natural color and oil texture straight from the mill stone.'}
              </p>
            </div>
          )}

          {/* Chapter 6: Blending (0.72 - 0.85) */}
          {scrollProgress > 0.72 && scrollProgress <= 0.85 && (
            <div className="space-y-3 transition-opacity duration-300">
              <p className="text-xs sm:text-sm font-mono tracking-[0.25em] text-[#D49B28] uppercase">
                {isKn ? 'ಹಂತ ೦೬ · ಮಿಶ್ರಣ' : 'SCENE 06 · HERITAGE BLEND'}
              </p>
              <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                {isKn ? 'ಸಮತೋಲಿತ ಪಾರಂಪರಿಕ ರುಚಿ.' : 'Flavour comes together.'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto">
                {isKn
                  ? 'ಶತಮಾನಗಳ ಹಳೆಯ ಕರ್ನಾಟಕ ಪಾಕವಿಧಾನದ ಅಳತೆಯಲ್ಲಿ ಬೆರೆಸಿದ ಮಸಾಲೆಗಳು.'
                  : 'Harmonizing single spices according to sacred generational proportions.'}
              </p>
            </div>
          )}

          {/* Chapter 7: Packaging (0.85 - 0.94) */}
          {scrollProgress > 0.85 && scrollProgress <= 0.94 && (
            <div className="space-y-3 transition-opacity duration-300">
              <p className="text-xs sm:text-sm font-mono tracking-[0.25em] text-[#D49B28] uppercase">
                {isKn ? 'ಹಂತ ೦೭ · ಪ್ಯಾಕಿಂಗ್' : 'SCENE 07 · PACKAGING'}
              </p>
              <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                {isKn ? 'ಸುವಾಸನೆಯ ಶಾಶ್ವತ ಲಾಕ್.' : 'Sealed at the source.'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto">
                {isKn
                  ? 'ಬೀಸಿದ ಕೆಲವೇ ಸಮಯದಲ್ಲಿ ಗಾಳಿ ತಾಗದಂತೆ ಪ್ಯಾಕ್ ಮಾಡಿ ತಾಜಾತನ ಸಂರಕ್ಷಣೆ.'
                  : 'Multi-layer aroma-barrier sealing preserves essential notes until your kitchen.'}
              </p>
            </div>
          )}

          {/* Chapter 8: Your Kitchen & Live Ecommerce Product Reveal (0.94 - 1.00) */}
          {scrollProgress > 0.94 && (
            <div className="space-y-4 pointer-events-auto max-w-md mx-auto bg-[#1A120E]/90 border border-[#D49B28]/40 p-5 sm:p-6 rounded-3xl backdrop-blur-md shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95">
              <div className="inline-flex items-center space-x-2 text-[11px] font-mono text-[#D49B28] uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isKn ? 'ಅಂತಿಮ ಹಂತ · ನಿಮ್ಮ ಅಡುಗೆ ಮನೆಗೆ' : 'TO YOUR KITCHEN · READY TO COOK'}</span>
              </div>

              <div className="flex items-center space-x-4 text-left">
                <img
                  src={(featuredProduct.images && featuredProduct.images[0]) || spicePackImg}
                  alt={featuredProduct.name_en}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-2xl border border-stone-700 bg-stone-900 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-serif text-base sm:text-lg font-bold text-white truncate">
                    {isKn ? featuredProduct.name_kn : featuredProduct.name_en}
                  </h3>
                  <p className="text-xs text-stone-300 line-clamp-1">
                    {isKn ? featuredProduct.description_kn : featuredProduct.description_en}
                  </p>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="font-mono font-bold text-sm text-[#D49B28]">
                      ₹{featuredProduct.price}
                    </span>
                    <span className="text-[11px] text-stone-400">({featuredProduct.weight})</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-[#D49B28] hover:bg-[#E5AA35] text-[#120D0A] font-bold text-xs transition-colors cursor-pointer"
                >
                  {isAddedToCart ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isKn ? 'ಸೇರಿಸಲಾಗಿದೆ' : 'Added!'}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5" />
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
                  className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/20 transition-colors cursor-pointer"
                >
                  <span>{isKn ? 'ವಿವರಗಳು' : 'View Details'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Pinned Footer */}
        <div className="relative z-10 pb-6 sm:pb-8 px-4 sm:px-8 max-w-7xl mx-auto w-full flex items-center justify-between text-xs text-stone-500 font-mono">
          <span className="truncate">
            {isKn
              ? 'ಪ್ರಕೃತಿಯಿಂದ ನಿಮ್ಮ ಮನೆಯ ತಟ್ಟೆಯವರೆಗೆ · ಇಂದಿಮಾ'
              : 'Nature to Dining Table · Indima Spice Co.'}
          </span>

          <button
            type="button"
            onClick={onExploreCatalog}
            className="flex items-center space-x-1.5 text-stone-300 hover:text-[#D49B28] transition-colors cursor-pointer"
          >
            <span>{isKn ? 'ಎಲ್ಲಾ ಮಸಾಲೆಗಳ ಸಂಗ್ರಹ' : 'Full Catalogue'}</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
