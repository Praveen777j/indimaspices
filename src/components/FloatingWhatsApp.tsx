import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { BusinessSettings } from '../types';

interface FloatingWhatsAppProps {
  settings: BusinessSettings;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ settings }) => {
  const { language } = useLanguage();
  const isKn = language === 'kn';

  const rawNumber = (settings.whatsapp_number || '919845012345').replace(/\D/g, '');
  const message = isKn
    ? `ನಮಸ್ಕಾರ, ಇಂದಿಮಾ ಸ್ಪೈಸ್ ಕಂ. ಮಸಾಲೆಗಳ ಬಗ್ಗೆ ವಿಚಾರಿಸಲು ಬಯಸುತ್ತೇನೆ.`
    : `Namaskara! I would like to inquire about Indima pure heritage spices.`;

  const whatsappUrl = `https://wa.me/${rawNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      id="floating-whatsapp-btn"
      className="fixed bottom-6 right-6 z-40 bg-[#25D366] hover:bg-[#1EBE5D] text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl flex items-center space-x-2 transition-all transform hover:scale-105 active:scale-95 group"
      title="Chat with us on WhatsApp"
    >
      <MessageCircle className="w-6 h-6 fill-white" />
      <span className="hidden sm:inline font-bold text-xs">
        {isKn ? 'ವಾಟ್ಸಾಪ್ ಸಹಾಯವಾಣಿ' : 'Order / Chat on WhatsApp'}
      </span>
    </a>
  );
};
