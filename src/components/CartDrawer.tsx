import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  MessageCircle,
  Truck,
  Tag
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { BusinessSettings, Offer } from '../types';
import { BrandLogo } from './BrandLogo';

interface CartDrawerProps {
  settings: BusinessSettings;
  offers: Offer[];
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  settings,
  offers,
  onProceedToCheckout
}) => {
  const { language, t } = useLanguage();
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    discount,
    shippingFee,
    totalAmount,
    totalItems,
    appliedCoupon,
    applyCoupon,
    generateWhatsAppOrderUrl
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isCartOpen) return null;

  const isKn = language === 'kn';
  const freeShippingTarget = settings.free_delivery_threshold || 499;
  const progressToFreeShipping = Math.min(100, Math.round((subtotal / freeShippingTarget) * 100));
  const amountNeededForFree = Math.max(0, freeShippingTarget - subtotal);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponInput.trim()) return;

    const matched = offers.find(
      o => o.active && o.code.toUpperCase() === couponInput.trim().toUpperCase()
    );

    if (!matched) {
      setCouponError(isKn ? 'ಅಮಾನ್ಯ ಕೂಪನ್ ಕೋಡ್' : 'Invalid or expired coupon code');
      return;
    }

    if (subtotal < matched.min_order_amount) {
      setCouponError(
        isKn
          ? `ಈ ಕೂಪನ್‌ಗೆ ಕನಿಷ್ಠ ₹${matched.min_order_amount} ಖರೀದಿಯ ಅಗತ್ಯವಿದೆ`
          : `Minimum order of ₹${matched.min_order_amount} required for this coupon`
      );
      return;
    }

    applyCoupon(matched);
    setCouponInput('');
  };

  const handleWhatsAppOrder = () => {
    const url = generateWhatsAppOrderUrl(settings);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div
        className="absolute inset-0"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer Container (Generous width on desktop, comfortable height on mobile) */}
      <div
        id="cart-drawer-container"
        className="relative w-full max-w-lg bg-[#FFFDF9] h-full sm:h-full flex flex-col shadow-2xl z-10 border-l border-[#E8DFD3] mt-auto sm:mt-0 rounded-t-3xl sm:rounded-none max-h-[94vh] sm:max-h-full transition-all"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8DFD3] bg-[#FAF7F2] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <BrandLogo customUrl={settings.logo_url} size="sm" />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-serif text-base sm:text-lg font-bold text-[#1F1610]">
                  {t('cartTitle')}
                </h2>
                <span className="text-xs font-bold bg-[#8B3214] text-white px-2 py-0.5 rounded-full shadow-2xs">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </span>
              </div>
              <p className="text-[11px] text-[#7A6455] font-serif italic">
                {isKn ? 'ತಾಜಾ ಕಲ್ಲಿನ ಮಸಾಲೆಗಳು' : 'Stone-ground pure spices'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            id="close-cart-btn"
            className="p-2 rounded-full hover:bg-neutral-200/70 text-[#5C483B] hover:text-[#1F1610] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-[#FAF6EE] px-4 py-2.5 border-b border-[#F0E6D2] text-xs">
          <div className="flex items-center justify-between font-semibold mb-1 text-neutral-700">
            <span className="flex items-center space-x-1">
              <Truck className="w-3.5 h-3.5 text-[#138808]" />
              <span>
                {amountNeededForFree > 0
                  ? isKn
                    ? `ಉಚಿತ ಡೆಲಿವರಿಗೆ ಇನ್ನೂ ₹${amountNeededForFree} ಮೌಲ್ಯದ ಮಸಾಲೆ ಸೇರಿಸಿ`
                    : `Add ₹${amountNeededForFree} more for FREE Delivery`
                  : isKn
                  ? '🎉 ಉಚಿತ ಡೆಲಿವರಿ ಲಭ್ಯವಾಗಿದೆ!'
                  : '🎉 You have unlocked FREE Delivery!'}
              </span>
            </span>
            <span className="text-[10px] text-neutral-500">{progressToFreeShipping}%</span>
          </div>
          <div className="w-full bg-[#E5D7C2] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#138808] to-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressToFreeShipping}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-[#FAF7F2] border border-[#DFCFC0] flex items-center justify-center mx-auto text-[#8B3214] shadow-xs">
                <ShoppingBag className="w-9 h-9 opacity-70" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1F1610]">
                  {t('cartEmptyTitle')}
                </h3>
                <p className="text-xs text-[#7A6455] max-w-xs mx-auto mt-1">
                  {t('cartEmptyDesc')}
                </p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-6 py-3 rounded-full bg-[#8B3214] hover:bg-[#6E240D] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
              >
                {t('startShopping')}
              </button>
            </div>
          ) : (
            (items || []).map(({ product, quantity }) => (
              <div
                key={product.id}
                className="p-3.5 sm:p-4 bg-[#FFFDF9] rounded-2xl border border-[#E8DFD3] hover:border-[#DFCFC0] flex items-center space-x-3.5 shadow-2xs transition-all"
              >
                <img
                  src={(product.images && product.images[0]) || '/indima-logo.svg'}
                  alt={isKn ? product.name_kn : product.name_en}
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl object-cover border border-[#E8DFD3] shrink-0 bg-[#FAF7F2]"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-[#1F1610] truncate">
                    {isKn ? product.name_kn : product.name_en}
                  </h4>
                  <p className="text-[11px] text-[#7A6455] mt-0.5">
                    {product.weight} • <span className="font-semibold text-[#8B3214]">₹{product.price}</span> / pack
                  </p>

                  <div className="flex items-center justify-between mt-2.5">
                    {/* Quantity Stepper */}
                    <div className="flex items-center bg-[#FAF7F2] border border-[#DFCFC0] rounded-lg shadow-2xs overflow-hidden">
                      <button
                        onClick={() => updateQuantity(product.id, -1)}
                        className="px-2.5 py-1 hover:bg-[#E8DFD3] text-[#1F1610] cursor-pointer transition-colors"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 py-1 text-xs font-bold text-[#1F1610] select-none">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, 1)}
                        disabled={quantity >= product.stock}
                        className="px-2.5 py-1 hover:bg-[#E8DFD3] text-[#1F1610] disabled:opacity-30 cursor-pointer transition-colors"
                        title="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-bold text-[#8B3214]">
                        ₹{product.price * quantity}
                      </span>
                      <button
                        onClick={() => removeItem(product.id)}
                        className="text-neutral-400 hover:text-red-600 transition-colors p-1.5 rounded-full hover:bg-red-50 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout Action Controls */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#F0E6D2] bg-[#FAF6EE] space-y-3 shrink-0">
            {/* Coupon Code Section */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                  <div className="flex items-center space-x-1.5 text-emerald-800 font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {appliedCoupon.code} applied (-₹{discount})
                    </span>
                  </div>
                  <button
                    onClick={() => applyCoupon(null)}
                    className="text-neutral-400 hover:text-neutral-600 font-bold text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value)}
                      placeholder={isKn ? 'ಕೂಪನ್ ಕೋಡ್ ನಮೂದಿಸಿ (INDIMA10)' : 'Coupon Code (e.g. INDIMA10)'}
                      className="w-full pl-8 pr-2 py-1.5 text-xs bg-white border border-[#D9C4A2] rounded-lg text-neutral-800 uppercase focus:outline-hidden focus:ring-1 focus:ring-[#993300]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#993300] hover:bg-[#802B00] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-[10px] text-red-600 mt-1">{couponError}</p>}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs text-[#5C483B] bg-[#FAF7F2] p-3 rounded-xl border border-[#E8DFD3]">
              <div className="flex justify-between">
                <span>{t('subtotal')}</span>
                <span className="font-semibold text-[#1F1610]">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#2B5329] font-semibold">
                  <span>{t('discount')}</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t('deliveryFee')}</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-[#2B5329] font-bold uppercase">{t('freeShippingBadge')}</span>
                  ) : (
                    <span className="text-[#1F1610] font-semibold">₹{shippingFee}</span>
                  )}
                </span>
              </div>
              <div className="pt-2 border-t border-[#DFCFC0] flex justify-between text-sm font-extrabold text-[#1F1610]">
                <span>{t('totalAmount')}</span>
                <span className="text-[#8B3214] text-lg font-bold">₹{totalAmount}</span>
              </div>
            </div>

            {/* Primary Action Buttons: Proceed to Checkout & Order via WhatsApp */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                id="proceed-to-checkout-btn"
                className="w-full py-3.5 px-4 rounded-full bg-[#8B3214] hover:bg-[#6E240D] text-white font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition-all transform active:scale-98 cursor-pointer"
              >
                <span>{t('proceedToCheckout')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleWhatsAppOrder}
                id="cart-whatsapp-order-btn"
                className="w-full py-2.5 px-4 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>{t('orderOnWhatsApp')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
