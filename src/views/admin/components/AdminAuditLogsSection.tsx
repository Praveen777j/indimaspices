import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Calendar,
  Clock,
  MessageCircle,
  Phone,
  FileText,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Lock,
  CreditCard,
  Cpu,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { AdminAuditLog, Lead } from '../../../types';

interface AdminAuditLogsSectionProps {
  auditLogs: AdminAuditLog[];
  leads: Lead[];
  defaultView?: 'audit' | 'leads';
}

type CategoryFilter = 'all' | 'admin' | 'system' | 'webhook';
type DateFilter = 'all' | 'today' | 'yesterday' | '7days' | 'custom';

// Format audit timestamp cleanly to e.g. "23 Sep 2026 · 5:17 PM"
function formatAuditTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const day = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${day} · ${time}`;
  } catch {
    return isoString;
  }
}

// Categorize event into ADMIN, WEBHOOK, or SYSTEM
function getAuditCategory(log: AdminAuditLog): {
  type: 'admin' | 'webhook' | 'system';
  label: string;
  emoji: string;
  badgeClass: string;
} {
  const username = (log.admin_username || '').toLowerCase();
  const action = (log.action || log.action_type || '').toLowerCase();
  const details = typeof log.details === 'string' ? log.details.toLowerCase() : JSON.stringify(log.details || '').toLowerCase();

  if (
    username.includes('webhook') ||
    username.includes('razorpay') ||
    action.includes('webhook') ||
    action.includes('razorpay') ||
    action.includes('payment_confirmed') ||
    action.includes('payment confirmed') ||
    details.includes('razorpay')
  ) {
    return {
      type: 'webhook',
      label: 'WEBHOOK',
      emoji: '💳',
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300'
    };
  }

  if (
    username.includes('system') ||
    username.includes('cron') ||
    username.includes('auto') ||
    action.includes('system') ||
    action.includes('inventory_sync') ||
    action.includes('auto') ||
    action.includes('order created')
  ) {
    return {
      type: 'system',
      label: 'SYSTEM',
      emoji: '🛒',
      badgeClass: 'bg-blue-100 text-blue-900 border-blue-300'
    };
  }

  return {
    type: 'admin',
    label: (log.admin_username || 'ADMIN').toUpperCase(),
    emoji: '🔐',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300'
  };
}

// Clean and humanize action title
function formatAuditAction(rawAction?: string, rawType?: string): string {
  const val = rawAction || rawType || 'Audit Event';
  if (val.includes('_') || val === val.toUpperCase()) {
    return val
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }
  return val;
}

// Format details/reason cleanly
function formatAuditDetails(log: AdminAuditLog): string {
  if (log.reason && typeof log.reason === 'string') {
    return log.reason;
  }
  if (!log.details) {
    return 'Action logged and recorded.';
  }
  if (typeof log.details === 'string') {
    return log.details;
  }
  if (typeof log.details === 'object') {
    if (log.details.reason && typeof log.details.reason === 'string') {
      return log.details.reason;
    }
    if (log.details.message && typeof log.details.message === 'string') {
      return log.details.message;
    }
    const parts: string[] = [];
    if (log.details.orderId || log.details.order_id) {
      parts.push(`Order #${log.details.orderId || log.details.order_id}`);
    }
    if (log.details.amount) {
      parts.push(`₹${log.details.amount}`);
    }
    if (log.details.customer_name || log.details.customerName) {
      parts.push(`Customer: ${log.details.customer_name || log.details.customerName}`);
    }
    if (log.details.status) {
      parts.push(`Status: ${log.details.status}`);
    }
    if (parts.length > 0) return parts.join(' · ');

    try {
      const json = JSON.stringify(log.details);
      if (json.length > 180) {
        return json.slice(0, 180) + '...';
      }
      return json;
    } catch {
      return String(log.details);
    }
  }
  return String(log.details);
}

