import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  MessageCircle,
  ShoppingBag,
  CheckCheck,
  ExternalLink,
  X,
  Sparkles,
  Radio,
  Clock
} from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../../lib/firebase';
import { api } from '../../../services/api';
import { OrderNotification } from '../../../types';
import { playOrderAlertChime } from '../../../utils/audioAlert';

interface AdminNotificationCenterProps {
  token: string;
  onSelectOrder?: (orderId: string) => void;
  onNewOrderReceived?: () => void;
}

export const AdminNotificationCenter: React.FC<AdminNotificationCenterProps> = ({
  token,
  onSelectOrder,
  onNewOrderReceived
}) => {
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    return localStorage.getItem('indima_admin_order_sound_muted') === 'true';
  });
  const [activeToast, setActiveToast] = useState<OrderNotification | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [isTesting, setIsTesting] = useState(false);

  const isInitialLoadRef = useRef(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Toggle Mute
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    localStorage.setItem('indima_admin_order_sound_muted', String(next));
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show Toast Alert
  const triggerToastAlert = (notif: OrderNotification) => {
    setActiveToast(notif);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setActiveToast(null);
    }, 10000);
  };

  // 1. Primary Real-Time Firestore onSnapshot Listener
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;

    try {
      const q = query(
        collection(db, 'order_notifications'),
        orderBy('created_at', 'desc'),
        limit(30)
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          setIsConnected(true);
          const loaded: OrderNotification[] = [];

          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as OrderNotification;
            loaded.push({
              ...data,
              id: docSnap.id
            });
          });

          // Check for newly incoming orders or unread on page open
          if (!isInitialLoadRef.current) {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                const newDoc = change.doc.data() as OrderNotification;
                playOrderAlertChime(newDoc.order_source || 'web');
                triggerToastAlert(newDoc);
                if (onNewOrderReceived) {
                  onNewOrderReceived();
                }
              }
            });
          } else {
            isInitialLoadRef.current = false;
            // Alert admin if there are unread order notifications upon opening the admin page
            const unreadOnOpen = loaded.filter((n) => !n.read);
            if (unreadOnOpen.length > 0) {
              const latestUnread = unreadOnOpen[0];
              triggerToastAlert(latestUnread);
              playOrderAlertChime(latestUnread.order_source || 'web');
              if (onNewOrderReceived) {
                onNewOrderReceived();
              }
            }
          }

          setNotifications(loaded);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'order_notifications');
          setIsConnected(false);

          // Fallback: poll server endpoint if Firestore listener errors
          const pollApi = async () => {
            try {
              const res = await api.getAdminNotifications(token);
              if (Array.isArray(res)) {
                setNotifications(res);
              }
            } catch {}
          };
          pollApi();
          fallbackInterval = setInterval(pollApi, 20000);
        }
      );
    } catch (e) {
      console.warn('Firestore snapshot setup notice:', e);
      setIsConnected(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
      if (fallbackInterval) clearInterval(fallbackInterval);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [token, onNewOrderReceived]);

  // Mark single notification read
  const handleMarkRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    await api.markNotificationRead(token, id);
  };

  // Mark all read
  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    for (const notif of notifications) {
      if (!notif.read) {
        api.markNotificationRead(token, notif.id).catch(() => {});
      }
    }
  };

  // Trigger Live Test Alert (Client-side audio & visual check only - DOES NOT create real orders)
  const handleTestAlert = (source: 'whatsapp' | 'web') => {
    setIsTesting(true);
    try {
      playOrderAlertChime(source);
      triggerToastAlert({
        id: `demo-${Date.now()}`,
        order_id: source === 'whatsapp' ? 'WA-DEMO' : 'IND-DEMO',
        customer_name: source === 'whatsapp' ? 'WhatsApp Sound Check' : 'Web Store Sound Check',
        customer_phone: '9999999999',
        total_amount: 540,
        item_count: 1,
        order_source: source,
        status: 'placed',
        payment_method: source === 'whatsapp' ? 'WhatsApp' : 'UPI',
        item_summary: 'Audio test only - no order was created in database',
        created_at: new Date().toISOString(),
        read: false
      });
    } finally {
      setTimeout(() => setIsTesting(false), 300);
    }
  };

  // Jump to order
  const handleViewOrder = (orderId: string) => {
    if (onSelectOrder) {
      onSelectOrder(orderId);
    }
    setIsOpen(false);
    setActiveToast(null);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatTimeAgo = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 60) return 'Just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      return new Date(isoString).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Sound Mute Toggle */}
      <div className="flex items-center space-x-1.5">
        <button
          onClick={toggleMute}
          title={isMuted ? 'Sound Alerts Muted (Click to Unmute)' : 'Sound Alerts Active (Click to Mute)'}
          className={`p-2 rounded-lg border transition-colors cursor-pointer ${
            isMuted
              ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
              : 'bg-amber-950/40 border-amber-800/50 text-amber-400 hover:text-amber-300'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Bell Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          title="Live Order Alerts"
          className="relative p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
        >
          {unreadCount > 0 ? (
            <BellRing className="w-4 h-4 text-amber-400 animate-wiggle" />
          ) : (
            <Bell className="w-4 h-4 text-zinc-400" />
          )}

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white shadow-md">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative">{unreadCount > 9 ? '9+' : unreadCount}</span>
            </span>
          )}
        </button>
      </div>

      {/* Floating Active Order Toast Alert */}
      {activeToast && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm sm:max-w-md w-full bg-zinc-900 border-2 shadow-2xl rounded-2xl p-4 text-white animate-in slide-in-from-top-4 duration-300 backdrop-blur-xl border-amber-500/80">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  activeToast.order_source === 'whatsapp'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}
              >
                {activeToast.order_source === 'whatsapp' ? (
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm ${
                      activeToast.order_source === 'whatsapp'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-600 text-white'
                    }`}
                  >
                    {activeToast.order_source === 'whatsapp' ? 'WhatsApp Order' : 'Web Store Order'}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">#{activeToast.order_id}</span>
                </div>
                <h4 className="text-sm font-bold text-zinc-100 mt-0.5">
                  ₹{activeToast.total_amount} — {activeToast.customer_name}
                </h4>
              </div>
            </div>

            <button
              onClick={() => setActiveToast(null)}
              className="text-zinc-400 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {activeToast.item_summary && (
            <p className="text-xs text-zinc-300 mt-2 line-clamp-1 bg-zinc-800/80 px-2.5 py-1.5 rounded-lg border border-zinc-700/50">
              {activeToast.item_summary}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between pt-2 border-t border-zinc-800">
            <span className="text-[11px] text-zinc-400 flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatTimeAgo(activeToast.created_at)}</span>
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveToast(null)}
                className="text-xs px-2.5 py-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Dismiss
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`🌿 *NEW PAID ORDER ALERT — INDIMA SPICE CO.* 🌿\n\n*Order ID:* ${activeToast.order_id}\n*Customer:* ${activeToast.customer_name} (+91 ${activeToast.customer_phone || ''})\n*Amount:* ₹${activeToast.total_amount}\n*Items:* ${activeToast.item_summary || 'Spices'}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white transition-colors flex items-center space-x-1"
                title="Open WhatsApp Alert"
              >
                <MessageCircle className="w-3 h-3" />
                <span>WhatsApp</span>
              </a>
              <button
                onClick={() => handleViewOrder(activeToast.order_id)}
                className="text-xs font-bold px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors flex items-center space-x-1"
              >
                <span>Open Order</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-zinc-200 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 bg-zinc-950/90 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1.5">
                <span className="text-sm font-bold text-white">Live Order Alerts</span>
                <span className="flex items-center space-x-1 text-[10px] font-semibold bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded-full">
                  <Radio className={`w-2.5 h-2.5 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
                  <span>{isConnected ? 'Firestore Live' : 'Polling'}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center space-x-1 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Test Alert Buttons for Operator Audio Check */}
          <div className="bg-zinc-950/60 px-3 py-2 border-b border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-[11px] text-zinc-400 font-medium">Test Alert Sound:</span>
            <div className="flex items-center space-x-1.5">
              <button
                disabled={isTesting}
                onClick={() => handleTestAlert('web')}
                title="Play web store alert sound tone (does not create orders)"
                className="text-[10px] font-bold px-2 py-1 rounded bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-700/50 transition-colors disabled:opacity-50 flex items-center space-x-1"
              >
                <Volume2 className="w-3 h-3" />
                <span>Web Chime</span>
              </button>
              <button
                disabled={isTesting}
                onClick={() => handleTestAlert('whatsapp')}
                title="Play WhatsApp alert sound tone (does not create orders)"
                className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/50 transition-colors disabled:opacity-50 flex items-center space-x-1"
              >
                <Volume2 className="w-3 h-3" />
                <span>WhatsApp Chime</span>
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/80">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-zinc-600 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold text-zinc-400">No order notifications yet</p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  New orders placed via Web Store or WhatsApp will alert in real-time here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isWhatsApp = notif.order_source === 'whatsapp';
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleViewOrder(notif.order_id)}
                    className={`p-3 transition-colors cursor-pointer flex items-start space-x-3 hover:bg-zinc-800/70 ${
                      !notif.read ? 'bg-zinc-800/30' : ''
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isWhatsApp
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {isWhatsApp ? (
                        <MessageCircle className="w-4 h-4" />
                      ) : (
                        <ShoppingBag className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center space-x-1.5 truncate">
                          <span
                            className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-sm ${
                              isWhatsApp
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {isWhatsApp ? 'WhatsApp' : 'Web Store'}
                          </span>
                          <span className="text-xs font-bold text-white truncate">
                            {notif.customer_name}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 shrink-0">
                          {formatTimeAgo(notif.created_at)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-1 text-xs">
                        <span className="font-mono text-zinc-400 text-[11px]">#{notif.order_id}</span>
                        <span className="font-bold text-amber-400">₹{notif.total_amount}</span>
                      </div>

                      {notif.item_summary && (
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {notif.item_summary}
                        </p>
                      )}
                    </div>

                    {!notif.read && (
                      <button
                        onClick={(e) => handleMarkRead(notif.id, e)}
                        title="Mark read"
                        className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 mt-2 hover:scale-125 transition-transform"
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
