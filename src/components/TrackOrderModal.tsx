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
  Calendar,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
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
  const { language } = useLanguage();
  const isKn = language === 'kn';

  const [phone, setPhone] = useState(initialPhone || '');
  const [orderId, setOrderId] = useState(initialOrderId || '');
  const [manualToken, setManualToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Initialize and auto-track if initial values provided
  useEffect(() => {
    let savedToken = '';
    if (initialPhone) setPhone(initialPhone);
    if (initialOrderId) {
      setOrderId(initialOrderId);
      // Look for saved token in localStorage
      try {
        const stored = JSON.parse(localStorage.getItem('indima_order_tokens') || '{}');
        if (stored[initialOrderId]) {
          savedToken = stored[initialOrderId];
          setManualToken(savedToken);
        }
      } catch (_) {}
    }

    if (isOpen && (initialOrderId || initialPhone)) {
      handleSearch(initialPhone, initialOrderId, savedToken || undefined);
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
      // 1. Dedicated single order fetch if Order ID is present
      if (cleanOrderId) {
        const singleRes = await api.trackSingleOrder(cleanOrderId, tokenOverride || undefined);
        if (singleRes.success && singleRes.order) {
          setOrders([singleRes.order]);
          setSelectedOrder(singleRes.order);
          setLastRefreshedAt(new Date());
          setLoading(false);
          return;
        }
      }

      // 2. Track orders API
      const res = await api.trackOrders(cleanPhone || undefined, cleanOrderId || undefined, tokenOverride || undefined);
      if (res.orders && res.orders.length > 0) {
        setOrders(res.orders);
        setSelectedOrder(res.orders[0]);
        setLastRefreshedAt(new Date());
      } else {
        setOrders([]);
        setSelectedOrder(null);
        setError(res.error || (isKn ? 'ಯಾವುದೇ ಸಕ್ರಿಯ ಆರ್ಡರ್ಗಳು ಕಂಡುಬಂದಿಲ್ಲ' : 'No active orders found. Please verify your Order ID and Order Token.'));
      }
    } catch (e: any) {
      setError(e.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  // Safe customer refresh mechanism to fetch the latest location saved by admin
  const handleRefreshTracking = async () => {
    if (!selectedOrder) return;
    setRefreshing(true);
    try {
      let token = manualToken;
      if (!token) {
        try {
          const stored = JSON.parse(localStorage.getItem('indima_order_tokens') || '{}');
          token = stored[selectedOrder.id] || stored[(selectedOrder as any).internal_order_id] || '';
        } catch (_) {}
      }

      const res = await api.trackSingleOrder(selectedOrder.id, token || undefined);
      if (res.success && res.order) {
        setSelectedOrder(res.order);
        setOrders(prev => prev.map(o => o.id === res.order!.id ? res.order! : o));
        setLastRefreshedAt(new Date());
      } else {
        const trackRes = await api.trackOrders(undefined, selectedOrder.id, token || undefined);
        if (trackRes.orders && trackRes.orders.length > 0) {
          setSelectedOrder(trackRes.orders[0]);
          setOrders(trackRes.orders);
          setLastRefreshedAt(new Date());
        }
      }
    } catch (err: any) {
      console.error('Failed to refresh tracking:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Customer-Facing 7 Delivery Status Timeline Steps
  const timelineSteps: { key: string; label_en: string; label_kn: string; desc_en: string; desc_kn: string }[] = [
    {
      key: 'placed',
      label_en: 'Order Placed',
      label_kn: 'ಆರ್ಡರ್ ಸ್ವೀಕರಿಸಲಾಗಿದೆ',
      desc_en: 'Order received and recorded in estate system',
      desc_kn: 'ಆರ್ಡರ್ ದಾಖಲಿಸಲಾಗಿದೆ'
    },
    {
      key: 'confirmed',
      label_en: 'Payment Confirmed',
      label_kn: 'ಪಾವತಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ',
      desc_en: 'Payment verified securely',
      desc_kn: 'ಪಾವತಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ'
    },
    {
      key: 'processing',
      label_en: 'Processing',
      label_kn: 'ಸಂಸ್ಕರಣೆ ಹಂತ',
      desc_en: 'Fresh batch grinding & aroma-sealed packaging',
      desc_kn: 'ಮಸಾಲೆ ತಯಾರಿಕೆ ಮತ್ತು ಪ್ಯಾಕಿಂಗ್'
    },
    {
      key: 'shipped',
      label_en: 'Shipped',
      label_kn: 'ರವಾನಿಸಲಾಗಿದೆ',
      desc_en: 'Handed over to verified logistics courier',
      desc_kn: 'ಕೊರಿಯರ್ ಸಂಸ್ಥೆಗೆ ಹಸ್ತಾಂತರಿಸಲಾಗಿದೆ'
    },
    {
      key: 'in_transit',
      label_en: 'In Transit',
      label_kn: 'ಸಾಗಣೆಯಲ್ಲಿದೆ',
      desc_en: 'Moving through regional logistics hubs',
      desc_kn: 'ವಿತರಣಾ ಕೇಂದ್ರಗಳ ಮೂಲಕ ಸಾಗುತ್ತಿದೆ'
    },
    {
      key: 'out_for_delivery',
      label_en: 'Out for Delivery',
      label_kn: 'ವಿತರಣೆಗೆ ಹೊರಟಿದೆ',
      desc_en: 'Consignment out for doorstep delivery',
      desc_kn: 'ನಿಮ್ಮ ಮನೆಬಾಗಿಲಿಗೆ ತಲುಪಿಸಲು ಹೊರಟಿದೆ'
    },
    {
      key: 'delivered',
      label_en: 'Delivered',
      label_kn: 'ತಲುಪಿಸಲಾಗಿದೆ',
      desc_en: 'Safely delivered to customer',
      desc_kn: 'ಯಶಸ್ವಿಯಾಗಿ ತಲುಪಿಸಲಾಗಿದೆ'
    }
  ];

  const getStepIndex = (rawStatus?: string, paymentStatus?: string) => {
    if (!rawStatus) return 0;
    const s = String(rawStatus).toLowerCase().replace(/[\s_-]+/g, '_');
    if (s.includes('cancel')) return -1;
    if (s.includes('deliver') && !s.includes('out')) return 6; // Delivered
    if (s.includes('out') || s.includes('doorstep')) return 5; // Out for Delivery
    if (s.includes('transit')) return 4; // In Transit
    if (s.includes('ship') || s.includes('dispatch')) return 3; // Shipped
    if (s.includes('process') || s.includes('prep') || s.includes('pack')) return 2; // Processing
    if (s.includes('confirm') || (paymentStatus && (String(paymentStatus).toLowerCase() === 'paid' || String(paymentStatus).toLowerCase().includes('success')))) return 1; // Payment Confirmed
    if (s.includes('place')) return 0; // Order Placed
    return 0;
  };

  const currentStatusRaw = selectedOrder
    ? (selectedOrder.tracking?.status || selectedOrder.order_status || selectedOrder.status || 'placed')
    : '';

  const currentStepIdx = getStepIndex(currentStatusRaw, selectedOrder?.payment_status);
  const isCancelled = currentStatusRaw.toLowerCase().includes('cancel');
  const isPaymentFailed = String(selectedOrder?.payment_status || '').toLowerCase().includes('fail');

  // Resolved carrier and tracking information
  const carrier = selectedOrder?.tracking?.carrier || selectedOrder?.carrier;
  const trackingNumber = selectedOrder?.tracking?.tracking_number || selectedOrder?.tracking_number;
  const expectedDelivery = selectedOrder?.tracking?.expected_delivery || selectedOrder?.expected_delivery;
  const courierExternalUrl = carrier && trackingNumber ? getVerifiedTrackingUrl(carrier, trackingNumber) : null;
  const checkpointName = selectedOrder?.tracking?.location_name || '';
  const locationUpdatedAt = selectedOrder?.tracking?.location_updated_at || '';

  // Formatted last update time
  const formattedUpdateTime = (() => {
    if (!locationUpdatedAt) return null;
    try {
      const d = new Date(locationUpdatedAt);
      if (isNaN(d.getTime())) return locationUpdatedAt;
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch {
      return locationUpdatedAt;
    }
  })();

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
            <div className="w-9 h-9 rounded-lg bg-[#993300]/10 flex items-center justify-center text-[#993300]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-neutral-900 leading-tight">
                {isKn ? 'ನಿಮ್ಮ ಆರ್ಡರ್ ಅನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ' : 'Track Your Order'}
              </h2>
              <p className="text-[11px] text-neutral-500 font-medium">
                {isKn ? 'ಪರಿಶೀಲಿಸಿದ ಶಿಪ್‌ಮೆಂಟ್ ಸ್ಥಿತಿ ಮತ್ತು ಆರ್ಡರ್ ಪ್ರಗತಿ' : 'Verified courier shipment status & order progress'}
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

          {/* Active Customer Order Details */}
          {selectedOrder && (
            <div className="space-y-6">
              {/* 1. ORDER OVERVIEW & QUICK ACTIONS BAR */}
              <div className="bg-[#FAF6EE] p-4 rounded-xl border border-[#EADBCA] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div>
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">
                      TRACK YOUR ORDER
                    </span>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-xs text-neutral-600 font-semibold">{isKn ? 'ಆರ್ಡರ್ ಐಡಿ:' : 'Order ID:'}</span>
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
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Payment status badge */}
                    <span
                      className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border ${
                        String(selectedOrder.payment_status).toLowerCase().includes('success') || String(selectedOrder.payment_status).toLowerCase() === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isPaymentFailed
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {selectedOrder.payment_status ? `Payment: ${selectedOrder.payment_status}` : 'Payment Pending'}
                    </span>

                    {/* Order status badge */}
                    <span
                      className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full ${
                        isCancelled
                          ? 'bg-red-600 text-white'
                          : currentStatusRaw.toLowerCase().includes('deliver')
                          ? 'bg-emerald-700 text-white'
                          : 'bg-[#993300] text-white'
                      }`}
                    >
                      {currentStatusRaw.replace(/_/g, ' ')}
                    </span>

                    {/* Customer Refresh Tracking Button */}
                    <button
                      type="button"
                      onClick={handleRefreshTracking}
                      disabled={refreshing}
                      className="px-2.5 py-1 bg-white hover:bg-neutral-100 text-neutral-800 border border-[#D9C4A2] rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                      title="Refresh tracking data from server"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-[#993300] ${refreshing ? 'animate-spin' : ''}`} />
                      <span>{refreshing ? (isKn ? 'ನವೀಕರಿಸಲಾಗುತ್ತಿದೆ...' : 'Refreshing...') : (isKn ? 'ನವೀಕರಿಸಿ' : 'Refresh Tracking')}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2.5 border-t border-[#F0E6D2] text-xs">
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

              {/* 2. ORDER PROGRESS */}
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
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#993300]" />
                      <span>{isKn ? 'ಆರ್ಡರ್ ಪ್ರಗತಿ' : 'ORDER PROGRESS'}</span>
                    </h4>
                    {formattedUpdateTime && (
                      <span className="text-[11px] text-neutral-500">
                        {isKn ? 'ಕೊನೆಯ ನವೀಕರಣ:' : 'Last updated:'} {formattedUpdateTime}
                      </span>
                    )}
                  </div>

                  {/* Clean, readable stage-by-stage progress list */}
                  <div className="relative pl-6 space-y-3.5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D9C4A2]">
                    {timelineSteps.map((s, idx) => {
                      const isCompleted = currentStepIdx > idx;
                      const isCurrent = currentStepIdx === idx;
                      const isFuture = currentStepIdx < idx;

                      return (
                        <div
                          key={s.key}
                          className={`relative flex items-start space-x-3 p-2.5 rounded-lg transition-all ${
                            isCurrent
                              ? 'bg-white border border-[#DFC7A2] shadow-2xs -ml-1 pl-3'
                              : ''
                          }`}
                        >
                          <div
                            className={`absolute -left-6 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              isCompleted
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                                : isCurrent
                                ? 'bg-[#993300] border-[#993300] text-white shadow-xs'
                                : 'bg-white border-[#D9C4A2] text-neutral-300'
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="w-3 h-3 stroke-[3]" />
                            ) : isCurrent ? (
                              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            ) : (
                              <span className="text-[10px] text-neutral-400 font-bold">○</span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p
                                className={`text-xs ${
                                  isCurrent
                                    ? 'font-bold text-[#993300] text-sm'
                                    : isCompleted
                                    ? 'font-semibold text-neutral-900'
                                    : 'font-medium text-neutral-400'
                                }`}
                              >
                                {isCompleted && <span className="text-emerald-700 font-bold mr-1">✓</span>}
                                {isCurrent && <span className="text-[#993300] font-bold mr-1">●</span>}
                                {isFuture && <span className="text-neutral-400 font-bold mr-1">○</span>}
                                {isKn ? s.label_kn : s.label_en}
                              </p>
                              {isCurrent && (
                                <span className="text-[10px] font-extrabold px-2 py-0.5 bg-[#993300] text-white rounded-full uppercase tracking-wider">
                                  {isKn ? 'ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ' : 'CURRENT STATUS'}
                                </span>
                              )}
                            </div>
                            <p className={`text-[11px] mt-0.5 ${isCurrent ? 'text-neutral-700 font-medium' : isCompleted ? 'text-neutral-600' : 'text-neutral-400'}`}>
                              {isKn ? s.desc_kn : s.desc_en}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. EXPECTED DELIVERY (Prominent Display) */}
              <div className="bg-[#FAF6EE] p-4 sm:p-5 rounded-xl border border-[#DFC7A2] space-y-1">
                <div className="flex items-center space-x-1.5 text-neutral-600">
                  <Calendar className="w-4 h-4 text-[#993300]" />
                  <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider">
                    {isKn ? 'ನಿರೀಕ್ಷಿತ ವಿತರಣಾ ದಿನಾಂಕ' : 'EXPECTED DELIVERY'}
                  </span>
                </div>
                <p className="font-serif text-base sm:text-lg font-bold text-emerald-800">
                  {expectedDelivery ? expectedDelivery : (isKn ? 'ನಿರೀಕ್ಷಿತ ವಿತರಣಾ ದಿನಾಂಕ ಶೀಘ್ರದಲ್ಲೇ ನವೀಕರಿಸಲಾಗುವುದು.' : 'Expected delivery date will be updated soon.')}
                </p>
              </div>

              {/* 4. OPTIONAL SHIPPING INFORMATION (Courier & Tracking Number / AWB) */}
              {(carrier || trackingNumber) && (
                <div className="bg-white p-4 rounded-xl border border-[#D9C4A2] shadow-2xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-[#FAF6EE] border border-[#DFC7A2] flex items-center justify-center text-[#993300]">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        {carrier && (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-neutral-500 font-semibold">{isKn ? 'ಕೊರಿಯರ್:' : 'Courier:'}</span>
                            <span className="font-bold text-neutral-900 text-xs sm:text-sm">
                              {getCarrierDisplayName(carrier)}
                            </span>
                          </div>
                        )}
                        {trackingNumber && (
                          <div className="flex items-center space-x-2 mt-0.5">
                            <span className="text-xs text-neutral-500 font-semibold">{isKn ? 'AWB ಸಂಖ್ಯೆ:' : 'Tracking Number / AWB:'}</span>
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
                        )}
                      </div>
                    </div>

                    {/* External courier tracking link */}
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
              )}

              {/* 5. OPTIONAL SHIPMENT NOTE / CHECKPOINT */}
              {checkpointName && (
                <div className="bg-white p-3.5 rounded-xl border border-[#D9C4A2] shadow-2xs flex items-start space-x-2.5 text-xs">
                  <Package className="w-4 h-4 text-[#993300] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-neutral-700 block">
                      {isKn ? 'ಶಿಪ್‌ಮೆಂಟ್ ವಿವರಣೆ:' : 'Shipment Note:'}
                    </span>
                    <span className="text-neutral-900 font-medium">{checkpointName}</span>
                  </div>
                </div>
              )}

              {/* 5. PRODUCT / ORDER SUMMARY */}
              {(selectedOrder.items || []).length > 0 && (
                <div className="bg-white p-4 rounded-xl border border-[#D9C4A2] space-y-3 shadow-2xs">
                  <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center space-x-1.5">
                    <Package className="w-3.5 h-3.5 text-[#993300]" />
                    <span>{isKn ? 'ಆರ್ಡರ್ ಮಾಡಿದ ವಸ್ತುಗಳು' : 'Product Summary'}</span>
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

                  <div className="pt-2 border-t border-[#F0E6D2] flex justify-between items-center text-xs">
                    <span className="font-bold text-neutral-700">{isKn ? 'ಒಟ್ಟು ಪಾವತಿಸಿದ ಮೊತ್ತ:' : 'Total Amount Paid:'}</span>
                    <span className="font-serif text-sm font-bold text-[#993300]">₹{selectedOrder.total_amount}</span>
                  </div>
                </div>
              )}

              {/* 6. DELIVERY DESTINATION (Snapshot) */}
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
