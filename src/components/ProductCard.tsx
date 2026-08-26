import React from 'react';
import { Heart, Plus, Minus, Star, Eye, Play, Camera, Leaf, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { language, t } = useLanguage();
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isKn = language === 'kn';
  const qtyInCart = getItemQuantity(product.id);
  const isWished = isInWishlist(product.id);

  // Badge mapping
  const badges = Array.isArray(product.badges) ? product.badges : [];
  const renderBadge = () => {
    if (badges.includes('bestseller')) {
      return (
        <span className="bg-[#FAF7F2] border border-[#DFCFC0] text-[#8B3214] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs backdrop-blur-md">
          {isKn ? 'ಹೆಚ್ಚು ಮಾರಾಟವಾದದ್ದು' : 'Bestseller'}
        </span>
      );
    }
    if (badges.includes('homemade')) {
      return (
        <span className="bg-[#EAF2EB] border border-[#CDE0D0] text-[#2B5329] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs backdrop-blur-md">
          {isKn ? 'ಮನೆಯ ಮಸಾಲೆ' : 'Homemade'}
        </span>
      );
    }
    if (badges.includes('natural')) {
      return (
        <span className="bg-[#EAF2EB] border border-[#CDE0D0] text-[#2B5329] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs backdrop-blur-md">
          {isKn ? '100% ನೈಸರ್ಗಿಕ' : '100% Natural'}
        </span>
      );
    }
    return (
      <span className="bg-[#EAF2EB] border border-[#CDE0D0] text-[#2B5329] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs backdrop-blur-md">
        {isKn ? 'ಕಲ್ಲಿನ ಪುಡಿ' : 'Stone-Ground'}
      </span>
    );
  };

  const isOutOfStock = (product.stock || 0) <= 0;
  const isLowStock = (product.stock || 0) > 0 && product.stock <= (product.low_stock_threshold || 10);
  const productImage = (Array.isArray(product.images) && product.images[0]) ? product.images[0] : '/indima-logo.svg';

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative bg-[#FFFDF9] rounded-3xl border border-[#E8DFD3] hover:border-[#8B3214] transition-all duration-300 hover:shadow-md flex flex-col overflow-hidden"
    >
      {/* Product Image Container */}
      <div
        className="relative aspect-4/3 overflow-hidden bg-[#FAF7F2] cursor-pointer"
        onClick={() => onOpenDetails(product)}
      >
        <img
          src={productImage}
          alt={isKn ? product.name_kn : product.name_en}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.includes('indima-logo.svg')) {
              target.src = '/indima-logo.svg';
            }
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {renderBadge()}
          {product.discount_percentage > 0 && (
            <span className="bg-[#2B5329] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
              {product.discount_percentage}% OFF
            </span>
          )}
          {product.video && product.video.trim().length > 0 && (
            <span className="bg-[#1F1610]/85 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs flex items-center space-x-1 backdrop-blur-xs">
              <Play className="w-2.5 h-2.5 fill-amber-200" />
              <span>Video</span>
            </span>
          )}
        </div>

        {/* Multi-Image indicator */}
        {Array.isArray(product.images) && product.images.length > 1 && (
          <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold flex items-center space-x-1 backdrop-blur-xs">
            <Camera className="w-3 h-3 text-amber-300" />
            <span>{product.images.length}</span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={e => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          title={t('wishlist')}
          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 hover:bg-[#FAF7F2] border border-[#DFCFC0] text-[#5C483B] hover:text-[#8B3214] transition-all shadow-2xs z-10 cursor-pointer backdrop-blur-md"
        >
          <Heart className={`w-3.5 h-3.5 ${isWished ? 'fill-[#8B3214] text-[#8B3214]' : ''}`} />
        </button>

        {/* Quick View Button on Hover */}
        <button
          onClick={e => {
            e.stopPropagation();
            onOpenDetails(product);
          }}
          className="absolute bottom-2.5 right-2.5 px-3 py-1.5 bg-white/95 hover:bg-[#FAF7F2] text-[#1F1610] text-xs font-bold rounded-full border border-[#DFCFC0] shadow-sm flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-[#8B3214]" />
          <span>{isKn ? 'ವಿವರ' : 'Details'}</span>
        </button>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-[#1F1610]/70 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="bg-[#8B3214] text-white font-bold text-xs uppercase px-3 py-1 rounded-full tracking-wider">
              {t('outOfStock')}
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Weight & Rating */}
          <div className="flex items-center justify-between text-xs text-[#5C483B] mb-1.5">
            <span className="font-semibold px-2 py-0.5 bg-[#FAF7F2] border border-[#DFCFC0] rounded-full text-[#5C483B] text-[10px]">
              {product.weight}
            </span>
            <div className="flex items-center space-x-1 text-[#C27803] font-bold text-xs">
              <Star className="w-3.5 h-3.5 fill-[#C27803] text-[#C27803]" />
              <span>{product.rating}</span>
              <span className="text-[#8C7667] font-normal">({product.review_count})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onOpenDetails(product)}
            className="font-serif text-sm sm:text-base font-bold text-[#1F1610] line-clamp-1 hover:text-[#8B3214] cursor-pointer transition-colors"
          >
            {isKn ? product.name_kn : product.name_en}
          </h3>

          {/* Short Description */}
          <p className="text-[11px] sm:text-xs text-[#7A6455] line-clamp-2 mt-1 leading-relaxed font-normal">
            {isKn ? product.description_kn : product.description_en}
          </p>

          {/* Low Stock Indicator */}
          {isLowStock && (
            <p className="text-[10px] text-[#8B3214] font-bold mt-1.5 flex items-center gap-1">
              <span>⚠️</span>
              <span>{t('onlyLeft', { count: product.stock })}</span>
            </p>
          )}
        </div>

        {/* Pricing & Add Controls */}
        <div className="pt-3 border-t border-[#F0E6D8] flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-base sm:text-lg font-bold text-[#8B3214]">
                ₹{product.price}
              </span>
              {product.mrp > product.price && (
                <span className="text-xs text-[#9C8778] line-through">
                  ₹{product.mrp}
                </span>
              )}
            </div>
          </div>

          {/* Interactive ADD / − 1 + Button */}
          <div>
            {isOutOfStock ? (
              <button
                disabled
                className="px-3 py-1.5 rounded-full bg-[#FAF7F2] text-[#9C8778] text-xs font-bold uppercase cursor-not-allowed border border-[#DFCFC0]"
              >
                {t('outOfStock')}
              </button>
            ) : qtyInCart === 0 ? (
              <button
                onClick={() => addItem(product, 1)}
                id={`add-btn-${product.id}`}
                className="px-3.5 py-1.5 rounded-full border border-[#8B3214] bg-[#FAF7F2] text-[#8B3214] hover:bg-[#8B3214] hover:text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-2xs cursor-pointer active:scale-95 flex items-center space-x-1"
              >
                <span>{t('add')}</span>
                <Plus className="w-3 h-3" />
              </button>
            ) : (
              <div className="flex items-center bg-[#8B3214] text-white rounded-full shadow-sm overflow-hidden border border-[#6E240D]">
                <button
                  onClick={() => updateQuantity(product.id, -1)}
                  className="px-2.5 py-1.5 hover:bg-[#6E240D] transition-colors cursor-pointer"
                  title="Decrease quantity"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-2 py-1 text-xs font-bold select-none">
                  {qtyInCart}
                </span>
                <button
                  onClick={() => updateQuantity(product.id, 1)}
                  disabled={qtyInCart >= product.stock}
                  className="px-2.5 py-1.5 hover:bg-[#6E240D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Increase quantity"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
