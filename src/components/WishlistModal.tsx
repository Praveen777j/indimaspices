import React from 'react';
import { X, Heart, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Product } from '../types';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProduct: (product: Product) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  onOpenProduct
}) => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();
  const { language, t } = useLanguage();
  const isKn = language === 'kn';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="relative bg-[#FFFDF9] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#EADBCA] max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-[#F0E6D2] bg-[#FAF6EE] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-[#C05621] fill-[#C05621]" />
            <h2 className="font-serif text-lg font-bold text-neutral-900">
              {t('wishlist')} ({wishlist?.length || 0})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {(wishlist || []).length === 0 ? (
            <div className="py-12 text-center text-neutral-500 text-xs space-y-2">
              <Heart className="w-10 h-10 mx-auto opacity-30 text-[#993300]" />
              <p>{t('wishlistEmpty')}</p>
            </div>
          ) : (
            (wishlist || []).map(product => (
              <div
                key={product.id}
                className="p-3 bg-[#FAF6EE] rounded-xl border border-[#EADBCA] flex items-center justify-between gap-3"
              >
                <div
                  onClick={() => {
                    onClose();
                    onOpenProduct(product);
                  }}
                  className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0"
                >
                  <img
                    src={(product.images && product.images[0]) || '/indima-logo.svg'}
                    alt={product.name_en}
                    className="w-14 h-14 rounded-lg object-cover border border-amber-100 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-neutral-900 truncate">
                      {isKn ? product.name_kn : product.name_en}
                    </h4>
                    <p className="text-[11px] text-neutral-500">{product.weight}</p>
                    <p className="text-xs font-bold text-[#993300] mt-0.5">₹{product.price}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => {
                      addItem(product, 1);
                      removeFromWishlist(product.id);
                    }}
                    className="p-2 rounded-lg bg-[#993300] hover:bg-[#802B00] text-white text-xs font-bold flex items-center space-x-1 cursor-pointer"
                    title="Move to Cart"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="p-2 rounded-lg text-neutral-400 hover:text-red-600 cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
