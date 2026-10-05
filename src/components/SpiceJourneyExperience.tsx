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
  Compass,
  Thermometer,
  Utensils,
  Filter,
  Wind,
  HeartHandshake
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { SpiceParticlesCanvas } from './SpiceParticlesCanvas';
import {
  rawSpicesImg,
  spiceCleanImg,
  stoneGrindImg,
  spiceBlendImg,
  spicePackImg,
  spiceKitchenImg
} from '../assets/images';

export interface JourneyStage {
  id: string;
  stepNumber: string;
  badge: string;
  title_en: string;
  title_kn: string;
  subtitle_en: string;
  subtitle_kn: string;
  headline_en: string;
  headline_kn: string;
  description_en: string;
  description_kn: string;
  keyHighlight_en: string;
  keyHighlight_kn: string;
  metricLabel_en: string;
  metricLabel_kn: string;
  metricValue: string;
  icon: React.ComponentType<{ className?: string }>;
  image: string;
  accentColor: string;
  gradientBg: string;
  purityBadge_en: string;
  purityBadge_kn: string;
}

const JOURNEY_STAGES: JourneyStage[] = [
  {
    id: 'whole_spices',
    stepNumber: '01',
    badge: 'RAW ORIGIN',
    title_en: 'Whole Spices',
    title_kn: 'ನೈಸರ್ಗಿಕ ಕಾಳು ಮಸಾಲೆಗಳು',
    subtitle_en: 'Every flavour begins somewhere',
    subtitle_kn: 'ಪ್ರತಿಯೊಂದು ಸ್ವಾದಕ್ಕೂ ಒಂದು ಪವಿತ್ರ ಮೂಲವಿದೆ',
    headline_en: 'FROM WHOLE SPICE',
    headline_kn: 'ಕಾಳು ಮಸಾಲೆಗಳ ಪವಿತ್ರ ಮೂಲ',
    description_en:
      'We harvest plump stemless Byadgi chillies with naturally high oleoresin, fragrant round coriander seeds, rich golden Salem turmeric fingers, and bold Malabar peppercorns directly from generational Karnataka farm plots.',
    description_kn:
      'ಹಾವೇರಿಯ ಹೊಲಗಳಿಂದ ಬ್ಯಾಡಗಿ ಮೆಣಸಿನಕಾಯಿ, ಸುವಾಸನಾಭರಿತ ಧನಿಯಾ ಕಾಳುಗಳು, ಸುವರ್ಣ ಅರಿಶಿನ ಕೊಂಬುಗಳು ಮತ್ತು ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಕಾಳುಮೆಣಸನ್ನು ನೈಜ ಕೃಷಿಕರಿಂದ ನೇರವಾಗಿ ಸಂಗ್ರಹಿಸುತ್ತೇವೆ.',
    keyHighlight_en: 'Single-origin Karnataka crops with dense essential oils',
    keyHighlight_kn: 'ನೈಸರ್ಗಿಕ ಗಾಢ ಬಣ್ಣ ಮತ್ತು ಗರಿಷ್ಠ ತೈಲ ಸಾಂದ್ರತೆ',
    metricLabel_en: 'Origin Sourcing',
    metricLabel_kn: 'ಮೂಲ ಸಂಗ್ರಹ',
    metricValue: '100% Single Origin',
    icon: Compass,
    image: rawSpicesImg,
    accentColor: '#C0392B',
    gradientBg: 'from-amber-950/80 via-red-950/70 to-stone-900/90',
    purityBadge_en: 'WHOLE HARVEST',
    purityBadge_kn: 'ನೈಜ ಕಾಳುಗಳು'
  },
  {
    id: 'selection_cleaning',
    stepNumber: '02',
    badge: 'SELECTION',
    title_en: 'Selection & Cleaning',
    title_kn: 'ಆಯ್ಕೆ ಮತ್ತು ಪರಿಶುದ್ಧತೆ',
    subtitle_en: 'Carefully prepared before processing',
    subtitle_kn: 'ಸಂಸ್ಕರಣೆಗೆ ಮುನ್ನ ಕೈಯಿಂದ ಕೇರಿ ಶುದ್ಧೀಕರಣ',
    headline_en: 'ARTISANAL WINNOWING',
    headline_kn: 'ಕೈಯಿಂದ ಆರಿಸುವ ಪರಿಶುದ್ಧತೆ',
    description_en:
      'Carefully prepared before processing. In traditional bamboo trays, artisans manually winnow, de-stem, and sort every batch to eliminate dust, hollow pods, and field debris, ensuring only wholesome spice kernels move forward.',
    description_kn:
      'ಸಂಸ್ಕರಣೆಗೆ ಮುನ್ನ ಅತ್ಯಂತ ಎಚ್ಚರಿಕೆಯಿಂದ ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತದೆ. ಸಾಂಪ್ರದಾಯಿಕ ಮೊರದಲ್ಲಿ ಕೇರಿ, ತೊಟ್ಟು ಮತ್ತು ಧೂಳನ್ನು ತೆಗೆದು ಕೇವಲ ಪರಿಪೂರ್ಣ ಮಸಾಲೆ ಕಾಳುಗಳನ್ನು ಮಾತ್ರ ಸಂಸ್ಕರಣೆಗೆ ಆರಿಸಲಾಗುತ್ತದೆ.',
    keyHighlight_en: 'Zero stems, dust, or hollow chaff — triple-cleaned',
    keyHighlight_kn: 'ಯಾವುದೇ ತೊಟ್ಟು, ಹೊಟ್ಟು ಅಥವಾ ಧೂಳಿಲ್ಲದ ಪರಿಶುದ್ಧತೆ',
    metricLabel_en: 'Purity Factor',
    metricLabel_kn: 'ಶುದ್ಧತಾ ಪ್ರಮಾಣ',
    metricValue: '99.9% Cleaned',
    icon: Filter,
    image: spiceCleanImg,
    accentColor: '#264E36',
    gradientBg: 'from-emerald-950/80 via-stone-900/70 to-amber-950/90',
    purityBadge_en: 'HAND SORTED',
    purityBadge_kn: 'ಕೈಯಿಂದ ಆರಿಸಿದ್ದು'
  },
  {
    id: 'preparation_drying',
    stepNumber: '03',
    badge: 'PREPARATION',
    title_en: 'Sun-Curing & Slow Roast',
    title_kn: 'ಬಿಸಿಲಿನಲ್ಲಿ ಒಣಗಿಸಿ ಮಂದ ಉರಿಯಲ್ಲಿ ಹುರಿಯುವುದು',
    subtitle_en: 'Awakening aromatic volatiles naturally',
    subtitle_kn: 'ನೈಸರ್ಗಿಕ ಸುವಾಸನಾ ತೈಲಗಳನ್ನು ಜಾಗೃತಗೊಳಿಸುವ ವಿಧಾನ',
    headline_en: 'SOLAR & FIRE CURED',
    headline_kn: 'ಬಿಸಿಲು ಮತ್ತು ಮಂದ ಉರಿ',
    description_en:
      'Sun-cured on hygienic raised mats under warm South Indian skies, then gently toasted in seasoned cast-iron kadai over low wood embers. This precise low heat awakens natural oils without blistering or scorching the delicate skins.',
    description_kn:
      'ಬಿಸಿಲಿನಲ್ಲಿ ನೈಸರ್ಗಿಕವಾಗಿ ಒಣಗಿಸಿ, ಸಾಂಪ್ರದಾಯಿಕ ಕಬ್ಬಿಣದ ಬಾಣಲೆಯಲ್ಲಿ ಮಂದ ಉರಿಯಲ್ಲಿ ಹುರಿಯಲಾಗುತ್ತದೆ. ಇದರಿಂದ ಕಾಳುಗಳು ಸುಡದೆ ಸುಗಂಧ ತೈಲಗಳು ಪೂರ್ಣ ಪ್ರಮಾಣದಲ್ಲಿ ಜಾಗೃತಗೊಳ್ಳುತ್ತವೆ.',
    keyHighlight_en: 'Gentle dry-roasting preserves fragrant aromatic terpenes',
    keyHighlight_kn: 'ಸುಗಂಧ ತೈಲಗಳು ಕರಗದಂತೆ ಕಾಪಾಡುವ ನಿಧಾನ ವಿಧಾನ',
    metricLabel_en: 'Thermal Control',
    metricLabel_kn: 'ಶಾಖ ನಿಯಂತ್ರಣ',
    metricValue: 'Low Wood Embers',
    icon: Sun,
    image: rawSpicesImg,
    accentColor: '#D49B28',
    gradientBg: 'from-amber-950/85 via-orange-950/70 to-stone-900/90',
    purityBadge_en: 'SLOW ROASTED',
    purityBadge_kn: 'ಮಂದ ಉರಿ ಹುರಿಯುವಿಕೆ'
  },
  {
    id: 'stone_grinding',
    stepNumber: '04',
    badge: 'GRINDING',
    title_en: 'Cold Stone-Milling',
    title_kn: 'ಸಾಂಪ್ರದಾಯಿಕ ಕಲ್ಲಿನ ಬೀಸುವಿಕೆ',
    subtitle_en: 'Low-RPM Granite Mill below 38°C',
    subtitle_kn: 'ತಣ್ಣನೆಯ ಕಲ್ಲಿನಲ್ಲಿ ನಿಧಾನವಾಗಿ ಬೀಸಿದ ಪುಡಿ',
    headline_en: 'AUTHENTIC STONE GRIND',
    headline_kn: 'ಅಪ್ಪಟ ಕಲ್ಲಿನ ಬೀಸುವಿಕೆ',
    description_en:
      'High-speed industrial blenders heat up beyond 85°C, vaporizing precious aroma and essential nutrients. Our low-RPM natural granite mills grind gently below 38°C, yielding coarse, textured masala with bursting flavours.',
    description_kn:
      'ಕಾರ್ಖಾನೆಗಳ ವೇಗದ ಮೆಷಿನ್‌ಗಳು ಬಿಸಿಯಾಗಿ ಮಸಾಲೆಯ ರುಚಿ ಹಾಳುಮಾಡುತ್ತವೆ. ಆದರೆ ನಮ್ಮ ಸಾಂಪ್ರದಾಯಿಕ ಗ್ರಾನೈಟ್ ಕಲ್ಲು ತಣ್ಣನೆಯ ಉಷ್ಣತೆಯಲ್ಲಿ (೩೮°C ಗಿಂತ ಕಡಿಮೆ) ನಿಧಾನವಾಗಿ ಬೀಸಿ ನೈಸರ್ಗಿಕ ಸುವಾಸನೆಯನ್ನು ಕಾಪಾಡುತ್ತದೆ.',
    keyHighlight_en: 'Aroma-safe cold-milled texture without thermal destruction',
    keyHighlight_kn: 'ಕಡಿಮೆ ಶಾಖದಲ್ಲಿ ಬೀಸಿ ಸುವಾಸನೆ ಮತ್ತು ಪೋಷಕಾಂಶ ರಕ್ಷಣೆ',
    metricLabel_en: 'Milling Temp',
    metricLabel_kn: 'ಬೀಸುವ ಉಷ್ಣತೆ',
    metricValue: '< 38°C Cold Stone',
    icon: Flame,
    image: stoneGrindImg,
    accentColor: '#993300',
    gradientBg: 'from-stone-950/90 via-red-950/70 to-amber-950/90',
    purityBadge_en: 'COLD MILLED',
    purityBadge_kn: 'ಕಲ್ಲಿನ ಪುಡಿ'
  },
  {
    id: 'spice_blending',
    stepNumber: '05',
    badge: 'BLENDING',
    title_en: 'Heritage Recipe Blending',
    title_kn: 'ಪಾರಂಪರಿಕ ಸೂತ್ರಗಳ ಹದವಾದ ಮಿಶ್ರಣ',
    subtitle_en: 'Generational Karnataka Kitchen Formulations',
    subtitle_kn: 'ಮೈಸೂರು, ಉಡುಪಿ ಮತ್ತು ಬೆಂಗಳೂರು ಮನೆ ಪಾಕಪದ್ಧತಿ',
    headline_en: 'ARTISANAL FORMULATION',
    headline_kn: 'ಪಾರಂಪರಿಕ ಸುವಾಸನಾ ಸೂತ್ರ',
    description_en:
      'Stone-ground spices are harmonized in micro-batches with roasted copra, Malnad cloves, Marathi Moggu, and stone flower according to sacred regional Karnataka culinary proportions passed down through generations.',
    description_kn:
      'ಬಿಸಿಬೇಳೆಬಾತ್, ಸಾಂಬಾರ್, ರಸಂ ಮತ್ತು ಚಟ್ನಿ ಪುಡಿಗಳಿಗೆ ಬೇಕಾದ ಪ್ರತಿಯೊಂದು ಸಾಂಬಾರ ಪದಾರ್ಥಗಳನ್ನು ಶತಮಾನಗಳ ಹಳೆಯ ಕರ್ನಾಟಕದ ಅಜ್ಜಿ ಮನೆಯ ಪಾಕವಿಧಾನದಂತೆ ಅಳತೆ ಮಾಡಿ ಬೆರೆಸಲಾಗುತ್ತದೆ.',
    keyHighlight_en: 'Masterfully balanced heat, color, sweetness, and earthy warmth',
    keyHighlight_kn: 'ಸಮತೋಲಿತ ಸಾಂಪ್ರದಾಯಿಕ ದಕ್ಷಿಣ ಭಾರತದ ರುಚಿ',
    metricLabel_en: 'Recipe Heritage',
    metricLabel_kn: 'ಪಾಕ ಪರಂಪರೆ',
    metricValue: 'Generational Secret',
    icon: Layers,
    image: spiceBlendImg,
    accentColor: '#C5A059',
    gradientBg: 'from-amber-950/85 via-stone-900/75 to-red-950/90',
    purityBadge_en: 'HERITAGE BLEND',
    purityBadge_kn: 'ಪಾರಂಪರಿಕ ಮಿಶ್ರಣ'
  },
  {
    id: 'quality_testing',
    stepNumber: '06',
    badge: 'QUALITY',
    title_en: 'Uncompromised Purity Check',
    title_kn: 'ಪರಿಶುದ್ಧತೆಯ ಗುಣಮಟ್ಟ ಪರೀಕ್ಷೆ',
    subtitle_en: 'Zero chemicals, artificial dyes, or fillers',
    subtitle_kn: 'ಕೃತಕ ಬಣ್ಣ, ಸುಡಾನ್ ಡೈ ಅಥವಾ ಕಲಬೆರಕೆ ಇಲ್ಲ',
    headline_en: '100% PURE TESTED',
    headline_kn: 'ಶುದ್ಧತೆಯ ಖಾತರಿ',
    description_en:
      'Every batch undergoes thorough moisture verification, volatile oil quantification, and purity screening. We strictly reject synthetic Sudan red dyes, spent chillies, starch fillers, MSG, and chemical anti-caking agents.',
    description_kn:
      'ಪ್ರತಿಯೊಂದು ಬ್ಯಾಚ್‌ನ ತೇವಾಂಶ ಮತ್ತು ನೈಸರ್ಗಿಕ ಸುಗಂಧವನ್ನು ಪರೀಕ್ಷಿಸಲಾಗುತ್ತದೆ. ಯಾವುದೇ ಕೃತಕ ಬಣ್ಣ, ಸೀಮೆಸುಣ್ಣ, ಮರದ ಪುಡಿ ಅಥವಾ ರಾಸಾಯನಿಕ ಸಂರಕ್ಷಕಗಳನ್ನು ಎಂದಿಗೂ ಬಳಸುವುದಿಲ್ಲ.',
    keyHighlight_en: 'Unadulterated spice potency: requires 50% less pinch per dish',
    keyHighlight_kn: 'ಅರ್ಧ ಚಮಚದಲ್ಲೇ ಅತಿ ಹೆಚ್ಚು ಗಾಢವಾದ ನೈಜ ರುಚಿ',
    metricLabel_en: 'Adulteration',
    metricLabel_kn: 'ಕಲಬೆರಕೆ',
    metricValue: '0% Fillers / Dyes',
    icon: Award,
    image: spiceBlendImg,
    accentColor: '#264E36',
    gradientBg: 'from-emerald-950/85 via-stone-900/75 to-amber-950/90',
    purityBadge_en: 'CERTIFIED PURE',
    purityBadge_kn: 'ಪ್ರಮಾಣೀಕೃತ ಶುದ್ಧ'
  },
  {
    id: 'aroma_packaging',
    stepNumber: '07',
    badge: 'PACKAGING',
    title_en: 'Aroma-Lock Eco Packaging',
    title_kn: 'ಸುವಾಸನೆ ಲಾಕ್ ಮಾಡುವ ಪ್ಯಾಕಿಂಗ್',
    subtitle_en: 'Multi-layer oxygen and moisture barrier',
    subtitle_kn: 'ತೇವಾಂಶ ಮತ್ತು ಬೆಳಕು ತಾಗದಂತೆ ನೈಸರ್ಗಿಕ ಸಂರಕ್ಷಣೆ',
    headline_en: 'AROMA SEALED FOR YOU',
    headline_kn: 'ಸುವಾಸನೆಯ ಶಾಶ್ವತ ಲಾಕ್',
    description_en:
      'Sealed in recyclable, food-grade multi-layer moisture and UV-barrier pouches within hours of milling to lock in delicate aromatic volatile oils until you cut open the seal in your kitchen.',
    description_kn:
      'ಕಲ್ಲಿನಲ್ಲಿ ಬೀಸಿದ ಕೆಲವೇ ಗಂಟೆಗಳಲ್ಲಿ ಗಾಳಿ, ಬೆಳಕು ಮತ್ತು ತೇವಾಂಶ ತಾಗದಂತಹ ವಿಶೇಷ ಸುವಾಸನೆ-ಲಾಕ್ ಕವರ್‌ಗಳಲ್ಲಿ ಪ್ಯಾಕ್ ಮಾಡಲಾಗುತ್ತದೆ. ನೀವು ತೆರೆದಾಗ ತಕ್ಷಣ ಅಜ್ಜಿಯ ಮನೆಯ ಪರಿಮಳ ಹೊರಸೂಸುತ್ತದೆ.',
    keyHighlight_en: 'Guarantees fresh-milled aroma and flavor for up to 12 months',
    keyHighlight_kn: '೧೨ ತಿಂಗಳವರೆಗೆ ಗರಿಷ್ಠ ತಾಜಾತನ ಮತ್ತು ಪರಿಮಳ ಉಳಿಯುತ್ತದೆ',
    metricLabel_en: 'Shelf Freshness',
    metricLabel_kn: 'ತಾಜಾತನ ಅವಧಿ',
    metricValue: '12 Months Fresh',
    icon: Package,
    image: spicePackImg,
    accentColor: '#8B3214',
    gradientBg: 'from-stone-950/90 via-red-950/80 to-amber-950/90',
    purityBadge_en: 'VACUUM SHIELDED',
    purityBadge_kn: 'ಸುವಾಸನೆ ಲಾಕ್'
  },
  {
    id: 'to_your_kitchen',
    stepNumber: '08',
    badge: 'YOUR KITCHEN',
    title_en: 'To Your Kitchen',
    title_kn: 'ನಿಮ್ಮ ಮನೆಯ ಅಡುಗೆ ಕೋಣೆಗೆ',
    subtitle_en: 'Wholesome everyday South Indian nourishment',
    subtitle_kn: 'ಪ್ರತಿದಿನದ ಸಾತ್ವಿಕ, ಆರೋಗ್ಯಕರ ಮತ್ತು ರುಚಿಕರ ಊಟ',
    headline_en: 'DELIGHT AT YOUR DINING TABLE',
    headline_kn: 'ನಿಮ್ಮ ಮನೆಯ ಊಟದ ತಟ್ಟೆಯಲ್ಲಿ ಸಂತಸ',
    description_en:
      'From the stone mortar to your simmering brass pot: as the hot tadka crackles with pure ghee, whole aroma fills your home. Wholesome Karnataka taste that nourishes your family and brings authentic heritage to every meal.',
    description_kn:
      'ನಮ್ಮ ಕಲ್ಲಿನ ಬೀಸುವ ಕಲ್ಲಿನಿಂದ ನಿಮ್ಮ ಅಡುಗೆ ಮನೆಗೆ: ತುಪ್ಪದ ಒಗ್ಗರಣೆಯಲ್ಲಿ ಸಿಡಿಯುವ ಘಮಲು ಇಡೀ ಮನೆಯನ್ನು ತುಂಬುತ್ತದೆ. ಶುದ್ಧ, ಸಾತ್ವಿಕ ಮತ್ತು ತಾಯಿಯ ಕೈರುಚಿಯ ಮಸಾಲೆಗಳಿಂದ ನಿಮ್ಮ ಮನೆಮಂದಿಯ ಮುಖದಲ್ಲಿ ಸಂತಸ ತರುವ ಅದ್ಭುತ ರುಚಿ.',
    keyHighlight_en: 'Doorstep direct dispatch from Bengaluru mill across India',
    keyHighlight_kn: 'ಬೆಂಗಳೂರು ಮಿಲ್‌ನಿಂದ ನೇರವಾಗಿ ಮನೆ ಬಾಗಿಲಿಗೆ ತಾಜಾ ವಿತರಣೆ',
    metricLabel_en: 'Customer Loved',
    metricLabel_kn: 'ಮೆಚ್ಚಿನ ಬ್ರ್ಯಾಂಡ್',
    metricValue: '5.0 ★ Rated (1.2k+)',
    icon: Utensils,
    image: spiceKitchenImg,
    accentColor: '#D49B28',
    gradientBg: 'from-amber-950/90 via-red-950/70 to-stone-900/90',
    purityBadge_en: 'KITCHEN READY',
    purityBadge_kn: 'ಅಡುಗೆಗೆ ಸಿದ್ಧ'
  }
];

