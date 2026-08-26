import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Filter,
  Check,
  X,
  QrCode,
  ArrowUpDown,
  MessageCircle,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { Order, PaymentStatus } from '../../../types';
import { api } from '../../../services/api';

interface AdminPaymentsTabProps {
  token: string;
  orders: Order[];
  onOrderUpdated: (updatedOrder: Order) => void;
  onShowSuccess: (msg: string) => void;
}

export const AdminPaymentsTab: React.FC<AdminPaymentsTabProps> = ({
  token,
  orders,
  onOrderUpdated,
  onShowSuccess
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredOrders = (orders || []).filter(order => {
    const s = search.toLowerCase();
    const matchesSearch =
      order.id.toLowerCase().includes(s) ||
      (order.customer_name || '').toLowerCase().includes(s) ||
      (order.customer_phone || '').includes(s) ||
      (order.razorpay_order_id || '').toLowerCase().includes(s) ||
      (order.razorpay_payment_id || '').toLowerCase().includes(s) ||
      (order.payment_method || '').toLowerCase().includes(s) ||
      (order.utr_reference || '').toLowerCase().includes(s) ||
      (order.upi_reference_id || '').toLowerCase().includes(s) ||
      (order.transaction_id || '').toLowerCase().includes(s) ||
      (order.payment_details?.utr_reference || '').toLowerCase().includes(s) ||
      (order.payment_details?.transaction_id || '').toLowerCase().includes(s);

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    const pStatus = (order.payment_status || '').toLowerCase();
    if (statusFilter === 'Successful' && (pStatus === 'successful' || pStatus === 'paid')) return true;
    if (statusFilter === 'Payment Pending' && (pStatus === 'payment pending' || pStatus === 'processing' || pStatus === 'pending')) return true;
    if (statusFilter === 'Failed' && (pStatus === 'failed' || pStatus === 'cancelled')) return true;
    return pStatus === statusFilter.toLowerCase();
  });

  const totalCollected = orders
    .filter(o => o.payment_status === 'Successful' || o.payment_status === 'PAID')
    .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  const totalPending = orders
    .filter(o => o.payment_status === 'Payment Pending' || o.payment_status === 'Processing' || o.payment_status === 'PENDING')
    .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  const razorpayOrdersCount = orders.filter(o => o.razorpay_payment_id || o.razorpay_order_id).length;

  const handleUpdatePaymentStatus = async (order: Order, newStatus: PaymentStatus) => {
    setUpdatingId(order.id);
    try {
      const res = await api.updateOrderStatus(token, order.id, {
        payment_status: newStatus,
        status: (newStatus === 'Successful' || newStatus === 'PAID') && order.status === 'placed' ? 'confirmed' : order.status
      });

      if (res.success && res.order) {
        onOrderUpdated(res.order);
        onShowSuccess(`Order ${order.id} payment updated to ${newStatus}`);
      } else {
        alert('Failed to update payment status: ' + (res.error || 'Unknown error'));
      }
    } catch (e: any) {
      alert('Error updating payment: ' + e.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Total Verified Collected</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-400 mt-2">
            ₹{totalCollected.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">
            {razorpayOrdersCount} Razorpay verified transactions
          </p>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Pending Checkout</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-400 mt-2">
            ₹{totalPending.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">Awaiting customer payment completion</p>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Payment Integration</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-bold text-zinc-100 mt-2">
            Razorpay Standard Checkout
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">UPI Intent, Dynamic QR, Cards & NetBanking</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search Order ID, Razorpay ID, Phone..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-zinc-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-hidden focus:border-amber-500"
          >
            <option value="all">All Payment Statuses</option>
            <option value="Successful">Successful / PAID</option>
            <option value="Payment Pending">Payment Pending</option>
            <option value="Processing">Processing</option>
            <option value="Failed">Failed / Cancelled</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Amount (₹)</th>
                <th className="p-4">Razorpay / Ref ID</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500">
                    No transactions match your search.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const isSuccess = order.payment_status === 'Successful' || order.payment_status === 'PAID';
                  const isPending =
                    order.payment_status === 'Payment Pending' ||
                    order.payment_status === 'Processing' ||
                    order.payment_status === 'PENDING';

                  return (
                    <tr key={order.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="p-4">
                        <p className="font-mono font-bold text-zinc-100">{order.id}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">
                          {new Date(order.created_at).toLocaleString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </td>

                      <td className="p-4">
                        <p className="font-semibold text-zinc-100">{order.customer_name}</p>
                        <p className="text-[11px] text-zinc-400 font-mono">{order.customer_phone}</p>
                      </td>

                      <td className="p-4 font-mono font-black text-amber-400 text-sm">
                        ₹{order.total_amount}
                      </td>

                      <td className="p-4 space-y-1">
                        {order.razorpay_payment_id ? (
                          <div className="flex flex-col space-y-0.5">
                            <span className="font-mono bg-zinc-950 px-2 py-0.5 rounded-md border border-emerald-900/60 text-emerald-400 text-[10px] font-bold">
                              Pay: {order.razorpay_payment_id}
                            </span>
                            {order.razorpay_order_id && (
                              <span className="font-mono text-zinc-500 text-[9px]">
                                Ord: {order.razorpay_order_id}
                              </span>
                            )}
                            {order.payment_method && (
                              <span className="text-zinc-400 text-[9px] uppercase tracking-wider">
                                Method: {order.payment_method}
                              </span>
                            )}
                          </div>
                        ) : order.utr_reference || order.upi_reference_id || order.transaction_id ? (
                          <span className="font-mono bg-zinc-950 px-2 py-1 rounded-md border border-zinc-800 text-zinc-200 text-[11px] font-bold">
                            {order.utr_reference || order.upi_reference_id || order.transaction_id}
                          </span>
                        ) : (
                          <span className="text-zinc-600 text-[11px] italic">
                            {order.razorpay_order_id ? `Ord: ${order.razorpay_order_id}` : 'Awaiting payment'}
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isSuccess
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : isPending
                              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {isSuccess && <CheckCircle2 className="w-3 h-3" />}
                          {isPending && <Clock className="w-3 h-3" />}
                          <span>{order.payment_status}</span>
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {!isSuccess && (
                            <button
                              disabled={updatingId === order.id}
                              onClick={() => handleUpdatePaymentStatus(order, 'Successful')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/40 text-[11px] font-bold transition-colors cursor-pointer"
                              title="Mark payment as verified & successful"
                            >
                              <Check className="w-3 h-3 inline mr-1" />
                              Verify
                            </button>
                          )}

                          {order.customer_phone && (
                            <a
                              href={`https://wa.me/91${order.customer_phone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(
                                isSuccess
                                  ? `Namaskara ${order.customer_name}! 🙏\nYour payment of ₹${order.total_amount} for Indima Spice Co. Order ${order.id} is verified and confirmed! 🌿 We are preparing your authentic spice package.`
                                  : `Namaskara ${order.customer_name}! 🙏\nThis is from Indima Spice Co. regarding your Order ${order.id} for ₹${order.total_amount}. We noticed your payment is pending. Please let us know if you need assistance completing your order.`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold transition-colors flex items-center space-x-1"
                              title="Notify Customer on WhatsApp"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </a>
                          )}

                          {order.payment_status !== 'Failed' && !isSuccess && (
                            <button
                              disabled={updatingId === order.id}
                              onClick={() => handleUpdatePaymentStatus(order, 'Failed')}
                              className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-600/40 text-[11px] font-bold transition-colors cursor-pointer"
                              title="Mark payment as failed"
                            >
                              <X className="w-3 h-3 inline mr-1" />
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
