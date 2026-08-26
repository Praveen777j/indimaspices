import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { BusinessSettings } from '../types';

interface PolicyModalProps {
  type: 'privacy' | 'terms' | 'refund' | 'shipping' | null;
  settings: BusinessSettings;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ type, settings, onClose }) => {
  const { language, t } = useLanguage();
  const isKn = language === 'kn';

  if (!type) return null;

  const titles = {
    privacy: t('policyPrivacy'),
    terms: t('policyTerms'),
    refund: t('policyRefund'),
    shipping: t('policyShipping')
  };

  const getPolicyContent = () => {
    switch (type) {
      case 'privacy':
        return isKn ? settings.policy_privacy_kn : settings.policy_privacy_en;
      case 'terms':
        return isKn ? settings.policy_terms_kn : settings.policy_terms_en;
      case 'refund':
        return isKn ? settings.policy_refund_kn : settings.policy_refund_en;
      case 'shipping':
        return isKn ? settings.policy_shipping_kn : settings.policy_shipping_en;
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="relative bg-[#FFFDF9] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#EADBCA] max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-[#F0E6D2] bg-[#FAF6EE] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#993300]" />
            <h2 className="font-serif text-lg font-bold text-neutral-900">
              {titles[type]}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 text-xs sm:text-sm text-neutral-700 leading-relaxed space-y-4">
          <p className="whitespace-pre-line">{getPolicyContent()}</p>
        </div>
      </div>
    </div>
  );
};