export const SpiceJourneyExperience: React.FC = () => {
  const { language } = useLanguage();
  const isKn = language === 'kn';

  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });
  const [interactiveTemp, setInteractiveTemp] = useState(34);
  const [interactivePurity, setInteractivePurity] = useState(100);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const visualCardRef = useRef<HTMLDivElement | null>(null);

  const activeStage = JOURNEY_STAGES[activeStageIdx];

  // Auto-play interval
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveStageIdx(prev => (prev + 1) % JOURNEY_STAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Gentle stone milling temp fluctuation for simulation
  useEffect(() => {
    if (activeStage.id === 'stone_grinding') {
      const interval = setInterval(() => {
        setInteractiveTemp(32 + Math.floor(Math.random() * 4));
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [activeStage.id]);

  // 3D Tilt calculation on mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!visualCardRef.current) return;
    const rect = visualCardRef.current.getBoundingClientRect();
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

  const nextStage = () => {
    setActiveStageIdx(prev => (prev + 1) % JOURNEY_STAGES.length);
  };

  const prevStage = () => {
    setActiveStageIdx(prev => (prev - 1 + JOURNEY_STAGES.length) % JOURNEY_STAGES.length);
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
      ref={containerRef}
      className="py-12 sm:py-20 lg:py-24 px-3.5 sm:px-6 lg:px-8 max-w-7xl 2xl:max-w-[1500px] mx-auto w-full relative"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-amber-500/5 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-red-600/5 blur-[140px] rounded-full pointer-events-none" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3.5 mb-8 sm:mb-14 relative z-10">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-[#FFFDF9] border border-[#DFC7A2] rounded-full text-xs font-bold text-[#8B3214] shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#993300] animate-pulse" />
          <span className="uppercase tracking-widest font-mono text-[11px]">
            {isKn ? 'ಕಾಳು ಮಸಾಲೆಯಿಂದ ನಿಮ್ಮ ಅಡುಗೆ ಮನೆಗೆ' : 'FROM SPICE TO KITCHEN'}
          </span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1F1610] tracking-tight leading-tight">
          {isKn
            ? 'ಅಪ್ಪಟ ಕಲ್ಲಿನಲ್ಲಿ ಬೀಸಿದ ಮಸಾಲೆಗಳ ೮ ಹಂತದ ಪವಿತ್ರ ಪಯಣ'
            : 'The Journey of a Spice: From Whole Spice to Your Kitchen'}
        </h2>

        <p className="text-xs sm:text-sm lg:text-base text-[#5C483B] leading-relaxed max-w-2xl mx-auto font-normal">
          {isKn
            ? 'ಹಾವೇರಿಯ ತೋಟಗಳಿಂದ ನಿಮ್ಮ ಮನೆಯ ಸಾಂಬಾರ್ ಪಾತ್ರೆಯವರೆಗೆ, ಕಲಬೆರಕೆ ಇಲ್ಲದೆ ನೈಸರ್ಗಿಕ ಕಲ್ಲಿನ ಬೀಸುವ ವಿಧಾನದ ಅದ್ಭುತ ಕಥೆ.'
            : 'Experience the living transformation of single-origin Karnataka spices as whole seeds are sorted, wood-fire roasted, cold stone-milled, and aroma-sealed for your home.'}
        </p>

        {/* Global Progress Bar Across the 8 Stages */}
        <div className="pt-2 max-w-md mx-auto">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#8B3214] mb-1.5">
            <span>
              {isKn ? 'ಹಂತ' : 'STAGE'} {activeStage.stepNumber} / 08
            </span>
            <span className="text-[#5C483B]">{activeStage.badge}</span>
          </div>
          <div className="w-full h-2 bg-[#E8DFD3] rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#8B3214] via-[#D49B28] to-[#8B3214] rounded-full transition-all duration-500 ease-out shadow-xs"
              style={{ width: `${((activeStageIdx + 1) / JOURNEY_STAGES.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Interactive Stage Experience Pod */}
      <div className="bg-[#FFFDF9] border border-[#DFC7A2] rounded-3xl p-4 sm:p-8 lg:p-10 shadow-lg relative overflow-hidden">
        {/* Living Particle & Whole Spice Canvas Layer */}
        <SpiceParticlesCanvas
          particleCount={32}
          wholeSpiceCount={12}
          showWholeSpices={true}
          opacity={0.7}
          activeStageId={activeStage.id}
        />

        {/* Interactive 8-Stage Timeline Navigation Bar */}
        <div className="relative z-10 flex items-center gap-2 overflow-x-auto pb-3 mb-6 sm:mb-8 border-b border-[#E8DFD3]/80 scrollbar-none">
          {JOURNEY_STAGES.map((stg, idx) => {
            const isActive = idx === activeStageIdx;
            const Icon = stg.icon;
            return (
              <button
                key={stg.id}
                type="button"
                onClick={() => {
                  setActiveStageIdx(idx);
                  setIsPlaying(false);
                }}
                className={`group flex items-center space-x-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 shrink-0 cursor-pointer ${
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
                <span className="whitespace-nowrap font-medium">{isKn ? stg.title_kn : stg.title_en}</span>
              </button>
            );
          })}
        </div>

        {/* 3D Stage Visual & Narrative Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center relative z-10">
          {/* Left Column: Interactive 3D Card with Perspective Tilt */}
          <div
            className="lg:col-span-6 relative perspective-[1200px]"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div
              ref={visualCardRef}
              style={{
                transform: `rotateX(${cardTilt.x}deg) rotateY(${cardTilt.y}deg)`,
                transition: 'transform 0.15s ease-out'
              }}
              className="relative aspect-16/10 sm:aspect-16/10 w-full rounded-3xl overflow-hidden shadow-2xl border border-[#DFC7A2] bg-[#1F1610] group"
            >
              {/* Main Stage Photograph */}
              <img
                src={activeStage.image}
                alt={isKn ? activeStage.title_kn : activeStage.title_en}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />

              {/* Ambient Cinematic Gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-t ${activeStage.gradientBg} opacity-80 mix-blend-multiply`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1F1610] via-transparent to-black/30" />

              {/* Top Accent Badges */}
              <div className="absolute top-4 left-4 flex items-center space-x-2">
                <span className="bg-[#8B3214] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-amber-300/30">
                  {isKn ? activeStage.purityBadge_kn : activeStage.purityBadge_en}
                </span>
                <span className="bg-white/90 text-[#1F1610] text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md border border-[#DFCFC0]">
                  STAGE {activeStage.stepNumber} / 08
                </span>
              </div>

              {/* Metric Overlay Badge */}
              <div className="absolute bottom-4 right-4 bg-[#FFFDF9]/95 backdrop-blur-md border border-[#DFC7A2] rounded-2xl p-3 shadow-lg flex items-center space-x-3 max-w-[210px]">
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

              {/* Stage Step Indicator in Bottom-Left */}
              <div className="absolute bottom-4 left-4 text-white max-w-[55%] space-y-0.5">
                <p className="text-[10px] font-mono text-amber-300 font-bold tracking-wider">
                  {isKn ? 'ಇಂದಿಮಾ ಸಾಂಬಾರ್ ವಿಜ್ಞಾನ' : 'INDIMA HERITAGE CRAFT'}
                </p>
                <p className="text-xs sm:text-sm font-bold text-white/95 truncate">
                  {isKn ? activeStage.headline_kn : activeStage.headline_en}
                </p>
              </div>

              {/* Real-time Stage Special Indicators */}
              {activeStage.id === 'stone_grinding' && (
                <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-md border border-amber-400/40 rounded-xl px-2.5 py-1 flex items-center space-x-1.5 text-white">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold">{interactiveTemp}°C COOL</span>
                </div>
              )}

              {activeStage.id === 'quality_testing' && (
                <div className="absolute top-4 right-4 bg-emerald-950/80 backdrop-blur-md border border-emerald-400/40 rounded-xl px-2.5 py-1 flex items-center space-x-1.5 text-white">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-mono font-bold">0% ADULTERATION</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Stage Narrative, Heritage Truths & Interactive Stepper */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#8B3214] uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8B3214] animate-ping" />
                <span className="font-mono">
                  {isKn ? `ಹಂತ ${activeStage.stepNumber} / ೦೮` : `Stage ${activeStage.stepNumber} of 08`}
                </span>
                <span className="text-[#DFC7A2]">•</span>
                <span className="text-[#5C483B]">{activeStage.badge}</span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1F1610] leading-tight">
                {isKn ? activeStage.headline_kn : activeStage.headline_en}
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
