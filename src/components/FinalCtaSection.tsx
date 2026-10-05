import React from 'react';
import { ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { spiceKitchenImg } from '../assets/images';

interface FinalCtaSectionProps {
  onShopClick: () => void;
}

export const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({ onShopClick }) => {
  const { language } = useLanguage();
  const isKn = language === 'kn';

  return (
    <section className="relative py-24 sm:py-36 bg-gradient-to-b from-[#2C160E] via-[#421E12] to-[#24110A] text-[#FFF9F2] overflow-hidden select-none border-t border-amber-900/30">
      {/* Background ambient gold & saffron glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-500/15 blur-[180px] rounded-full pointer-events-none" />

      {/* Background subtle kitchen imagery with warm gradient blend */}
      <div className="absolute inset-0 opacity-25 pointer-events-none mix-blend-luminosity">
        <img
          src={spiceKitchenImg}
          alt="South Indian kitchen"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#24110A] via-[#35180F]/90 to-[#2C160E]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center relative z-10 space-y-6 sm:space-y-8">
        <div className="inline-flex items-center space-x-2 text-xs font-mono tracking-widest text-amber-400 uppercase font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>{isKn ? 'ನಿಮ್ಮ ಅಡುಗೆ ಮನೆಗೆ ಸ್ವಾಗತ' : 'FROM OUR MILL TO YOUR KITCHEN'}</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
          {isKn ? (
            <>
              ನಮ್ಮ ಕಾಳುಗಳಿಂದ, <br />
              <span className="text-amber-400">ನಿಮ್ಮ ಕುಟುಂಬದ ಅಡುಗೆಗೆ.</span>
            </>
          ) : (
            <>
              From our spices, <br />
              <span className="text-amber-400">to your kitchen.</span>
            </>
          )}
        </h2>

        <p className="text-xs sm:text-sm md:text-base text-stone-200 max-w-xl mx-auto leading-relaxed font-light">
          {isKn
            ? 'ಅಪ್ಪಟ ಕಲ್ಲಿನಲ್ಲಿ ಬೀಸಿದ ನೈಜ ಮಸಾಲೆಗಳ ಸುವಾಸನೆಯನ್ನು ಇಂದೇ ನಿಮ್ಮ ಮನೆಗೆ ತನ್ನಿ. ಕರ್ನಾಟಕದ ಪರಂಪರೆಯ ರುಚಿ ಈಗ ನಿಮ್ಮ ಅಡುಗೆ ಮನೆಯಲ್ಲಿ.'
            : 'Bring the rich, nostalgic aroma of genuine stone-ground Karnataka spices into your daily cooking. Delivered fresh directly from Bengaluru.'}
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={onShopClick}
            className="inline-flex items-center space-x-3 px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-[#1A0E0A] font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-xl shadow-amber-900/40 hover:scale-103 cursor-pointer w-full sm:w-auto justify-center"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isKn ? 'ಇಂದಿಮಾ ಮಸಾಲೆಗಳನ್ನು ಖರೀದಿಸಿ' : 'Shop Indima Spices'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
