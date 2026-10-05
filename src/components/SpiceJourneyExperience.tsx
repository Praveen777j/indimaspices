import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Leaf,
  Flame,
  CheckCircle2,
  ArrowRight,
  Sun,
  Layers,
  Award,
  Package,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  Compass
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { SpiceParticlesCanvas } from './SpiceParticlesCanvas';
import {
  rawSpicesImg,
  stoneGrindImg,
  spiceBlendImg,
  spicePackImg
} from '../assets/images';

interface Stage {
  id: string;
  stepNumber: string;
  title_en: string;
  title_kn: string;
  subtitle_en: string;
  subtitle_kn: string;
  description_en: string;
  description_kn: string;
  keyHighlight_en: string;
  keyHighlight_kn: string;
  metricLabel_en: string;
  metricLabel_kn: string;
  metricValue: string;
  icon: React.ComponentType<{ className?: string }>;
  image: string;
  ambientColor: string;
  accentBadge: string;
}

const STAGES: Stage[] = [
  {
    id: 'sourcing',
    stepNumber: '01',
    title_en: 'Raw Sourcing & Origin',
    title_kn: 'ಮೂಲ ತೋಟಗಳಿಂದ ನೇರ ಸಂಗ್ರಹ',
    subtitle_en: 'Single-Origin Karnataka Farm Harvests',
    subtitle_kn: 'ಬ್ಯಾಡಗಿ & ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಅತ್ಯುನ್ನತ ಗುಣಮಟ್ಟದ ಕಾಳು ಮಸಾಲೆಗಳು',
    description_en:
      'We harvest stemless deep-red Byadgi chillies, fragrant round coriander seeds, rich golden Salem turmeric fingers, and bold Malabar peppercorns directly from certified generational growers.',
    description_kn:
      'ಹಾವೇರಿ ಜಿಲ್ಲೆಯ ನೈಸರ್ಗಿಕ ಬ್ಯಾಡಗಿ ಮೆಣಸಿನಕಾಯಿ, ಸುವಾಸನಾಭರಿತ ಧನಿಯಾ ಕಾಳುಗಳು, ಸುವರ್ಣ ಅರಿಶಿನ ಕೊಂಬುಗಳು ಮತ್ತು ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಕಾಳುಮೆಣಸನ್ನು ನೈಜ ಕೃಷಿಕರಿಂದ ಸಂಗ್ರಹಿಸುತ್ತೇವೆ.',
    keyHighlight_en: 'Natural colour & rich oil density',
    keyHighlight_kn: 'ನೈಸರ್ಗಿಕ ಗಾಢ ಬಣ್ಣ ಮತ್ತು ತೈಲ ಸಾಂದ್ರತೆ',
    metricLabel_en: 'Byadgi APMC Harvest',
    metricLabel_kn: 'ಪ್ರಮಾಣೀಕೃತ ಕಾಳುಗಳು',
    metricValue: '100% Origin',
    icon: Compass,
    image: rawSpicesImg,
    ambientColor: 'rgba(212, 155, 40, 0.15)',
    accentBadge: 'FARM DIRECT'
  },
  {
    id: 'sorting',
    stepNumber: '02',
    title_en: 'Artisanal Hand-Sorting',
    title_kn: 'ಕೈಯಿಂದ ಆರಿಸುವ ಪರಿಶುದ್ಧತೆ',
    subtitle_en: 'Triple Cleaning with Zero Husk or Stems',
    subtitle_kn: 'ಧೂಳು, ತೊಟ್ಟು ಮತ್ತು ಕಸ ಮುಕ್ತವಾದ ಶುದ್ಧೀಕರಣ',
    description_en:
      'Every batch undergoes rigorous manual winnowing and hand-sorting. Stems, seeds with defects, dust, and field debris are eliminated so only wholesome, clean spice kernels proceed forward.',
    description_kn:
      'ಪ್ರತಿಯೊಂದು ಬ್ಯಾಚ್ ಅನ್ನು ಸಾಂಪ್ರದಾಯಿಕ ಮೊರದಲ್ಲಿ ಕೇರಿ, ಕೈಯಿಂದ ಆರಿಸಿ ತೊಟ್ಟು ಮತ್ತು ಧೂಳನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ತೆಗೆದು ಶುದ್ಧವಾದ ಮಸಾಲೆ ಕಾಳುಗಳನ್ನು ಮಾತ್ರ ಪ್ರತ್ಯೇಕಿಸಲಾಗುತ್ತದೆ.',
    keyHighlight_en: 'Zero husk, sand or foreign particles',
    keyHighlight_kn: 'ಯಾವುದೇ ಕಸ, ಧೂಳು ಅಥವಾ ಹೊಟ್ಟು ಇಲ್ಲ',
    metricLabel_en: 'Purity Factor',
    metricLabel_kn: 'ಶುದ್ಧತಾ ಪ್ರಮಾಣ',
    metricValue: '99.9% Clean',
    icon: ShieldCheck,
    image: rawSpicesImg,
    ambientColor: 'rgba(38, 78, 54, 0.15)',
    accentBadge: 'HAND INSPECTED'
  },
  {
    id: 'drying',
    stepNumber: '03',
    title_en: 'Sun-Drying & Embers Roasting',
    title_kn: 'ಬಿಸಿಲಿನಲ್ಲಿ ಒಣಗಿಸುವಿಕೆ & ಮಂದ ಉರಿ',
    subtitle_en: 'Slow Wood-Fire Heating to Awaken Aromas',
    subtitle_kn: 'ನೈಸರ್ಗಿಕ ಸುವಾಸನಾ ತೈಲಗಳನ್ನು ಜಾಗೃತಗೊಳಿಸುವ ವಿಧಾನ',
    description_en:
      'Spices are solar-cured on hygienic raised cotton mats under gentle South Indian sun, then slow-roasted in seasoned cast-iron pans over low wood embers to release essential aromatic volatiles without scorching.',
    description_kn:
      'ಬಿಸಿಲಿನಲ್ಲಿ ನೈಸರ್ಗಿಕವಾಗಿ ಒಣಗಿಸಿದ ಕಾಳುಗಳನ್ನು ಹದವಾದ ಮಂದ ಉರಿಯಲ್ಲಿ ಹುರಿಯಲಾಗುತ್ತದೆ. ಇದರಿಂದ ಮಸಾಲೆಯೊಳಗಿನ ಸುಗಂಧ ತೈಲಗಳು ಎಚ್ಚರಗೊಂಡು ಹಳೆಯ ಕಾಲದ ಅಡುಗೆಯ ನೈಜ ಸುವಾಸನೆ ಮೂಡುತ್ತದೆ.',
    keyHighlight_en: 'Preserves delicate volatile terpenes',
    keyHighlight_kn: 'ಸುಗಂಧ ತೈಲಗಳು ಕರಗದಂತೆ ಕಾಪಾಡುತ್ತದೆ',
    metricLabel_en: 'Solar & Fire Cured',
    metricLabel_kn: 'ನೈಸರ್ಗಿಕ ತಾಪಮಾನ',
    metricValue: 'Slow Roast',
    icon: Sun,
    image: rawSpicesImg,
    ambientColor: 'rgba(230, 126, 34, 0.15)',
    accentBadge: 'SOLAR CURED'
  },
  {
    id: 'grinding',
    stepNumber: '04',
    title_en: 'Cold Stone-Milling',
    title_kn: 'ಸಾಂಪ್ರದಾಯಿಕ ಕಲ್ಲಿನ ಬೀಸುವಿಕೆ',
    subtitle_en: 'Low-RPM Natural Granite Ammikallu Mill',
    subtitle_kn: 'ತಣ್ಣನೆಯ ಕಲ್ಲಿನಲ್ಲಿ ಬೀಸಿ ಪೋಷಕಾಂಶ ರಕ್ಷಣೆ',
    description_en:
      'Unlike high-speed industrial pulverizers that heat up to 90°C and burn away delicate nutrients and flavors, our slow granite stone-mill operates at cool temperatures, yielding coarse, textured, intensely aromatic masala.',
    description_kn:
      'ವೇಗದ ಕಾರ್ಖಾನೆ ಮೆಷಿನ್‌ಗಳಂತೆ ಬಿಸಿಯಾಗದೆ, ನೈಸರ್ಗಿಕ ಗ್ರಾನೈಟ್ ಕಲ್ಲಿನಲ್ಲಿ ನಿಧಾನವಾಗಿ ಬೀಸಲಾಗುತ್ತದೆ. ಹೀಗಾಗಿ ಮಸಾಲೆಯ ಬಣ್ಣ, ನೈಸರ್ಗಿಕ ತೈಲ ಮತ್ತು ರುಚಿ ಹಾಗೆಯೇ ಉಳಿಯುತ್ತದೆ.',
    keyHighlight_en: 'Cold-pressed below 38°C to retain aroma',
    keyHighlight_kn: 'ಕಡಿಮೆ ಶಾಖದಲ್ಲಿ ಬೀಸಿದ ಅಪ್ಪಟ ಪುಡಿ',
    metricLabel_en: 'Milling Temperature',
    metricLabel_kn: 'ಕಡಿಮೆ ಶಾಖ',
    metricValue: '< 38°C Cold',
    icon: Flame,
    image: stoneGrindImg,
    ambientColor: 'rgba(153, 51, 0, 0.18)',
    accentBadge: 'COLD STONE'
  },
  {
    id: 'blending',
    stepNumber: '05',
    title_en: 'Heritage Recipe Blending',
    title_kn: 'ಪಾರಂಪರಿಕ ಸೂತ್ರಗಳ ಹದವಾದ ಮಿಶ್ರಣ',
    subtitle_en: 'Generational Karnataka Kitchen Formulations',
    subtitle_kn: 'ಮೈಸೂರು, ಉಡುಪಿ ಮತ್ತು ಧಾರವಾಡ ಶೈಲಿಯ ನೈಜ ಪಾಕಪದ್ಧತಿ',
    description_en:
      'Ground whole spices are harmonized in micro-batches with roasted copra (dry coconut), Malnad cloves, Marathi Moggu, and stone flower according to sacred regional Karnataka culinary traditions.',
    description_kn:
      'ಬಿಸಿಬೇಳೆಬಾತ್, ಸಾಂಬಾರ್, ರಸಂ ಮತ್ತು ಶೇಂಗಾ ಚಟ್ನಿ ಪುಡಿಗಳಿಗೆ ಬೇಕಾದ ಪ್ರತಿಯೊಂದು ಸಾಂಬಾರ ಪದಾರ್ಥಗಳನ್ನು ಶತಮಾನಗಳ ಹಳೆಯ ಕರ್ನಾಟಕದ ಪಾಕವಿಧಾನದಂತೆ ಅಳತೆ ಮಾಡಿ ಬೆರೆಸಲಾಗುತ್ತದೆ.',
    keyHighlight_en: 'Authentic South Indian culinary balance',
    keyHighlight_kn: 'ಸಮತೋಲಿತ ಸಾಂಪ್ರದಾಯಿಕ ರುಚಿ',
    metricLabel_en: 'Formula Origin',
    metricLabel_kn: 'ಮನೆಯ ಪಾಕವಿಧಾನ',
    metricValue: 'Authentic Heritage',
    icon: Layers,
    image: spiceBlendImg,
    ambientColor: 'rgba(197, 160, 89, 0.18)',
    accentBadge: 'SECRET BLEND'
  },
  {
    id: 'quality',
    stepNumber: '06',
    title_en: 'Uncompromised Purity Check',
    title_kn: 'ಪರಿಶುದ್ಧತೆಯ ಗುಣಮಟ್ಟ ಪರೀಕ್ಷೆ',
    subtitle_en: 'Zero Chemicals, Artificial Dyes or Fillers',
    subtitle_kn: 'ಕೃತಕ ಬಣ್ಣ, ಕೃತಕ ಸುವಾಸನೆ ಅಥವಾ ಕಲಬೆರಕೆ ಇಲ್ಲ',
    description_en:
      'Every single batch is verified for moisture levels, particle texture, and colour purity. We never add synthetic Sudan dyes, chalk powder, spent chillies, or artificial taste boosters.',
    description_kn:
      'ಪ್ರತಿಯೊಂದು ಬ್ಯಾಚ್‌ನ ತೇವಾಂಶ ಮತ್ತು ನೈಸರ್ಗಿಕ ಸುಗಂಧವನ್ನು ಪರೀಕ್ಷಿಸಲಾಗುತ್ತದೆ. ಯಾವುದೇ ಕೃತಕ ಬಣ್ಣ, ಮರದ ಪುಡಿ ಅಥವಾ ರಾಸಾಯನಿಕ ಸಂರಕ್ಷಕಗಳನ್ನು ಬಳಸುವುದಿಲ್ಲ.',
    keyHighlight_en: 'Use 50% less quantity due to supreme potency',
    keyHighlight_kn: 'ಅರ್ಧ ಚಮಚದಲ್ಲೇ ಅತಿ ಹೆಚ್ಚು ಗಾಢ ರುಚಿ',
    metricLabel_en: 'Filler Free',
    metricLabel_kn: 'ನೈಜತೆ',
    metricValue: '0% Fillers',
    icon: Award,
    image: spiceBlendImg,
    ambientColor: 'rgba(43, 83, 41, 0.15)',
    accentBadge: 'PURITY TESTED'
  },
  {
    id: 'packaging',
    stepNumber: '07',
    title_en: 'Aroma-Lock Eco Packaging',
    title_kn: 'ಸುವಾಸನೆ ಲಾಕ್ ಮಾಡುವ ಪ್ಯಾಕಿಂಗ್',
    subtitle_en: 'Multi-Layer Moisture & Oxygen Barrier',
    subtitle_kn: 'ತೇವಾಂಶ ಮತ್ತು ಗಾಳಿಯಾಡದಂತೆ ನೈಸರ್ಗಿಕ ಸಂರಕ್ಷಣೆ',
    description_en:
      'Sealed in recyclable, food-grade aroma-barrier pouches within hours of milling to trap the volatile aroma and vibrant oils until you open the pack in your kitchen.',
    description_kn:
      'ಕಲ್ಲಿನಲ್ಲಿ ಬೀಸಿದ ಕೆಲವೇ ಗಂಟೆಗಳಲ್ಲಿ ಗಾಳಿ ಮತ್ತು ಬೆಳಕು ತಾಗದಂತಹ ವಿಶೇಷ ಸುವಾಸನೆ-ಲಾಕ್ ಕವರ್‌ಗಳಲ್ಲಿ ಪ್ಯಾಕ್ ಮಾಡಲಾಗುತ್ತದೆ. ನೀವು ತೆರೆದಾಗ ತಕ್ಷಣ ಅಜ್ಜಿಯ ಮನೆಯ ಪರಿಮಳ ಹೊರಸೂಸುತ್ತದೆ.',
    keyHighlight_en: 'Guarantees freshness for up to 12 months',
    keyHighlight_kn: '೧೨ ತಿಂಗಳವರೆಗೆ ತಾಜಾತನ ಉಳಿಯುತ್ತದೆ',
    metricLabel_en: 'Shelf Life',
    metricLabel_kn: 'ತಾಜಾತನ ಅವಧಿ',
    metricValue: '12 Months Fresh',
    icon: Package,
    image: spicePackImg,
    ambientColor: 'rgba(139, 50, 20, 0.15)',
    accentBadge: 'AROMA SEALED'
  },
  {
    id: 'kitchen',
    stepNumber: '08',
    title_en: 'To Your Family Kitchen',
    title_kn: 'ನಿಮ್ಮ ಮನೆಯ ಅಡುಗೆ ಕೋಣೆಗೆ',
    subtitle_en: 'Wholesome Everyday Bengaluru Nourishment',
    subtitle_kn: 'ಪ್ರತಿದಿನದ ಸಾತ್ವಿಕ, ಆರೋಗ್ಯಕರ ಮತ್ತು ರುಚಿಕರ ಊಟ',
    description_en:
      'From the stone pestle to your simmering brass pot: pure wholesome comfort that delights your family and brings authentic Karnataka flavors to your dining table.',
    description_kn:
      'ನಮ್ಮ ಕಲ್ಲಿನ ಬೀಸುವ ಕಲ್ಲಿನಿಂದ ನಿಮ್ಮ ಅಡುಗೆ ಮನೆಗೆ: ಶುದ್ಧ, ಸಾತ್ವಿಕ ಮತ್ತು ತಾಯಿಯ ಕೈರುಚಿಯ ಮಸಾಲೆಗಳಿಂದ ನಿಮ್ಮ ಮನೆಮಂದಿಯ ಮುಖದಲ್ಲಿ ಸಂತಸ ತರುವ ಅದ್ಭುತ ರುಚಿ.',
    keyHighlight_en: 'Pan-India doorstep delivery directly from mill',
    keyHighlight_kn: 'ಭಾರತದಾದ್ಯಂತ ಮನೆ ಬಾಗಿಲಿಗೆ ತಾಜಾ ವಿತರಣೆ',
    metricLabel_en: 'Customer Loved',
    metricLabel_kn: 'ಮೆಚ್ಚಿನ ಬ್ರ್ಯಾಂಡ್',
    metricValue: '5.0 ★ Rated',
    icon: Sparkles,
    image: spicePackImg,
    ambientColor: 'rgba(212, 155, 40, 0.2)',
    accentBadge: 'FRESH ARRIVAL'
  }
];

