import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ShieldCheck, HeartHandshake, Leaf, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';

export const HeritageStorySection: React.FC = () => {
  const { language, t } = useLanguage();
  const isKn = language === 'kn';

  return (
    <section id="heritage-story-section" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-[#FFFDF9] border border-[#E8DFD3] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Visual Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-md border border-[#E8DFD3]">
              <img
                src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80"
                alt="Traditional Bengaluru Stone Grinding"
                className="w-full h-80 sm:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1F1610]/85 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white p-4 backdrop-blur-md bg-[#1F1610]/75 rounded-2xl border border-white/20">
                <p className="font-serif italic text-sm text-amber-200">
                  {isKn ? '“ತಾಯಿಯ ಪ್ರೀತಿಯಷ್ಟೇ ಪರಿಶುದ್ಧ”' : '“Pure as mother\'s kitchen love”'}
                </p>
                <p className="text-[11px] text-amber-100/90 mt-1 font-normal">
                  {isKn ? 'ಬಸವನಗುಡಿ & ಬೆಂಗಳೂರಿನ ಸಾಂಪ್ರದಾಯಿಕ ಕಲ್ಲಿನ ಬೀಸುವ ಪದ್ಧತಿ' : 'Handcrafted weekly in our artisanal Bengaluru kitchen'}
                </p>
              </div>
            </div>

            {/* Bengaluru Badge */}
            <div className="absolute -bottom-3 -right-3 z-20 bg-[#8B3214] text-white p-3.5 rounded-2xl shadow-lg border border-amber-300/30 hidden sm:flex items-center space-x-2.5">
              <MapPin className="w-5 h-5 text-amber-300" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-200">BENGALURU KITCHEN</p>
                <p className="text-xs font-bold">100% Stone-Ground</p>
              </div>
            </div>
          </div>

          {/* Right Story Content Column */}
          <div className="lg:col-span-7 space-y-5">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#FAF7F2] border border-[#DFCFC0] rounded-full text-xs font-bold text-[#8B3214]">
                <Sparkles className="w-3.5 h-3.5 text-[#8B3214]" />
                <span>{isKn ? 'ನಮ್ಮ ಪರಂಪರೆಯ ಕಥೆ' : 'Our Bengaluru Heritage'}</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#1F1610] leading-tight">
                {isKn
                  ? 'ಬೆಂಗಳೂರಿನ ಮನೆಮನೆಗೆ ಶುದ್ಧ, ರಾಸಾಯನಿಕ-ಮುಕ್ತ ಮಸಾಲೆಗಳ ಸುವಾಸನೆ'
                  : 'From Ancient Karnataka Kitchens to Modern Bengaluru Homes'}
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-[#5C483B] leading-relaxed font-normal">
              {isKn
                ? 'ಕರ್ನಾಟಕದ ಸಾಂಪ್ರದಾಯಿಕ ಅಡುಗೆ ಮನೆಗಳಲ್ಲಿ ಬಳಸುತ್ತಿದ್ದ ಕಲ್ಲಿನ ಬೀಸುವ ಕಲ್ಲುಗಳ ಸತ್ವವನ್ನು ನಾವು ಇಂದಿಮಾದಲ್ಲಿ ಜೀವಂತವಾಗಿಟ್ಟಿದ್ದೇವೆ. ರೈತರಿಂದ ನೇರವಾಗಿ ತಂದ ಮೊದಲ ದರ್ಜೆಯ ಕಾಳು ಮಸಾಲೆಗಳನ್ನು ಬಿಸಿಲಿನಲ್ಲಿ ಒಣಗಿಸಿ, ಮಂದ ಉರಿಯಲ್ಲಿ ಹುರಿದು ಸಣ್ಣ ಬ್ಯಾಚ್‌ಗಳಲ್ಲಿ ಪುಡಿ ಮಾಡುತ್ತೇವೆ.'
                : 'In a world dominated by ultra-processed, factory-pulverized spice dust, Indima brings back the slow, artisanal integrity of stone-ground spices. We hand-clean farm-sourced whole spices, sun-dry them, slow-roast them over wood embers, and stone-mill in small weekly batches right here in Bengaluru.'}
            </p>

            {/* 3 Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8DFD3] space-y-2">
                <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center text-[#8B3214] border border-[#DFCFC0]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-xs font-bold text-[#1F1610]">
                  {isKn ? '0% ಕಲಬೆರಕೆ' : 'Zero Adulteration'}
                </h3>
                <p className="text-[11px] text-[#7A6455] leading-relaxed">
                  {isKn ? 'ಯಾವುದೇ ಕೃತಕ ಬಣ್ಣ, ಮರದ ಪುಡಿ ಅಥವಾ ರಾಸಾಯನಿಕಗಳಿಲ್ಲ' : 'No synthetic dyes, spent spice residue, or starch fillers.'}
                </p>
              </div>

              <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8DFD3] space-y-2">
                <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center text-[#2B5329] border border-[#DFCFC0]">
                  <Leaf className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-xs font-bold text-[#1F1610]">
                  {isKn ? 'ಕಲ್ಲಿನ ಬೀಸುವಿಕೆ' : 'Cold Stone-Ground'}
                </h3>
                <p className="text-[11px] text-[#7A6455] leading-relaxed">
                  {isKn ? 'ನೈಸರ್ಗಿಕ ಸುಗಂಧ ತೈಲಗಳು ಮತ್ತು ಔಷಧೀಯ ಗುಣಗಳು ಸಂರಕ್ಷಿತ' : 'Volatile aromatic oils preserved without high-heat burning.'}
                </p>
              </div>

              <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8DFD3] space-y-2">
                <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center text-[#8B3214] border border-[#DFCFC0]">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-xs font-bold text-[#1F1610]">
                  {isKn ? 'ಅಪ್ಪಟ ನೈಜ ರುಚಿ' : '50% Less Quantity'}
                </h3>
                <p className="text-[11px] text-[#7A6455] leading-relaxed">
                  {isKn ? 'ಅರ್ಧ ಚಮಚದಲ್ಲೇ ಮನೆಯ ಸಾಂಬಾರ್, ರಸಂಗೆ ಅದ್ಭುತ ರುಚಿ' : 'High potency purity means just 1 small spoon gives deep aroma.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
