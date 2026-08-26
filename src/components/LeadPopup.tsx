import React, { useState, useEffect } from 'react';
import { X, Sparkles, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';

export const LeadPopup: React.FC = () => {
  const { language, t } = useLanguage();
  const isKn = language === 'kn';

  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hasSeen = sessionStorage.getItem('indima_lead_seen');
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('indima_lead_seen', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) return;

    setLoading(true);
    try {
      await api.submitLead(cleanPhone, 'welcome_popup');
      setSubmitted(true);
      sessionStorage.setItem('indima_lead_seen', 'true');
      setTimeout(() => setIsOpen(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div
        className="relative bg-[#FFFDF9] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border-2 border-[#D9C4A2] p-6 text-center space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-full bg-[#FAF6EE] border border-[#EADBCA] flex items-center justify-center mx-auto text-[#993300]">
          <Sparkles className="w-6 h-6" />
        </div>

        <div>
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#993300] text-white">
            {t('leadDiscountPill')}
          </span>
          <h3 className="font-serif text-xl font-bold text-neutral-900 mt-2">
            {t('leadTitle')}
          </h3>
          <p className="text-xs text-neutral-600 mt-1">
            {t('leadSubtitle')}
          </p>
        </div>

        {submitted ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{t('leadSuccess')} (Code: <b>INDIMA10</b>)</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-[#D9C4A2] bg-[#FAF6EE] text-neutral-600 text-xs font-bold">
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder={t('mobilePlaceholder')}
                className="w-full px-3 py-2.5 text-xs bg-white border border-[#D9C4A2] rounded-r-xl text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-[#993300]"
              />
            </div>

            <button
              type="submit"
              disabled={loading || phone.length !== 10}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#993300] to-[#C05621] hover:from-[#802B00] hover:to-[#A84315] text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{t('leadSubmitBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