export const SpiceJourneyExperience: React.FC = () => {
  const { language } = useLanguage();
  const isKn = language === 'kn';

  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement | null>(null);

  const activeStage = STAGES[activeStageIdx];

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStageIdx(prev => (prev + 1) % STAGES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // 3D Card tilt calculation based on cursor relative to card
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tiltX = -((y - centerY) / centerY) * 7;
    const tiltY = ((x - centerX) / centerX) * 7;
    setCardTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setCardTilt({ x: 0, y: 0 });
  };

  const nextStage = () => {
    setActiveStageIdx(prev => (prev + 1) % STAGES.length);
  };

  const prevStage = () => {
    setActiveStageIdx(prev => (prev - 1 + STAGES.length) % STAGES.length);
  };

  const scrollToProducts = () => {
    const el = document.getElementById('products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="spice-journey-section"
      className="py-12 sm:py-20 px-3.5 sm:px-6 lg:px-8 max-w-7xl 2xl:max-w-[1500px] mx-auto w-full relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-amber-500/5 blur-[140px] rounded-full pointer-events-none" />

      {/* Header Container */}
      <div className="text-center max-w-3xl mx-auto space-y-3 mb-8 sm:mb-12 relative z-10">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-[#FFFDF9] border border-[#DFC7A2] rounded-full text-xs font-bold text-[#8B3214] shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#993300] animate-pulse" />
          <span className="uppercase tracking-wider">
            {isKn ? 'ಕಾಳು ಮಸಾಲೆಯಿಂದ ನಿಮ್ಮ ಅಡುಗೆ ಮನೆಗೆ' : 'From the Spice to Your Kitchen'}
          </span>
        </div>
        <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-[#1F1610] tracking-tight leading-tight">
          {isKn
            ? 'ಅಪ್ಪಟ ಕಲ್ಲಿನಲ್ಲಿ ಬೀಸಿದ ಮಸಾಲೆಗಳ ೮ ಹಂತದ ಪರಂಪರೆ'
            : 'The 8-Stage Journey of Pure Stone-Ground Spice'}
        </h2>
        <p className="text-xs sm:text-sm lg:text-base text-[#5C483B] leading-relaxed max-w-2xl mx-auto font-normal">
          {isKn
            ? 'ಹಾವೇರಿಯ ಹೊಲಗಳಿಂದ ಹಿಡಿದು ನಿಮ್ಮ ಮನೆಯ ಅಡುಗೆ ಮನೆಯವರೆಗೆ, ಕಲಬೆರಕೆ ಇಲ್ಲದೆ ಸಾಂಪ್ರದಾಯಿಕ ಕಲ್ಲಿನ ಬೀಸುವ ವಿಧಾನದ ಅದ್ಭುತ ಕಥೆ.'
            : 'Discover how raw whole Karnataka spices are hand-sorted, wood-fire cured, and granite stone-ground in micro-batches to preserve essential aroma & pure taste.'}
        </p>
      </div>

      {/* Main Interactive Stage Experience Pod */}
      <div className="bg-[#FFFDF9] border border-[#DFC7A2] rounded-3xl p-4 sm:p-8 lg:p-10 shadow-sm relative overflow-hidden">
        {/* Particle Canvas Layer */}
        <SpiceParticlesCanvas particleCount={30} opacity={0.65} />

        {/* Stage Timeline Navigation Tabs (Desktop & Mobile Scrollable) */}
        <div className="relative z-10 flex items-center justify-between gap-1.5 overflow-x-auto pb-3 mb-6 sm:mb-8 border-b border-[#E8DFD3]/80 scrollbar-none">
          {STAGES.map((stg, idx) => {
            const isActive = idx === activeStageIdx;
            const Icon = stg.icon;
            return (
              <button
                key={stg.id}
                onClick={() => {
                  setActiveStageIdx(idx);
                  setIsPlaying(false);
                }}
                className={`group flex items-center space-x-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#8B3214] text-white shadow-md scale-102 ring-2 ring-[#8B3214]/20'
                    : 'bg-[#FAF7F2] text-[#5C483B] hover:text-[#1F1610] hover:bg-[#F5EFEB] border border-[#E8DFD3]'
                }`}
              >
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#E8DFD3]/60 text-[#8B3214]'
                  }`}
                >
                  {stg.stepNumber}
                </span>
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-[#8B3214]'}`} />
                <span className="whitespace-nowrap">{isKn ? stg.title_kn : stg.title_en}</span>
              </button>
            );
          })}
        </div>

        {/* 3D Stage Hero Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center relative z-10">
          {/* Left Column: Interactive 3D Visual with Perspective Tilt */}
          <div
            className="lg:col-span-6 relative perspective-[1200px]"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div
              ref={cardRef}
              style={{
                transform: `rotateX(${cardTilt.x}deg) rotateY(${cardTilt.y}deg)`,
                transition: 'transform 0.15s ease-out'
              }}
              className="relative aspect-16/10 sm:aspect-16/10 w-full rounded-3xl overflow-hidden shadow-xl border border-[#DFC7A2] bg-[#1F1610] group"
            >
              {/* Main Stage Photograph */}
              <img
                src={activeStage.image}
                alt={isKn ? activeStage.title_kn : activeStage.title_en}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />

              {/* Ambient Cinematic Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1F1610] via-[#1F1610]/40 to-transparent" />

              {/* Top Accent Badges */}
              <div className="absolute top-4 left-4 flex items-center space-x-2">
                <span className="bg-[#8B3214] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-amber-300/30">
                  {activeStage.accentBadge}
                </span>
                <span className="bg-white/90 text-[#1F1610] text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md border border-[#DFCFC0]">
                  STAGE {activeStage.stepNumber} / 08
                </span>
              </div>

              {/* Metric Overlay Badge */}
              <div className="absolute bottom-4 right-4 bg-[#FFFDF9]/95 backdrop-blur-md border border-[#DFC7A2] rounded-2xl p-3 shadow-lg flex items-center space-x-3 max-w-[200px]">
                <div className="w-8 h-8 rounded-xl bg-[#8B3214]/10 text-[#8B3214] flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4 text-[#8B3214]" />
                </div>
                <div>
                  <p className="text-[10px] text-[#7A6455] font-semibold uppercase leading-tight">
                    {isKn ? activeStage.metricLabel_kn : activeStage.metricLabel_en}
                  </p>
                  <p className="text-xs font-bold text-[#1F1610] mt-0.5">{activeStage.metricValue}</p>
                </div>
              </div>

              {/* Stage Step Indicator Indicator in Bottom-Left */}
              <div className="absolute bottom-4 left-4 text-white max-w-[50%]">
                <p className="text-[11px] font-mono text-amber-300 font-bold">INDIMA SPICE LAB</p>
                <p className="text-xs font-bold text-white/90 truncate">
                  {isKn ? activeStage.subtitle_kn : activeStage.subtitle_en}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Stage Narrative, Heritage Truths & Next/Prev Controls */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#8B3214] uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#8B3214] animate-ping" />
                <span>
                  {isKn ? `ಹಂತ ${activeStage.stepNumber} / ೮` : `Stage ${activeStage.stepNumber} of 08`}
                </span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1F1610] leading-tight">
                {isKn ? activeStage.title_kn : activeStage.title_en}
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-[#8B3214]">
                {isKn ? activeStage.subtitle_kn : activeStage.subtitle_en}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-[#5C483B] leading-relaxed font-normal">
              {isKn ? activeStage.description_kn : activeStage.description_en}
            </p>

            {/* Key Highlight Pod */}
            <div className="bg-[#FAF7F2] border border-[#DFC7A2] rounded-2xl p-4 flex items-center space-x-3.5">
              <div className="p-2.5 rounded-xl bg-[#8B3214] text-white shrink-0 shadow-xs">
                <Leaf className="w-4 h-4 text-amber-200" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#8B3214] uppercase tracking-wider">
                  {isKn ? 'ನಮ್ಮ ಗ್ಯಾರಂಟಿ' : 'The Indima Difference'}
                </p>
                <p className="text-xs font-bold text-[#1F1610] mt-0.5">
                  {isKn ? activeStage.keyHighlight_kn : activeStage.keyHighlight_en}
                </p>
              </div>
            </div>

            {/* Bottom Controls & Call to Action */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {/* Stepper Buttons (Prev / Next & Play / Pause) */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={prevStage}
                  aria-label="Previous spice stage"
                  className="p-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F5EFEB] border border-[#DFC7A2] text-[#1F1610] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F5EFEB] border border-[#DFC7A2] text-xs font-bold text-[#1F1610] transition-colors cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 text-[#8B3214]" />
                      <span>{isKn ? 'ನಿಲ್ಲಿಸು' : 'Pause'}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-[#8B3214]" />
                      <span>{isKn ? 'ಸ್ವಯಂ ಚಲನೆ' : 'Auto Play'}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={nextStage}
                  aria-label="Next spice stage"
                  className="p-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F5EFEB] border border-[#DFC7A2] text-[#1F1610] transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Direct Shop Link */}
              <button
                type="button"
                onClick={scrollToProducts}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#8B3214] hover:bg-[#72270E] text-white text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer ml-auto"
              >
                <span>{isKn ? 'ಮಸಾಲೆಗಳನ್ನು ಖರೀದಿಸಿ' : 'Shop Stone-Ground Spices'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
