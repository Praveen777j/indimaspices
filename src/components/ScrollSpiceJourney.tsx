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

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  streamOrigin?: number; // 0: red, 1: yellow, 2: brown, 3: green
  angle?: number;
  radius?: number;
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

  // ScrollTrigger Setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
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
        else setActiveChapter('PRODUCT REVEAL');
      }
    });

    return () => {
      trigger.kill();
    };
  }, []);

  // Canvas Cinematic Animation Engine
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

    // Particle cloud for exploding powder and multi-stream blending (thousands on desktop, optimized on mobile)
    const particleCount = width < 640 ? 350 : 800;
    const particles: Particle[] = [];
    const colors = [
      '#C0392B', // Byadgi Chilli Red
      '#D49B28', // Salem Turmeric Gold
      '#996633', // Coriander/Cumin Sand
      '#2E6930', // Curry Leaf Green
      '#E67E22'  // Roasted Paprika
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        size: 1.5 + Math.random() * 3.5,
        color: colors[i % colors.length],
        alpha: 0.3 + Math.random() * 0.7,
        streamOrigin: i % 4,
        angle: Math.random() * Math.PI * 2,
        radius: 40 + Math.random() * 260
      });
    }

    // Dynamic background interpolator based on scrollProgress
    const getBackgroundColor = (p: number) => {
      if (p < 0.15) {
        // Scene A: Warm cream with golden terracotta aura
        return { top: '#FAF4E8', bottom: '#F3E5D0', textDark: true };
      } else if (p < 0.3) {
        // Scene B: Earthy warm bamboo & sandalwood
        return { top: '#F4EADA', bottom: '#E9D6BE', textDark: true };
      } else if (p < 0.44) {
        // Scene C: Cast-iron embers glow
        return { top: '#3D2014', bottom: '#22110B', textDark: false };
      } else if (p < 0.58) {
        // Scene D: Granite stone milling contrast
        return { top: '#1F1A18', bottom: '#141110', textDark: false };
      } else if (p < 0.72) {
        // Scene E: Bright Saffron / Saffron Glow
        return { top: '#993300', bottom: '#5A1707', textDark: false };
      } else if (p < 0.85) {
        // Scene F: Blending Vortex (Deep heritage warmth)
        return { top: '#2E1911', bottom: '#1A0E0A', textDark: false };
      } else if (p < 0.94) {
        // Scene G: Packaging (Warm Brass & Cream)
        return { top: '#FAF3E8', bottom: '#EDE0CC', textDark: true };
      } else {
        // Scene H: Kitchen Feast & Product Reveal
        return { top: '#FAF5EA', bottom: '#F2E5D4', textDark: true };
      }
    };

    const render = () => {
      const p = scrollProgress;
      const bg = getBackgroundColor(p);

      // Render Dynamic Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, bg.top);
      bgGrad.addColorStop(1, bg.bottom);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // ========================================================
      // SCENE 1: WHOLE SPICES (p: 0.0 - 0.15)
      // Camera zooms in on the hero Byadgi chilli while other spices float
      // ========================================================
      if (p <= 0.18) {
        const alpha = p < 0.14 ? 1 : Math.max(0, 1 - (p - 0.14) / 0.04);
        ctx.save();
        ctx.globalAlpha = alpha;

        const zoom = 1 + p * 1.8;
        ctx.translate(centerX, centerY);
        ctx.scale(zoom, zoom);

        // Ambient golden warm halo in center
        const halo = ctx.createRadialGradient(0, 0, 10, 0, 0, 300);
        halo.addColorStop(0, 'rgba(235, 170, 60, 0.35)');
        halo.addColorStop(0.6, 'rgba(215, 95, 40, 0.12)');
        halo.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(0, 0, 300, 0, Math.PI * 2);
        ctx.fill();

        // Orbiting Coriander & Turmeric
        [-110, 120, -60, 150].forEach((ox, i) => {
          const oy = Math.sin(p * 6 + i) * 35 + (i % 2 === 0 ? -60 : 70);
          ctx.beginPath();
          ctx.arc(ox * (1 - p * 0.4), oy * (1 - p * 0.4), 10, 0, Math.PI * 2);
          ctx.fillStyle = i % 2 === 0 ? '#C6A15E' : '#D49B28';
          ctx.shadowColor = 'rgba(0,0,0,0.2)';
          ctx.shadowBlur = 12;
          ctx.fill();
        });

        // The Hero Byadgi Chilli
        ctx.save();
        ctx.rotate(-0.25 + p * 0.6);
        ctx.shadowColor = 'rgba(70, 20, 10, 0.4)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 15;

        ctx.beginPath();
        ctx.moveTo(-65, 18);
        ctx.bezierCurveTo(-25, -22, 25, -30, 80, -10);
        ctx.bezierCurveTo(95, -4, 98, 6, 82, 12);
        ctx.bezierCurveTo(45, 28, -12, 34, -65, 18);
        ctx.closePath();

        const chilliGrad = ctx.createLinearGradient(-65, -20, 95, 20);
        chilliGrad.addColorStop(0, '#5C0F06');
        chilliGrad.addColorStop(0.3, '#941B0C');
        chilliGrad.addColorStop(0.7, '#C52B19');
        chilliGrad.addColorStop(1, '#701308');
        ctx.fillStyle = chilliGrad;
        ctx.fill();

        // Stem
        ctx.beginPath();
        ctx.moveTo(-65, 18);
        ctx.quadraticCurveTo(-82, 24, -92, 38);
        ctx.strokeStyle = '#43562C';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.restore();
        ctx.restore();
      }

      // ========================================================
      // SCENE 2: PREPARATION & WINNOWING (p: 0.15 - 0.32)
      // The hero chilli PHYSICALLY TRAVELS across the screen and lands
      // in a traditional bamboo tray, unwanted dust/chaff separates outward
      // ========================================================
      if (p >= 0.12 && p <= 0.34) {
        const stageProgress = Math.max(0, Math.min(1, (p - 0.14) / 0.16));
        const alpha = p < 0.14 ? (p - 0.12) / 0.02 : p > 0.3 ? Math.max(0, 1 - (p - 0.3) / 0.04) : 1;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Traditional Bamboo Winnowing Tray (Moram) Perspective
        ctx.save();
        ctx.translate(centerX, centerY + 30);
        ctx.scale(1, 0.45);
        ctx.beginPath();
        ctx.arc(0, 0, Math.min(width * 0.42, 300), 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(215, 180, 120, 0.35)';
        ctx.strokeStyle = '#A88045';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.fill();

        // Bamboo weave ribs
        ctx.strokeStyle = 'rgba(160, 120, 60, 0.2)';
        ctx.lineWidth = 2;
        for (let r = -240; r <= 240; r += 25) {
          ctx.beginPath();
          ctx.moveTo(r, -150);
          ctx.lineTo(r, 150);
          ctx.stroke();
        }
        ctx.restore();

        // The Chilli Physically Traveling Across the Screen (Landing into tray)
        const travelX = centerX - 240 + stageProgress * 240;
        const travelY = centerY - 140 + stageProgress * 170;
        ctx.save();
        ctx.translate(travelX, travelY);
        ctx.rotate(-0.4 + stageProgress * 0.8);
        ctx.scale(1.4, 1.4);

        ctx.beginPath();
        ctx.moveTo(-50, 14);
        ctx.bezierCurveTo(-20, -18, 20, -24, 60, -8);
        ctx.bezierCurveTo(72, -3, 75, 5, 62, 10);
        ctx.bezierCurveTo(30, 22, -10, 26, -50, 14);
        ctx.closePath();
        ctx.fillStyle = '#BA2310';
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.restore();

        // Visible Chaff & Dust Particles Separating Outward into the air
        for (let i = 0; i < 35; i++) {
          const separation = stageProgress * 280;
          const angle = (i / 35) * Math.PI * 2;
          const px = centerX + Math.cos(angle) * (70 + separation);
          const py = centerY + Math.sin(angle) * (35 + separation * 0.5);
          ctx.beginPath();
          ctx.arc(px, py, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(160, 130, 90, ' + Math.max(0, 0.8 - stageProgress * 0.7) + ')';
          ctx.fill();
        }

        ctx.restore();
      }

      // ========================================================
      // SCENE 3: GENTLE CURING & ROASTING (p: 0.30 - 0.46)
      // Spices move toward cast-iron kadai, warm golden embers glow, rising aromatic vapor
      // ========================================================
      if (p >= 0.28 && p <= 0.47) {
        const stageProgress = Math.max(0, Math.min(1, (p - 0.3) / 0.14));
        const alpha = p < 0.3 ? (p - 0.28) / 0.02 : p > 0.43 ? Math.max(0, 1 - (p - 0.43) / 0.04) : 1;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Radiant Wood Embers Heat Glow
        const emberGlow = ctx.createRadialGradient(
          centerX,
          centerY + 40,
          20,
          centerX,
          centerY + 40,
          260
        );
        emberGlow.addColorStop(0, 'rgba(240, 110, 20, 0.55)');
        emberGlow.addColorStop(0.4, 'rgba(200, 60, 15, 0.3)');
        emberGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = emberGlow;
        ctx.fillRect(0, 0, width, height);

        // Cast-iron Kadai Base
        ctx.save();
        ctx.translate(centerX, centerY + 30);
        ctx.beginPath();
        ctx.ellipse(0, 0, Math.min(width * 0.38, 260), 90, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#261C18';
        ctx.strokeStyle = '#4A352D';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.fill();
        ctx.restore();

        // Spices resting on the hot surface
        ctx.save();
        ctx.translate(centerX, centerY + 20);
        ctx.beginPath();
        ctx.ellipse(0, 0, 45, 14, -0.2, 0, Math.PI * 2);
        ctx.fillStyle = '#A81C0B';
        ctx.fill();
        ctx.restore();

        // Rising Golden Aromatic Terpenes / Vapor Streams
        for (let s = 0; s < 18; s++) {
          const vaporY = centerY + 10 - stageProgress * 220 - s * 14;
          const vaporX = centerX + Math.sin(stageProgress * 10 + s) * 45;
          ctx.beginPath();
          ctx.arc(vaporX, vaporY, 2.5 + s * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(235, 175, 45, ' + Math.max(0, 0.7 - stageProgress * 0.5) + ')';
          ctx.shadowColor = '#EBAF2D';
          ctx.shadowBlur = 8;
          ctx.fill();
        }

        ctx.restore();
      }

      // ========================================================
      // SCENE 4: THE GRANITE STONE MILL (p: 0.44 - 0.60) — THE WOW MOMENT!
      // Whole chilli enters grinder -> Granite stone visibly rotates with scroll ->
      // Chilli fractures apart -> Explosive burst of micro-particles!
      // ========================================================
      if (p >= 0.42 && p <= 0.62) {
        const millProgress = Math.max(0, Math.min(1, (p - 0.44) / 0.14));
        const alpha = p < 0.44 ? (p - 0.42) / 0.02 : p > 0.58 ? Math.max(0, 1 - (p - 0.58) / 0.04) : 1;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Lower Granite Mortar Base
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.beginPath();
        ctx.arc(0, 0, Math.min(width * 0.38, 240), 0, Math.PI * 2);
        const stoneGrad = ctx.createRadialGradient(0, 0, 30, 0, 0, 240);
        stoneGrad.addColorStop(0, '#423D3A');
        stoneGrad.addColorStop(0.7, '#2A2624');
        stoneGrad.addColorStop(1, '#151312');
        ctx.fillStyle = stoneGrad;
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 40;
        ctx.fill();

        // Upper Granite Grinding Stone — ROTATES DIRECTLY WITH SCROLL PROGRESS
        const rotAngle = millProgress * Math.PI * 6;
        ctx.rotate(rotAngle);

        ctx.beginPath();
        ctx.arc(0, 0, Math.min(width * 0.26, 160), 0, Math.PI * 2);
        ctx.fillStyle = '#524D49';
        ctx.strokeStyle = '#706A65';
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.fill();

        // Textured Granite Grooves
        for (let g = 0; g < 8; g++) {
          ctx.beginPath();
          ctx.arc(0, 0, Math.min(width * 0.22, 135) - g * 15, 0, Math.PI);
          ctx.strokeStyle = 'rgba(25, 22, 20, 0.4)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Wooden Pivot Handle
        ctx.beginPath();
        ctx.arc(Math.min(width * 0.17, 105), 0, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#A06E42';
        ctx.fill();

        // Central Grinding Aperture
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.fillStyle = '#0F0E0D';
        ctx.fill();

        ctx.restore();

        // The Chilli Fracturing & EXPLODING into thousands of vibrant particles
        const burstCount = width < 640 ? 120 : 240;
        for (let b = 0; b < burstCount; b++) {
          const bAngle = (b / burstCount) * Math.PI * 2 + rotAngle;
          const burstDist = millProgress * (70 + (b % 20) * 15);
          const bx = centerX + Math.cos(bAngle) * burstDist;
          const by = centerY + Math.sin(bAngle) * burstDist;

          ctx.beginPath();
          ctx.arc(bx, by, 2 + Math.random() * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = b % 3 === 0 ? '#C0392B' : b % 3 === 1 ? '#D49B28' : '#E67E22';
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = 8;
          ctx.fill();
        }

        ctx.restore();
      }

      // ========================================================
      // SCENE 5: POWDER SHOULD FILL THE SCREEN (p: 0.58 - 0.74)
      // Powder particles swirl, stream, form waves, and fill the entire viewport
      // ========================================================
      if (p >= 0.56 && p <= 0.76) {
        const powderProgress = Math.max(0, Math.min(1, (p - 0.58) / 0.14));
        const alpha = p < 0.58 ? (p - 0.56) / 0.02 : p > 0.72 ? Math.max(0, 1 - (p - 0.72) / 0.04) : 1;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Swirling waves of deep saffron and crimson spice powder
        particles.forEach((pt, i) => {
          const flowWave = Math.sin(pt.baseX * 0.02 + powderProgress * 8 + i) * 60;
          const px = (pt.baseX + powderProgress * width * 0.8) % width;
          const py = (pt.baseY + flowWave) % height;

          ctx.beginPath();
          ctx.arc(px, py, pt.size * (1 + powderProgress * 0.8), 0, Math.PI * 2);
          ctx.fillStyle = i % 2 === 0 ? '#C0392B' : '#E5A93C';
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = 10;
          ctx.fill();
        });

        ctx.restore();
      }

      // ========================================================
      // SCENE 6: BLENDING VORTEX (p: 0.72 - 0.87)
      // Multiple spice streams (Red Byadgi, Golden Turmeric, Brown Coriander, Green Curry Leaf)
      // physically converging into a central spinning vortex
      // ========================================================
      if (p >= 0.70 && p <= 0.89) {
        const blendProgress = Math.max(0, Math.min(1, (p - 0.72) / 0.13));
        const alpha = p < 0.72 ? (p - 0.70) / 0.02 : p > 0.85 ? Math.max(0, 1 - (p - 0.85) / 0.04) : 1;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Four Corner Streams Converging Inward
        particles.forEach((pt, i) => {
          pt.angle = (pt.angle || 0) + 0.04;
          const startRadius = Math.max(width, height) * 0.6;
          const currentRadius = startRadius * (1 - blendProgress) + (pt.radius || 100) * blendProgress;

          // Corner stream offsets
          let cornerAngle = 0;
          if (pt.streamOrigin === 0) {
            cornerAngle = -Math.PI * 0.75; // Red (Top-Left)
            pt.color = '#C0392B';
          } else if (pt.streamOrigin === 1) {
            cornerAngle = -Math.PI * 0.25; // Gold (Top-Right)
            pt.color = '#D49B28';
          } else if (pt.streamOrigin === 2) {
            cornerAngle = Math.PI * 0.75; // Brown (Bottom-Left)
            pt.color = '#996633';
          } else {
            cornerAngle = Math.PI * 0.25; // Green (Bottom-Right)
            pt.color = '#2E6930';
          }

          const angle = cornerAngle * (1 - blendProgress) + (pt.angle || 0) * blendProgress;
          const px = centerX + Math.cos(angle) * currentRadius;
          const py = centerY + Math.sin(angle) * currentRadius * 0.7;

          ctx.beginPath();
          ctx.arc(px, py, pt.size * 1.3, 0, Math.PI * 2);
          ctx.fillStyle = pt.color;
          ctx.shadowColor = pt.color;
          ctx.shadowBlur = 10;
          ctx.fill();
        });

        ctx.restore();
      }

      // ========================================================
      // SCENE 7: POWDER -> PACKAGING (p: 0.85 - 0.95)
      // The blended powder physically funnels into a pouch silhouette,
      // seals with a metallic golden sweep, Indima branding becomes visible
      // ========================================================
      if (p >= 0.83 && p <= 0.96) {
        const packProgress = Math.max(0, Math.min(1, (p - 0.85) / 0.09));
        const alpha = p < 0.85 ? (p - 0.83) / 0.02 : p > 0.94 ? Math.max(0, 1 - (p - 0.94) / 0.02) : 1;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Pouch Dimensions
        const pw = Math.min(width * 0.5, 260);
        const ph = Math.min(height * 0.52, 340);

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((1 - packProgress) * 0.15);

        // Pouch Body with Brand Red & Brass Sheen
        ctx.shadowColor = 'rgba(70, 20, 10, 0.4)';
        ctx.shadowBlur = 35;
        ctx.beginPath();
        ctx.roundRect(-pw / 2, -ph / 2, pw, ph, 20);
        const pouchGrad = ctx.createLinearGradient(-pw / 2, -ph / 2, pw / 2, ph / 2);
        pouchGrad.addColorStop(0, '#8B170B');
        pouchGrad.addColorStop(0.5, '#A82512');
        pouchGrad.addColorStop(1, '#6F0F05');
        ctx.fillStyle = pouchGrad;
        ctx.fill();

        // Shimmering Golden Seal Top
        const sealY = -ph / 2 + packProgress * ph;
        ctx.strokeStyle = '#D49B28';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#D49B28';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.moveTo(-pw / 2 + 15, sealY);
        ctx.lineTo(pw / 2 - 15, sealY);
        ctx.stroke();

        ctx.restore();
        ctx.restore();
      }

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

  const isLightScene = scrollProgress < 0.3 || scrollProgress > 0.85;

  return (
    <section
      id="scroll-journey-section"
      ref={containerRef}
      className="relative w-full h-[580vh]"
    >
      {/* Pinned Viewport Cinematic Stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between select-none">
        {/* Living Canvas Transformation Engine */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

        {/* Top HUD: Current Chapter & Real-Time Progress Bar */}
        <div className="relative z-10 pt-6 sm:pt-8 px-4 sm:px-8 max-w-7xl mx-auto w-full flex items-center justify-between text-xs font-mono">
          <div
            className={`flex items-center space-x-2.5 font-bold tracking-widest uppercase transition-colors duration-300 ${
              isLightScene ? 'text-[#8B3214]' : 'text-amber-400'
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
              isLightScene ? 'text-[#5C483B]' : 'text-stone-400'
            }`}
          >
            <span className="hidden sm:inline font-sans text-[11px] tracking-widest uppercase font-bold">
              {isKn ? 'ಸ್ಕ್ರೋಲ್ ಪ್ರಗತಿ' : 'SCROLL PROGRESS'}
            </span>
            <span
              className={`font-bold text-sm font-mono ${
                isLightScene ? 'text-[#8B3214]' : 'text-amber-400'
              }`}
            >
              {Math.round(scrollProgress * 100)}%
            </span>
          </div>
        </div>

        {/* Right Rail Timeline Scrubber */}
        <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center space-y-3 pointer-events-none">
          <div className="w-1.5 h-40 bg-black/15 rounded-full overflow-hidden relative">
            <div
              className="w-full bg-gradient-to-b from-[#8B3214] via-[#D49B28] to-[#8B3214] rounded-full transition-all duration-150"
              style={{ height: `${Math.max(8, scrollProgress * 100)}%` }}
            />
          </div>
          <span
            className={`text-[10px] font-mono uppercase rotate-90 origin-center translate-y-3 font-bold ${
              isLightScene ? 'text-[#8B3214]' : 'text-amber-400'
            }`}
          >
            TIMELINE
          </span>
        </div>

        {/* Center Typography Overlays Driven Strictly by scrollProgress */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 text-center my-auto pointer-events-none">
          {/* Chapter 1: Whole Spice (0.00 - 0.15) */}
          {scrollProgress <= 0.15 && (
            <div className="space-y-3 transition-all duration-300">
              <p className="text-xs sm:text-sm font-mono tracking-[0.28em] text-[#8B3214] uppercase font-bold">
                {isKn ? 'ಹಂತ ೦೧ · ಕಾಳು ಮಸಾಲೆ' : 'SCENE 01 · WHOLE SPICE'}
              </p>
              <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1F1610] leading-tight">
                {isKn ? 'ಕಾಳು ಮಸಾಲೆಗಳ ಪವಿತ್ರ ಮೂಲ.' : 'It starts with the whole spice.'}
              </h2>
              <p className="text-xs sm:text-sm text-[#5C483B] max-w-md mx-auto font-normal">
                {isKn
                  ? 'ಬ್ಯಾಡಗಿ ಮೆಣಸಿನಕಾಯಿ, ಸುವಾಸನಾಭರಿತ ಧನಿಯಾ ಮತ್ತು ಅರಿಶಿನ ಕೊಂಬುಗಳು.'
                  : 'Single-origin Byadgi chillies, coriander seeds, and Salem turmeric.'}
              </p>
            </div>
          )}

          {/* Chapter 2: Preparation & Winnowing (0.15 - 0.30) */}
          {scrollProgress > 0.15 && scrollProgress <= 0.3 && (
            <div className="space-y-3 transition-all duration-300">
              <p className="text-xs sm:text-sm font-mono tracking-[0.28em] text-[#8B3214] uppercase font-bold">
                {isKn ? 'ಹಂತ ೦೨ · ಪರಿಶುದ್ಧತೆ' : 'SCENE 02 · PREPARATION'}
              </p>
              <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1F1610] leading-tight">
                {isKn ? 'ಕೈಯಿಂದ ಆರಿಸುವ ತಾಳ್ಮೆ.' : 'Prepared with patience.'}
              </h2>
              <p className="text-xs sm:text-sm text-[#5C483B] max-w-md mx-auto font-normal">
                {isKn
                  ? 'ಸಾಂಪ್ರದಾಯಿಕ ಮೊರದಲ್ಲಿ ಕೇರಿ ತೊಟ್ಟು ಮತ್ತು ಧೂಳನ್ನು ತೆಗೆದು ಶುದ್ಧ ಕಾಳುಗಳನ್ನು ಸಿದ್ಧಪಡಿಸುವುದು.'
                  : 'Sorted and winnowed by hand before any heat or milling begins.'}
              </p>
            </div>
          )}

          {/* Chapter 3: Gentle Roasting (0.30 - 0.44) */}
          {scrollProgress > 0.3 && scrollProgress <= 0.44 && (
            <div className="space-y-3 transition-all duration-300">
              <p className="text-xs sm:text-sm font-mono tracking-[0.28em] text-amber-400 uppercase font-bold">
                {isKn ? 'ಹಂತ ೦೩ · ಮಂದ ಉರಿ' : 'SCENE 03 · GENTLE ROAST'}
              </p>
              <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                {isKn ? 'ಹದವಾದ ಮಂದ ಉರಿ.' : 'Gently warmed over embers.'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto font-light">
                {isKn
                  ? 'ಕಾಳುಗಳು ಸುಡದೆ ಸುಗಂಧ ತೈಲಗಳು ಎಚ್ಚರಗೊಳ್ಳುವಂತೆ ಹದವಾಗಿ ಹುರಿಯುವುದು.'
                  : 'Awakening fragrant aromatic volatiles without scorching delicate skins.'}
              </p>
            </div>
          )}

          {/* Chapter 4: Stone Milling (0.44 - 0.58) — THE WOW MOMENT */}
          {scrollProgress > 0.44 && scrollProgress <= 0.58 && (
            <div className="space-y-3 transition-all duration-300">
              <p className="text-xs sm:text-sm font-mono tracking-[0.28em] text-amber-400 uppercase font-bold">
                {isKn ? 'ಹಂತ ೦೪ · ಕಲ್ಲಿನ ಬೀಸುವಿಕೆ' : 'SCENE 04 · STONE MILLING'}
              </p>
              <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-red-400 leading-tight">
                {isKn ? 'ಕಾಳು → ಅಪ್ಪಟ ಪುಡಿ' : 'WHOLE → GROUND'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto font-light">
                {isKn
                  ? 'ನೈಸರ್ಗಿಕ ಗ್ರಾನೈಟ್ ಕಲ್ಲಿನಲ್ಲಿ ನಿಧಾನವಾಗಿ ಬೀಸಿದ ಪರಿಮಳ.'
                  : 'Granite stones rotate with your scroll, crushing whole spices into aromatic micro-particles.'}
              </p>
            </div>
          )}

          {/* Chapter 5: Spice Powder (0.58 - 0.72) */}
          {scrollProgress > 0.58 && scrollProgress <= 0.72 && (
            <div className="space-y-3 transition-all duration-300">
              <p className="text-xs sm:text-sm font-mono tracking-[0.28em] text-amber-300 uppercase font-bold">
                {isKn ? 'ಹಂತ ೦೫ · ಪರಿಶುದ್ಧ ಪುಡಿ' : 'SCENE 05 · SPICE POWDER'}
              </p>
              <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                {isKn ? 'ದಟ್ಟವಾದ ನೈಸರ್ಗಿಕ ಬಣ್ಣ.' : 'Vibrant, pure powder.'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-200 max-w-md mx-auto font-light">
                {isKn
                  ? 'ಯಾವುದೇ ಕೃತಕ ಬಣ್ಣಗಳಿಲ್ಲದೆ ಕಲ್ಲಿನಲ್ಲಿ ಉಳಿದ ನೈಜ ತೈಲಾಂಶ.'
                  : 'Dense natural color and oil texture cascading in air currents.'}
              </p>
            </div>
          )}

          {/* Chapter 6: Blending (0.72 - 0.85) */}
          {scrollProgress > 0.72 && scrollProgress <= 0.85 && (
            <div className="space-y-3 transition-all duration-300">
              <p className="text-xs sm:text-sm font-mono tracking-[0.28em] text-amber-400 uppercase font-bold">
                {isKn ? 'ಹಂತ ೦೬ · ಮಿಶ್ರಣ' : 'SCENE 06 · HERITAGE BLEND'}
              </p>
              <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                {isKn ? 'ಸಮತೋಲಿತ ಪಾರಂಪರಿಕ ರುಚಿ.' : 'Flavour comes together.'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto font-light">
                {isKn
                  ? 'ಶತಮಾನಗಳ ಹಳೆಯ ಕರ್ನಾಟಕ ಪಾಕವಿಧಾನದ ಅಳತೆಯಲ್ಲಿ ಬೆರೆಸಿದ ಮಸಾಲೆಗಳು.'
                  : 'Multiple spice streams converge into a central harmonic blending spiral.'}
              </p>
            </div>
          )}

          {/* Chapter 7: Packaging (0.85 - 0.94) */}
          {scrollProgress > 0.85 && scrollProgress <= 0.94 && (
            <div className="space-y-3 transition-all duration-300">
              <p className="text-xs sm:text-sm font-mono tracking-[0.28em] text-[#8B3214] uppercase font-bold">
                {isKn ? 'ಹಂತ ೦೭ · ಪ್ಯಾಕಿಂಗ್' : 'SCENE 07 · PACKAGING'}
              </p>
              <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1F1610] leading-tight">
                {isKn ? 'ಸುವಾಸನೆಯ ಶಾಶ್ವತ ಲಾಕ್.' : 'Sealed at the source.'}
              </h2>
              <p className="text-xs sm:text-sm text-[#5C483B] max-w-md mx-auto font-normal">
                {isKn
                  ? 'ಬೀಸಿದ ಕೆಲವೇ ಸಮಯದಲ್ಲಿ ಗಾಳಿ ತಾಗದಂತೆ ಪ್ಯಾಕ್ ಮಾಡಿ ತಾಜಾತನ ಸಂರಕ್ಷಣೆ.'
                  : 'Multi-layer aroma-barrier sealing locks volatile oils until your kitchen.'}
              </p>
            </div>
          )}

          {/* Chapter 8: Commercial Product Reveal (0.94 - 1.00) */}
          {scrollProgress > 0.94 && (
            <div className="space-y-4 pointer-events-auto max-w-md mx-auto bg-[#FFFDF9]/95 border border-[#DFC7A2] p-6 sm:p-7 rounded-3xl backdrop-blur-md shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95">
              <div className="inline-flex items-center space-x-2 text-[11px] font-mono text-[#8B3214] uppercase font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#8B3214]" />
                <span>{isKn ? 'ಅಂತಿಮ ಹಂತ · ನಿಮ್ಮ ಅಡುಗೆ ಮನೆಗೆ' : 'TO YOUR KITCHEN · READY TO COOK'}</span>
              </div>

              <div className="flex items-center space-x-4 text-left">
                <img
                  src={(featuredProduct.images && featuredProduct.images[0]) || spicePackImg}
                  alt={featuredProduct.name_en}
                  className="w-18 h-18 sm:w-22 sm:h-22 object-cover rounded-2xl border border-[#DFC7A2] bg-[#FAF7F2] shrink-0 shadow-sm"
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

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-[#8B3214] hover:bg-[#72270E] text-white font-bold text-xs transition-all shadow-md cursor-pointer"
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
                  className="flex items-center justify-center space-x-1.5 py-3 px-4 rounded-2xl bg-[#FAF6EE] hover:bg-[#F2E8D8] text-[#1F1610] text-xs font-bold border border-[#DFC7A2] transition-colors cursor-pointer shadow-xs"
                >
                  <span>{isKn ? 'ವಿವರಗಳು' : 'View Details'}</span>
                  <ChevronRight className="w-4 h-4 text-[#8B3214]" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Pinned Footer */}
        <div
          className={`relative z-10 pb-6 sm:pb-8 px-4 sm:px-8 max-w-7xl mx-auto w-full flex items-center justify-between text-xs font-mono transition-colors duration-300 ${
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
              isLightScene ? 'text-[#8B3214] hover:text-[#72270E]' : 'text-amber-400 hover:text-amber-300'
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
