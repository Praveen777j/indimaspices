import React, { useState } from 'react';
import { Recipe, Product } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { Clock, ChefHat, Play, ShoppingBag, Sparkles } from 'lucide-react';

interface RecipeSectionProps {
  recipes?: Recipe[];
  products?: Product[];
  onOpenProduct: (product: Product) => void;
}

export const RecipeSection: React.FC<RecipeSectionProps> = ({
  recipes = [],
  products = [],
  onOpenProduct
}) => {
  const { language, t } = useLanguage();
  const { addItem } = useCart();
  const isKn = language === 'kn';

  const validRecipes = recipes || [];
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(validRecipes[0] || null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  if (!validRecipes || validRecipes.length === 0) return null;
  const current = activeRecipe || validRecipes[0];
  if (!current) return null;

  const rawIngredients = isKn
    ? current.ingredients_kn || current.ingredients_en
    : current.ingredients_en || current.ingredients_kn;
  const ingredients = Array.isArray(rawIngredients) ? rawIngredients : [];

  const rawInstructions = isKn
    ? current.instructions_kn || current.instructions_en
    : current.instructions_en || current.instructions_kn;
  const instructions = Array.isArray(rawInstructions) ? rawInstructions : [];

  const relatedProductIds = Array.isArray(current.featured_spice_ids)
    ? current.featured_spice_ids
    : Array.isArray((current as any).related_product_ids)
    ? (current as any).related_product_ids
    : [];

  return (
    <section id="recipes-section" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-[#FFFDF9] border border-[#E8DFD3] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 bg-[#FAF7F2] border border-[#DFCFC0] rounded-full text-xs font-bold text-[#8B3214] shadow-2xs">
            <ChefHat className="w-3.5 h-3.5 text-[#8B3214]" />
            <span>{isKn ? 'ಕರ್ನಾಟಕದ ಸಾಂಪ್ರದಾಯಿಕ ಪಾಕವಿಧಾನಗಳು' : 'Karnataka Kitchen Heritage'}</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#1F1610] tracking-tight">
            {isKn ? 'ಮನೆಯಡುಗೆಯ ಪರಿಮಳ & ಪಾಕವಿಧಾನಗಳು' : 'Cook Authentic Karnataka Dishes'}
          </h2>
          <p className="text-xs sm:text-sm text-[#5C483B] font-normal">
            {isKn
              ? 'ಇಂದಿಮಾ ಅಪ್ಪಟ ಮಸಾಲೆಗಳೊಂದಿಗೆ ತಾಯಿಯ ಕೈರುಚಿಯ ಅಡುಗೆಗಳನ್ನು ಮನೆಯಲ್ಲೇ ತಯಾರಿಸಿ'
              : 'Recreate timeless heritage flavours with stone-ground pure spices'}
          </p>
        </div>

        {/* Recipe Selection Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2 mb-6 scrollbar-none justify-start sm:justify-center">
          {validRecipes.map(rec => {
            const isSelected = current?.id === rec.id;
            return (
              <button
                key={rec.id}
                onClick={() => {
                  setActiveRecipe(rec);
                  setIsPlayingVideo(false);
                }}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#8B3214] text-white border border-[#6E240D] shadow-sm'
                    : 'bg-[#FAF7F2] text-[#5C483B] hover:text-[#1F1610] hover:bg-[#F5EFEB] border border-[#E8DFD3]'
                }`}
              >
                {isKn ? rec.title_kn : rec.title_en}
              </button>
            );
          })}
        </div>

        {/* Active Recipe Showcase Bento Pod */}
        {current && (
          <div className="bg-[#FAF7F2] rounded-3xl border border-[#E8DFD3] overflow-hidden shadow-2xs grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 sm:p-7">
            {/* Left Media Column (Video / Image) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-white border border-[#E8DFD3] shadow-2xs">
                {isPlayingVideo && current.video_url ? (
                  <video
                    controls
                    autoPlay
                    className="w-full h-full object-cover"
                    src={current.video_url}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={current.image}
                    alt={isKn ? current.title_kn : current.title_en}
                    className="w-full h-full object-cover"
                  />
                )}

                {current.video_url && !isPlayingVideo && (
                  <button
                    onClick={() => setIsPlayingVideo(true)}
                    className="absolute inset-0 bg-black/40 hover:bg-black/50 flex items-center justify-center transition-colors cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#8B3214] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform border border-amber-200/40">
                      <Play className="w-6 h-6 fill-white ml-1" />
                    </div>
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-[#1F1610] bg-white p-3 rounded-2xl border border-[#E8DFD3]">
                <span className="flex items-center space-x-1.5 font-bold">
                  <Clock className="w-4 h-4 text-[#8B3214]" />
                  <span>{t('prepTime')}: {current.prep_time}</span>
                </span>
                <span className="font-bold text-[#2B5329] bg-[#EAF2EB] px-2.5 py-0.5 rounded-full border border-[#CDE0D0]">
                  {isKn ? '೪ ಜನರಿಗೆ ಸೂಕ್ತ' : 'Serves 4'}
                </span>
              </div>
            </div>

            {/* Right Recipe Content Column */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#1F1610]">
                  {isKn ? current.title_kn : current.title_en}
                </h3>
                <p className="text-xs sm:text-sm text-[#5C483B] mt-1 leading-relaxed font-normal">
                  {isKn ? current.description_kn : current.description_en}
                </p>

                {/* Ingredients & Steps Bento Sub-boxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Ingredients */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E8DFD3] shadow-2xs">
                    <h4 className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#8B3214] mb-2 flex items-center space-x-1.5">
                      <Sparkles className="w-3 h-3 text-[#8B3214]" />
                      <span>{t('ingredients')}</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-[#5C483B]">
                      {ingredients.map((ing, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <span className="text-[#2B5329] font-bold">•</span>
                          <span>{ing}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Steps */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E8DFD3] shadow-2xs">
                    <h4 className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#8B3214] mb-2 flex items-center space-x-1.5">
                      <Sparkles className="w-3 h-3 text-[#8B3214]" />
                      <span>{t('steps')}</span>
                    </h4>
                    <ol className="space-y-2 text-xs text-[#5C483B]">
                      {instructions.map((step, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="font-bold text-[#8B3214] shrink-0">{idx + 1}.</span>
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>

              {/* Spices Used & Instant Add-To-Cart Action */}
              <div className="pt-4 border-t border-[#E8DFD3] flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs">
                  <span className="font-bold text-[#1F1610]">
                    {isKn ? 'ಬಳಸಿದ ಪ್ರಮುಖ ಮಸಾಲೆಗಳು:' : 'Authentic Spices for this Recipe:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {relatedProductIds.map(pid => {
                      const prod = (products || []).find(p => p.id === pid);
                      if (!prod) return null;
                      return (
                        <button
                          key={pid}
                          onClick={() => onOpenProduct(prod)}
                          className="px-3 py-1 bg-white border border-[#DFCFC0] hover:border-[#8B3214] rounded-full text-[11px] font-bold text-[#8B3214] transition-colors cursor-pointer shadow-2xs"
                        >
                          {isKn ? prod.name_kn : prod.name_en} (₹{prod.price})
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => {
                    relatedProductIds.forEach(pid => {
                      const prod = (products || []).find(p => p.id === pid);
                      if (prod && (prod.stock || 0) > 0) addItem(prod, 1);
                    });
                  }}
                  className="px-4 py-2.5 rounded-full bg-[#8B3214] hover:bg-[#6E240D] text-white font-bold text-xs flex items-center space-x-2 shadow-sm transition-all cursor-pointer active:scale-95 border border-[#6E240D]"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-200" />
                  <span>{isKn ? 'ಎಲ್ಲಾ ಮಸಾಲೆಗಳನ್ನು ಸೇರಿಸಿ' : 'Add Recipe Spices to Basket'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

