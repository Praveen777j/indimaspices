import React from 'react';
import { Compass, Filter, Sun, Flame, Layers, Package } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const ProcessCraftSection: React.FC = () => {
  const { language } = useLanguage();
  const isKn = language === 'kn';

  const steps = [
    {
      number: '01',
      icon: Compass,
      title_en: 'Whole Crop Sourcing',
      title_kn: 'ನೈಜ ಮೂಲದಿಂದ ಸಂಗ್ರಹ',
      desc_en:
        'Harvested directly from generational growers across Karnataka: deep-red Byadgi chillies, fragrant round coriander seeds, and Salem turmeric roots.',
      desc_kn:
        'ಕರ್ನಾಟಕದ ನೈಜ ಕೃಷಿ ಭೂಮಿಗಳಿಂದ ಬ್ಯಾಡಗಿ ಮೆಣಸಿನಕಾಯಿ, ಸುವಾಸನಾಭರಿತ ಧನಿಯಾ ಮತ್ತು ಅರಿಶಿನ ಕೊಂಬುಗಳನ್ನು ನೇರವಾಗಿ ಸಂಗ್ರಹಿಸುತ್ತೇವೆ.'
    },
    {
      number: '02',
      icon: Filter,
      title_en: 'Artisanal Sorting',
      title_kn: 'ಕೈಯಿಂದ ಆರಿಸುವ ಪರಿಶುದ್ಧತೆ',
      desc_en:
        'Every harvest is winnowed and de-stemmed by hand in traditional bamboo trays to eliminate field debris, hollow pods, and dust before any processing starts.',
      desc_kn:
        'ಸಾಂಪ್ರದಾಯಿಕ ಮೊರದಲ್ಲಿ ಕೇರಿ ತೊಟ್ಟು, ಧೂಳು ಮತ್ತು ಕಸವನ್ನು ಕೈಯಿಂದಲೇ ಆರಿಸಿ ಶುದ್ಧ ಕಾಳುಗಳನ್ನು ಮಾತ್ರ ಸಂಸ್ಕರಣೆಗೆ ಆರಿಸಲಾಗುತ್ತದೆ.'
    },
    {
      number: '03',
      icon: Sun,
      title_en: 'Solar & Fire Curing',
      title_kn: 'ಬಿಸಿಲು ಮತ್ತು ಮಂದ ಉರಿ',
      desc_en:
        'Spices are solar-cured on raised hygienic mats, then slowly warmed over low embers in cast-iron kadai to release essential oils without blistering.',
      desc_kn:
        'ನೈಸರ್ಗಿಕ ಬಿಸಿಲಿನಲ್ಲಿ ಒಣಗಿಸಿ, ಕಬ್ಬಿಣದ ಬಾಣಲೆಯಲ್ಲಿ ಮಂದ ಉರಿಯಲ್ಲಿ ಹುರಿಯುವುದರಿಂದ ಸುಗಂಧ ತೈಲಗಳು ಎಚ್ಚರಗೊಂಡು ನೈಜ ಸುವಾಸನೆ ಮೂಡುತ್ತದೆ.'
    },
    {
      number: '04',
      icon: Flame,
      title_en: 'Granite Stone-Milling',
      title_kn: 'ನೈಸರ್ಗಿಕ ಕಲ್ಲಿನ ಬೀಸುವಿಕೆ',
      desc_en:
        'Unlike commercial pulverizers that burn away volatile aroma with extreme heat, our natural granite stones grind slowly at ambient temperature.',
      desc_kn:
        'ವೇಗದ ಮೆಷಿನ್‌ಗಳಂತೆ ಬಿಸಿಯಾಗದೆ, ಸಾಂಪ್ರದಾಯಿಕ ಗ್ರಾನೈಟ್ ಕಲ್ಲಿನಲ್ಲಿ ನಿಧಾನವಾಗಿ ಬೀಸಿ ನೈಸರ್ಗಿಕ ತೈಲ ಮತ್ತು ಸುವಾಸನೆಯನ್ನು ಕಾಪಾಡಲಾಗುತ್ತದೆ.'
    },
    {
      number: '05',
      icon: Layers,
      title_en: 'Generational Blending',
      title_kn: 'ಪಾರಂಪರಿಕ ಸೂತ್ರಗಳ ಮಿಶ್ರಣ',
      desc_en:
        'Stone-ground spices are harmonized in micro-batches according to authentic regional Karnataka culinary proportions passed down through families.',
      desc_kn:
        'ಬಿಸಿಬೇಳೆಬಾತ್, ಸಾಂಬಾರ್ ಮತ್ತು ರಸಂ ಪುಡಿಗಳಿಗೆ ಬೇಕಾದ ಪ್ರತಿಯೊಂದು ಮಸಾಲೆಯನ್ನು ಶತಮಾನಗಳ ಹಳೆಯ ಕರ್ನಾಟಕ ಪಾಕವಿಧಾನದಂತೆ ಅಳತೆ ಮಾಡಿ ಬೆರೆಸಲಾಗುತ್ತದೆ.'
    },
    {
      number: '06',
      icon: Package,
      title_en: 'Aroma-Lock Sealing',
      title_kn: 'ಸುವಾಸನೆ ಲಾಕ್ ಮಾಡುವ ಪ್ಯಾಕಿಂಗ್',
      desc_en:
        'Airtight multi-layer oxygen-barrier pouches are sealed within hours of milling to lock in volatile aromas until you open them in your home kitchen.',
      desc_kn:
        'ಕಲ್ಲಿನಲ್ಲಿ ಬೀಸಿದ ಕೆಲವೇ ಸಮಯದಲ್ಲಿ ಗಾಳಿ ಮತ್ತು ಬೆಳಕು ತಾಗದಂತಹ ವಿಶೇಷ ಸುವಾಸನೆ-ಲಾಕ್ ಕವರ್‌ಗಳಲ್ಲಿ ಪ್ಯಾಕ್ ಮಾಡಲಾಗುತ್ತದೆ.'
    }
  ];

  return (
    <section id="process-section" className="py-20 sm:py-28 bg-[#FAF6EE] text-[#1F1610] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center space-x-2 text-xs font-mono tracking-widest text-[#8B3214] uppercase mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B3214]" />
            <span>{isKn ? 'ಪದ್ಧತಿ ಮತ್ತು ಕಲೆ' : 'THE ARTISANAL METHOD'}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#1F1610] leading-tight">
            {isKn ? 'ನಾವು ಮಸಾಲೆ ತಯಾರಿಸುವ ಪ್ರಾಮಾಣಿಕ ವಿಧಾನ' : 'How we craft honest spices.'}
          </h2>

          <p className="text-sm sm:text-base text-[#5C483B] mt-4 font-normal max-w-2xl leading-relaxed">
            {isKn
              ? 'ಕಾರ್ಖಾನೆಯ ಶಾರ್ಟ್‌ಕಟ್‌ಗಳಿಲ್ಲದೆ, ಪೂರ್ವಜರ ನಿಧಾನವಾದ ಕಲ್ಲಿನ ಬೀಸುವ ವಿಧಾನವನ್ನು ಗೌರವಿಸಿ ತಯಾರಿಸಲಾಗುವ ಸಾತ್ವಿಕ ಮಸಾಲೆಗಳು.'
              : 'No shortcuts, no artificial food dyes, no synthetic fillers. Just the unhurried craft of working with whole nature.'}
          </p>
        </div>

        {/* 6-Grid Process Pods */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {steps.map(step => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-[#FFFDF9] border border-[#DFC7A2] rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-bold text-[#8B3214]/30 group-hover:text-[#8B3214] transition-colors">
                    {step.number}
                  </span>
                  <div className="p-2.5 rounded-2xl bg-[#FAF6EE] text-[#8B3214] border border-[#DFC7A2]">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="font-serif text-xl font-bold text-[#1F1610]">
                  {isKn ? step.title_kn : step.title_en}
                </h3>

                <p className="text-xs sm:text-sm text-[#5C483B] leading-relaxed font-normal">
                  {isKn ? step.desc_kn : step.desc_en}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
