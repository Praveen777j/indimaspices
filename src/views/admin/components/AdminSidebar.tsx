import React from 'react';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Truck,
  Users,
  CreditCard,
  Image as ImageIcon,
  ChefHat,
  Tag,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export type AdminTabType =
  | 'overview'
  | 'products'
  | 'orders'
  | 'customers'
  | 'inventory'
  | 'payments'
  | 'recipes'
  | 'banners'
  | 'offers'
  | 'reports'
  | 'settings';

interface AdminSidebarProps {
  activeTab: AdminTabType;
  setActiveTab: (tab: AdminTabType) => void;
  onLogout: () => void;
  onBackToStore: () => void;
  pendingOrdersCount?: number;
  lowStockCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  onLogout,
  onBackToStore,
  pendingOrdersCount = 0,
  lowStockCount = 0
}) => {
  const menuItems: {
    id: AdminTabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }[] = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    {
      id: 'orders',
      label: 'Orders',
      icon: Truck,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      badgeColor: 'bg-amber-500 text-zinc-950'
    },
    { id: 'customers', label: 'Customers', icon: Users },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Boxes,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-rose-500 text-white'
    },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'recipes', label: 'Recipes', icon: ChefHat },
    { id: 'banners', label: 'Banners', icon: ImageIcon },
    { id: 'offers', label: 'Offers', icon: Tag },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: SettingsIcon }
  ];

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800/80 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-zinc-800/70">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-zinc-950 font-black shadow-md shadow-amber-950/50">
              <Sparkles className="w-5 h-5 text-zinc-950" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-base text-zinc-100 leading-tight">
                Indima Admin
              </h1>
              <p className="text-[10px] text-amber-400 font-medium tracking-wide uppercase">
                Vedic Purity & Control
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`admin-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-950/30 font-bold'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-950' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-zinc-950 text-amber-400' : item.badgeColor || 'bg-amber-500 text-zinc-950'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls (Store Link & Logout) */}
      <div className="p-3 border-t border-zinc-800/70 space-y-1 bg-zinc-950/90">
        <button
          onClick={onBackToStore}
          id="admin-view-store-btn"
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-zinc-400 hover:text-amber-300 hover:bg-zinc-900/80 transition-colors cursor-pointer"
        >
          <span className="flex items-center space-x-2.5">
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span>View Live Store</span>
          </span>
          <span className="text-[10px] text-zinc-500">↗</span>
        </button>

        <button
          onClick={onLogout}
          id="admin-logout-btn"
          className="w-full flex items-center space-x-2.5 px-3.5 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
