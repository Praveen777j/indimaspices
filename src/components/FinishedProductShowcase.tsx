import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { Product } from '../types';
import { Sparkles, ShoppingBag, ArrowRight, Star, ShieldCheck, Heart } from 'lucide-react';
import { spicePackImg } from '../assets/images';

interface FinishedProductShowcaseProps {
  products: Product[];
  onOpenProduct: (product: Product) => void;
  onExploreShop: () => void;
}

export const FinishedProductShowcase: React.FC<FinishedProductShowcaseProps> = ({
  products,
  onOpenProduct,
  onExploreShop
}) => {
  const { language } = useLanguage();
  const isKn = language === 'kn';
  const { addItem, getItemQuantity } = useCart();

  // Highlight flagship crafted blends & powders
  const flagshipProducts = products
    .filter(p => p.active)
    .slice(0, 4);

  if (flagshipProducts.length === 0) return null;

  return (
    <section id="finished-product-section" className="relative py-16 sm:py-24 bg-[#FAF6EE] text-[#1F1610] overflow-hidden border-b border-[#DFC7A2]">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-400/8 blur-[180px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl 2xl:max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#FAF0DC] border border-[#DFC7A2] text-xs font-mono tracking-widest text-[#8B3214] uppercase font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#8B3214]" />
              <span>{isKn ? 'ಸಿದ್ಧಪಡಿಸಿದ ಮಸಾಲೆಗಳು' : 'PART 06 · FINISHED PRODUCT'}</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#1F1610] leading-tight">
              {isKn ? (
                <>
                  ಕಲ್ಲಿನಲ್ಲಿ ಅರೆದ ಅಪ್ಪಟ ಮಸಾಲೆಗಳು. <br />
                  <span className="text-[#8B3214]">ನಿಮ್ಮ ಕೈಗೆ ಸಿದ್ಧ.</span>
                </>
              ) : (
                <>
                  From Granite Mill to Airtight Seal. <br />
                  <span className="text-[#8B3214]">Our Flagship Finished Blends.</span>
                </>
              )}
            </h2>

            <p className="text-xs sm:text-sm text-[#5C483B] max-w-xl font-normal leading-relaxed">
              {isKn
                ? 'ಪ್ರತಿಯೊಂದು ಪಾಕೆಟ್‌ ಕೂಡ ಯಾವುದೇ ಕೃತಕ ಬಣ್ಣ, ಮರದ ಪುಡಿ ಅಥವಾ ರಾಸಾಯನಿಕಗಳಿಲ್ಲದೆ ಶುದ್ಧವಾಗಿ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ. ತೆರೆದಾಗ ಸುವಾಸನೆ ನಿಮ್ಮ ಮನೆಯಿಡೀ ಹರಡುತ್ತದೆ.'
                : 'Sealed fresh in nitrogen-flushed, aroma-barrier pouches within hours of stone-milling. Experience pure essential oil volatility in every pinch.'}
            </p>
          </div>

          <button
            onClick={onExploreShop}
            type="button"
            className="inline-flex items-center space-x-2.5 px-6 py-3.5 rounded-full bg-[#8B3214] hover:bg-[#72270E] text-white text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-300 shadow-md shadow-[#8B3214]/20 hover:scale-103 cursor-pointer self-start md:self-auto"
          >
            <span>{isKn ? 'ಎಲ್ಲಾ ಮಸಾಲೆಗಳ ಅಂಗಡಿ' : 'Explore Full Shop'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Finished Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {flagshipProducts.map(product => {
            const qty = getItemQuantity(product.id);
            const mainImg = product.images?.[0] || spicePackImg;
            const savings = product.mrp && product.mrp > product.price ? product.mrp - product.price : 0;

            return (
              <div
                key={product.id}
                className="group relative bg-[#FFFDF9] rounded-3xl border border-[#DFC7A2] p-5 shadow-sm hover:shadow-xl hover:border-[#8B3214]/40 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Container with Badges */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#FAF6EE] mb-4 border border-[#E8DFD3]/60">
                  <img
                    src={mainImg}
                    alt={product.name_en}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                    loading="lazy"
                  />

                  {/* Purity Ribbon Badge */}
                  <div className="absolute top-3 left-3 inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#FAF0DC] text-[#8B3214] border border-[#DFC7A2] text-[10px] font-mono font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-3 h-3 text-[#8B3214]" />
                    <span>{isKn ? '೧೦೦% ಶುದ್ಧ' : 'Stone-Ground'}</span>
                  </div>

                  {/* Net Weight */}
                  {product.weight && (
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/65 backdrop-blur-xs text-white text-[11px] font-mono">
                      {product.weight}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-1 text-amber-500 text-xs">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-bold text-[#1F1610]">{product.rating || 4.9}</span>
                    <span className="text-[#8C6D53] text-[11px]">({product.review_count || 48})</span>
                  </div>

                  <h3
                    onClick={() => onOpenProduct(product)}
                    className="font-serif text-lg font-bold text-[#1F1610] group-hover:text-[#8B3214] transition-colors cursor-pointer line-clamp-1"
                  >
                    {isKn ? product.name_kn || product.name_en : product.name_en}
                  </h3>

                  <p className="text-xs text-[#5C483B] line-clamp-2 font-normal leading-relaxed">
                    {isKn ? product.description_kn || product.description_en : product.description_en}
                  </p>
                </div>

                {/* Pricing & Add to Cart Footer */}
                <div className="pt-4 mt-4 border-t border-[#E8DFD3] flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline space-x-2">
                      <span className="font-serif text-xl font-bold text-[#8B3214]">
                        ₹{product.price}
                      </span>
                      {product.mrp && product.mrp > product.price && (
                        <span className="text-xs text-[#8C6D53] line-through">
                          ₹{product.mrp}
                        </span>
                      )}
                    </div>
                    {savings > 0 && (
                      <span className="text-[10px] font-bold text-emerald-700">
                        {isKn ? `₹${savings} ಉಳಿತಾಯ` : `Save ₹${savings}`}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => addItem(product, 1)}
                    type="button"
                    className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-full bg-[#8B3214] hover:bg-[#72270E] text-white text-xs font-bold transition-all shadow-xs hover:scale-104 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{qty > 0 ? `${qty} in Cart` : isKn ? 'ಖರೀದಿಸಿ' : 'Add'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
