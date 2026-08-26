import React, { useState } from 'react';
import { Review, Product } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Star, CheckCircle2, MapPin, Sparkles } from 'lucide-react';
import { api } from '../services/api';

interface CustomerReviewsSectionProps {
  reviews?: Review[];
  products?: Product[];
  onReviewAdded: (newReview: Review) => void;
}

export const CustomerReviewsSection: React.FC<CustomerReviewsSectionProps> = ({
  reviews = [],
  products = [],
  onReviewAdded
}) => {
  const { language, t } = useLanguage();
  const isKn = language === 'kn';

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(products?.[0]?.id || '');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !comment.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.submitReview({
        product_id: selectedProductId || (products?.[0]?.id ?? ''),
        customer_name: customerName.trim(),
        customer_city: customerCity.trim() || 'Bengaluru',
        rating,
        comment_en: comment.trim(),
        comment_kn: isKn ? comment.trim() : undefined
      });

      if (res.success && res.review) {
        onReviewAdded(res.review);
        setSuccessMsg(true);
        setCustomerName('');
        setCustomerCity('');
        setComment('');
        setTimeout(() => {
          setSuccessMsg(false);
          setIsFormOpen(false);
        }, 2500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const verifiedReviews = (reviews || []).filter(r => r?.verified_purchase !== false);

  return (
    <section id="reviews-section" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-[#FFFDF9] border border-[#E8DFD3] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#FAF7F2] border border-[#DFCFC0] rounded-full text-xs font-bold text-[#8B3214] mb-2 shadow-2xs">
              <Star className="w-3.5 h-3.5 fill-[#C27803] text-[#C27803]" />
              <span>{isKn ? 'ಗ್ರಾಹಕರ ನೈಜ ಅನುಭವಗಳು' : 'Bengaluru Household Reviews'}</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#1F1610] tracking-tight">
              {isKn ? 'ನಮ್ಮ ಶುದ್ಧ ಮಸಾಲೆಗಳ ಬಗ್ಗೆ ಗ್ರಾಹಕರು ಏನಂತಾರೆ?' : 'Trusted by Thousands of Bengaluru Kitchens'}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C483B] mt-1 font-normal">
              {isKn
                ? 'ಗ್ಯಾಸ್ಟ್ರಿಕ್ ಮತ್ತು ಹೊಟ್ಟೆಯುರಿ ಇಲ್ಲದ, ಅಪ್ಪಟ ಮನೆಯ ಸಾಂಬಾರ್-ರಸಂ ಮಸಾಲೆಯ ರುಚಿ'
                : '100% genuine feedback on real aroma, zero gastric burning, and rich homemade flavor.'}
            </p>
          </div>

          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="px-5 py-2.5 rounded-full bg-[#8B3214] hover:bg-[#6E240D] text-white text-xs font-bold transition-all cursor-pointer self-start sm:self-auto shadow-sm"
          >
            {isFormOpen ? (isKn ? 'ಮುಚ್ಚಿ' : 'Close') : (isKn ? 'ವಿಮರ್ಶೆ ಬರೆಯಿರಿ' : 'Write a Review')}
          </button>
        </div>

        {/* Submit Review Form */}
        {isFormOpen && (
          <form
            onSubmit={handleSubmit}
            className="mb-8 p-6 bg-[#FAF7F2] rounded-3xl border border-[#E8DFD3] shadow-sm max-w-xl mx-auto space-y-4"
          >
            <h3 className="font-serif text-base font-bold text-[#1F1610]">
              {isKn ? 'ನಿಮ್ಮ ಅನುಭವವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ' : 'Share Your Purity Experience'}
            </h3>

            {successMsg && (
              <div className="p-3 bg-[#EAF2EB] border border-[#CDE0D0] rounded-xl text-xs text-[#2B5329] flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#2B5329]" />
                <span>{isKn ? 'ನಿಮ್ಮ ವಿಮರ್ಶೆ ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ! ಧನ್ಯವಾದಗಳು.' : 'Thank you! Your review has been submitted successfully.'}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1F1610] mb-1">
                  {isKn ? 'ಪೂರ್ಣ ಹೆಸರು' : 'Full Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="e.g. Gayatri Rao"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-[#DFCFC0] rounded-xl text-[#1F1610] focus:outline-hidden focus:border-[#8B3214]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1610] mb-1">
                  {isKn ? 'ಸ್ಥಳ / ನಗರ' : 'Area / City'}
                </label>
                <input
                  type="text"
                  value={customerCity}
                  onChange={e => setCustomerCity(e.target.value)}
                  placeholder="e.g. Jayanagar, Bengaluru"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-[#DFCFC0] rounded-xl text-[#1F1610] focus:outline-hidden focus:border-[#8B3214]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F1610] mb-1">
                {isKn ? 'ಮಸಾಲೆ ಆಯ್ಕೆ' : 'Select Spice'}
              </label>
              <select
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-[#DFCFC0] rounded-xl text-[#1F1610] focus:outline-hidden focus:border-[#8B3214]"
              >
                {(products || []).map(p => (
                  <option key={p.id} value={p.id} className="bg-white text-[#1F1610]">
                    {isKn ? p.name_kn : p.name_en} ({p.weight})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F1610] mb-1">
                {isKn ? 'ರೇಟಿಂಗ್' : 'Rating'}
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating
                          ? 'fill-[#C27803] text-[#C27803]'
                          : 'text-[#DFCFC0]'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F1610] mb-1">
                {isKn ? 'ನಿಮ್ಮ ಅನಿಸಿಕೆ' : 'Your Review'} *
              </label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder={isKn ? 'ಮಸಾಲೆಯ ಸುವಾಸನೆ, ನೈಸರ್ಗಿಕ ರುಚಿ ಮತ್ತು ಹೊಟ್ಟೆಯ ಹಿತದ ಬಗ್ಗೆ ಬರೆಯಿರಿ...' : 'Describe the aroma, stone-ground texture, and digestive lightness...'}
                className="w-full px-3.5 py-2 text-xs bg-white border border-[#DFCFC0] rounded-xl text-[#1F1610] focus:outline-hidden focus:border-[#8B3214]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-full bg-[#8B3214] hover:bg-[#6E240D] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : isKn ? 'ವಿಮರ್ಶೆ ಸಲ್ಲಿಸಿ' : 'Submit Review'}
            </button>
          </form>
        )}

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {verifiedReviews.map(rev => {
            const prod = (products || []).find(p => p.id === rev.product_id);
            return (
              <div
                key={rev.id}
                className="p-5 sm:p-6 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] hover:border-[#8B3214] transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-0.5 text-[#C27803]">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating
                              ? 'fill-[#C27803] text-[#C27803]'
                              : 'text-[#DFCFC0]'
                          }`}
                        />
                      ))}
                    </div>
                    {rev.verified_purchase && (
                      <span className="text-[10px] font-bold text-[#2B5329] bg-[#EAF2EB] border border-[#CDE0D0] px-2 py-0.5 rounded-full flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{isKn ? 'ಖಚಿತ ಖರೀದಿ' : 'Verified'}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#5C483B] leading-relaxed italic font-normal">
                    “{isKn && rev.comment_kn ? rev.comment_kn : rev.comment_en}”
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E8DFD3] flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-[#1F1610]">{rev.customer_name}</p>
                    <p className="text-[11px] text-[#7A6455] font-normal flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#8B3214]" />
                      <span>{rev.customer_city || 'Bengaluru'}</span>
                    </p>
                  </div>
                  {prod && (
                    <span className="text-[10px] font-bold text-[#8B3214] bg-white border border-[#DFCFC0] px-2.5 py-1 rounded-full">
                      {isKn ? prod.name_kn : prod.name_en}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
