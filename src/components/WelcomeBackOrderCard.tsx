import React, { useState, useEffect } from 'react';
import { Package, Truck, ArrowRight, X, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Order } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { safeStorage } from '../utils/safeStorage';
import { getAuthoritativeOrderStatus, isOrderActive } from '../utils/orderStatus';

interface WelcomeBackOrderCardProps {
  onTrackOrder: (orderId: string) => void;
}

export const WelcomeBackOrderCard: React.FC<WelcomeBackOrderCardProps> = ({ onTrackOrder }) => {
  const { language } = useLanguage();
  const isKn = language === 'kn';

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadAuthorizedOrders = async () => {
      try {
        if (typeof window === 'undefined') return;

        const rawStored = safeStorage.getItem('indima_order_tokens');
        if (!rawStored) {
          if (isMounted) setLoading(false);
          return;
        }

        const stored: Record<string, string> = JSON.parse(rawStored);
        if (!stored || typeof stored !== 'object') {
          if (isMounted) setLoading(false);
          return;
        }

        // Deduplicate entries by token value so alias keys (internal_order_id vs id) don't trigger duplicate fetches
        const uniqueEntries: { orderId: string; token: string }[] = [];
        const seenTokens = new Set<string>();

        for (const [orderId, token] of Object.entries(stored)) {
          if (typeof token === 'string' && token.trim() && !seenTokens.has(token.trim())) {
            seenTokens.add(token.trim());
            uniqueEntries.push({ orderId: orderId.trim(), token: token.trim() });
          }
        }

        if (uniqueEntries.length === 0) {
          if (isMounted) setLoading(false);
          return;
        }

        // Limit to the most recent 4 orders to prevent excessive network requests
        const targetEntries = uniqueEntries.slice(-4);

        // Fetch each order securely through existing token-authorized endpoint
        const fetchPromises = targetEntries.map(async entry => {
          try {
            const res = await api.trackSingleOrder(entry.orderId, entry.token);
            if (res.success && res.order) {
              return res.order;
            }
          } catch (_) {
            // Fail closed on error
          }
          return null;
        });

        const results = await Promise.all(fetchPromises);
        const validOrders = results.filter((o): o is Order => Boolean(o));

        // Filter out completed, delivered, and cancelled orders so ONLY active orders appear
        const activeOrders = validOrders.filter(isOrderActive);

        // Deduplicate by order id
        const deduplicated: Order[] = [];
        const seenIds = new Set<string>();
        for (const ord of activeOrders) {
          const key = ord.id || ord.internal_order_id;
          if (key && !seenIds.has(key)) {
            seenIds.add(key);
            deduplicated.push(ord);
          }
        }

        // Sort newest first
        deduplicated.sort((a, b) => {
          const timeA = new Date(a.created_at || (a as any).order_date || 0).getTime();
          const timeB = new Date(b.created_at || (b as any).order_date || 0).getTime();
          return timeB - timeA;
        });

        if (isMounted) {
          setOrders(deduplicated);
        }
      } catch (err) {
        console.error('Failed to verify returning customer orders:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAuthorizedOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute strictly active orders (excludes Delivered, Cancelled, and Payment Failed)
  const activeOrders = orders.filter(isOrderActive);

  if (dismissed || loading || activeOrders.length === 0) {
    return null;
  }

  const getStatusBadge = (rawStatus?: string, paymentStatus?: string) => {
    const s = String(rawStatus || '').toLowerCase().replace(/[\s_-]+/g, ' ');
    if (s.includes('cancel')) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
          <AlertCircle className="w-3 h-3" />
          <span>{isKn ? 'ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ' : 'Cancelled'}</span>
        </span>
      );
    }
    if (s.includes('deliver') && !s.includes('out')) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>{isKn ? 'ತಲುಪಿಸಲಾಗಿದೆ' : 'Delivered'}</span>
        </span>
      );
    }
    if (s.includes('out') || s.includes('transit') || s.includes('ship')) {
      const label = s.includes('out')
        ? (isKn ? 'ವಿತರಣೆಗೆ ಹೊರಟಿದೆ' : 'Out for Delivery')
        : s.includes('transit')
        ? (isKn ? 'ಸಾಗಣೆಯಲ್ಲಿದೆ' : 'In Transit')
        : (isKn ? 'ರವಾನಿಸಲಾಗಿದೆ' : 'Shipped');

      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <Truck className="w-3 h-3 text-amber-700" />
          <span>{label}</span>
        </span>
      );
    }

    const label = s.includes('process')
      ? (isKn ? 'ಸಂಸ್ಕರಣೆಯಲ್ಲಿದೆ' : 'Processing')
      : s.includes('confirm')
      ? (isKn ? 'ದೃಢೀಕರಿಸಲಾಗಿದೆ' : 'Confirmed')
      : (isKn ? 'ಆರ್ಡರ್ ಸ್ವೀಕರಿಸಲಾಗಿದೆ' : 'Order Placed');

    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
        <Clock className="w-3 h-3 text-blue-700" />
        <span>{label}</span>
      </span>
    );
  };

  // Case 1: Single previous active order
  if (activeOrders.length === 1) {
    const order = activeOrders[0];
    const displayId = order.internal_order_id || order.id;
    const rawStatus = getAuthoritativeOrderStatus(order);
    const expectedDelivery = order.tracking?.expected_delivery || order.expected_delivery;
    const formattedDate = order.created_at || (order as any).order_date
      ? new Date(order.created_at || (order as any).order_date).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })
      : null;

    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="relative bg-[#FFFDF9] border border-[#DFC7A2] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm overflow-hidden group">
          {/* Subtle warm decorative glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />

          {/* Dismiss button */}
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss welcome card"
            className="absolute top-3 right-3 p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
            title={isKn ? 'ಮುಚ್ಚಿ' : 'Dismiss'}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Greeting and Context */}
            <div className="space-y-1.5 pr-6">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-[#FAF3E0] border border-[#DFC7A2] rounded-full text-xs font-bold text-[#7A1F1D]">
                <span>👋</span>
                <span>{isKn ? 'ಮರಳಿ ಸುಸ್ವಾಗತ!' : 'Welcome back!'}</span>
              </div>

              <h3 className="font-serif text-base sm:text-lg font-bold text-[#2C1810]">
                {isKn ? 'ನಿಮ್ಮ ಹಿಂದಿನ ಆರ್ಡರ್ ಅನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ಬಯಸುವಿರಾ?' : 'Want to track your previous order?'}
              </h3>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#5C4535]">
                <span className="font-mono font-bold text-[#2C1810] bg-[#FAF6EE] px-2 py-0.5 rounded border border-[#EADBCA]">
                  #{displayId}
                </span>
                <span>•</span>
                {getStatusBadge(rawStatus, order.payment_status)}
                {expectedDelivery && (
                  <>
                    <span>•</span>
                    <span className="text-neutral-700">
                      {isKn ? 'ನಿರೀಕ್ಷಿತ ವಿತರಣೆ:' : 'Expected delivery:'}{' '}
                      <strong className="text-emerald-800">{expectedDelivery}</strong>
                    </span>
                  </>
                )}
                {formattedDate && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline text-neutral-500">
                      {isKn ? 'ದಿನಾಂಕ:' : 'Ordered:'} {formattedDate}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="shrink-0 pt-2 md:pt-0">
              <button
                type="button"
                onClick={() => onTrackOrder(order.id)}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-[#993300] hover:bg-[#7A1F1D] text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer min-h-[44px]"
              >
                <Truck className="w-4 h-4" />
                <span>{isKn ? 'ಹಿಂದಿನ ಆರ್ಡರ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ' : 'Track Previous Order'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Case 2: Multiple previous active orders
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div className="relative bg-[#FFFDF9] border border-[#DFC7A2] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm overflow-hidden">
        {/* Subtle warm decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />

        {/* Dismiss button */}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss welcome card"
          className="absolute top-3 right-3 p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
          title={isKn ? 'ಮುಚ್ಚಿ' : 'Dismiss'}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="mb-3.5 pr-6">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-[#FAF3E0] border border-[#DFC7A2] rounded-full text-xs font-bold text-[#7A1F1D] mb-1.5">
            <span>👋</span>
            <span>{isKn ? 'ಮರಳಿ ಸುಸ್ವಾಗತ!' : 'Welcome back!'}</span>
          </div>
          <h3 className="font-serif text-base sm:text-lg font-bold text-[#2C1810]">
            {isKn ? 'ನಿಮ್ಮ ಹಿಂದಿನ ಆರ್ಡರ್‌ಗಳು' : 'Your Previous Orders'}
          </h3>
          <p className="text-xs text-[#5C4535]">
            {isKn ? 'ಯಾವುದನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ಬಯಸುತ್ತೀರಿ?' : 'Which one would you like to track?'}
          </p>
        </div>

        {/* List of Previous Active Orders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeOrders.map(order => {
            const displayId = order.internal_order_id || order.id;
            const rawStatus = getAuthoritativeOrderStatus(order);
            const expectedDelivery = order.tracking?.expected_delivery || order.expected_delivery;
            const formattedDate = order.created_at || (order as any).order_date
              ? new Date(order.created_at || (order as any).order_date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short'
                })
              : null;

            return (
              <div
                key={order.id}
                className="bg-[#FAF6EE] border border-[#EADBCA] hover:border-[#993300] rounded-xl p-3.5 flex flex-col justify-between space-y-3 transition-colors shadow-2xs group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-xs text-[#2C1810]">
                      #{displayId}
                    </span>
                    {getStatusBadge(rawStatus, order.payment_status)}
                  </div>

                  <div className="text-[11px] text-[#5C4535] space-y-0.5">
                    {expectedDelivery && (
                      <p>
                        {isKn ? 'ವಿತರಣೆ:' : 'Delivery:'}{' '}
                        <strong className="text-emerald-800 font-semibold">{expectedDelivery}</strong>
                      </p>
                    )}
                    {formattedDate && (
                      <p className="text-neutral-500">
                        {isKn ? 'ದಿನಾಂಕ:' : 'Date:'} {formattedDate}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onTrackOrder(order.id)}
                  className="w-full inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-[#993300] text-[#993300] hover:text-white border border-[#D9C4A2] hover:border-[#993300] font-bold text-xs rounded-lg transition-all cursor-pointer min-h-[36px]"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>{isKn ? 'ಟ್ರ್ಯಾಕ್ ಮಾಡಿ' : 'Track Order'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );

};
