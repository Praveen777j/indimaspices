import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  MapPin,
  MessageCircle,
  Truck,
  Printer,
  Download,
  Copy,
  Check,
  X,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order, BusinessSettings } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { BrandLogo } from './BrandLogo';
import {
  downloadReceiptFile,
  printReceiptDirectly,
  getAdminWhatsAppUrl,
  normalizeWhatsAppNumber
} from '../utils/receiptGenerator';

interface OrderConfirmationModalProps {
  order: Order | null;
  settings: BusinessSettings;
  onClose: () => void;
  onTrackOrder: (orderId: string, phone: string) => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  settings,
  onClose,
  onTrackOrder
}) => {
  const { language, t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    if (order) {
      // Trigger festive celebration confetti
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [order]);

  if (!order) return null;

  const isKn = language === 'kn';
  const adminWhatsAppClean = normalizeWhatsAppNumber(settings.whatsapp_number);

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    downloadReceiptFile(order, settings);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handlePrint = () => {
    printReceiptDirectly(order, settings);
  };

  const adminWhatsAppUrl = getAdminWhatsAppUrl(order, settings);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="relative bg-[#FFFDF9] rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-[#EADBCA] max-h-[94vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#138808] to-emerald-700 text-white text-center relative shrink-0">
          <button
            onClick={onClose}
            id="close-order-confirmation-btn"
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2.5 text-[#138808] shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight">
            {t('orderConfirmedTitle')}
          </h2>
          <p className="text-xs text-emerald-100 mt-1 max-w-md mx-auto">
            {t('orderConfirmedSubtitle')}
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Brand & Receipt Meta */}
          <div className="flex items-center justify-between border-b border-[#E8DFD3] pb-3">
            <div className="flex items-center space-x-2.5">
              <BrandLogo customUrl={settings.logo_url} size="sm" />
              <div>
                <h3 className="font-serif text-sm font-bold text-[#1F1610]">
                  {settings.business_name || 'Indima Spice Co.'}
                </h3>
                <p className="text-[10px] text-[#7A6455] font-serif italic">
                  {isKn ? settings.tagline_kn : (settings.tagline_en || "Pure as mother's love")}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 uppercase tracking-wider flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>{isKn ? 'ಅಧಿಕೃತ ರಸೀದಿ' : 'Official Receipt'}</span>
            </span>
          </div>

          {/* Prominent Order ID Box for Live Tracking */}
          <div className="p-3.5 bg-gradient-to-br from-[#FAF6EE] to-[#F5ECE0] rounded-xl border-2 border-[#D9C4A2] shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#993300] uppercase tracking-wider bg-[#EADBCA] px-2 py-0.5 rounded">
                  {t('orderIdForTracking')}
                </span>
                <p className="font-mono text-lg sm:text-xl font-extrabold text-[#993300] mt-1">
                  {order.id}
                </p>
              </div>
              <button
                onClick={copyOrderId}
                id="copy-order-id-btn"
                className="px-3 py-1.5 rounded-lg bg-white border border-[#D9C4A2] text-neutral-800 hover:text-[#993300] hover:border-[#993300] flex items-center space-x-1 text-xs font-bold cursor-pointer shadow-xs transition-all"
                title="Copy Order ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (isKn ? 'ನಕಲಿಸಲಾಗಿದೆ' : 'Copied!') : (isKn ? 'ನಕಲಿಸಿ' : 'Copy ID')}</span>
              </button>
            </div>
            <p className="text-[11px] text-[#7A6455] mt-1.5 flex items-center space-x-1">
              <span>ℹ️</span>
              <span>{t('orderTrackingNote')}</span>
            </p>
          </div>

          {/* WhatsApp Notification & Store Alert Section */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs">
                <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                <span>{t('whatsappUpdateSent')}</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                {order.whatsapp_notification_status || 'Ready'}
              </span>
            </div>

            <div className="pt-1">
              {/* Direct Store Admin WhatsApp */}
              <a
                href={adminWhatsAppUrl}
                target="_blank"
                rel="noreferrer"
                id="send-to-admin-whatsapp-btn"
                className="w-full px-4 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold rounded-lg text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-xs transition-colors"
                title={`Send order to WhatsApp +${adminWhatsAppClean}`}
              >
                <MessageCircle className="w-4 h-4 fill-white shrink-0" />
                <span className="truncate">{t('sendToAdminWhatsApp')}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
            <p className="text-[10px] text-emerald-700 font-mono">
              Store WhatsApp: +{adminWhatsAppClean}
            </p>
          </div>

          {/* Delivery Address Snapshot */}
          <div className="p-3.5 bg-[#FAF6EE] rounded-xl border border-[#EADBCA] space-y-1 text-xs text-neutral-800">
            <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-[#993300] flex items-center space-x-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{t('immutableAddressLabel')}</span>
            </h4>
            <p className="font-bold text-neutral-900">{order.address_snapshot.fullName}</p>
            <p className="font-mono text-[11px]">+91 {order.address_snapshot.phone} • {order.address_snapshot.email}</p>
            <p>
              {order.address_snapshot.houseFlat}, {order.address_snapshot.street}, {order.address_snapshot.area}
            </p>
            <p className="font-bold text-[#993300]">
              {order.address_snapshot.city}, {order.address_snapshot.district}, {order.address_snapshot.state} - {order.address_snapshot.pincode}
            </p>
          </div>

          {/* Ordered Products Summary */}
          <div className="space-y-2">
            <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-neutral-700">
              {t('itemsOrdered')} ({order?.items?.length || 0})
            </h4>
            <div className="divide-y divide-[#F0E6D2] border border-[#EADBCA] rounded-xl bg-[#FFFDF9] overflow-hidden">
              {(order?.items || []).map((item, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-neutral-900">
                      {isKn ? item.name_kn : item.name_en}
                    </p>
                    <p className="text-[11px] text-neutral-500 font-mono">
                      {item.weight || 'Standard'} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold text-neutral-900 font-mono">
                    ₹{item.subtotal ?? item.total_price ?? (item.unit_price * item.quantity)}
                  </span>
                </div>
              ))}
              <div className="p-2.5 bg-[#FAF6EE] flex justify-between text-xs font-bold text-neutral-900 border-t border-[#EADBCA]">
                <span>{t('totalAmount')} ({t('paymentStatus')}: {order.payment_status?.toUpperCase() || 'PAID'})</span>
                <span className="text-[#993300] text-sm font-mono">₹{order.total_amount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions: Download Receipt, Print & Track Order */}
        <div className="p-3.5 sm:p-4 bg-[#FAF6EE] border-t border-[#F0E6D2] flex flex-col sm:flex-row gap-2 shrink-0">
          {/* Download Receipt HTML */}
          <button
            onClick={handleDownload}
            id="download-receipt-btn"
            className="flex-1 py-2.5 px-3 rounded-xl border border-emerald-600/30 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
            title="Download formatted receipt file"
          >
            {downloadSuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Download className="w-3.5 h-3.5 text-emerald-700" />}
            <span>{downloadSuccess ? (isKn ? 'ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ!' : 'Downloaded!') : t('downloadReceipt')}</span>
          </button>

          {/* Print Receipt */}
          <button
            onClick={handlePrint}
            id="print-receipt-btn"
            className="flex-1 py-2.5 px-3 rounded-xl border border-[#D9C4A2] bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-neutral-600" />
            <span>{t('printInvoice')}</span>
          </button>

          {/* Track Order */}
          <button
            onClick={() => {
              onClose();
              onTrackOrder(order.id, order.customer_phone);
            }}
            id="track-order-from-confirm-btn"
            className="flex-1 py-2.5 px-3 rounded-xl bg-[#993300] hover:bg-[#802B00] text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md transition-colors cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>{t('trackMyOrder')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