export const AdminAuditLogsSection: React.FC<AdminAuditLogsSectionProps> = ({
  auditLogs = [],
  leads = [],
  defaultView = 'audit'
}) => {
  // Navigation sub-tab: 'audit' (Audit Logs) or 'leads' (WhatsApp Leads)
  const [activeSubTab, setActiveSubTab] = useState<'audit' | 'leads'>(defaultView);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [customDate, setCustomDate] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const [leadsPage, setLeadsPage] = useState(1);
  const leadsPageSize = 15;

  // Filtered audit logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      // 1. Category filter
      if (categoryFilter !== 'all') {
        const cat = getAuditCategory(log).type;
        if (cat !== categoryFilter) return false;
      }

      // 2. Date filter
      if (dateFilter !== 'all') {
        const logDate = new Date(log.timestamp);
        if (!isNaN(logDate.getTime())) {
          const now = new Date();
          if (dateFilter === 'today') {
            const isToday =
              logDate.getDate() === now.getDate() &&
              logDate.getMonth() === now.getMonth() &&
              logDate.getFullYear() === now.getFullYear();
            if (!isToday) return false;
          } else if (dateFilter === 'yesterday') {
            const yest = new Date();
            yest.setDate(yest.getDate() - 1);
            const isYesterday =
              logDate.getDate() === yest.getDate() &&
              logDate.getMonth() === yest.getMonth() &&
              logDate.getFullYear() === yest.getFullYear();
            if (!isYesterday) return false;
          } else if (dateFilter === '7days') {
            const diff = now.getTime() - logDate.getTime();
            if (diff < 0 || diff > 7 * 24 * 60 * 60 * 1000) return false;
          } else if (dateFilter === 'custom' && customDate) {
            const target = new Date(customDate);
            const matchesCustom =
              logDate.getDate() === target.getDate() &&
              logDate.getMonth() === target.getMonth() &&
              logDate.getFullYear() === target.getFullYear();
            if (!matchesCustom) return false;
          }
        }
      }

      // 3. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const action = (log.action || log.action_type || '').toLowerCase();
        const admin = (log.admin_username || '').toLowerCase();
        const target = (log.target_id || '').toLowerCase();
        const reason = (log.reason || '').toLowerCase();
        const detailsStr =
          typeof log.details === 'object'
            ? JSON.stringify(log.details).toLowerCase()
            : String(log.details || '').toLowerCase();

        const matches =
          action.includes(q) ||
          admin.includes(q) ||
          target.includes(q) ||
          reason.includes(q) ||
          detailsStr.includes(q);

        if (!matches) return false;
      }

      return true;
    });
  }, [auditLogs, categoryFilter, dateFilter, customDate, searchQuery]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, dateFilter, customDate]);

  // Paginated logs
  const totalAuditItems = filteredLogs.length;
  const totalAuditPages = Math.max(1, Math.ceil(totalAuditItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalAuditPages);

  const paginatedLogs = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, validCurrentPage, pageSize]);

  // Paginated leads
  const totalLeads = leads.length;
  const totalLeadsPages = Math.max(1, Math.ceil(totalLeads / leadsPageSize));
  const validLeadsPage = Math.min(leadsPage, totalLeadsPages);

  const paginatedLeads = useMemo(() => {
    const start = (validLeadsPage - 1) * leadsPageSize;
    return leads.slice(start, start + leadsPageSize);
  }, [leads, validLeadsPage, leadsPageSize]);

  const hasActiveFilters = searchQuery.trim() !== '' || categoryFilter !== 'all' || dateFilter !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setDateFilter('all');
    setCustomDate('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-5 max-w-full overflow-hidden">
      {/* 1. Compact Summary Cards (WhatsApp Leads & Audit Events) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Card 1: WhatsApp Leads */}
        <button
          type="button"
          onClick={() => setActiveSubTab('leads')}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
            activeSubTab === 'leads'
              ? 'bg-gradient-to-br from-emerald-950/80 to-zinc-900 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
              : 'bg-zinc-900/80 hover:bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Leads</span>
            </span>
            {activeSubTab === 'leads' && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            )}
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              {leads.length}
            </span>
            <span className="text-[10px] sm:text-xs text-zinc-400 hidden xs:inline">
              Captured Customers
            </span>
          </div>
        </button>

        {/* Card 2: Audit Events */}
        <button
          type="button"
          onClick={() => setActiveSubTab('audit')}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
            activeSubTab === 'audit'
              ? 'bg-gradient-to-br from-amber-950/80 to-zinc-900 border-amber-500 shadow-md ring-2 ring-amber-500/20'
              : 'bg-zinc-900/80 hover:bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Audit Events</span>
            </span>
            {activeSubTab === 'audit' && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            )}
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              {auditLogs.length}
            </span>
            <span className="text-[10px] sm:text-xs text-zinc-400 hidden xs:inline">
              Security Trail Records
            </span>
          </div>
        </button>
      </div>

      {/* 2. SUB-VIEW A: AUDIT LOGS TRAIL */}
      {activeSubTab === 'audit' && (
        <div className="space-y-4">
          {/* Header & Filter Controls Section */}
          <div className="bg-white rounded-2xl border border-[#EADBCA] p-3.5 sm:p-5 shadow-2xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0E6D2] pb-3">
              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#2C1810] flex items-center space-x-2">
                  <span>Security & Admin Audit Trail</span>
                  <span className="text-xs font-mono font-normal text-[#7A5840] bg-[#FAF6EE] px-2 py-0.5 rounded-full border border-[#DFC7A2]">
                    {filteredLogs.length} of {auditLogs.length}
                  </span>
                </h3>
                <p className="text-xs text-[#5C4535] mt-0.5">
                  Immutable event records for login, order status changes, inventory updates, and Razorpay webhooks.
                </p>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="self-start sm:self-auto text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-xl flex items-center space-x-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audit logs (action, order ID, admin username, details)..."
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#FAF6EE] border border-[#DFC7A2] rounded-xl text-neutral-900 placeholder:text-neutral-500 focus:outline-hidden focus:border-[#993300] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Pills / Dropdowns Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
              {/* Category Filter Pills */}
              <div className="flex items-center space-x-1 bg-[#FAF6EE] p-1 rounded-xl border border-[#DFC7A2]">
                <button
                  type="button"
                  onClick={() => setCategoryFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    categoryFilter === 'all'
                      ? 'bg-white text-[#993300] shadow-2xs font-extrabold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('admin')}
                  className={`px-2 py-1 rounded-lg font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                    categoryFilter === 'admin'
                      ? 'bg-amber-100 text-amber-900 shadow-2xs font-extrabold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <span>🔐</span>
                  <span>Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('webhook')}
                  className={`px-2 py-1 rounded-lg font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                    categoryFilter === 'webhook'
                      ? 'bg-emerald-100 text-emerald-900 shadow-2xs font-extrabold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <span>💳</span>
                  <span>Webhook</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('system')}
                  className={`px-2 py-1 rounded-lg font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                    categoryFilter === 'system'
                      ? 'bg-blue-100 text-blue-900 shadow-2xs font-extrabold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <span>🛒</span>
                  <span>System</span>
                </button>
              </div>

              {/* Date Filter Dropdown */}
              <div className="relative inline-flex items-center">
                <div className="relative">
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                    className="appearance-none pl-7 pr-7 py-1.5 bg-[#FAF6EE] border border-[#DFC7A2] rounded-xl text-neutral-800 font-bold text-xs focus:outline-hidden focus:border-[#993300] cursor-pointer"
                  >
                    <option value="all">📅 All Time</option>
                    <option value="today">📅 Today</option>
                    <option value="yesterday">📅 Yesterday</option>
                    <option value="7days">📅 Last 7 Days</option>
                    <option value="custom">📅 Custom Date...</option>
                  </select>
                  <Calendar className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Custom Date Input (shows if custom selected) */}
              {dateFilter === 'custom' && (
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="px-2.5 py-1 bg-[#FAF6EE] border border-[#DFC7A2] rounded-xl text-neutral-800 font-mono text-xs focus:outline-hidden focus:border-[#993300]"
                />
              )}
            </div>
          </div>

          {/* 3. AUDIT LOGS DISPLAY */}
          {filteredLogs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#EADBCA] p-8 text-center space-y-2">
              <ShieldCheck className="w-8 h-8 text-neutral-400 mx-auto" />
              <p className="text-sm font-bold text-neutral-800">No audit logs match the selected filter</p>
              <p className="text-xs text-neutral-500">
                Try clearing search terms or changing the date filter.
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-2 text-xs font-bold text-amber-800 underline cursor-pointer"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* MOBILE VIEW: Responsive Card Layout (< md breakpoint) */}
              <div className="block md:hidden space-y-3">
                {paginatedLogs.map((log) => {
                  const cat = getAuditCategory(log);
                  const actionFormatted = formatAuditAction(log.action, log.action_type);
                  const detailsFormatted = formatAuditDetails(log);
                  const formattedTime = formatAuditTime(log.timestamp);

                  return (
                    <div
                      key={log.id}
                      className="bg-white rounded-2xl border border-[#EADBCA] p-3.5 sm:p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-2.5 max-w-full overflow-hidden"
                    >
                      {/* Card Header: Category Badge + Target ID */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${cat.badgeClass}`}
                        >
                          <span>{cat.emoji}</span>
                          <span>{cat.label}</span>
                        </span>

                        {log.target_id && (
                          <span className="text-[10px] font-mono text-neutral-500 bg-[#FAF6EE] px-1.5 py-0.5 rounded border border-[#F0E6D2] truncate max-w-[130px]">
                            {log.target_id}
                          </span>
                        )}
                      </div>

                      {/* Card Body: Action and Details */}
                      <div>
                        <h4 className="font-serif font-bold text-sm text-neutral-900 leading-snug break-words">
                          {actionFormatted}
                        </h4>
                        <p className="text-xs text-neutral-700 mt-1 leading-relaxed break-words font-normal">
                          {detailsFormatted}
                        </p>
                      </div>

                      {/* Card Footer: Timestamp */}
                      <div className="pt-2 border-t border-[#F5EDE1] flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-neutral-400" />
                          <span>{formattedTime}</span>
                        </div>
                        <span className="text-[10px] text-neutral-400">
                          {log.admin_username !== 'admin' && log.admin_username !== 'system' && log.admin_username !== 'webhook'
                            ? `by ${log.admin_username}`
                            : ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DESKTOP/TABLET VIEW: Structured Table Layout (>= md breakpoint) */}
              <div className="hidden md:block bg-white rounded-2xl border border-[#EADBCA] shadow-2xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF6EE] border-b border-[#F0E6D2] text-neutral-600 uppercase font-semibold">
                    <tr>
                      <th className="p-3.5 w-32">Source</th>
                      <th className="p-3.5 w-48">Action</th>
                      <th className="p-3.5">Details / Reason</th>
                      <th className="p-3.5 w-44 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0E6D2]">
                    {paginatedLogs.map((log) => {
                      const cat = getAuditCategory(log);
                      const actionFormatted = formatAuditAction(log.action, log.action_type);
                      const detailsFormatted = formatAuditDetails(log);
                      const formattedTime = formatAuditTime(log.timestamp);

                      return (
                        <tr key={log.id} className="hover:bg-[#FAF6EE]/50 transition-colors">
                          <td className="p-3.5 align-top">
                            <span
                              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase ${cat.badgeClass}`}
                            >
                              <span>{cat.emoji}</span>
                              <span>{cat.label}</span>
                            </span>
                          </td>
                          <td className="p-3.5 font-bold text-neutral-900 align-top">
                            <div className="font-serif">{actionFormatted}</div>
                            {log.target_id && (
                              <div className="text-[10px] font-mono text-neutral-400 mt-0.5 truncate max-w-[170px]">
                                ID: {log.target_id}
                              </div>
                            )}
                          </td>
                          <td className="p-3.5 text-neutral-700 leading-relaxed align-top">
                            {detailsFormatted}
                          </td>
                          <td className="p-3.5 text-neutral-500 font-mono text-[11px] text-right whitespace-nowrap align-top">
                            {formattedTime}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION CONTROLS */}
              {totalAuditPages > 1 && (
                <div className="bg-white rounded-2xl border border-[#EADBCA] p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                  <div className="text-xs text-neutral-600">
                    Showing <span className="font-bold text-neutral-900">{(validCurrentPage - 1) * pageSize + 1}</span> to{' '}
                    <span className="font-bold text-neutral-900">
                      {Math.min(validCurrentPage * pageSize, totalAuditItems)}
                    </span>{' '}
                    of <span className="font-bold text-neutral-900">{totalAuditItems}</span> events
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      disabled={validCurrentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl border border-[#DFC7A2] bg-[#FAF6EE] text-neutral-800 hover:bg-[#F3EAD8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Prev</span>
                    </button>

                    {/* Page Numbers Indicator */}
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalAuditPages) }, (_, idx) => {
                        let pageNum = idx + 1;
                        if (totalAuditPages > 5 && validCurrentPage > 3) {
                          pageNum = validCurrentPage - 3 + idx;
                          if (pageNum > totalAuditPages) {
                            pageNum = totalAuditPages - (4 - idx);
                          }
                        }
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                              validCurrentPage === pageNum
                                ? 'bg-amber-600 text-white shadow-2xs'
                                : 'bg-[#FAF6EE] text-neutral-700 hover:bg-[#F3EAD8] border border-[#DFC7A2]'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      disabled={validCurrentPage >= totalAuditPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalAuditPages, p + 1))}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl border border-[#DFC7A2] bg-[#FAF6EE] text-neutral-800 hover:bg-[#F3EAD8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 4. SUB-VIEW B: WHATSAPP LEAD CAPTURES */}
      {activeSubTab === 'leads' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#EADBCA] p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#2C1810] flex items-center space-x-2">
                <span>WhatsApp Lead Captures</span>
                <span className="text-xs font-mono font-normal text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  {leads.length} Leads
                </span>
              </h3>
              <p className="text-xs text-[#5C4535] mt-0.5">
                Prospective customers captured from website floaters, spice inquiries, and cart checkout questions.
              </p>
            </div>
          </div>

          {leads.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#EADBCA] p-8 text-center space-y-2">
              <MessageCircle className="w-8 h-8 text-neutral-400 mx-auto" />
              <p className="text-sm font-bold text-neutral-800">No WhatsApp leads captured yet</p>
              <p className="text-xs text-neutral-500">
                Inquiries from website visitors and checkout will automatically show here.
              </p>
            </div>
          ) : (
            <>
              {/* MOBILE VIEW: Responsive Cards for Leads (< sm breakpoint) */}
              <div className="block sm:hidden space-y-3">
                {paginatedLeads.map((l, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-[#EADBCA] p-4 shadow-2xs flex flex-col space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-sm text-[#2C1810]">
                        +91 {l.phone}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FAF6EE] text-[#7A5840] border border-[#DFC7A2]">
                        {l.source || 'Direct'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#F5EDE1]">
                      <span className="text-[11px] text-neutral-500 font-mono">
                        {formatAuditTime(l.created_at)}
                      </span>
                      <a
                        href={`https://wa.me/91${(l.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                          'Namaskara! Indima Spice Co. is here to assist with pure traditional spices. How can we help you?'
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1 transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Chat</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP/TABLET VIEW: Table (>= sm breakpoint) */}
              <div className="hidden sm:block bg-white rounded-2xl border border-[#EADBCA] shadow-2xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF6EE] border-b border-[#F0E6D2] text-neutral-600 uppercase font-semibold">
                    <tr>
                      <th className="p-3.5">Customer Phone</th>
                      <th className="p-3.5">Source Channel</th>
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0E6D2]">
                    {paginatedLeads.map((l, i) => (
                      <tr key={i} className="hover:bg-[#FAF6EE]/50 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-neutral-900 text-sm">
                          +91 {l.phone}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-md bg-[#FAF6EE] text-[#7A5840] border border-[#DFC7A2] font-semibold text-[11px]">
                            {l.source || 'Website'}
                          </span>
                        </td>
                        <td className="p-3.5 text-neutral-500 font-mono text-[11px]">
                          {formatAuditTime(l.created_at)}
                        </td>
                        <td className="p-3.5 text-right">
                          <a
                            href={`https://wa.me/91${(l.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                              'Namaskara! Indima Spice Co. is here to assist with pure traditional spices. How can we help you?'
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs transition-colors cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>WhatsApp</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* LEADS PAGINATION */}
              {totalLeadsPages > 1 && (
                <div className="bg-white rounded-2xl border border-[#EADBCA] p-3 sm:p-4 flex items-center justify-between shadow-2xs">
                  <div className="text-xs text-neutral-600">
                    Showing {(validLeadsPage - 1) * leadsPageSize + 1} to{' '}
                    {Math.min(validLeadsPage * leadsPageSize, totalLeads)} of {totalLeads} leads
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      disabled={validLeadsPage <= 1}
                      onClick={() => setLeadsPage((p) => Math.max(1, p - 1))}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg border border-[#DFC7A2] bg-[#FAF6EE] text-neutral-800 hover:bg-[#F3EAD8] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Prev
                    </button>
                    <span className="text-xs font-bold font-mono px-2">
                      {validLeadsPage} / {totalLeadsPages}
                    </span>
                    <button
                      type="button"
                      disabled={validLeadsPage >= totalLeadsPages}
                      onClick={() => setLeadsPage((p) => Math.min(totalLeadsPages, p + 1))}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg border border-[#DFC7A2] bg-[#FAF6EE] text-neutral-800 hover:bg-[#F3EAD8] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
