import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Sparkles, ArrowRight, Leaf } from 'lucide-react';

interface SpiceItem {
  id: string;
  name_en: string;
  name_kn: string;
  role_en: string;
  role_kn: string;
  desc_en: string;
  desc_kn: string;
  image: string;
}

export const SpiceOriginSection: React.FC = () => {
  const { language } = useLanguage();
  const isKn = language === 'kn';
  const [activeSpice, setActiveSpice] = useState<string>('byadgi');

  const spices: SpiceItem[] = [
    {
      id: 'byadgi',
      name_en: 'Byadgi Red Chilli',
      name_kn: 'ಬ್ಯಾಡಗಿ ಕೆಂಪು ಮೆಣಸಿನಕಾಯಿ',
      role_en: 'Deep Natural Color & Gentle Warmth',
      role_kn: 'ನೈಸರ್ಗಿಕ ಗಾಢ ಕೆಂಪು ಬಣ್ಣ ಮತ್ತು ಹಿತಕರ ಖಾರ',
      desc_en:
        'A beloved staple of Karnataka kitchens. Renowned for lending rich natural red color and aromatic warmth to everyday sambar and curries without harsh pungency.',
      desc_kn:
        'ಕರ್ನಾಟಕದ ಸಾಂಪ್ರದಾಯಿಕ ಅಡುಗೆ ಮನೆಗಳ ನೆಚ್ಚಿನ ಮೆಣಸಿನಕಾಯಿ. ಗಂಟಲು ಉರಿಯದ ಹಿತಕರ ಖಾರ ಮತ್ತು ಸಾಂಬಾರ್‌ಗೆ ನೈಸರ್ಗಿಕ ಸುಂದರ ಕೆಂಪು ಬಣ್ಣ ನೀಡುತ್ತದೆ.',
      image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 'turmeric',
      name_en: 'Golden Turmeric',
      name_kn: 'ಶುದ್ಧ ಅರಿಶಿನ',
      role_en: 'Earthy Aroma & Kitchen Tradition',
      role_kn: 'ಮಣ್ಣಿನ ಪರಿಮಳ ಮತ್ತು ಅಡುಗೆ ಪರಂಪರೆ',
      desc_en:
        'The golden soul of Indian cooking. Carefully selected whole rhizomes ground gently to maintain warmth, natural color, and traditional culinary character.',
      desc_kn:
        'ಭಾರತೀಯ ಅಡುಗೆಯ ಚಿನ್ನದ ಕಣ. ಸಾಂಪ್ರದಾಯಿಕವಾಗಿ ಸಿದ್ಧಪಡಿಸಿದ ಶುದ್ಧ ಅರಿಶಿನವು ದಿನನಿತ್ಯದ ಅಡುಗೆಗೆ ಸಹಜ ಬಣ್ಣ ಮತ್ತು ಸುವಾಸನೆ ನೀಡುತ್ತದೆ.',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 'pepper',
      name_en: 'Whole Black Pepper',
      name_kn: 'ಕಾಳುಮೆಣಸು',
      role_en: 'Aromatic Depth & Bold Heat',
      role_kn: 'ಅಪ್ಪಟ ಸುವಾಸನೆ ಮತ್ತು ಘಾಟು',
      desc_en:
        'The timeless spice of South India. Whole black peppercorns provide a clean, aromatic heat that elevates rasam and savoury dishes.',
      desc_kn:
        'ದಕ್ಷಿಣ ಭಾರತದ ಪಾರಂಪರಿಕ ಸಾಂಬಾರ ಪದಾರ್ಥ. ರಸಂ ಮತ್ತು ಸಾಂಪ್ರದಾಯಿಕ ಅಡುಗೆಗಳಿಗೆ ವಿಶಿಷ್ಟ ಘಾಟು ಮತ್ತು ಆಹ್ಲಾದಕರ ಪರಿಮಳ ನೀಡುತ್ತದೆ.',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 'coriander',
      name_en: 'Coriander & Cumin Seeds',
      name_kn: 'ಧನಿಯಾ ಮತ್ತು ಜೀರಿಗೆ ಕಾಳುಗಳು',
      role_en: 'Fragrant Base of Sambar & Rasam',
      role_kn: 'ಸಾಂಬಾರ್ ಮತ್ತು ರಸಂಗೆ ಮುಖ್ಯ ಆಧಾರ',
      desc_en:
        'Crisp, aromatic whole seeds that form the comforting fragrant backbone of South Indian sambar, rasam, and daily vegetable preparations.',
      desc_kn:
        'ನಮ್ಮ ಮನೆಗಳಲ್ಲಿ ಮಾಡುವ ಬಿಸಿ ಸಾಂಬಾರ್ ಮತ್ತು ರಸಂಗೆ ಘಮಘಮಿಸುವ ಮುಖ್ಯ ಆಧಾರವೇ ಈ ಸುಗಂಧಭರಿತ ಧನಿಯಾ ಮತ್ತು ಜೀರಿಗೆ ಕಾಳುಗಳು.',
      image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&auto=format&fit=crop&q=80'
    }
  ];

  const current = spices.find(s => s.id === activeSpice) || spices[0];

  return (
    <section id="spice-origin-section" className="relative py-16 sm:py-24 bg-[#140E0A] text-[#FFF9F2] overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 bg-radial from-[#24160F] via-[#140E0A] to-[#0D0805] pointer-events-none" />
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-amber-600/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl 2xl:max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-14">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-xs font-mono tracking-widest text-amber-400 uppercase font-semibold">
            <Leaf className="w-3.5 h-3.5 text-amber-400" />
            <span>{isKn ? 'ನಮ್ಮ ಮುಖ್ಯ ಕಾಳು ಮಸಾಲೆಗಳು' : 'THE WHOLE SPICES'}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            {isKn ? (
              <>
                ದಿನನಿತ್ಯದ ಅಡುಗೆಗೆ <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200">
                  ಆಯ್ಕೆ ಮಾಡಿದ ಕಾಳು ಮಸಾಲೆಗಳು.
                </span>
              </>
            ) : (
              <>
                Spices Made for <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200">
                  Everyday Indian Kitchens.
                </span>
              </>
            )}
          </h2>

          <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto font-light leading-relaxed">
            {isKn
              ? 'ಪ್ರತಿಯೊಂದು ಉತ್ತಮ ಅಡುಗೆಯೂ ಆರಂಭವಾಗುವುದು ಗುಣಮಟ್ಟದ ಕಾಳು ಮಸಾಲೆಗಳಿಂದ. ಇಂದಿಮಾದಲ್ಲಿ ನಾವು ಸಾಂಪ್ರದಾಯಿಕ ರುಚಿಗೆ ಬೇಕಾದ ಕಾಳುಗಳನ್ನು ಕಾಳಜಿಯಿಂದ ಆಯ್ಕೆ ಮಾಡುತ್ತೇವೆ.'
              : 'Every wholesome family meal starts with good whole ingredients. At Indima, we focus on the foundational spices that bring comfort, warmth, and character to South Indian dining tables.'}
          </p>
        </div>

        {/* Spice Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-8 sm:mb-12">
          {spices.map(s => {
            const isSel = s.id === activeSpice;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSpice(s.id)}
                type="button"
                className={`flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-300 cursor-pointer border ${
                  isSel
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-lg shadow-amber-950/60 font-bold'
                    : 'bg-[#1F1510] border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                }`}
              >
                <span>{isKn ? s.name_kn : s.name_en}</span>
              </button>
            );
          })}
        </div>

        {/* Featured Spice Card */}
        <div className="relative rounded-3xl overflow-hidden border border-amber-500/25 bg-gradient-to-br from-[#1C120D] to-[#120B08] p-6 sm:p-10 lg:p-12 shadow-2xl shadow-black/80">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Visual Column */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 aspect-[4/3] shadow-xl">
                <img
                  src={current.image}
                  alt={current.name_en}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0A07]/85 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-[11px] font-mono text-amber-300 uppercase tracking-widest font-semibold">
                    {isKn ? current.role_kn : current.role_en}
                  </p>
                  <p className="font-serif text-lg sm:text-xl font-bold text-white mt-0.5">
                    {isKn ? current.name_kn : current.name_en}
                  </p>
                </div>
              </div>
            </div>

            {/* Description Column */}
            <div className="lg:col-span-6 space-y-5">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs font-mono text-amber-400 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isKn ? 'ಸಾಂಪ್ರದಾಯಿಕ ಬಳಕೆ' : 'TRADITIONAL CULINARY ROLE'}</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  {isKn ? current.name_kn : current.name_en}
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light">
                  {isKn ? current.desc_kn : current.desc_en}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#261710] border border-amber-900/40">
                <p className="text-xs text-amber-200/90 font-sans leading-relaxed">
                  {isKn
                    ? 'ಅಡುಗೆಯ ಪ್ರತಿ ತುತ್ತಿನಲ್ಲೂ ಮನೆಯ ಪ್ರೀತಿ ತುಂಬುವ ನೈಜ ಘಮಲು.'
                    : 'Handled with care from selection to milling, so natural aroma remains true to your kitchen recipes.'}
                </p>
              </div>

              {/* Navigation Link to Process */}
              <div className="pt-2">
                <a
                  href="#process-craft-section"
                  className="inline-flex items-center space-x-2 text-xs font-mono tracking-widest text-amber-400 hover:text-amber-300 uppercase font-bold group"
                >
                  <span>{isKn ? 'ತಯಾರಿಕೆಯ ವಿಧಾನ ನೋಡಿ' : 'SEE OUR PREPARATION PROCESS'}</span>
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
