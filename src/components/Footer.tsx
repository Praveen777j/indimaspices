import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Truck,
  ShieldCheck,
  Heart,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Globe,
  Leaf
} from 'lucide-react';
import { BusinessSettings } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  settings: BusinessSettings;
  onOpenPolicy: (type: 'privacy' | 'terms' | 'refund' | 'shipping') => void;
  onOpenTrackOrder: () => void;
  onNavigateToSection: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenPolicy,
  onOpenTrackOrder,
  onNavigateToSection
}) => {
  const { language, setLanguage, t } = useLanguage();
  const isKn = language === 'kn';

  return (
    <footer id="contact-section" className="bg-[#1F1610] text-[#E8DFD3] border-t border-[#3A2A20] mt-12">
      {/* Value Pillars Strip */}
      <div className="border-b border-[#2C1F16] bg-[#17100B] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center space-x-3.5 p-4 rounded-2xl bg-[#1F1610] border border-[#3A2A20]">
            <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-300 border border-amber-400/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">
                {isKn ? 'ಬೆಂಗಳೂರು & ಭಾರತಾದ್ಯಂತ ವಿತರಣೆ' : 'Bengaluru & All-India Delivery'}
              </p>
              <p className="text-neutral-400 font-normal">
                {isKn ? 'ತಾಜಾ ಮಸಾಲೆಗಳ ಮನೆ ಬಾಗಿಲಿಗೆ ರವಾನೆ' : 'Fresh stone-ground batches dispatched daily'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 p-4 rounded-2xl bg-[#1F1610] border border-[#3A2A20]">
            <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-300 border border-amber-400/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">
                {isKn ? '100% ರಾಸಾಯನಿಕ-ಮುಕ್ತ ಭರವಸೆ' : '0% Chemicals & Preservatives'}
              </p>
              <p className="text-neutral-400 font-normal">
                {isKn ? 'ಯಾವುದೇ ಕೃತಕ ಬಣ್ಣ ಅಥವಾ ಕಲಬೆರಕೆ ಇಲ್ಲ' : 'No synthetic dyes, husk or fillers'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 p-4 rounded-2xl bg-[#1F1610] border border-[#3A2A20]">
            <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-300 border border-amber-400/20">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">
                {isKn ? 'ಕಲ್ಲಿನ ಬೀಸುವ ನೈಸರ್ಗಿಕ ಶುದ್ಧತೆ' : 'Cold Stone-Ground Retention'}
              </p>
              <p className="text-neutral-400 font-normal">
                {isKn ? 'ಅಡುಗೆಗೆ ಅರ್ಧ ಚಮಚವೇ ಸಾಕು' : 'Volatile essential oils 100% preserved'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 p-4 rounded-2xl bg-[#1F1610] border border-[#3A2A20]">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">
                {isKn ? 'ವಾಟ್ಸಾಪ್ ಸಹಾಯವಾಣಿ' : 'WhatsApp Kitchen Support'}
              </p>
              <p className="text-neutral-400 font-normal">+91 {settings.whatsapp_number}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Story Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <BrandLogo customUrl={settings.logo_url} size="md" variant="light" />
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight text-white">
                  {settings.business_name || 'Indima'}
                </span>
                <p className="text-xs font-serif italic text-amber-300">
                  {isKn ? 'ಅಪ್ಪಟ ಮನೆಯ ಮಸಾಲೆಗಳು • ತಾಯಿಯ ಪ್ರೀತಿಯಷ್ಟೇ ಪರಿಶುದ್ಧ' : "Pure as mother's love • Bengaluru"}
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed max-w-sm font-normal">
              {isKn
                ? 'ಬೆಂಗಳೂರಿನಲ್ಲಿ ಸಾಂಪ್ರದಾಯಿಕ ಕಲ್ಲಿನ ಬೀಸುವ ಪದ್ಧತಿಯಲ್ಲಿ ತಯಾರಿಸಲಾದ ಶುದ್ಧ, ನೈಸರ್ಗಿಕ ಮಸಾಲೆಗಳು. ಯಾವುದೇ ರಾಸಾಯನಿಕ ಸಂರಕ್ಷಕಗಳು ಅಥವಾ ಕೃತಕ ಬಣ್ಣಗಳಿಲ್ಲದೆ ನಿಮ್ಮ ಅಡುಗೆಗೆ ತಾಯಿಯ ಪ್ರೀತಿಯಷ್ಟೇ ಪರಿಶುದ್ಧ ರುಚಿ.'
                : 'Handcrafted in Bengaluru using slow cold granite milling. 100% whole spices with zero chemicals, synthetic dyes, or starches. Taste the true nostalgic aroma of pure home cooking.'}
            </p>

            {/* Social Icons */}
            <div className="flex items-center space-x-2.5 pt-2">
              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#2C1F16] border border-[#3A2A20] hover:border-amber-400 text-neutral-300 hover:text-white rounded-full transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#2C1F16] border border-[#3A2A20] hover:border-amber-400 text-neutral-300 hover:text-white rounded-full transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings.youtube_url && (
                <a
                  href={settings.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#2C1F16] border border-[#3A2A20] hover:border-amber-400 text-neutral-300 hover:text-white rounded-full transition-colors"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {settings.twitter_url && (
                <a
                  href={settings.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#2C1F16] border border-[#3A2A20] hover:border-amber-400 text-neutral-300 hover:text-white rounded-full transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-sans text-xs font-bold text-amber-300 uppercase tracking-wider">
              {isKn ? 'ಮುಖ್ಯ ಲಿಂಕ್‌ಗಳು' : 'Quick Navigation'}
            </h4>
            <ul className="space-y-2 text-xs text-neutral-300">
              <li>
                <button
                  onClick={() => onNavigateToSection('products-section')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {isKn ? 'ಎಲ್ಲಾ ಶುದ್ಧ ಮಸಾಲೆಗಳು' : 'All Pure Spices'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToSection('health-truth-section')}
                  className="hover:text-white transition-colors cursor-pointer text-emerald-300 font-semibold"
                >
                  {isKn ? 'ಆರೋಗ್ಯ & ರಾಸಾಯನಿಕ-ಮುಕ್ತ ಸತ್ಯ' : 'Health Truth & Purity'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToSection('recipes-section')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {isKn ? 'ಸಾಂಪ್ರದಾಯಿಕ ಪಾಕವಿಧಾನಗಳು' : 'Traditional Recipes'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToSection('heritage-story-section')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {isKn ? 'ಬೆಂಗಳೂರು ಪರಂಪರೆ' : 'Bengaluru Heritage'}
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTrackOrder}
                  className="hover:text-white transition-colors cursor-pointer text-amber-300 font-bold"
                >
                  {isKn ? 'ಆರ್ಡರ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ' : 'Track Order Status'}
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Policies */}
          <div className="space-y-3">
            <h4 className="font-sans text-xs font-bold text-amber-300 uppercase tracking-wider">
              {isKn ? 'ನಿಯಮಾವಳಿಗಳು' : 'Trust & Policies'}
            </h4>
            <ul className="space-y-2 text-xs text-neutral-300">
              <li>
                <button
                  onClick={() => onOpenPolicy('shipping')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('policyShipping')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('refund')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('policyRefund')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('privacy')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('policyPrivacy')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('terms')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('policyTerms')}
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Bengaluru Address */}
          <div className="space-y-3 text-xs">
            <h4 className="font-sans text-xs font-bold text-amber-300 uppercase tracking-wider">
              {isKn ? 'ಸಂಪರ್ಕಿಸಿ' : 'Contact Kitchen'}
            </h4>
            <div className="space-y-2.5 text-neutral-300">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-[#8B3214] shrink-0 mt-0.5" />
                <p className="leading-relaxed font-normal">{settings.address || 'Basavanagudi, Bengaluru, Karnataka 560004'}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <p className="font-normal">+91 {settings.phone}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <p className="font-normal">{settings.email}</p>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <p className="font-normal">WhatsApp: +91 {settings.whatsapp_number}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="mt-10 pt-6 border-t border-[#2C1F16] flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-4">
          <p>© {new Date().getFullYear()} {settings.business_name}. 100% Pure Natural Spices. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setLanguage(language === 'en' ? 'kn' : 'en')}
              className="flex items-center space-x-1 hover:text-amber-300 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'ಕನ್ನಡ ಆವೃತ್ತಿ' : 'English Edition'}</span>
            </button>
            <span>•</span>
            <span className="font-serif italic text-amber-200">
              Handcrafted with devotion in Bengaluru, Karnataka
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
