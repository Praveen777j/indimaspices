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
  Phone,
  Copy,
  Check,
  AlertTriangle,
  ShieldCheck,
  Navigation,
  Calendar,
  CreditCard
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import { DeliveryMap } from './DeliveryMap';
import { getVerifiedTrackingUrl, getCarrierDisplayName } from '../utils/carrierTracking';

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
  const isKn = language === 'kn';

  const [phone, setPhone] = useState(initialPhone || '');
  const [orderId, setOrderId] = useState(initialOrderId || '');
  const [manualToken, setManualToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Initialize and auto-track if initial values provided
  useEffect(() => {
    if (initialPhone) setPhone(initialPhone);
    if (initialOrderId) {
      setOrderId(initialOrderId);
      // Auto look for saved token
      try {
        const stored = JSON.parse(localStorage.getItem('indima_order_tokens') || '{}');
        if (stored[initialOrderId]) {
          setManualToken(stored[initialOrderId]);
        }
      } catch (_) {}
    }

    if (isOpen && (initialOrderId || initialPhone)) {
      handleSearch(initialPhone, initialOrderId);
    }
  }, [initialPhone, initialOrderId, isOpen]);

  // Check URL hash / query on open
  useEffect(() => {
    if (!isOpen) return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const hash = window.location.hash;
      const paramOrderId = urlParams.get('order_id') || (hash.includes('order_id=') ? new URLSearchParams(hash.split('?')[1]).get('order_id') : null);
      const paramToken = urlParams.get('token') || (hash.includes('token=') ? new URLSearchParams(hash.split('?')[1]).get('token') : null);

      if (paramOrderId && !orderId) {
        setOrderId(paramOrderId);
        if (paramToken) setManualToken(paramToken);
        handleSearch(undefined, paramOrderId, paramToken || undefined);
      }
    } catch (_) {}
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, fieldKey: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (_) {}
  };

  const handleSearch = async (
    searchPhone = phone,
    searchOrderId = orderId,
    tokenOverride = manualToken
  ) => {
    const cleanOrderId = (searchOrderId || '').trim();
    const cleanPhone = (searchPhone || '').replace(/\D/g, '').slice(-10);

    if (!cleanOrderId && !cleanPhone) {
      setError(isKn ? 'ದಯವಿಟ್ಟು ಆರ್ಡರ್ ಐಡಿ ಅಥವಾ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ' : 'Please enter your Order ID or registered phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. First attempt: Dedicated single order fetch if Order ID is present
      if (cleanOrderId) {
        const singleRes = await api.trackSingleOrder(cleanOrderId, tokenOverride || undefined);
        if (singleRes.success && singleRes.order) {
          setOrders([singleRes.order]);
          setSelectedOrder(singleRes.order);
          setLoading(false);
          return;
        }
      }

      // 2. Second attempt: Track orders API
      const res = await api.trackOrders(cleanPhone || undefined, cleanOrderId || undefined, tokenOverride || undefined);
      if (res.orders && res.orders.length > 0) {
        setOrders(res.orders);
        setSelectedOrder(res.orders[0]);
      } else {
        setOrders([]);
        setSelectedOrder(null);
        setError(res.error || (isKn ? 'ಯಾವುದೇ ಸಕ್ರಿಯ ಆರ್ಡರ್ಗಳು ಕಂಡುಬಂದಿಲ್ಲ' : 'No active orders found. Please verify your Order ID.'));
      }
    } catch (e: any) {
      setError(e.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  // Timeline step definitions
  const timelineSteps: { key: OrderStatus; label_en: string; label_kn: string; desc_en: string }[] = [
    {
      key: 'placed',
      label_en: 'Order Placed',
      label_kn: 'ಆರ್ಡರ್ ಸ್ವೀಕರಿಸಲಾಗಿದೆ',
      desc_en: 'Order recorded in our estate system'
    },
    {
      key: 'confirmed',
      label_en: 'Payment Confirmed',
      label_kn: 'ಪಾವತಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ',
      desc_en: 'Payment verified securely'
    },
    {
      key: 'processing',
      label_en: 'In Preparation',
      label_kn: 'ಮಸಾಲೆ ತಯಾರಿಕೆ ಹಂತ',
      desc_en: 'Fresh batch grinding & aroma preservation'
    },
    {
      key: 'packed',
      label_en: 'Packed Fresh',
      label_kn: 'ಪ್ಯಾಕಿಂಗ್ ಪೂರ್ಣಗೊಂಡಿದೆ',
      desc_en: 'Sealed in moisture-barrier pouches'
    },
    {
      key: 'shipped',
      label_en: 'Dispatched & In Transit',
      label_kn: 'ರವಾನಿಸಲಾಗಿದೆ',
      desc_en: 'Handed over to verified logistics courier'
    },
    {
      key: 'out_for_delivery',
      label_en: 'Out for Delivery',
      label_kn: 'ವಿತರಣೆಗೆ ಹೊರಟಿದೆ',
      desc_en: 'Arriving at your doorstep today'
    },
    {
      key: 'delivered',
      label_en: 'Delivered',
      label_kn: 'ತಲುಪಿಸಲಾಗಿದೆ',
      desc_en: 'Safely delivered to customer'
    }
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
    return 0;
  };

  const currentStatusRaw = selectedOrder
    ? (selectedOrder.tracking?.status || selectedOrder.order_status || selectedOrder.status || '')
    : '';

  const currentStepIdx = getStepIndex(currentStatusRaw);
  const isCancelled = currentStatusRaw.toLowerCase().includes('cancel');
  const isPaymentFailed = selectedOrder?.payment_status?.toLowerCase().includes('fail');

  // Resolved carrier and tracking
  const carrier = selectedOrder?.tracking?.carrier || selectedOrder?.carrier;
  const trackingNumber = selectedOrder?.tracking?.tracking_number || selectedOrder?.tracking_number;
  const expectedDelivery = selectedOrder?.tracking?.expected_delivery || selectedOrder?.expected_delivery;
  const courierExternalUrl = carrier && trackingNumber ? getVerifiedTrackingUrl(carrier, trackingNumber) : null;

  return (
    <div
      id="track-order-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        id="track-order-modal-container"
        className="relative bg-[#FFFDF9] rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-[#EADBCA] max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#F0E6D2] bg-[#FAF6EE] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#993300]/10 flex items-center justify-center text-[#993300]">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-neutral-900 leading-tight">
                {isKn ? 'ಆರ್ಡರ್ ವಿತರಣೆ ಟ್ರ್ಯಾಕಿಂಗ್' : 'Order Delivery Tracking'}
              </h2>
              <p className="text-[11px] text-neutral-500 font-medium">
                {isKn ? 'ಲೈವ್ ಸ್ಥಿತಿ ಮತ್ತು ಪರಿಶೀಲಿಸಿದ ಕೊರಿಯರ್ ಮಾಹಿತಿ' : 'Verified courier transit & delivery location'}
              </p>
            </div>
          </div>

          <button
            id="track-order-modal-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-200/60 text-neutral-500 hover:text-neutral-900 cursor-pointer transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Search Bar */}
        <div className="p-4 bg-[#FAF6EE] border-b border-[#F0E6D2] space-y-3">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSearch();
            }}
            className="grid grid-cols-1 sm:grid-cols-12 gap-2"
          >
            <div className="sm:col-span-5 relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="track-order-id-input"
                type="text"
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                placeholder={isKn ? 'ಆರ್ಡರ್ ಐಡಿ (e.g. IND-2025...)' : 'Order ID (e.g. IND-2025...)'}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#D9C4A2] rounded-lg text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-[#993300] font-mono font-medium"
              />
            </div>

            <div className="sm:col-span-4 relative">
              <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="track-phone-input"
                type="tel"
                maxLength={10}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder={isKn ? '10-ಅಂಕಿಯ ಫೋನ್ ಸಂಖ್ಯೆ' : 'Phone (10 digits)'}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#D9C4A2] rounded-lg text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-[#993300] font-medium"
              />
            </div>

            <div className="sm:col-span-3">
              <button
                id="track-search-btn"
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-[#993300] hover:bg-[#802B00] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {loading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>{isKn ? 'ಹುಡುಕಿ' : 'Track Order'}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-xs text-red-700">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}
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
                      : 'bg-[#FAF6EE] text-neutral-700 border border-[#EADBCA] hover:bg-[#F2E8D7]'
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
              {/* Order Key Overview Card */}
              <div className="bg-[#FAF6EE] p-4 rounded-xl border border-[#EADBCA] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-neutral-500 font-semibold">{isKn ? 'ಆರ್ಡರ್ ಐಡಿ:' : 'Order ID:'}</span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-neutral-900 bg-white px-2 py-0.5 rounded-md border border-[#DFC7A2]">
                      {selectedOrder.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedOrder.id, 'order_id')}
                      className="p-1 hover:bg-neutral-200/60 rounded text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                      title="Copy Order ID"
                    >
                      {copiedField === 'order_id' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Payment status badge */}
                    <span
                      className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                        String(selectedOrder.payment_status).toLowerCase().includes('success') || String(selectedOrder.payment_status).toLowerCase() === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : String(selectedOrder.payment_status).toLowerCase().includes('fail')
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {selectedOrder.payment_status || 'Payment Pending'}
                    </span>

                    {/* Order status badge */}
                    <span
                      className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full ${
                        isCancelled
                          ? 'bg-red-600 text-white'
                          : currentStatusRaw.toLowerCase().includes('deliver')
                          ? 'bg-emerald-700 text-white'
                          : 'bg-[#993300] text-white'
                      }`}
                    >
                      {currentStatusRaw.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#F0E6D2] text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-500 block uppercase font-semibold">
                      {isKn ? 'ಆರ್ಡರ್ ದಿನಾಂಕ' : 'Ordered On'}
                    </span>
                    <span className="font-bold text-neutral-800">
                      {new Date(selectedOrder.created_at || (selectedOrder as any).order_date || Date.now()).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-neutral-500 block uppercase font-semibold">
                      {isKn ? 'ಒಟ್ಟು ಮೊತ್ತ' : 'Total Amount'}
                    </span>
                    <span className="font-bold text-[#993300]">
                      ₹{selectedOrder.total_amount}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-neutral-500 block uppercase font-semibold">
                      {isKn ? 'ಪಾವತಿ ವಿಧಾನ' : 'Payment Method'}
                    </span>
                    <span className="font-bold text-neutral-800 capitalize">
                      {selectedOrder.payment_method || 'Online'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-neutral-500 block uppercase font-semibold">
                      {isKn ? 'ನಿರೀಕ್ಷಿತ ವಿತರಣೆ' : 'Expected Delivery'}
                    </span>
                    <span className="font-bold text-emerald-800">
                      {expectedDelivery || '2-4 business days'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Carrier & Shipment Tracking Banner */}
              <div className="bg-white p-4 rounded-xl border border-[#D9C4A2] shadow-2xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-[#FAF6EE] border border-[#DFC7A2] flex items-center justify-center text-[#993300]">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-neutral-500 font-semibold">{isKn ? 'ಕೊರಿಯರ್ ವಾಹಕ:' : 'Carrier:'}</span>
                        <span className="font-bold text-neutral-900 text-xs sm:text-sm">
                          {carrier ? getCarrierDisplayName(carrier) : 'Standard Express Delivery'}
                        </span>
                      </div>
                      {trackingNumber ? (
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-xs text-neutral-500 font-semibold">{isKn ? 'AWB ಸಂಖ್ಯೆ:' : 'AWB Number:'}</span>
                          <span className="font-mono text-xs font-bold text-[#993300] bg-[#FAF6EE] px-2 py-0.5 rounded border border-[#EADBCA]">
                            {trackingNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(trackingNumber, 'awb')}
                            className="p-1 hover:bg-neutral-200/60 rounded text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                            title="Copy AWB Number"
                          >
                            {copiedField === 'awb' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <p className="text-[11px] text-neutral-500 italic mt-0.5">
                          {isKn ? 'ರವಾನೆಯ ನಂತರ AWB ಸಂಖ್ಯೆ ಲಭ್ಯವಾಗಲಿದೆ' : 'AWB number will be generated upon dispatch'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* External courier portal tracking link */}
                  {courierExternalUrl && (
                    <a
                      href={courierExternalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 bg-[#FAF6EE] hover:bg-[#F2E8D7] text-[#993300] border border-[#D9C4A2] font-bold text-xs rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <span>{isKn ? 'ಕೊರಿಯರ್ ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿ ನೋಡಿ' : 'Track on Courier Site'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Status Timeline */}
              {isCancelled ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-1">
                  <div className="flex items-center space-x-2 font-bold text-red-900 text-sm">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>{isKn ? 'ಆರ್ಡರ್ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ' : 'Order Cancelled'}</span>
                  </div>
                  <p>
                    {isKn
                      ? 'ಈ ಆರ್ಡರ್ ರದ್ದಾಗಿದೆ. ಮರುಪಾವತಿ ಪ್ರಕ್ರಿಯೆಯ ಮಾಹಿತಿಗಾಗಿ ಗ್ರಾಹಕ ಬೆಂಬಲವನ್ನು ಸಂಪರ್ಕಿಸಿ.'
                      : 'This order was cancelled. Any applicable refund has been initiated to your original payment method.'}
                  </p>
                </div>
              ) : (
                <div className="bg-[#FAF6EE] p-4 sm:p-5 rounded-xl border border-[#EADBCA] space-y-4">
                  <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#993300]" />
                    <span>{isKn ? 'ವಿತರಣಾ ಪ್ರಗತಿ ಹಂತಗಳು' : 'Consignment Timeline'}</span>
                  </h4>

                  <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D9C4A2]">
                    {timelineSteps.map((s, idx) => {
                      const isCompleted = currentStepIdx >= idx;
                      const isCurrent = currentStepIdx === idx;

                      return (
                        <div key={s.key} className="relative flex items-start space-x-3">
                          <div
                            className={`absolute -left-6 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              isCompleted
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                                : 'bg-white border-[#D9C4A2] text-neutral-300'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
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
                                <span className="text-[10px] font-bold px-2 py-0.2 bg-amber-100 text-amber-800 rounded-full animate-pulse">
                                  {isKn ? 'ಪ್ರಸ್ತುತ ಹಂತ' : 'In Progress'}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-neutral-500 mt-0.5">
                              {s.desc_en}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Delivery Location Map (Interactive Leaflet Map) */}
              <div className="space-y-2">
                <DeliveryMap order={selectedOrder} />
              </div>

              {/* Consignment Items Snapshot */}
              {(selectedOrder.items || []).length > 0 && (
                <div className="bg-white p-4 rounded-xl border border-[#D9C4A2] space-y-3 shadow-2xs">
                  <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center space-x-1.5">
                    <Package className="w-3.5 h-3.5 text-[#993300]" />
                    <span>{isKn ? 'ಆರ್ಡರ್ ಮಾಡಿದ ವಸ್ತುಗಳು' : 'Package Items'}</span>
                  </h4>

                  <div className="divide-y divide-[#F0E6D2]">
                    {(selectedOrder.items || []).map((item, i) => (
                      <div key={i} className="py-2.5 flex items-center justify-between text-xs gap-3">
                        <div className="flex items-center space-x-2.5">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name_en}
                              className="w-9 h-9 object-cover rounded-md border border-[#DFC7A2]"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <div>
                            <p className="font-bold text-neutral-900">
                              {isKn && item.name_kn ? item.name_kn : item.name_en}
                            </p>
                            <p className="text-[11px] text-neutral-500">
                              Qty: {item.quantity} × ₹{item.unit_price}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-neutral-800">
                          ₹{item.subtotal || item.quantity * item.unit_price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery Destination (Data-Minimized Privacy Snapshot) */}
              {selectedOrder.address_snapshot && (
                <div className="p-4 bg-[#FAF6EE] rounded-xl border border-[#EADBCA] text-xs text-neutral-800 space-y-1.5">
                  <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-[#993300] flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{isKn ? 'ವಿತರಣಾ ತಾಣ' : 'Delivery Destination'}</span>
                  </h4>
                  {selectedOrder.address_snapshot.fullName && (
                    <p className="font-bold text-neutral-900">{selectedOrder.address_snapshot.fullName}</p>
                  )}
                  <p className="font-semibold text-neutral-700">
                    {selectedOrder.address_snapshot.city}
                    {selectedOrder.address_snapshot.district ? `, ${selectedOrder.address_snapshot.district}` : ''}, {selectedOrder.address_snapshot.state} -{' '}
                    <span className="font-mono font-bold text-[#993300]">{selectedOrder.address_snapshot.pincode}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {!selectedOrder && !loading && !error && (
            <div className="py-12 text-center text-neutral-500 text-xs space-y-2">
              <Truck className="w-10 h-10 mx-auto opacity-40 text-[#993300]" />
              <p className="font-medium">
                {isKn
                  ? 'ನಿಮ್ಮ ಆರ್ಡರ್ ಸ್ಥಿತಿಯನ್ನು ನೋಡಲು ಮೇಲೆ ಆರ್ಡರ್ ಐಡಿ ಅಥವಾ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ'
                  : 'Enter your Order ID or phone number above to track consignment status'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
