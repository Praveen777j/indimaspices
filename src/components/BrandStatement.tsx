import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Sparkles } from 'lucide-react';

export const BrandStatement: React.FC = () => {
  const { language } = useLanguage();
  const isKn = language === 'kn';

  return (
    <section id="brand-story-section" className="relative py-20 sm:py-32 lg:py-40 bg-[#FAF6EE] text-[#1F1610] overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-400/8 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center relative z-10 space-y-6 sm:space-y-8">
        <div className="inline-flex items-center space-x-2 text-xs font-mono tracking-widest text-[#8B3214] uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B3214]" />
          <span>{isKn ? 'ನಮ್ಮ ಧ್ಯೇಯ' : 'THE PHILOSOPHY'}</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1F1610] leading-[1.15] text-balance">
          {isKn ? (
            <>
              ಉತ್ತಮ ಅಡುಗೆಗೆ <br className="hidden sm:inline" />
              <span className="text-[#8B3214] italic font-serif">ಅಪ್ಪಟ ಮಸಾಲೆಗಳೇ ಜೀವಾಳ.</span>
            </>
          ) : (
            <>
              Good food begins with <br className="hidden sm:inline" />
              <span className="text-[#8B3214] italic font-serif">honest, whole spices.</span>
            </>
          )}
        </h2>

        <p className="text-sm sm:text-base lg:text-lg text-[#5C483B] max-w-2xl mx-auto leading-relaxed font-normal">
          {isKn
            ? 'ಒಗ್ಗರಣೆಯ ಸದ್ದು, ಮನೆಯಿಡೀ ಹರಡುವ ಪರಿಮಳ, ತಟ್ಟೆಯಲ್ಲಿ ಮೂಡುವ ನೈಜ ರುಚಿ — ಇವೆಲ್ಲವೂ ಆರಂಭವಾಗುವುದು ಕಲ್ಲಿನಲ್ಲಿ ಬೀಸಿದ ಅಪ್ಪಟ ಮಸಾಲೆಗಳಿಂದ. ಯಾವುದೇ ಕೃತಕ ತಂತ್ರಗಳಿಲ್ಲದೆ ನೈಸರ್ಗಿಕ ವಿಧಾನದಲ್ಲಿ ತಯಾರಿಸುವ ಪರಂಪರೆ ನಮ್ಮದು.'
            : 'Before the sizzle of mustard seeds in hot ghee, before the aroma fills every corner of your home, before the first spoonful shared with family — there is the spice. Whole, patient, and full of natural character.'}
        </p>

        <div className="pt-4 flex items-center justify-center space-x-6 text-xs font-mono text-[#8C6D53]">
          <span>WHOLE</span>
          <span className="text-[#DFC7A2]">·</span>
          <span>GROUND</span>
          <span className="text-[#DFC7A2]">·</span>
          <span>BLENDED</span>
          <span className="text-[#DFC7A2]">·</span>
          <span>SEALED</span>
        </div>
      </div>
    </section>
  );
};
