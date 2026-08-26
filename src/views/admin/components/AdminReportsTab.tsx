import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  Truck,
  Users,
  Package,
  Calendar,
  Download,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { Order, Product, Customer } from '../../../types';

interface AdminReportsTabProps {
  orders: Order[];
  products: Product[];
  customers: Customer[];
}

export const AdminReportsTab: React.FC<AdminReportsTabProps> = ({
  orders = [],
  products = [],
  customers = []
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('all');

  const safeOrders = orders || [];
  const safeProducts = products || [];

  const totalRevenue = safeOrders
    .filter(o => o?.payment_status === 'Successful')
    .reduce((sum, o) => sum + (o?.total_amount || 0), 0);

  const deliveredOrdersCount = safeOrders.filter(o => o?.status === 'delivered' || o?.order_status === 'Delivered').length;
  const avgOrderValue = safeOrders.length > 0 ? Math.round(totalRevenue / (safeOrders.filter(o => o?.payment_status === 'Successful').length || 1)) : 0;

  // Calculate Product Sales Breakdown
  const productSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};

  safeOrders.forEach(order => {
    (order?.items || []).forEach(item => {
      if (!item) return;
      const pId = item.product_id;
      const matchedProd = safeProducts.find(p => p?.id === pId);
      const name = matchedProd ? matchedProd.name_en : pId;
      const price = matchedProd ? matchedProd.price : 199;

      if (!productSalesMap[pId]) {
        productSalesMap[pId] = { name, quantity: 0, revenue: 0 };
      }
      productSalesMap[pId].quantity += item.quantity || 0;
      productSalesMap[pId].revenue += (item.quantity || 0) * price;
    });
  });

  const topSellingProducts = Object.values(productSalesMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Status Distribution
  const statusCounts = {
    placed: safeOrders.filter(o => o?.status === 'placed' || o?.order_status === 'Order Placed').length,
    confirmed: safeOrders.filter(o => o?.status === 'confirmed' || o?.order_status === 'Processing').length,
    packed: safeOrders.filter(o => o?.status === 'packed' || o?.order_status === 'Packed').length,
    shipped: safeOrders.filter(o => o?.status === 'shipped' || o?.order_status === 'Shipped').length,
    delivered: deliveredOrdersCount,
    cancelled: safeOrders.filter(o => o?.status === 'cancelled').length
  };

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer Name', 'Phone', 'Amount (INR)', 'Payment Status', 'Delivery Status'];
    const rows = safeOrders.map(o => [
      o.id,
      new Date(o.created_at).toISOString(),
      `"${o.customer_name || ''}"`,
      o.customer_phone || '',
      o.total_amount || 0,
      o.payment_status || '',
      o.status || o.order_status || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `indima_orders_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif text-lg font-bold text-zinc-100">
              Sales, Fulfillment & Customer Reports
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time business performance analytics and downloadable order audits.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export Orders CSV</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Total Net Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-400 mt-2">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">From verified UPI orders</p>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Average Order Value</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-400 mt-2">
            ₹{avgOrderValue.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">Per successful transaction</p>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Total Orders</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-blue-400 mt-2">
            {orders.length}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">
            {deliveredOrdersCount} completed & delivered
          </p>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Registered Customers</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-purple-400 mt-2">
            {customers.length}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">Pan-India buyer accounts</p>
        </div>
      </div>

      {/* Top Selling Products & Fulfillment Pipeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top 5 Products */}
        <div className="lg:col-span-7 bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-sm font-bold text-zinc-100 flex items-center space-x-2">
              <Package className="w-4 h-4 text-amber-400" />
              <span>Top Selling Spice Blends & Masalas</span>
            </h3>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">By Volume</span>
          </div>

          <div className="space-y-3">
            {topSellingProducts.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">No sales recorded yet.</p>
            ) : (
              topSellingProducts.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-zinc-200">{p.name}</p>
                      <p className="text-[10px] text-zinc-500">{p.quantity} units sold</p>
                    </div>
                  </div>

                  <p className="text-xs font-mono font-bold text-amber-400">
                    ₹{p.revenue.toLocaleString('en-IN')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Fulfillment Pipeline Breakdown */}
        <div className="lg:col-span-5 bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-sm font-bold text-zinc-100 flex items-center space-x-2">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Order Fulfillment Status</span>
            </h3>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
              <span className="text-zinc-400">1. Order Placed</span>
              <span className="font-mono font-bold text-amber-400">{statusCounts.placed}</span>
            </div>
            <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
              <span className="text-zinc-400">2. Payment Confirmed / Prep</span>
              <span className="font-mono font-bold text-blue-400">{statusCounts.confirmed}</span>
            </div>
            <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
              <span className="text-zinc-400">3. Packed Fresh</span>
              <span className="font-mono font-bold text-indigo-400">{statusCounts.packed}</span>
            </div>
            <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
              <span className="text-zinc-400">4. Shipped / Out for Delivery</span>
              <span className="font-mono font-bold text-purple-400">{statusCounts.shipped}</span>
            </div>
            <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
              <span className="text-zinc-400">5. Delivered</span>
              <span className="font-mono font-bold text-emerald-400">{statusCounts.delivered}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
