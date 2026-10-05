import React from 'react';
import { ShieldCheck, Leaf, HeartHandshake, MapPin, Sparkles, Award } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const TrustQualitySection: React.FC = () => {
  const { language } = useLanguage();
  const isKn = language === 'kn';

  const pillars = [
    {
      icon: Leaf,
      title_en: 'Whole Ingredients Only',
      title_kn: 'ನೈಜ ಕಾಳು ಮಸಾಲೆಗಳು ಮಾತ್ರ',
      desc_en:
        'We never use spent spices, extracted wastes, or starch fillers. Only wholesome dried seeds and roots.',
      desc_kn:
        'ಯಾವುದೇ ಸಾರ ತೆಗೆದ ಅಥವಾ ಮರದ ಪುಡಿ ಬಳಸುವುದಿಲ್ಲ. ಕೇವಲ ನೈಸರ್ಗಿಕ ಪೂರ್ಣ ಕಾಳು ಮಸಾಲೆಗಳನ್ನು ಮಾತ್ರ ಬಳಸುತ್ತೇವೆ.'
    },
    {
      icon: ShieldCheck,
      title_en: 'Zero Added Food Dyes',
      title_kn: 'ಯಾವುದೇ ಕೃತಕ ಬಣ್ಣಗಳಿಲ್ಲ',
      desc_en:
        'The deep red comes exclusively from natural Byadgi chillies and golden hue from Salem turmeric.',
      desc_kn:
        'ದಟ್ಟವಾದ ನೈಸರ್ಗಿಕ ಕೆಂಪು ಬಣ್ಣವು ಶುದ್ಧ ಬ್ಯಾಡಗಿ ಮೆಣಸಿನಕಾಯಿಯಿಂದ ಹಾಗೂ ಸುವರ್ಣ ಬಣ್ಣವು ಅರಿಶಿನದಿಂದ ಮಾತ್ರ ಬರುತ್ತದೆ.'
    },
    {
      icon: Award,
      title_en: 'Natural Stone-Milled',
      title_kn: 'ನೈಸರ್ಗಿಕ ಕಲ್ಲಿನ ಬೀಸುವಿಕೆ',
      desc_en:
        'Ground using traditional granite stone mills to retain essential oils and rich textural mouthfeel.',
      desc_kn:
        'ಸಾಂಪ್ರದಾಯಿಕ ಗ್ರಾನೈಟ್ ಕಲ್ಲಿನಲ್ಲಿ ಬೀಸಿ ಮಸಾಲೆಯೊಳಗಿನ ಸುವಾಸನಾ ತೈಲ ಮತ್ತು ನೈಜ ರುಚಿಯನ್ನು ಉಳಿಸಿಕೊಳ್ಳಲಾಗುತ್ತದೆ.'
    },
    {
      icon: MapPin,
      title_en: 'Crafted in Bengaluru',
      title_kn: 'ಬೆಂಗಳೂರಿನಲ್ಲೇ ಸಿದ್ಧತೆ',
      desc_en:
        'Carefully prepared and packaged in Bengaluru, dispatching fresh batches directly to dining tables across India.',
      desc_kn:
        'ಬೆಂಗಳೂರಿನಲ್ಲೇ ಶುದ್ಧವಾಗಿ ತಯಾರಿಸಿ ಪ್ಯಾಕ್ ಮಾಡಿ, ಭಾರತದಾದ್ಯಂತ ಮನೆ ಬಾಗಿಲಿಗೆ ವಿತರಿಸಲಾಗುತ್ತದೆ.'
    }
  ];

  return (
    <section id="trust-section" className="py-20 sm:py-28 bg-[#FFFDF9] border-t border-[#DFC7A2] text-[#1F1610]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center space-x-2 text-xs font-mono tracking-widest text-[#8B3214] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B3214]" />
            <span>{isKn ? 'ನಮ್ಮ ಪ್ರಾಮಾಣಿಕತೆ' : 'OUR HONEST PLEDGE'}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#1F1610]">
            {isKn ? 'ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ನೈಜ ಮಸಾಲೆಗಳ ಭರವಸೆ' : 'Real trust for your family kitchen.'}
          </h2>

          <p className="text-xs sm:text-sm lg:text-base text-[#5C483B] leading-relaxed font-normal">
            {isKn
              ? 'ಪ್ರತಿಯೊಂದು ತುತ್ತಿನಲ್ಲೂ ನಿಮ್ಮ ಮನೆಮಂದಿಯ ಆರೋಗ್ಯ ಮತ್ತು ಸಾತ್ವಿಕ ರುಚಿಯನ್ನು ಕಾಪಾಡುವ ಪ್ರಾಮಾಣಿಕ ಪ್ರಯತ್ನ.'
              : 'Built on everyday culinary respect: truthful ingredients, honest milling, and recipes that make your meals unforgettable.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div
                key={i}
                className="bg-[#FAF6EE] border border-[#DFC7A2] rounded-3xl p-6 sm:p-7 space-y-3.5 shadow-2xs hover:shadow-sm transition-shadow"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#FFFDF9] border border-[#DFC7A2] text-[#8B3214] flex items-center justify-center shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1F1610]">
                  {isKn ? pillar.title_kn : pillar.title_en}
                </h3>
                <p className="text-xs sm:text-sm text-[#5C483B] leading-relaxed font-normal">
                  {isKn ? pillar.desc_kn : pillar.desc_en}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
