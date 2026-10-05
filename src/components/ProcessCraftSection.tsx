import React from 'react';
import { Compass, Filter, Sun, Sparkles, Layers, Package } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const ProcessCraftSection: React.FC = () => {
  const { language } = useLanguage();
  const isKn = language === 'kn';

  const steps = [
    {
      number: '01',
      icon: Compass,
      title_en: 'Careful Sourcing',
      title_kn: 'ಗುಣಮಟ್ಟದ ಕಾಳುಗಳ ಆಯ್ಕೆ',
      desc_en:
        'We begin with whole spices chosen for their natural aroma, clean appearance, and traditional culinary quality.',
      desc_kn:
        'ನೈಸರ್ಗಿಕ ಸುವಾಸನೆ ಮತ್ತು ಸಾಂಪ್ರದಾಯಿಕ ಅಡುಗೆಗೆ ಸೂಕ್ತವಾದ ಉತ್ತಮ ಕಾಳು ಮಸಾಲೆಗಳನ್ನು ಕಾಳಜಿಯಿಂದ ಆಯ್ಕೆ ಮಾಡುತ್ತೇವೆ.'
    },
    {
      number: '02',
      icon: Filter,
      title_en: 'Hand Cleaning',
      title_kn: 'ಕೈಯಿಂದ ಆರಿಸಿ ಶುಚಿಗೊಳಿಸುವಿಕೆ',
      desc_en:
        'Every batch is manually cleaned and sorted to remove stems, dust, and hollow pods before any preparation begins.',
      desc_kn:
        'ಯಾವುದೇ ಸಂಸ್ಕರಣೆಗೂ ಮುನ್ನ ಕಾಳುಗಳನ್ನು ಕೈಯಿಂದಲೇ ಆರಿಸಿ, ತೊಟ್ಟು ಮತ್ತು ಧೂಳನ್ನು ತೆಗೆದು ಶುದ್ಧಗೊಳಿಸಲಾಗುತ್ತದೆ.'
    },
    {
      number: '03',
      icon: Sun,
      title_en: 'Natural Sun Drying',
      title_kn: 'ನೈಸರ್ಗಿಕ ಬಿಸಿಲಿನಲ್ಲಿ ಒಣಗಿಸುವುದು',
      desc_en:
        'Whole spices are sun-dried under warm natural sunlight to eliminate surface humidity and prepare them for grinding.',
      desc_kn:
        'ಕಾಳುಗಳನ್ನು ನೈಸರ್ಗಿಕ ಬಿಸಿಲಿನಲ್ಲಿ ಹದವಾಗಿ ಒಣಗಿಸಿ, ತೇವಾಂಶವನ್ನು ನಿವಾರಿಸಿ ಪುಡಿ ಮಾಡಲು ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತದೆ.'
    },
    {
      number: '04',
      icon: Sparkles,
      title_en: 'Small Batch Grinding',
      title_kn: 'ಸಣ್ಣ ಬ್ಯಾಚ್‌ಗಳಲ್ಲಿ ಪುಡಿ ಮಾಡುವುದು',
      desc_en:
        'Milled in controlled small batches with care so the natural aromatic oils and authentic flavors remain intact.',
      desc_kn:
        'ಸಣ್ಣ ಬ್ಯಾಚ್‌ಗಳಲ್ಲಿ ನಿಧಾನವಾಗಿ ಪುಡಿ ಮಾಡುವುದರಿಂದ ಮಸಾಲೆಯ ಸಹಜ ಪರಿಮಳ ಮತ್ತು ರುಚಿ ಹಾಗೆಯೇ ಉಳಿಯುತ್ತದೆ.'
    },
    {
      number: '05',
      icon: Layers,
      title_en: 'Traditional Blending',
      title_kn: 'ಸಾಂಪ್ರದಾಯಿಕ ಮಿಶ್ರಣ',
      desc_en:
        'Spices are measured according to time-tested regional Karnataka proportions for everyday sambar, rasam, and curries.',
      desc_kn:
        'ದಿನನಿತ್ಯದ ಸಾಂಬಾರ್ ಮತ್ತು ರಸಂಗೆ ಹೊಂದಿಕೊಳ್ಳುವಂತೆ ಸಾಂಪ್ರದಾಯಿಕ ಅಳತೆಯ ಪ್ರಕಾರ ಮಸಾಲೆಗಳನ್ನು ಬೆರೆಸಲಾಗುತ್ತದೆ.'
    },
    {
      number: '06',
      icon: Package,
      title_en: 'Airtight Packaging',
      title_kn: 'ಗಾಳಿಯಾಡದ ಸುರಕ್ಷಿತ ಪ್ಯಾಕಿಂಗ್',
      desc_en:
        'Packed securely in airtight packets shortly after preparation to ensure freshness reaches your dining table.',
      desc_kn:
        'ತಯಾರಿಸಿದ ಕೆಲವೇ ಸಮಯದಲ್ಲಿ ಗಾಳಿಯಾಡದ ಪ್ಯಾಕೆಟ್‌ಗಳಲ್ಲಿ ಪ್ಯಾಕ್ ಮಾಡಿ ತಾಜಾತನವನ್ನು ಕಾಪಾಡಲಾಗುತ್ತದೆ.'
    }
  ];

  return (
    <section id="process-craft-section" className="py-20 sm:py-28 bg-[#FAF6EE] text-[#1F1610] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center space-x-2 text-xs font-mono tracking-widest text-[#8B3214] uppercase mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B3214]" />
            <span>{isKn ? 'ತಯಾರಿಕೆಯ ಸರಳ ಹಂತಗಳು' : 'OUR PREPARATION PROCESS'}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#1F1610] leading-tight">
            {isKn ? 'ನಾವು ಮಸಾಲೆ ಸಿದ್ಧಪಡಿಸುವ ಪ್ರಾಮಾಣಿಕ ವಿಧಾನ' : 'How We Prepare Our Everyday Spices.'}
          </h2>

          <p className="text-sm sm:text-base text-[#5C483B] mt-4 font-normal max-w-2xl leading-relaxed">
            {isKn
              ? 'ಯಾವುದೇ ಕೃತಕ ಬಣ್ಣಗಳಿಲ್ಲದೆ, ಪ್ರೀತಿ ಮತ್ತು ಕಾಳಜಿಯಿಂದ ಸಿದ್ಧಪಡಿಸಲಾಗುವ ಮನೆ ಮಸಾಲೆಗಳು.'
              : 'Crafted with care, patience, and respect for traditional family home cooking.'}
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
                  <div className="w-10 h-10 rounded-2xl bg-[#FAF0DC] flex items-center justify-center text-[#8B3214] border border-[#DFC7A2]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-[#8C6D53] tracking-widest">
                    STEP {step.number}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-bold text-[#1F1610] group-hover:text-[#8B3214] transition-colors">
                    {isKn ? step.title_kn : step.title_en}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5C483B] leading-relaxed font-normal">
                    {isKn ? step.desc_kn : step.desc_en}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
