import React, { useState, useRef } from 'react';
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

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only apply 3D tilt on fine pointer devices (desktop)
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tiltX = -((y - centerY) / centerY) * 6;
    const tiltY = ((x - centerX) / centerX) * 6;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const isKn = language === 'kn';
  const qtyInCart = getItemQuantity(product.id);
  const isWished = isInWishlist(product.id);

  // Badge mapping
  const badges = Array.isArray(product.badges) ? product.badges : [];
  const renderBadge = () => {
    if (badges.includes('bestseller')) {
      return (
        <span className="bg-[#FAF7F2] border border-[#DFCFC0] text-[#8B3214] text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs backdrop-blur-md truncate">
          {isKn ? 'ಹೆಚ್ಚು ಮಾರಾಟವಾದದ್ದು' : 'Bestseller'}
        </span>
      );
    }
    if (badges.includes('homemade')) {
      return (
        <span className="bg-[#EAF2EB] border border-[#CDE0D0] text-[#2B5329] text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs backdrop-blur-md truncate">
          {isKn ? 'ಮನೆಯ ಮಸಾಲೆ' : 'Homemade'}
        </span>
      );
    }
    if (badges.includes('natural')) {
      return (
        <span className="bg-[#EAF2EB] border border-[#CDE0D0] text-[#2B5329] text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs backdrop-blur-md truncate">
          {isKn ? '100% ನೈಸರ್ಗಿಕ' : '100% Pure'}
        </span>
      );
    }
    return (
      <span className="bg-[#EAF2EB] border border-[#CDE0D0] text-[#2B5329] text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs backdrop-blur-md truncate">
        {isKn ? 'ಕಲ್ಲಿನ ಪುಡಿ' : 'Stone-Ground'}
      </span>
    );
  };

  const isOutOfStock = (product.stock || 0) <= 0;
  const isLowStock = (product.stock || 0) > 0 && product.stock <= (product.low_stock_threshold || 10);
  const productImage = (Array.isArray(product.images) && product.images[0]) ? product.images[0] : '/indima-logo.svg';
  const productName = (isKn && product.name_kn ? product.name_kn : (product.name_en || (product as any).name)) || product.name_en || (product as any).name || product.name_kn || 'Spice Blend';

  return (
    <div
      ref={cardRef}
      id={`product-card-${product.id}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.15s ease-out, box-shadow 0.3s ease, border-color 0.3s ease'
      }}
      className="group relative bg-[#FFFDF9] rounded-2xl sm:rounded-3xl border border-[#DFC7A2]/80 hover:border-[#8B3214] transition-all duration-300 hover:shadow-xl hover:shadow-[#8B3214]/10 flex flex-col overflow-hidden w-full"
    >
      {/* Product Image Container */}
      <div
        className="relative aspect-4/3 overflow-hidden bg-[#FAF7F2] cursor-pointer"
        onClick={() => onOpenDetails(product)}
      >
        <img
          src={productImage}
          alt={`Indima Spice Co. ${productName}`}
          title={`Indima Spice Co. ${productName}`}
          loading="lazy"
          width={400}
          height={300}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.includes('indima-logo.svg')) {
              target.src = '/indima-logo.svg';
            }
          }}
        />


        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 max-w-[70%]">
          {renderBadge()}
          {product.discount_percentage > 0 && (
            <span className="bg-[#2B5329] text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs w-fit">
              {product.discount_percentage}% OFF
            </span>
          )}
          {product.video && product.video.trim().length > 0 && (
            <span className="bg-[#1F1610]/85 text-amber-200 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs flex items-center space-x-1 backdrop-blur-xs w-fit">
              <Play className="w-2.5 h-2.5 fill-amber-200" />
              <span>Video</span>
            </span>
          )}
        </div>

        {/* Multi-Image indicator */}
        {Array.isArray(product.images) && product.images.length > 1 && (
          <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-full bg-black/60 text-white text-[9px] sm:text-[10px] font-bold flex items-center space-x-1 backdrop-blur-xs">
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
          className="absolute top-2 right-2 p-1.5 sm:p-2 rounded-full bg-white/90 hover:bg-[#FAF7F2] border border-[#DFCFC0] text-[#5C483B] hover:text-[#8B3214] transition-all shadow-2xs z-10 cursor-pointer backdrop-blur-md min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center"
        >
          <Heart className={`w-3.5 h-3.5 ${isWished ? 'fill-[#8B3214] text-[#8B3214]' : ''}`} />
        </button>

        {/* Quick View Button on Hover (hidden on touch/small devices, shown on desktop hover) */}
        <button
          onClick={e => {
            e.stopPropagation();
            onOpenDetails(product);
          }}
          className="hidden sm:flex absolute bottom-2.5 right-2.5 px-3 py-1.5 bg-white/95 hover:bg-[#FAF7F2] text-[#1F1610] text-xs font-bold rounded-full border border-[#DFCFC0] shadow-sm items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-[#8B3214]" />
          <span>{isKn ? 'ವಿವರ' : 'Details'}</span>
        </button>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-[#1F1610]/70 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="bg-[#8B3214] text-white font-bold text-[10px] sm:text-xs uppercase px-2.5 py-1 rounded-full tracking-wider">
              {t('outOfStock')}
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-2.5 sm:p-4 lg:p-5 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
        <div>
          {/* Weight & Rating */}
          <div className="flex items-center justify-between text-xs text-[#5C483B] mb-1 gap-1">
            <span className="font-semibold px-2 py-0.5 bg-[#FAF7F2] border border-[#DFCFC0] rounded-full text-[#5C483B] text-[9px] sm:text-[10px] truncate max-w-[60%]">
              {product.weight}
            </span>
            <div className="flex items-center space-x-1 text-[#C27803] font-bold text-[10px] sm:text-xs shrink-0">
              <Star className="w-3 h-3 fill-[#C27803] text-[#C27803]" />
              <span className="tabular-nums">{product.rating}</span>
              <span className="text-[#8C7667] font-normal text-[9px] sm:text-xs">({product.review_count})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onOpenDetails(product)}
            className="font-serif text-xs sm:text-sm lg:text-base font-bold text-[#1F1610] line-clamp-2 hover:text-[#8B3214] cursor-pointer transition-colors leading-snug"
          >
            {isKn ? product.name_kn : product.name_en}
          </h3>

          {/* Short Description */}
          <p className="text-[10px] sm:text-xs text-[#7A6455] line-clamp-2 mt-1 leading-relaxed font-normal">
            {isKn ? product.description_kn : product.description_en}
          </p>

          {/* Low Stock Indicator */}
          {isLowStock && (
            <p className="text-[9px] sm:text-[10px] text-[#8B3214] font-bold mt-1 flex items-center gap-1">
              <span>⚠️</span>
              <span className="truncate">{t('onlyLeft', { count: product.stock })}</span>
            </p>
          )}
        </div>

        {/* Pricing & Add Controls */}
        <div className="pt-2 sm:pt-3 border-t border-[#F0E6D8] flex items-center justify-between gap-1.5">
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline flex-wrap gap-x-1.5 gap-y-0.5">
              <span className="text-xs sm:text-sm lg:text-base font-bold text-[#8B3214] tabular-nums whitespace-nowrap">
                ₹{product.price}
              </span>
              {product.mrp > product.price && (
                <span className="text-[9px] sm:text-xs text-[#9C8778] line-through tabular-nums whitespace-nowrap">
                  ₹{product.mrp}
                </span>
              )}
            </div>
          </div>

          {/* Interactive ADD / − 1 + Button */}
          <div className="shrink-0">
            {isOutOfStock ? (
              <button
                disabled
                className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-[#FAF7F2] text-[#9C8778] text-[9px] sm:text-xs font-bold uppercase cursor-not-allowed border border-[#DFCFC0]"
              >
                {t('outOfStock')}
              </button>
            ) : qtyInCart === 0 ? (
              <button
                onClick={() => addItem(product, 1)}
                id={`add-btn-${product.id}`}
                className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-[#8B3214] bg-[#FAF7F2] text-[#8B3214] hover:bg-[#8B3214] hover:text-white font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all duration-200 shadow-2xs cursor-pointer active:scale-95 flex items-center space-x-1 min-h-[32px] sm:min-h-[36px]"
              >
                <span>{t('add')}</span>
                <Plus className="w-3 h-3" />
              </button>
            ) : (
              <div className="flex items-center bg-[#8B3214] text-white rounded-full shadow-sm overflow-hidden border border-[#6E240D] min-h-[32px] sm:min-h-[36px]">
                <button
                  onClick={() => updateQuantity(product.id, -1)}
                  className="px-2 sm:px-2.5 py-1 sm:py-1.5 hover:bg-[#6E240D] transition-colors cursor-pointer"
                  title="Decrease quantity"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-1.5 sm:px-2 py-0.5 text-xs font-bold select-none min-w-[16px] sm:min-w-[20px] text-center tabular-nums">
                  {qtyInCart}
                </span>
                <button
                  onClick={() => updateQuantity(product.id, 1)}
                  disabled={qtyInCart >= product.stock}
                  className="px-2 sm:px-2.5 py-1 sm:py-1.5 hover:bg-[#6E240D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
