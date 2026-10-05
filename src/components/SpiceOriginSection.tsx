import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { MapPin, Sparkles, Compass, Sun, Mountain, Leaf, Droplets, ArrowRight } from 'lucide-react';

interface TerroirRegion {
  id: string;
  name_en: string;
  name_kn: string;
  location_en: string;
  location_kn: string;
  spice_en: string;
  spice_kn: string;
  soil_en: string;
  soil_kn: string;
  altitude: string;
  profile_en: string;
  profile_kn: string;
  accentColor: string;
  bgGradient: string;
  badge: string;
  image: string;
}

export const SpiceOriginSection: React.FC = () => {
  const { language } = useLanguage();
  const isKn = language === 'kn';
  const [activeRegion, setActiveRegion] = useState<string>('byadgi');

  const regions: TerroirRegion[] = [
    {
      id: 'byadgi',
      name_en: 'Byadgi & Haveri Plains',
      name_kn: 'ಬ್ಯಾಡಗಿ ಮತ್ತು ಹಾವೇರಿ ಬಯಲುಸೀಮೆ',
      location_en: 'Central Karnataka • GI Tagged Terroir',
      location_kn: 'ಮಧ್ಯ ಕರ್ನಾಟಕ • ಭೌಗೋಳಿಕ ಮಾನ್ಯತೆ (GI Tag)',
      spice_en: 'Wrinkled Byadgi Chilli (Kaddi & Dabbi)',
      spice_kn: 'ಬ್ಯಾಡಗಿ ಕೆಂಪು ಮೆಣಸಿನಕಾಯಿ (ಕಡ್ಡಿ ಮತ್ತು ಡಬ್ಬಿ)',
      soil_en: 'Rich Red Loamy Soil with High Mineral Iron',
      soil_kn: 'ಕಬ್ಬಿಣಾಂಶಯುಕ್ತ ಫಲವತ್ತಾದ ಕೆಂಪು ಮಣ್ಣು',
      altitude: '650m ASL',
      profile_en:
        'World-renowned for its brilliant deep crimson color (high ASTA color value) and mild, sweet lingering warmth without harsh throat-burning pungency.',
      profile_kn:
        'ಗಂಟಲು ಉರಿಯದ ಸೌಮ್ಯ ಖಾರ ಮತ್ತು ಕಣ್ಣು ಕೋರೈಸುವ ನೈಸರ್ಗಿಕ ಗಾಢ ಕೆಂಪು ಬಣ್ಣಕ್ಕೆ ಜಗತ್ಪ್ರಸಿದ್ಧ. ಸಾಂಬಾರ್, ರಸಂಗೆ ಅದ್ಭುತ ಬಣ್ಣ ನೀಡುತ್ತದೆ.',
      accentColor: '#C0392B',
      bgGradient: 'from-[#2A110C] via-[#1E0D09] to-[#140A07]',
      badge: 'GI TAGGED',
      image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 'chamarajanagar',
      name_en: 'Chamarajanagar & Salem Belt',
      name_kn: 'ಚಾಮರಾಜನಗರ ಮತ್ತು ಸೇಲಂ ಕಣಿವೆ',
      location_en: 'Southern Karnataka Foothills',
      location_kn: 'ದಕ್ಷಿಣ ಕರ್ನಾಟಕದ ಬೆಟ್ಟದ ತಪ್ಪಲು',
      spice_en: 'High-Curcumin Golden Turmeric (Haridra)',
      spice_kn: 'ಹೆಚ್ಚು ಕುರ್ಕುಮಿನ್ ಹೊಂದಿರುವ ಸುವರ್ಣ ಅರಿಶಿನ',
      soil_en: 'Well-Drained Sandy Clay Loam, Organic Rich',
      soil_kn: 'ನೈಸರ್ಗಿಕ ಸಾವಯವ ಅಂಶವುಳ್ಳ ಗೋಡು ಮಣ್ಣು',
      altitude: '720m ASL',
      profile_en:
        'Contains 8.5%+ natural Curcumin oils. Sun-cured on natural stone courtyards to preserve volatile turmerone and deep earthy medicinal fragrance.',
      profile_kn:
        '೮.೫% ಗೂ ಹೆಚ್ಚು ನೈಸರ್ಗಿಕ ಕುರ್ಕುಮಿನ್ ಅಂಶ. ಬಿಸಿಲಿನಲ್ಲಿ ಹದವಾಗಿ ಒಣಗಿಸಿ ತಯಾರಿಸಲ್ಪಟ್ಟ ದೈವಿಕ ರೋಗನಿರೋಧಕ ಸತ್ವವುಳ್ಳ ಅಪ್ಪಟ ಅರಿಶಿನ.',
      accentColor: '#D49B28',
      bgGradient: 'from-[#261A08] via-[#1D1305] to-[#140D04]',
      badge: '8.5%+ CURCUMIN',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 'coorg',
      name_en: 'Coorg & Western Ghats',
      name_kn: 'ಕೊಡಗು ಮತ್ತು ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಮಲೆನಾಡು',
      location_en: 'Misty Rainforest Slopes • Karnataka',
      location_kn: 'ದಟ್ಟ ಮಂಜಿನ ಮಲೆನಾಡಿನ ಕಾಡುಗಳು • ಕರ್ನಾಟಕ',
      spice_en: 'Tellicherry Bold Black Pepper & Green Cardamom',
      spice_kn: 'ದಪ್ಪ ಕಾಳಿನ ಕರಿಮೆಣಸು ಮತ್ತು ಹಸಿರು ಏಲಕ್ಕಿ',
      soil_en: 'Virgin Humus Forest Floor & Volcanic Andesite',
      soil_kn: 'ಹ್ಯೂಮಸ್ ಸಮೃದ್ಧ ಅರಣ್ಯದ ಕಾಡು ಮಣ್ಣು',
      altitude: '1,150m ASL',
      profile_en:
        'Known historically as "Black Gold". Hand-picked berries with maximum piperine density and pungent pine-citrus aroma.',
      profile_kn:
        'ಪುರಾತನ ಕಾಲದ "ಕಪ್ಪು ಚಿನ್ನ". ಮಲೆನಾಡಿನ ಮಂಜಿನಲ್ಲಿ ನೈಸರ್ಗಿಕವಾಗಿ ಬೆಳೆದ ದಪ್ಪ ಕಾಳುಗಳು, ಗರಿಷ್ಠ ಪೈಪರೀನ್ ಮತ್ತು ಘಾಟು ಸುವಾಸನೆ.',
      accentColor: '#4A6B34',
      bgGradient: 'from-[#142010] via-[#0E160B] to-[#0A1007]',
      badge: 'RAINFOREST TERROIR',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 'dharwad',
      name_en: 'Dharwad & Bellary Plains',
      name_kn: 'ಧಾರವಾಡ ಮತ್ತು ಬಳ್ಳಾರಿ ಬಯಲುಸೀಮೆ',
      location_en: 'Deccan Plateau • Karnataka',
      location_kn: 'ದಖನ್ ಪ್ರಸ್ಥಭೂಮಿ • ಕರ್ನಾಟಕ',
      spice_en: 'Aromatic Coriander Seeds & Cumin (Jeera)',
      spice_kn: 'ಸುವಾಸಿತ ಧನಿಯಾ ಕಾಳುಗಳು ಮತ್ತು ಜೀರಿಗೆ',
      soil_en: 'Deep Black Cotton Soil (Regur)',
      soil_kn: 'ಆಳವಾದ ಕಪ್ಪು ಹತ್ತಿ ಮಣ್ಣು (ರೆಗೂರ್)',
      altitude: '580m ASL',
      profile_en:
        'Rich in linalool essential oils, yielding a crisp, sweet citrusy top note that forms the foundational spine of authentic Bengaluru sambar and rasam.',
      profile_kn:
        'ನೈಸರ್ಗಿಕ ಲಿನಾಲೂಲ್ ತೈಲದ ಅಂಶ. ತಾಜಾ ಸಿಟ್ರಸ್ ಘಮಲು ಹೊಂದಿದ್ದು, ನಮ್ಮ ಸಾಂಬಾರ್ ಮತ್ತು ರಸಂಗೆ ಪಾರಂಪರಿಕ ಪರಿಮಳ ನೀಡುತ್ತದೆ.',
      accentColor: '#A06E35',
      bgGradient: 'from-[#22150C] via-[#1A1009] to-[#120B06]',
      badge: 'NATIVE SEEDLINE',
      image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&auto=format&fit=crop&q=80'
    }
  ];

  const current = regions.find(r => r.id === activeRegion) || regions[0];

  return (
    <section id="spice-origin-section" className="relative py-16 sm:py-24 bg-[#140E0A] text-[#FFF9F2] overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-radial from-[#24160F] via-[#140E0A] to-[#0D0805] pointer-events-none" />
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-amber-600/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-red-600/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl 2xl:max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header Kicker */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-xs font-mono tracking-widest text-amber-400 uppercase font-semibold">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>{isKn ? 'ಮಸಾಲೆಗಳ ಮೂಲ ಸ್ಥಳ' : 'PART 04 · SPICE ORIGIN'}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            {isKn ? (
              <>
                ಕರ್ನಾಟಕದ ಪುಣ್ಯ ಮಣ್ಣಿನಿಂದ <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200">
                  ಆಯ್ದ ಏಕ-ಮೂಲದ ಮಸಾಲೆಗಳು.
                </span>
              </>
            ) : (
              <>
                Single-Origin Provenance. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200">
                  Karnataka’s Sacred Spice Terroir.
                </span>
              </>
            )}
          </h2>

          <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto font-light leading-relaxed">
            {isKn
              ? 'ಪ್ರತಿಯೊಂದು ಮಸಾಲೆಯೂ ತನ್ನದೇ ಆದ ವಿಶಿಷ್ಟ ಮಣ್ಣು, ಹವಾಮಾನ ಮತ್ತು ಸೂರ್ಯನ ಶಾಖದಿಂದ ಅತ್ಯುನ್ನತ ಸುವಾಸನೆ ಪಡೆಯುತ್ತದೆ. ನಾವು ಯಾವುದೇ ಮಧ್ಯವರ್ತಿಗಳಿಲ್ಲದೆ ರೈತರ ಜಮೀನಿನಿಂದಲೇ ನೇರವಾಗಿ ಸಂಗ್ರಹಿಸುತ್ತೇವೆ.'
              : 'Every Indima spice begins in its ancestral micro-climate. Harvested at peak maturity from dedicated family farms across Karnataka and the Western Ghats.'}
          </p>
        </div>

        {/* Terroir Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-8 sm:mb-12">
          {regions.map(r => {
            const isSel = r.id === activeRegion;
            return (
              <button
                key={r.id}
                onClick={() => setActiveRegion(r.id)}
                type="button"
                className={`flex items-center space-x-2.5 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-300 cursor-pointer border ${
                  isSel
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-lg shadow-amber-950/60 scale-102 font-bold'
                    : 'bg-[#1F1510] border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                }`}
              >
                <MapPin className={`w-3.5 h-3.5 ${isSel ? 'text-amber-400' : 'text-stone-500'}`} />
                <span>{isKn ? r.name_kn : r.name_en}</span>
              </button>
            );
          })}
        </div>

        {/* Featured Terroir Interactive Showcase Card */}
        <div className="relative rounded-3xl overflow-hidden border border-amber-500/25 bg-gradient-to-br from-[#1C120D] to-[#120B08] p-6 sm:p-10 lg:p-12 shadow-2xl shadow-black/80">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Visual Terroir Imagery Column */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 aspect-[4/3] shadow-xl group">
                <img
                  src={current.image}
                  alt={current.spice_en}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0A07]/90 via-[#0F0A07]/30 to-transparent" />

                {/* Terroir Badge Pill */}
                <div className="absolute top-4 left-4 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-amber-400/40 text-[10px] font-mono tracking-widest text-amber-300 font-bold uppercase">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{current.badge}</span>
                </div>

                {/* Microclimate Location Tag */}
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-[11px] font-mono text-amber-300 uppercase tracking-widest font-semibold">
                    {isKn ? current.location_kn : current.location_en}
                  </p>
                  <p className="font-serif text-lg sm:text-xl font-bold text-white mt-0.5">
                    {isKn ? current.spice_kn : current.spice_en}
                  </p>
                </div>
              </div>
            </div>

            {/* Terroir Deep Dive Details Column */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs font-mono text-amber-400 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>{isKn ? 'ಮೂಲ ವಿವರಣೆ' : 'ORIGIN ARCHIVE'}</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  {isKn ? current.name_kn : current.name_en}
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light">
                  {isKn ? current.profile_kn : current.profile_en}
                </p>
              </div>

              {/* Terroir Stats Bento Grid */}
              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <div className="p-3.5 rounded-2xl bg-[#261710] border border-amber-900/40 space-y-1">
                  <div className="flex items-center space-x-1.5 text-[11px] font-mono text-amber-300 uppercase">
                    <Droplets className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isKn ? 'ಮಣ್ಣಿನ ವಿಧ' : 'SOIL TERROIR'}</span>
                  </div>
                  <p className="text-xs text-stone-200 font-medium">
                    {isKn ? current.soil_kn : current.soil_en}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#261710] border border-amber-900/40 space-y-1">
                  <div className="flex items-center space-x-1.5 text-[11px] font-mono text-amber-300 uppercase">
                    <Mountain className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isKn ? 'ಸಮುದ್ರ ಮಟ್ಟ' : 'ELEVATION'}</span>
                  </div>
                  <p className="text-xs text-stone-200 font-medium">{current.altitude}</p>
                </div>
              </div>

              {/* Direct Link into the Spice Journey */}
              <div className="pt-2">
                <a
                  href="#scroll-journey-section"
                  className="inline-flex items-center space-x-2 text-xs font-mono tracking-widest text-amber-400 hover:text-amber-300 uppercase font-bold group"
                >
                  <span>{isKn ? 'ಈ ಮಸಾಲೆಗಳು ಹೇಗೆ ಪರಿವರ್ತನೆಯಾಗುತ್ತವೆ ನೋಡಿ' : 'SEE HOW IT BECOMES POWDER'}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
