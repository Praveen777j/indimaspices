import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  RefreshCw,
  ExternalLink,
  Phone
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
  initialPhone?: string;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  onClose,
  initialOrderId,
  initialPhone
}) => {
  const { language, t } = useLanguage();
  const [phone, setPhone] = useState(initialPhone || '');
  const [orderId, setOrderId] = useState(initialOrderId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (initialPhone) setPhone(initialPhone);
    if (initialOrderId) setOrderId(initialOrderId);
    if (initialPhone || initialOrderId) {
      handleSearch(initialPhone, initialOrderId);
    }
  }, [initialPhone, initialOrderId, isOpen]);

  if (!isOpen) return null;

  const isKn = language === 'kn';

  const handleSearch = async (searchPhone = phone, searchOrderId = orderId) => {
    const cleanPhone = searchPhone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone && !searchOrderId) {
      setError(t('trackOrderPrompt'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.trackOrders(cleanPhone || '9999999999', searchOrderId || undefined);
      if (res.orders && res.orders.length > 0) {
        setOrders(res.orders);
        setSelectedOrder(res.orders[0]);
      } else {
        setOrders([]);
        setSelectedOrder(null);
        setError(t('noOrdersFound'));
      }
    } catch (e: any) {
      setError(e.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const timelineSteps: { key: OrderStatus; label_en: string; label_kn: string }[] = [
    { key: 'placed', label_en: 'Order Placed', label_kn: 'ಆರ್ಡರ್ ಸ್ವೀಕರಿಸಲಾಗಿದೆ' },
    { key: 'confirmed', label_en: 'Payment Confirmed', label_kn: 'ಪಾವತಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ' },
    { key: 'processing', label_en: 'In Preparation', label_kn: 'ಮಸಾಲೆ ತಯಾರಿಕೆ ಹಂತ' },
    { key: 'packed', label_en: 'Packed Fresh', label_kn: 'ಪ್ಯಾಕಿಂಗ್ ಪೂರ್ಣಗೊಂಡಿದೆ' },
    { key: 'shipped', label_en: 'Shipped', label_kn: 'ರವಾನಿಸಲಾಗಿದೆ' },
    { key: 'out_for_delivery', label_en: 'Out for Delivery', label_kn: 'ವಿತರಣೆಗೆ ಹೊರಟಿದೆ' },
    { key: 'delivered', label_en: 'Delivered', label_kn: 'ತಲುಪಿಸಲಾಗಿದೆ' }
  ];

  const getStepIndex = (rawStatus?: string) => {
    if (!rawStatus) return 0;
    const s = String(rawStatus).toLowerCase().replace(/[\s_-]+/g, '_');
    if (s.includes('cancel')) return -1;
    if (s.includes('place')) return 0;
    if (s.includes('confirm')) return 1;
    if (s.includes('process') || s.includes('prep')) return 2;
    if (s.includes('pack')) return 3;
    if (s.includes('ship')) return 4;
    if (s.includes('out') || s.includes('delivery')) return 5;
    if (s.includes('delivered')) return 6;
    return timelineSteps.findIndex(step => step.key === s) ?? 0;
  };

  const currentStepIdx = selectedOrder
    ? getStepIndex(selectedOrder.order_status || (selectedOrder as any).status)
    : -1;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="relative bg-[#FFFDF9] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#EADBCA] max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#F0E6D2] bg-[#FAF6EE] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-[#993300]" />
            <h2 className="font-serif text-lg font-bold text-neutral-900">
              {t('trackOrderModalTitle')}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-200/60 text-neutral-500 hover:text-neutral-900 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Search Bar */}
        <div className="p-4 bg-[#FAF6EE] border-b border-[#F0E6D2] space-y-2">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div className="flex-1 relative">
              <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder={t('mobilePlaceholder')}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#D9C4A2] rounded-lg text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-[#993300]"
              />
            </div>

            <div className="flex-1 relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                placeholder={t('orderIdPlaceholder')}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#D9C4A2] rounded-lg text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-[#993300] font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#993300] hover:bg-[#802B00] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <span>{t('trackBtn')}</span>
              )}
            </button>
          </form>

          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Order Selection Tabs if Multiple */}
          {(orders || []).length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-1">
              {(orders || []).map(ord => (
                <button
                  key={ord.id}
                  onClick={() => setSelectedOrder(ord)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedOrder?.id === ord.id
                      ? 'bg-[#993300] text-white shadow-xs'
                      : 'bg-[#FAF6EE] text-neutral-700 border border-[#EADBCA]'
                  }`}
                >
                  {ord.id.slice(-8)} • ₹{ord.total_amount}
                </button>
              ))}
            </div>
          )}

          {/* Active Order Details */}
          {selectedOrder && (
            <div className="space-y-6">
              {/* Top Banner with Status & AWB */}
              <div className="bg-[#FAF6EE] p-4 rounded-xl border border-[#EADBCA] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-bold text-neutral-900">
                      {selectedOrder.id}
                    </span>
                    <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-[#993300] text-white">
                      {selectedOrder.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    {t('orderedOn')}: {new Date(selectedOrder.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-right">
                  {selectedOrder.tracking_number && (
                    <div className="text-xs">
                      <span className="text-neutral-500 font-semibold">{t('awbNumber')}: </span>
                      <span className="font-mono font-bold text-[#993300]">
                        {selectedOrder.tracking_number}
                      </span>
                    </div>
                  )}
                  {selectedOrder.expected_delivery && (
                    <p className="text-xs font-semibold text-emerald-800">
                      {t('expectedDelivery')}: {selectedOrder.expected_delivery}
                    </p>
                  )}
                </div>
              </div>

              {/* Interactive Timeline Progress */}
              <div className="space-y-3">
                <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-neutral-700">
                  {t('timelineTitle')}
                </h4>

                <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EADBCA]">
                  {timelineSteps.map((s, idx) => {
                    const isCompleted = currentStepIdx >= idx;
                    const isCurrent = currentStepIdx === idx;

                    return (
                      <div key={s.key} className="relative flex items-start space-x-3">
                        <div
                          className={`absolute -left-6 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isCompleted
                              ? 'bg-[#138808] border-[#138808] text-white'
                              : 'bg-white border-[#D9C4A2] text-neutral-300'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                          )}
                        </div>

                        <div>
                          <p
                            className={`text-xs font-bold ${
                              isCurrent
                                ? 'text-[#993300]'
                                : isCompleted
                                ? 'text-neutral-900'
                                : 'text-neutral-400'
                            }`}
                          >
                            {isKn ? s.label_kn : s.label_en}
                          </p>
                          {isCurrent && (
                            <p className="text-[11px] text-amber-700 font-medium animate-pulse">
                              {isKn ? 'ಪ್ರಸ್ತುತ ಪ್ರಗತಿಯಲ್ಲಿದೆ...' : 'Current state in progress...'}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Immutable Delivery Address */}
              <div className="p-3.5 bg-[#FAF6EE] rounded-xl border border-[#EADBCA] text-xs text-neutral-800 space-y-1">
                <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-[#993300] flex items-center space-x-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{t('immutableAddressLabel')}</span>
                </h4>
                <p className="font-bold text-neutral-900">{selectedOrder.address_snapshot.fullName}</p>
                <p>+91 {selectedOrder.address_snapshot.phone}</p>
                <p>
                  {selectedOrder.address_snapshot.houseFlat}, {selectedOrder.address_snapshot.street}, {selectedOrder.address_snapshot.area}
                </p>
                <p className="font-bold text-[#993300]">
                  {selectedOrder.address_snapshot.city}, {selectedOrder.address_snapshot.district}, {selectedOrder.address_snapshot.state} - {selectedOrder.address_snapshot.pincode}
                </p>
              </div>
            </div>
          )}

          {!selectedOrder && !loading && !error && (
            <div className="py-12 text-center text-neutral-500 text-xs space-y-2">
              <Truck className="w-10 h-10 mx-auto opacity-40 text-[#993300]" />
              <p>{t('trackOrderPrompt')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
