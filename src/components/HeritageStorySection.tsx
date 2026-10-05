import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { HeartHandshake, Leaf, Sparkles, Award } from 'lucide-react';

export const HeritageStorySection: React.FC = () => {
  const { language } = useLanguage();
  const isKn = language === 'kn';

  return (
    <section id="heritage-story-section" className="py-8 sm:py-16 px-3.5 sm:px-6 lg:px-8 max-w-7xl 2xl:max-w-[1500px] mx-auto w-full">
      <div className="bg-[#FFFDF9] border border-[#E8DFD3] rounded-3xl p-4 sm:p-8 lg:p-12 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Visual Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-md border border-[#E8DFD3]">
              <img
                src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80"
                alt="Traditional Spices Preparation"
                className="w-full h-80 sm:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1F1610]/85 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white p-4 backdrop-blur-md bg-[#1F1610]/75 rounded-2xl border border-white/20">
                <p className="font-serif italic text-sm text-amber-200">
                  {isKn ? '“ತಾಯಿಯ ಪ್ರೀತಿಯಷ್ಟೇ ಪರಿಶುದ್ಧ”' : "“Pure as mother's love”"}
                </p>
                <p className="text-[11px] text-amber-100/90 mt-1 font-normal">
                  {isKn ? 'ಮೂರು ದಶಕಗಳ ನೈಜ ಅನುಭವ' : 'Three decades of culinary experience'}
                </p>
              </div>
            </div>

            {/* Heritage Badge */}
            <div className="absolute -bottom-3 -right-3 z-20 bg-[#8B3214] text-white p-3.5 rounded-2xl shadow-lg border border-amber-300/30 hidden sm:flex items-center space-x-2.5">
              <Award className="w-5 h-5 text-amber-300" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-200">INDIMA HERITAGE</p>
                <p className="text-xs font-bold">~30 Years Experience</p>
              </div>
            </div>
          </div>

          {/* Right Story Content Column */}
          <div className="lg:col-span-7 space-y-5">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#FAF7F2] border border-[#DFCFC0] rounded-full text-xs font-bold text-[#8B3214]">
                <Sparkles className="w-3.5 h-3.5 text-[#8B3214]" />
                <span>{isKn ? 'ನಮ್ಮ ಕಥೆ · ಮೂರು ದಶಕಗಳ ಅನುಭವ' : 'OUR STORY · THREE DECADES OF EXPERIENCE'}</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#1F1610] leading-tight">
                {isKn
                  ? 'ಉತ್ತಮ ಅಡುಗೆಗೆ ಅಪ್ಪಟ ಮಸಾಲೆಗಳೇ ಜೀವಾಳ'
                  : 'Good Food Begins with Good Spices'}
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-[#5C483B] leading-relaxed font-normal">
              {isKn
                ? 'ಸುಮಾರು 30 ವರ್ಷಗಳಿಂದ ನಾವು ಒಂದೇ ನಂಬಿಕೆಯೊಂದಿಗೆ ಕೆಲಸ ಮಾಡುತ್ತಿದ್ದೇವೆ: ಮನೆಯ ಅಡುಗೆಗೆ ಬೇಕಾದ ಮಸಾಲೆಗಳು ಪ್ರಾಮಾಣಿಕವಾಗಿರಬೇಕು. ಆಯ್ಕೆ ಮಾಡಿದ ಕಾಳುಗಳಿಂದ ನಿಮ್ಮ ಅಡುಗೆ ಮನೆಗೆ ತಲುಪುವ ಪರಿಮಳದವರೆಗೆ, ಪ್ರತಿಯೊಂದು ಹಂತದಲ್ಲೂ ಪ್ರೀತಿ ಮತ್ತು ಜಾಗರೂಕತೆ ಇರುತ್ತದೆ.'
                : 'For around 30 years, Indima has been built around a simple belief: good food begins with good spices. Rooted in the rich culinary traditions of Karnataka, we bring together carefully selected ingredients to create everyday spice blends made with patience, honesty, and care.'}
            </p>

            <p className="text-xs sm:text-sm text-[#5C483B] leading-relaxed font-normal">
              {isKn
                ? 'ಕರ್ನಾಟಕದ ಮನೆ ಮನೆಗಳಲ್ಲಿ ದಿನನಿತ್ಯದ ಸಾಂಬಾರ್, ರಸಂ ಮತ್ತು ಸಾಂಪ್ರದಾಯಿಕ ಅಡುಗೆಗಳ ರುಚಿ ಹೆಚ್ಚಿಸಲು ನಮ್ಮ ಮಸಾಲೆಗಳು ಸದಾ ಜೊತೆಯಾಗಿವೆ.'
                : 'From whole spices to your dining table, our blends are crafted for everyday Indian kitchens seeking authentic, comforting taste.'}
            </p>

            {/* 3 Grounded Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8DFD3] space-y-2">
                <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center text-[#8B3214] border border-[#DFCFC0]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-xs font-bold text-[#1F1610]">
                  {isKn ? 'ಆಯ್ಕೆ ಮಾಡಿದ ಕಾಳುಗಳು' : 'Carefully Selected'}
                </h3>
                <p className="text-[11px] text-[#7A6455] leading-relaxed">
                  {isKn ? 'ಗುಣಮಟ್ಟದ ಕಾಳು ಮಸಾಲೆಗಳನ್ನು ಮಾತ್ರ ಬಳಸುತ್ತೇವೆ' : 'Whole spices chosen for natural aroma and character.'}
                </p>
              </div>

              <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8DFD3] space-y-2">
                <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center text-[#2B5329] border border-[#DFCFC0]">
                  <Leaf className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-xs font-bold text-[#1F1610]">
                  {isKn ? 'ಕರ್ನಾಟಕದ ಸಂಪ್ರದಾಯ' : 'Karnataka Flavours'}
                </h3>
                <p className="text-[11px] text-[#7A6455] leading-relaxed">
                  {isKn ? 'ದಿನನಿತ್ಯದ ಮನೆ ಊಟಕ್ಕೆ ಹೊಂದಿಕೊಳ್ಳುವ ರುಚಿ' : 'Formulations true to traditional regional home cooking.'}
                </p>
              </div>

              <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8DFD3] space-y-2">
                <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center text-[#8B3214] border border-[#DFCFC0]">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-xs font-bold text-[#1F1610]">
                  {isKn ? 'ಪ್ರಾಮಾಣಿಕ ಕಾಳಜಿ' : 'Crafted with Care'}
                </h3>
                <p className="text-[11px] text-[#7A6455] leading-relaxed">
                  {isKn ? 'ಕುಟುಂಬದ ಆರೋಗ್ಯ ಮತ್ತು ರುಚಿಗೆ ಆದ್ಯತೆ' : 'Made with patience for family dining tables.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
