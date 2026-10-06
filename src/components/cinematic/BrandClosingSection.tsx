import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Sparkles, HeartHandshake, Leaf, ShieldCheck } from 'lucide-react';

export const BrandClosingSection: React.FC = () => {
  const { language } = useLanguage();
  const isKn = language === 'kn';

  return (
    <section className="brand-closing-section relative w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#F7F1E5] text-[#2C1810] border-t border-[#DFC7A2]/50">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#FFFDF9] border border-[#DFC7A2] text-[#8B3214] text-xs font-semibold tracking-widest uppercase shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#993300]" />
          <span>{isKn ? 'ನಮ್ಮ ವಾಗ್ದಾನ' : 'Our Promise'}</span>
        </div>

        <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#2C1810]">
          {isKn
            ? 'ನಮ್ಮ ಅಡುಗೆಮನೆಯಿಂದ ನಿಮ್ಮ ಮನೆಗೆ.'
            : 'From Our Kitchen to Yours.'}
        </h2>

        <p className="font-serif italic text-sm sm:text-lg text-[#6B4E3D] max-w-xl mx-auto font-normal">
          {isKn
            ? '“ಸಾಂಪ್ರದಾಯಿಕ ಬೇರುಗಳಿಂದ ಮೂಡಿ, ಇಂದಿನ ಅಡುಗೆಗೆ ಸಿದ್ಧವಾದ ಅಪ್ಪಟ ಮಸಾಲೆಗಳು.”'
            : '“Rooted in tradition. Handcrafted for the everyday cooking we love.”'}
        </p>

        {/* 3 Quiet Brand Truths */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 max-w-3xl mx-auto text-left">
          <div className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#E8DFD3] shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#FAF0E1] flex items-center justify-center text-[#993300]">
              <Leaf className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-sm text-[#2C1810]">
              {isKn ? 'ಕಾಳು ಮಸಾಲೆಗಳ ಸತ್ವ' : 'Whole Ingredients First'}
            </h3>
            <p className="text-xs text-[#6B4E3D] leading-relaxed">
              {isKn
                ? 'ಗುಣಮಟ್ಟದ ಕಾಳು ಮೆಣಸು, ಅರಿಶಿನ ಮತ್ತು ಬ್ಯಾಡಗಿ ಮೆಣಸಿನಕಾಯಿ.'
                : 'Carefully chosen whole spices forming the authentic base of every recipe.'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#E8DFD3] shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#FAF0E1] flex items-center justify-center text-[#993300]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-sm text-[#2C1810]">
              {isKn ? 'ಸಣ್ಣ ಬ್ಯಾಚ್‌ಗಳ ತಯಾರಿಕೆ' : 'Small-Batch Preparation'}
            </h3>
            <p className="text-xs text-[#6B4E3D] leading-relaxed">
              {isKn
                ? 'ಸುವಾಸನೆ ಮತ್ತು ತಾಜಾತನ ಉಳಿಸಿಕೊಳ್ಳಲು ಸಣ್ಣ ಪ್ರಮಾಣದಲ್ಲಿ ಸಿದ್ಧತೆ.'
                : 'Prepared in limited batches so that natural essential aromas remain intact.'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#E8DFD3] shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#FAF0E1] flex items-center justify-center text-[#993300]">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-sm text-[#2C1810]">
              {isKn ? 'ಮನೆಯ ಅಡುಗೆಯ ರುಚಿ' : 'Honest Homemade Taste'}
            </h3>
            <p className="text-xs text-[#6B4E3D] leading-relaxed">
              {isKn
                ? 'ಪ್ರತಿ ತುತ್ತಿನಲ್ಲೂ ತಾಯಿಯ ಕೈರುಚಿಯ ನೈಜ ಸುವಾಸನೆ.'
                : 'The comforting, nostalgic aroma of authentic Karnataka home cooking.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
