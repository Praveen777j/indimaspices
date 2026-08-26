import React, { useState } from 'react';
import {
  X,
  Star,
  Plus,
  Minus,
  Heart,
  ShieldCheck,
  Truck,
  Leaf,
  Clock,
  Sparkles,
  Play,
  Film,
  Image as ImageIcon
} from 'lucide-react';
import { Product } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose
}) => {
  const { language, t } = useLanguage();
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  if (!product) return null;

  const isKn = language === 'kn';
  const qtyInCart = getItemQuantity(product.id);
  const isWished = isInWishlist(product.id);

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['/indima-logo.svg'];
  const hasVideo = !!product.video && product.video.trim().length > 0;

  // Check if video is YouTube or direct file
  const isYouTube = hasVideo && (product.video!.includes('youtube.com') || product.video!.includes('youtu.be'));
  const getYouTubeEmbedUrl = (url: string) => {
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    if (url.includes('watch?v=')) {
      const id = url.split('watch?v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    return url;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="relative bg-[#FFFDF9] rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-[#EADBCA] max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          id="close-product-modal-btn"
          className="absolute top-3.5 right-3.5 z-30 p-2.5 rounded-full bg-white/90 hover:bg-white text-neutral-600 hover:text-neutral-900 shadow-md transition-all cursor-pointer border border-[#DFC7A2]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Top Section: Media Gallery & Quick Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gallery Column */}
            <div className="space-y-3">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#FAF6EE] border border-[#E8DCC4] flex items-center justify-center">
                {isPlayingVideo && hasVideo ? (
                  isYouTube ? (
                    <iframe
                      src={getYouTubeEmbedUrl(product.video!)}
                      title={product.name_en}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      controls
                      autoPlay
                      className="w-full h-full object-contain bg-black"
                      src={product.video}
                    >
                      Your browser does not support video playback.
                    </video>
                  )
                ) : (
                  <img
                    src={images[activeImageIdx] || '/indima-logo.svg'}
                    alt={isKn ? product.name_kn : product.name_en}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes('indima-logo.svg')) {
                        target.src = '/indima-logo.svg';
                      }
                    }}
                  />
                )}

                {/* Video Play Pill on Image */}
                {hasVideo && !isPlayingVideo && (
                  <button
                    type="button"
                    onClick={() => setIsPlayingVideo(true)}
                    className="absolute bottom-3 left-3 bg-[#993300]/95 hover:bg-[#802B00] text-white px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1.5 shadow-lg backdrop-blur-xs cursor-pointer border border-amber-300/40 transition-transform active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{isKn ? 'ವೀಡಿಯೊ ವೀಕ್ಷಿಸಿ' : 'Watch Product Video'}</span>
                  </button>
                )}

                {/* Discount Badge */}
                {product.discount_percentage > 0 && (
                  <div className="absolute top-3 left-3 bg-[#15803D] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
                    {product.discount_percentage}% OFF
                  </div>
                )}
              </div>

              {/* Media Thumbnails Row (Images + Video) */}
              {(images.length > 1 || hasVideo) && (
                <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                  {/* Photo Thumbnails */}
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setActiveImageIdx(idx);
                        setIsPlayingVideo(false);
                      }}
                      className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        activeImageIdx === idx && !isPlayingVideo
                          ? 'border-[#993300] ring-2 ring-[#993300]/30 shadow-xs'
                          : 'border-neutral-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img || '/indima-logo.svg'}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!target.src.includes('indima-logo.svg')) {
                            target.src = '/indima-logo.svg';
                          }
                        }}
                      />
                    </button>
                  ))}

                  {/* Video Thumbnail */}
                  {hasVideo && (
                    <button
                      type="button"
                      onClick={() => setIsPlayingVideo(true)}
                      className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 bg-neutral-900 flex flex-col items-center justify-center transition-all cursor-pointer text-white ${
                        isPlayingVideo
                          ? 'border-[#993300] ring-2 ring-[#993300]/30 shadow-xs'
                          : 'border-neutral-300 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <Play className="w-5 h-5 fill-amber-400 text-amber-400" />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-300 mt-0.5">Video</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Info Column */}
            <div className="space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#993300] bg-[#FAF6EE] px-3 py-1 rounded-full border border-[#EADBCA]">
                    {product.weight}
                  </span>
                  <div className="flex items-center space-x-1 text-amber-600 font-bold text-sm">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>{product.rating}</span>
                    <span className="text-neutral-400 font-normal">({product.review_count} {t('reviews')})</span>
                  </div>
                </div>

                <h2 className="font-serif text-2xl font-bold text-neutral-900 leading-snug">
                  {isKn ? product.name_kn : product.name_en}
                </h2>

                <p className="text-xs text-neutral-500 mt-1 font-mono">
                  SKU: {product.sku}
                </p>

                {/* Price Section */}
                <div className="mt-3 flex items-baseline space-x-3">
                  <span className="text-3xl font-black text-[#993300]">
                    ₹{product.price}
                  </span>
                  {product.mrp > product.price && (
                    <span className="text-base text-neutral-400 line-through">
                      ₹{product.mrp}
                    </span>
                  )}
                  {product.discount_percentage > 0 && (
                    <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      {t('save', { percent: product.discount_percentage })}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-neutral-700 mt-3.5 leading-relaxed">
                  {isKn ? product.description_kn : product.description_en}
                </p>
              </div>

              {/* Action Buttons: ADD to Cart & Wishlist */}
              <div className="pt-4 border-t border-[#F0E6D2] space-y-3">
                <div className="flex items-center space-x-3">
                  {product.stock <= 0 ? (
                    <div className="flex-1 py-3 text-center bg-neutral-100 text-neutral-500 rounded-2xl font-bold text-sm">
                      {t('outOfStock')}
                    </div>
                  ) : qtyInCart === 0 ? (
                    <button
                      onClick={() => addItem(product, 1)}
                      className="flex-1 bg-gradient-to-r from-[#993300] to-[#C05621] hover:from-[#802B00] hover:to-[#A84315] text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t('add')}</span>
                    </button>
                  ) : (
                    <div className="flex-1 flex items-center justify-between bg-[#FAF6EE] border-2 border-[#993300] rounded-2xl p-1.5">
                      <button
                        onClick={() => updateQuantity(product.id, -1)}
                        className="p-2 rounded-xl bg-[#993300] text-white hover:bg-[#802B00] cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-extrabold text-neutral-900 text-sm">
                        {qtyInCart} {isKn ? 'ಬುಟ್ಟಿಯಲ್ಲಿದೆ' : 'in Basket'}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, 1)}
                        disabled={qtyInCart >= product.stock}
                        className="p-2 rounded-xl bg-[#993300] text-white hover:bg-[#802B00] disabled:opacity-50 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => toggleWishlist(product)}
                    className="p-3.5 rounded-2xl border border-[#EADBCA] bg-[#FAF6EE] hover:bg-[#F3EAD7] text-neutral-700 transition-colors cursor-pointer"
                    title={t('wishlist')}
                  >
                    <Heart className={`w-5 h-5 ${isWished ? 'fill-[#C05621] text-[#C05621]' : ''}`} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600">
                  <div className="flex items-center space-x-1.5">
                    <Leaf className="w-4 h-4 text-emerald-600" />
                    <span>{isKn ? '೧೦೦% ಶುದ್ಧ ಪದಾರ್ಥಗಳು' : '100% Pure Natural'}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>{t('shelfLife')}: {product.shelf_life}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Ingredients & Traditional Preparation Breakdown */}
          <div className="border-t border-[#F0E6D2] pt-5 space-y-4">
            {/* Ingredients */}
            <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#EADBCA]">
              <h3 className="font-serif text-sm font-bold text-[#993300] uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                <span>✦</span>
                <span>{t('ingredients')}</span>
              </h3>
              <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed">
                {isKn ? product.ingredients_kn : product.ingredients_en}
              </p>
            </div>

            {/* Traditional Heritage & Method */}
            <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#EADBCA]">
              <h3 className="font-serif text-sm font-bold text-[#993300] uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                <span>✦</span>
                <span>{t('traditionalWisdom')}</span>
              </h3>
              <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed">
                {isKn ? product.traditional_info_kn : product.traditional_info_en}
              </p>
            </div>

            {/* Storage Instructions */}
            <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#EADBCA]">
              <h3 className="font-serif text-sm font-bold text-[#993300] uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                <span>✦</span>
                <span>{t('storageInfo')}</span>
              </h3>
              <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed">
                {isKn ? product.storage_kn : product.storage_en}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
