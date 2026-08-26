import React, { useState } from 'react';
import { Offer } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Copy, Check, Tag, Gift } from 'lucide-react';

interface FestivalOffersSectionProps {
  offers?: Offer[];
  onApplyCoupon: (offer: Offer) => void;
}

export const FestivalOffersSection: React.FC<FestivalOffersSectionProps> = ({
  offers = [],
  onApplyCoupon
}) => {
  const { language, t } = useLanguage();
  const isKn = language === 'kn';
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const activeOffers = (offers || []).filter(o => o?.active);
  if (activeOffers.length === 0) return null;

  const handleCopy = (code: string, offer: Offer) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    onApplyCoupon(offer);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <section id="offers-section" className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-[#FFFDF9] border border-[#EADBCA] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#FAF3E0] border border-[#DFC7A2] rounded-full text-xs font-bold text-[#7A1F1D] mb-2">
              <Gift className="w-3.5 h-3.5 text-[#993300]" />
              <span>{t('festiveDeals')}</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C1810]">
              {t('festivalOffersTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C4535] mt-1 font-normal">
              {isKn
                ? 'ಹಬ್ಬದ ಪ್ರಯುಕ್ತ ವಿಶೇಷ ರಿಯಾಯಿತಿಗಳು ಮತ್ತು ಕೂಪನ್‌ಗಳನ್ನು ಪಡೆದುಕೊಳ್ಳಿ'
                : 'Exclusive festive blessings and verified sacred discount coupons on pure spices'}
            </p>
          </div>
        </div>

        {/* Bento Coupons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {activeOffers.map(offer => (
            <div
              key={offer.id}
              className="relative p-5 rounded-2xl bg-[#FAF6EE] border border-[#DFC7A2] hover:border-[#993300] transition-all flex flex-col justify-between overflow-hidden shadow-2xs group"
            >
              {/* Corner Ribbon */}
              <div className="absolute top-3 right-3 bg-[#FAF3E0] border border-[#DFC7A2] text-[#7A1F1D] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {offer.discount_type === 'percentage'
                  ? `${offer.discount_value}% OFF`
                  : `₹${offer.discount_value} OFF`}
              </div>

              <div className="space-y-2 pr-12">
                <div className="flex items-center space-x-2 text-[#993300]">
                  <Tag className="w-4 h-4" />
                  <span className="font-serif font-bold text-base text-[#2C1810]">
                    {isKn ? offer.title_kn : offer.title_en}
                  </span>
                </div>

                <p className="text-xs text-[#5C4535] leading-relaxed font-normal">
                  {isKn ? offer.description_kn : offer.description_en}
                </p>

                <p className="text-[11px] text-[#8C6D53] font-medium">
                  {t('minOrder')}: <span className="font-bold text-[#2C1810]">₹{offer.min_order_amount}</span>
                  {offer.max_discount_amount && (
                    <span> • Max disc: ₹{offer.max_discount_amount}</span>
                  )}
                </p>
              </div>

              {/* Coupon Code Pill & Copy / Apply Button */}
              <div className="pt-4 mt-4 border-t border-[#EADBCA] flex items-center justify-between">
                <div className="px-3 py-1.5 bg-white border border-[#D9C4A2] rounded-xl font-mono font-bold text-xs text-[#7A1F1D] tracking-wider select-all">
                  {offer.code}
                </div>

                <button
                  onClick={() => handleCopy(offer.code, offer)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#993300] hover:bg-[#7A1F1D] text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer active:scale-95 border border-[#7A1F1D]"
                >
                  {copiedCode === offer.code ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>{t('couponApplied')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{t('applyCoupon')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

