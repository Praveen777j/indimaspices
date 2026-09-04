import React, { useState, useEffect } from 'react';
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
  Settings as SettingsIcon,
  FileText,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Search,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Eye,
  MessageCircle,
  Clock,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  Video,
  Film,
  Play,
  X,
  Star,
  Layers,
  Link as LinkIcon,
  Check,
  ArrowLeft,
  ArrowRight,
  Download,
  Printer
} from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { api } from '../../services/api';
import { HeroBannerManager } from './components/HeroBannerManager';
import { AdminSecuritySettings } from './components/AdminSecuritySettings';
import { AdminPaymentsTab } from './components/AdminPaymentsTab';
import { AdminReportsTab } from './components/AdminReportsTab';
import {
  downloadReceiptFile,
  printReceiptDirectly,
  getAdminWhatsAppUrl,
  getCustomerWhatsAppUrl
} from '../../utils/receiptGenerator';
import {
  Product,
  Category,
  Order,
  Customer,
  Recipe,
  Banner,
  Offer,
  BusinessSettings,
  AdminAuditLog,
  Lead,
  OrderStatus,
  AdminStats
} from '../../types';

interface AdminDashboardProps {
  onBackToStore: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToStore }) => {
  const { token, logout, adminUser } = useAdminAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'products'
    | 'inventory'
    | 'orders'
    | 'customers'
    | 'payments'
    | 'banners'
    | 'recipes'
    | 'offers'
    | 'reports'
    | 'settings'
    | 'audit_logs'
  >('overview');

  // Master States
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // Modals & Editing state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);

  // In-app deletion confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'product' | 'recipe' | 'offer' | 'category' | 'banner' | 'customer' | 'order';
    id: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Address edit state
  const [addressEditReason, setAddressEditReason] = useState('');
  const [modifiedAddress, setModifiedAddress] = useState<any>(null);

  // Status update state
  const [newOrderStatus, setNewOrderStatus] = useState<OrderStatus>('placed');
  const [newTrackingNumber, setNewTrackingNumber] = useState('');
  const [newExpectedDelivery, setNewExpectedDelivery] = useState('');

  // Uploading status
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [videoUploadError, setVideoUploadError] = useState('');

  // Search queries
  const [orderSearch, setOrderSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');

  const loadAllData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        api.getAdminStats(token),
        api.getProducts({ activeOnly: false }),
        api.getCategories(),
        api.getAdminOrders(token),
        api.getAdminCustomers(token),
        api.getBanners(),
        api.getRecipes(),
        api.getOffers(),
        api.getAdminSettings(token),
        api.getAuditLogs(token),
        api.getLeads(token)
      ]);

      const [
        statsRes,
        prodsRes,
        catsRes,
        ordsRes,
        custsRes,
        bansRes,
        recsRes,
        offsRes,
        setsRes,
        logsRes,
        leadsRes
      ] = results;

      if (statsRes.status === 'fulfilled' && statsRes.value && !(statsRes.value as any).error) {
        setStats(statsRes.value);
      }
      if (prodsRes.status === 'fulfilled' && Array.isArray(prodsRes.value)) {
        setProducts(prodsRes.value);
      }
      if (catsRes.status === 'fulfilled' && Array.isArray(catsRes.value)) {
        setCategories(catsRes.value);
      }
      if (ordsRes.status === 'fulfilled' && Array.isArray(ordsRes.value)) {
        setOrders(ordsRes.value);
      }
      if (custsRes.status === 'fulfilled' && Array.isArray(custsRes.value)) {
        setCustomers(custsRes.value);
      }
      if (bansRes.status === 'fulfilled' && Array.isArray(bansRes.value)) {
        setBanners(bansRes.value);
      }
      if (recsRes.status === 'fulfilled' && Array.isArray(recsRes.value)) {
        setRecipes(recsRes.value);
      }
      if (offsRes.status === 'fulfilled' && Array.isArray(offsRes.value)) {
        setOffers(offsRes.value);
      }
      if (setsRes.status === 'fulfilled' && setsRes.value && (setsRes.value as any).business_name) {
        setSettings(setsRes.value);
      }
      if (logsRes.status === 'fulfilled' && Array.isArray(logsRes.value)) {
        setAuditLogs(logsRes.value);
      }
      if (leadsRes.status === 'fulfilled' && Array.isArray(leadsRes.value)) {
        setLeads(leadsRes.value);
      }
    } catch (e) {
      console.error('Error fetching admin data', e);
    } finally {
      setLoading(false);
    }
  };

  const activeStats: AdminStats = stats || {
    totalSales: (orders || []).filter(o => o.payment_status === 'Successful' || o.payment_status === 'PAID').reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0),
    totalOrders: (orders || []).length,
    totalCustomers: (customers || []).length,
    lowStockProducts: (products || []).filter(p => p.stock <= (p.low_stock_threshold || 10)),
    ordersByStatus: {
      placed: (orders || []).filter(o => o.status === 'placed' || o.order_status === 'placed' || o.order_status === 'Order Placed').length,
      processing: (orders || []).filter(o => o.status === 'processing' || o.order_status === 'processing' || o.order_status === 'Processing').length,
      packed: (orders || []).filter(o => o.status === 'packed' || o.order_status === 'packed' || o.order_status === 'Packed').length,
      shipped: (orders || []).filter(o => o.status === 'shipped' || o.order_status === 'shipped' || o.order_status === 'Shipped').length,
      delivered: (orders || []).filter(o => o.status === 'delivered' || o.order_status === 'delivered' || o.order_status === 'Delivered').length,
      cancelled: (orders || []).filter(o => o.status === 'cancelled' || o.order_status === 'cancelled' || o.order_status === 'Cancelled').length
    },
    recentOrders: (orders || []).slice(0, 8),
    recentCustomers: (customers || []).slice(0, 6)
  };

  const displayedCustomers: Customer[] = (customers && customers.length > 0)
    ? customers
    : (() => {
        const customerMap = new Map<string, Customer>();
        (orders || []).forEach(o => {
          const phone = o.customer_phone || 'N/A';
          if (!customerMap.has(phone)) {
            customerMap.set(phone, {
              id: o.customer_id || 'cust-' + phone,
              phone,
              name: o.customer_name || 'Customer',
              email: o.customer_email || '',
              total_orders: 1,
              orders_count: 1,
              total_spent: Number(o.total_amount) || 0,
              saved_address: o.address_snapshot,
              created_at: o.created_at
            });
          } else {
            const existing = customerMap.get(phone)!;
            const updatedTotal = (existing.total_orders || 1) + 1;
            existing.total_orders = updatedTotal;
            existing.orders_count = updatedTotal;
            existing.total_spent = (existing.total_spent || 0) + (Number(o.total_amount) || 0);
          }
        });
        return Array.from(customerMap.values());
      })();

  useEffect(() => {
    loadAllData();
  }, [token]);

  const showSuccess = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  // Handle Single Media Upload
  const handleFileUpload = async (file: File): Promise<string | null> => {
    if (!token) return null;
    setIsUploading(true);
    try {
      const res = await api.uploadMedia(token, file);
      if (res.success && res.url) {
        return res.url;
      }
      return null;
    } catch (e) {
      console.error(e);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Multi-Image Upload for Products
  const handleMultiImageUpload = async (files: FileList | null) => {
    if (!files || !token || !editingProduct || files.length === 0) return;
    setIsUploading(true);
    try {
      const res = await api.uploadMultipleMedia(token, files);
      if (res && res.success && Array.isArray(res.urls) && res.urls.length > 0) {
        const currentImages = Array.isArray(editingProduct.images) ? editingProduct.images.filter(Boolean) : [];
        const updatedImages = [...currentImages, ...res.urls];
        setEditingProduct({
          ...editingProduct,
          images: updatedImages,
          image_url: updatedImages[0] || editingProduct.image_url || '/indima-logo.svg'
        });
        showSuccess(`${res.urls.length} photo(s) uploaded successfully`);
      } else {
        showSuccess(res.error || 'Failed to upload photo(s). Please try again.');
      }
    } catch (e: any) {
      console.error('Multi image upload error', e);
      showSuccess('Error uploading photos: ' + (e?.message || 'Unknown error'));
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Video Upload for Products
  const handleVideoUpload = async (file: File | null) => {
    if (!file || !token || !editingProduct) return;
    setIsUploadingVideo(true);
    setVideoUploadError('');
    try {
      const res = await api.uploadMedia(token, file);
      if (res && res.success && res.url) {
        setEditingProduct(prev => prev ? {
          ...prev,
          video: res.url
        } : prev);
        showSuccess('Product video uploaded successfully');
      } else {
        setVideoUploadError(res?.error || 'Video upload failed. Please verify format and size.');
      }
    } catch (e: any) {
      console.error('Video upload error', e);
      setVideoUploadError('Video upload failed: ' + (e?.message || 'Check connection.'));
    } finally {
      setIsUploadingVideo(false);
    }
  };

  // Order Status Update (Optimistic)
  const handleUpdateOrderStatus = async (orderId: string) => {
    if (!token) return;
    const order = orders.find(o => o.id === orderId);
    const isConfirming = newOrderStatus === 'confirmed' || newOrderStatus === 'processing' || newOrderStatus === 'packed' || newOrderStatus === 'shipped';
    const paymentStatus = isConfirming && order?.payment_status !== 'Successful' ? 'Successful' : undefined;

    // Optimistically update order in state immediately
    setOrders(prev => prev.map(o => o.id === orderId ? {
      ...o,
      status: newOrderStatus.toLowerCase().includes('deliv') ? 'delivered' : newOrderStatus.toLowerCase().includes('ship') ? 'shipped' : newOrderStatus.toLowerCase().includes('pack') ? 'packed' : newOrderStatus.toLowerCase().includes('process') ? 'confirmed' : o.status,
      order_status: newOrderStatus,
      tracking_number: newTrackingNumber || o.tracking_number,
      expected_delivery: newExpectedDelivery || o.expected_delivery,
      payment_status: paymentStatus || o.payment_status,
      updated_at: new Date().toISOString()
    } : o));

    setIsOrderModalOpen(false);
    showSuccess('Order status updated');

    try {
      await api.updateOrderStatus(token, orderId, {
        status: newOrderStatus,
        tracking_number: newTrackingNumber || undefined,
        expected_delivery: newExpectedDelivery || undefined,
        payment_status: paymentStatus
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Order Address Emergency Modification (Optimistic)
  const handleUpdateOrderAddress = async (orderId: string) => {
    if (!token || !addressEditReason.trim() || !modifiedAddress) return;
    
    // Optimistically update
    setOrders(prev => prev.map(o => o.id === orderId ? {
      ...o,
      address_snapshot: modifiedAddress,
      customer_address: `${modifiedAddress.street}, ${modifiedAddress.city}, ${modifiedAddress.state} - ${modifiedAddress.pincode}`,
      updated_at: new Date().toISOString()
    } : o));

    setIsOrderModalOpen(false);
    setAddressEditReason('');
    showSuccess('Address updated');

    try {
      await api.updateOrderAddress(token, orderId, {
        address: modifiedAddress,
        reason: addressEditReason.trim()
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Retry WhatsApp notification
  const handleRetryNotification = async (orderId: string) => {
    if (!token) return;
    showSuccess('Sending WhatsApp notification...');
    try {
      const res = await api.retryNotification(token, orderId);
      if (res.success) {
        showSuccess('WhatsApp notification triggered to admin & customer');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Product Save (Optimistic & Blazing Fast)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingProduct) return;
    
    setIsSavingProduct(true);
    try {
      const isEdit = Boolean(editingProduct.id && products.some(p => p.id === editingProduct.id));
      const validImages = Array.isArray(editingProduct.images)
        ? editingProduct.images.filter(Boolean)
        : [];
      
      const primaryImage = validImages.length > 0
        ? validImages[0]
        : (editingProduct.image_url || '/indima-logo.svg');

      const productId = editingProduct.id || ('prod-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6));

      const cleanedProduct: Product = {
        ...editingProduct,
        id: productId,
        mrp: Number(editingProduct.mrp) || 0,
        price: Number(editingProduct.price) || 0,
        discount_percentage: Number(editingProduct.discount_percentage) || 0,
        stock: Number(editingProduct.stock) >= 0 ? Number(editingProduct.stock) : 0,
        low_stock_threshold: Number(editingProduct.low_stock_threshold) || 10,
        images: validImages.length > 0 ? validImages : [primaryImage],
        image_url: primaryImage,
        active: editingProduct.active !== false,
        video: (editingProduct.video || '').trim(),
        updated_at: new Date().toISOString(),
        created_at: editingProduct.created_at || new Date().toISOString()
      };

      // 1. Instantly update UI state without waiting for network roundtrip
      if (isEdit) {
        setProducts(prev => prev.map(p => p.id === cleanedProduct.id ? cleanedProduct : p));
      } else {
        setProducts(prev => [cleanedProduct, ...prev]);
      }

      // 2. Instantly close modal and notify user
      setIsProductModalOpen(false);
      setEditingProduct(null);
      showSuccess(isEdit ? 'Product updated successfully' : 'Product created successfully');

      // 3. Persist to server in background
      api.saveProduct(token, cleanedProduct, isEdit).then(res => {
        if (res && res.product) {
          // Sync with authoritative server payload (e.g., ID or timestamp)
          setProducts(prev => prev.map(p => p.id === cleanedProduct.id || p.id === res.product.id ? res.product : p));
        }
      }).catch(err => {
        console.warn('[Product Save Background Notice]:', err);
      });

    } catch (e: any) {
      console.error('Error saving product', e);
      showSuccess('Error saving product: ' + (e?.message || 'Network error'));
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Product Delete Trigger
  const handleDeleteProduct = (id: string, title = 'Spice') => {
    setDeleteTarget({ type: 'product', id, title });
  };

  // In-app Delete Execution (Optimistic & Instant)
  const handleConfirmDelete = async () => {
    if (!token || !deleteTarget) return;
    const target = { ...deleteTarget };
    setIsDeleting(true);

    // 1. Optimistically remove item from UI immediately
    if (target.type === 'product') {
      setProducts(prev => prev.filter(p => p.id !== target.id));
      showSuccess('Product deleted successfully');
    } else if (target.type === 'category') {
      setCategories(prev => prev.filter(c => c.id !== target.id));
      showSuccess('Category deleted successfully');
    } else if (target.type === 'recipe') {
      setRecipes(prev => prev.filter(r => r.id !== target.id));
      showSuccess('Recipe deleted successfully');
    } else if (target.type === 'offer') {
      setOffers(prev => prev.filter(o => o.id !== target.id));
      showSuccess('Offer deleted successfully');
    } else if (target.type === 'banner') {
      setBanners(prev => prev.filter(b => b.id !== target.id));
      showSuccess('Banner deleted successfully');
    } else if (target.type === 'customer') {
      setCustomers(prev => prev.filter(c => c.id !== target.id));
      showSuccess('Customer deleted successfully');
    } else if (target.type === 'order') {
      setOrders(prev => prev.filter(o => o.id !== target.id));
      showSuccess('Order deleted successfully');
    }

    // 2. Instantly close confirmation modal
    setDeleteTarget(null);
    setIsDeleting(false);

    // 3. Perform backend deletion in background
    try {
      if (target.type === 'product') {
        await api.deleteProduct(token, target.id);
      } else if (target.type === 'category') {
        await api.deleteCategory(token, target.id);
      } else if (target.type === 'recipe') {
        await api.deleteRecipe(token, target.id);
      } else if (target.type === 'offer') {
        await api.deleteOffer(token, target.id);
      } else if (target.type === 'banner') {
        await api.deleteBanner(token, target.id);
      } else if (target.type === 'customer') {
        await api.deleteCustomer(token, target.id);
      } else if (target.type === 'order') {
        await api.deleteOrder(token, target.id);
      }
    } catch (e: any) {
      console.warn('[Delete Background Notice]:', e);
    }
  };

  // Inventory Quick Update (Optimistic)
  const handleUpdateStock = async (id: string, newStock: number, threshold?: number) => {
    if (!token) return;
    const currentProd = products.find(p => p.id === id);
    const targetThreshold = threshold !== undefined ? threshold : (currentProd?.low_stock_threshold ?? 5);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock, low_stock_threshold: targetThreshold } : p));
    showSuccess('Inventory updated');
    try {
      await api.updateInventory(token, id, newStock, targetThreshold);
    } catch (e) {
      console.error(e);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !settings) return;
    showSuccess('Saving settings...');
    try {
      const res = await api.updateSettings(token, settings);
      if (res.success || res.settings) {
        showSuccess('Settings saved successfully');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save Recipe (Optimistic)
  const handleSaveRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingRecipe) return;
    const isEdit = recipes.some(r => r.id === editingRecipe.id);
    const targetRecipe = { ...editingRecipe, id: editingRecipe.id || ('rec-' + Date.now()) };
    
    if (isEdit) {
      setRecipes(prev => prev.map(r => r.id === targetRecipe.id ? targetRecipe : r));
    } else {
      setRecipes(prev => [targetRecipe, ...prev]);
    }
    setIsRecipeModalOpen(false);
    setEditingRecipe(null);
    showSuccess('Recipe saved');

    try {
      await api.saveRecipe(token, targetRecipe, isEdit);
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Recipe Trigger
  const handleDeleteRecipe = (id: string, title = 'Recipe') => {
    setDeleteTarget({ type: 'recipe', id, title });
  };

  // Save Offer (Optimistic)
  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingOffer) return;
    const isEdit = offers.some(o => o.id === editingOffer.id);
    const targetOffer = { ...editingOffer, id: editingOffer.id || ('off-' + Date.now()) };

    if (isEdit) {
      setOffers(prev => prev.map(o => o.id === targetOffer.id ? targetOffer : o));
    } else {
      setOffers(prev => [targetOffer, ...prev]);
    }
    setIsOfferModalOpen(false);
    setEditingOffer(null);
    showSuccess('Offer saved');

    try {
      await api.saveOffer(token, targetOffer, isEdit);
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Offer Trigger
  const handleDeleteOffer = (id: string, title = 'Offer') => {
    setDeleteTarget({ type: 'offer', id, title });
  };

  // Save Banner (Optimistic)
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingBanner) return;
    const isEdit = banners.some(b => b.id === editingBanner.id);
    const targetBanner = { ...editingBanner, id: editingBanner.id || ('ban-' + Date.now()) };

    if (isEdit) {
      setBanners(prev => prev.map(b => b.id === targetBanner.id ? targetBanner : b));
    } else {
      setBanners(prev => [targetBanner, ...prev]);
    }
    setIsBannerModalOpen(false);
    setEditingBanner(null);
    showSuccess('Banner updated');

    try {
      await api.saveBanner(token, targetBanner, isEdit);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans">
      {/* Top Admin Navigation Bar */}
      <header className="bg-zinc-950 text-white sticky top-0 z-30 border-b border-zinc-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={settings?.logo_url || '/indima-logo.svg'}
              alt={settings?.business_name || 'Indima Logo'}
              className="h-10 w-auto max-w-[120px] object-contain rounded-xl p-0.5 bg-white border border-zinc-700 shadow-xs"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('indima-logo.svg')) {
                  target.src = '/indima-logo.svg';
                }
              }}
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif text-lg font-bold text-white">
                  {settings?.business_name || 'Indima Spice Co.'}
                </span>
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Admin Portal
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-light">
                Logged in as <span className="font-semibold text-zinc-200">{adminUser?.name || 'Administrator'}</span> ({adminUser?.role})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadAllData}
              title="Refresh Data"
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onBackToStore}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-amber-400 hover:text-white flex items-center space-x-1 transition-colors cursor-pointer"
            >
              <span>View Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-800/60 hover:bg-red-900/60 text-xs font-bold text-red-300 flex items-center space-x-1 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Action Notification Pill */}
      {actionSuccess && (
        <div className="fixed top-16 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold flex items-center space-x-2 animate-in fade-in border border-emerald-400/30">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Admin Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col md:flex-row gap-6 w-full">
        {/* Sidebar Navigation - Responsive Horizontal Strip on Mobile, Sidebar on Desktop */}
        <aside className="w-full md:w-60 shrink-0">
          <nav className="bg-zinc-900/90 backdrop-blur-md rounded-2xl md:rounded-3xl border border-zinc-800 p-2 md:p-3 flex md:flex-col overflow-x-auto md:overflow-visible gap-1.5 md:space-y-1 shadow-md sticky top-16 md:top-20 z-20 scrollbar-none">
            <button
              onClick={() => setActiveTab('overview')}
              className={`shrink-0 md:w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`shrink-0 md:w-full flex items-center justify-between space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 shrink-0" />
                <span>Orders</span>
              </div>
              {orders.filter(o => o.status === 'placed' || o.status === 'confirmed').length > 0 && (
                <span className="bg-amber-500 text-black text-[10px] px-1.5 py-0.2 rounded-full font-black ml-1.5">
                  {orders.filter(o => o.status === 'placed' || o.status === 'confirmed').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`shrink-0 md:w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'products'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4 shrink-0" />
              <span>Products & Spices</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`shrink-0 md:w-full flex items-center justify-between space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'inventory'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Boxes className="w-4 h-4 shrink-0" />
                <span>Inventory Control</span>
              </div>
              {products.filter(p => p.stock <= p.low_stock_threshold).length > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black ml-1.5">
                  {products.filter(p => p.stock <= p.low_stock_threshold).length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`shrink-0 md:w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'customers'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Customers</span>
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`shrink-0 md:w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'payments'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              <span>UPI Payments</span>
            </button>

            <button
              onClick={() => setActiveTab('banners')}
              className={`shrink-0 md:w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'banners'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4 shrink-0" />
              <span>Banners & Posters</span>
            </button>

            <button
              onClick={() => setActiveTab('recipes')}
              className={`shrink-0 md:w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'recipes'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
              }`}
            >
              <ChefHat className="w-4 h-4 shrink-0" />
              <span>Recipes</span>
            </button>

            <button
              onClick={() => setActiveTab('offers')}
              className={`shrink-0 md:w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'offers'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
              }`}
            >
              <Tag className="w-4 h-4 shrink-0" />
              <span>Offers & Coupons</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`shrink-0 md:w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'reports'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span>Reports & Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`shrink-0 md:w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
              }`}
            >
              <SettingsIcon className="w-4 h-4 shrink-0" />
              <span>Business & Security</span>
            </button>

            <button
              onClick={() => setActiveTab('audit_logs')}
              className={`shrink-0 md:w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'audit_logs'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>Audit Logs & Leads</span>
            </button>
          </nav>
        </aside>

        {/* Tab Body View */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-[#EADBCA] shadow-2xs">
                  <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
                    <span>Total Sales Revenue</span>
                    <CreditCard className="w-4 h-4 text-[#993300]" />
                  </div>
                  <p className="text-2xl font-black text-neutral-900 mt-2 font-mono">
                    ₹{(activeStats?.totalSales || 0).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                    ↑ 100% UPI Confirmed
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#EADBCA] shadow-2xs">
                  <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
                    <span>Total Orders Placed</span>
                    <Truck className="w-4 h-4 text-[#993300]" />
                  </div>
                  <p className="text-2xl font-black text-neutral-900 mt-2 font-mono">
                    {activeStats?.totalOrders || orders.length}
                  </p>
                  <p className="text-[11px] text-neutral-500 font-semibold mt-1">
                    Pan-India Shipping
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#EADBCA] shadow-2xs">
                  <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
                    <span>Active Customers</span>
                    <Users className="w-4 h-4 text-[#993300]" />
                  </div>
                  <p className="text-2xl font-black text-neutral-900 mt-2 font-mono">
                    {activeStats?.totalCustomers || displayedCustomers.length}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                    Returning buyer engine active
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#EADBCA] shadow-2xs">
                  <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
                    <span>Low Stock Alerts</span>
                    <Boxes className="w-4 h-4 text-red-600" />
                  </div>
                  <p className="text-2xl font-black text-red-600 mt-2 font-mono">
                    {activeStats?.lowStockProducts?.length || products.filter(p => p.stock <= (p.low_stock_threshold || 10)).length}
                  </p>
                  <p className="text-[11px] text-neutral-500 font-semibold mt-1">
                    Items needing replenishment
                  </p>
                </div>
              </div>

              {/* Pipeline Breakdown */}
              <div className="bg-white p-5 rounded-2xl border border-[#EADBCA] shadow-2xs space-y-3">
                <h3 className="font-serif text-sm font-bold text-neutral-900 uppercase tracking-wider">
                  Order Pipeline Status
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center text-xs">
                  {Object.entries(activeStats?.ordersByStatus || {}).map(([st, count]) => (
                    <div key={st} className="p-3 bg-[#FAF6EE] rounded-xl border border-[#EADBCA]">
                      <p className="text-neutral-500 font-semibold uppercase text-[10px]">
                        {st.replace(/_/g, ' ')}
                      </p>
                      <p className="text-lg font-black text-[#993300] mt-1 font-mono">
                        {count as number}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders Snapshot */}
              <div className="bg-white rounded-2xl border border-[#EADBCA] shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-[#F0E6D2] flex items-center justify-between bg-[#FAF6EE]">
                  <h3 className="font-serif text-sm font-bold text-neutral-900">
                    Recent Pan-India Orders
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-[#993300] font-bold hover:underline cursor-pointer"
                  >
                    View All Orders →
                  </button>
                </div>
                <div className="divide-y divide-[#F0E6D2] overflow-x-auto">
                  {(orders || []).slice(0, 5).map(ord => (
                    <div key={ord.id} className="p-3.5 flex items-center justify-between text-xs min-w-[500px]">
                      <div>
                        <p className="font-mono font-bold text-neutral-900">{ord.id}</p>
                        <p className="text-neutral-500 text-[11px]">
                          {ord.customer_name} (+91 {ord.customer_phone}) • {ord.address_snapshot?.city || 'Bengaluru'}, {ord.address_snapshot?.state || 'Karnataka'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#993300]">₹{ord.total_amount}</p>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-sm bg-[#993300]/10 text-[#993300]">
                          {ord.status || ord.order_status || 'placed'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#EADBCA] shadow-2xs">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    placeholder="Search spices by name, SKU..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF6EE] border border-[#D9C4A2] rounded-lg text-neutral-900 placeholder:text-neutral-500 font-medium focus:outline-hidden focus:border-[#993300]"
                  />
                </div>

                <button
                  onClick={() => {
                    setEditingProduct({
                      id: 'indima-' + Date.now(),
                      category_id: categories[0]?.id || 'cat-blends',
                      name_en: '',
                      name_kn: '',
                      description_en: '',
                      description_kn: '',
                      price: 150,
                      mrp: 180,
                      discount_percentage: 16,
                      weight: '250g',
                      stock: 50,
                      low_stock_threshold: 10,
                      images: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80'],
                      rating: 5.0,
                      review_count: 0,
                      ingredients_en: '',
                      ingredients_kn: '',
                      shelf_life: '12 Months',
                      storage_en: 'Store in airtight container',
                      storage_kn: 'ಗಾಳಿಯಾಡದ ಡಬ್ಬದಲ್ಲಿ ಇರಿಸಿ',
                      traditional_info_en: 'Stone-ground heritage Karnataka method',
                      traditional_info_kn: 'ಸಾಂಪ್ರದಾಯಿಕ ಕಲ್ಲಿನ ಬೀಸುವ ವಿಧಾನ',
                      sku: 'IND-SP-' + Math.floor(100 + Math.random() * 900),
                      badges: ['homemade', 'natural'],
                      video: '',
                      active: true
                    });
                    setIsProductModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#993300] hover:bg-[#802B00] text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Spice</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-2xl border border-[#EADBCA] shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF6EE] border-b border-[#F0E6D2] text-neutral-600 uppercase font-semibold">
                      <tr>
                        <th className="p-3">Spice Item</th>
                        <th className="p-3">Weight</th>
                        <th className="p-3">Price / MRP</th>
                        <th className="p-3">Stock</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0E6D2]">
                      {(products || [])
                        .filter(p =>
                          (p.name_en || '').toLowerCase().includes(productSearch.toLowerCase()) ||
                          (p.name_kn || '').toLowerCase().includes(productSearch.toLowerCase()) ||
                          (p.sku || '').toLowerCase().includes(productSearch.toLowerCase())
                        )
                        .map(prod => (
                          <tr key={prod.id} className="hover:bg-[#FAF6EE]/50 transition-colors">
                            <td className="p-3 flex items-center space-x-3">
                              <img
                                src={(prod.images && prod.images[0]) || '/indima-logo.svg'}
                                alt={prod.name_en}
                                className="w-12 h-12 rounded-lg object-cover border border-amber-100 bg-amber-50"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  if (!target.src.includes('indima-logo.svg')) {
                                    target.src = '/indima-logo.svg';
                                  }
                                }}
                              />
                              <div>
                                <p className="font-bold text-neutral-900 flex items-center gap-1.5">
                                  <span>{prod.name_en}</span>
                                  {prod.video && (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-semibold" title="Video showcase attached">
                                      <Video className="w-2.5 h-2.5 text-[#993300]" />
                                      <span>Video</span>
                                    </span>
                                  )}
                                </p>
                                <p className="text-neutral-500 font-serif">{prod.name_kn}</p>
                                <span className="font-mono text-[10px] text-neutral-400">SKU: {prod.sku}</span>
                              </div>
                            </td>
                            <td className="p-3 font-semibold text-neutral-700">{prod.weight}</td>
                            <td className="p-3">
                              <span className="font-bold text-[#993300]">₹{prod.price}</span>
                              <span className="text-neutral-400 line-through ml-1.5 text-[11px]">₹{prod.mrp}</span>
                            </td>
                            <td className="p-3">
                              {prod.stock <= 0 ? (
                                <span className="font-bold text-[11px] px-2.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-200 inline-flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
                                  <span>Out of Stock (0)</span>
                                </span>
                              ) : prod.stock <= (prod.low_stock_threshold ?? 5) ? (
                                <span className="font-bold text-[11px] px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                                  <span>Low: {prod.stock} left</span>
                                </span>
                              ) : (
                                <span className="font-bold text-[11px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                  <span>{prod.stock} in stock</span>
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase ${
                                  prod.active ? 'bg-green-100 text-green-800' : 'bg-neutral-200 text-neutral-600'
                                }`}
                              >
                                {prod.active ? 'Active' : 'Hidden'}
                              </span>
                            </td>
                            <td className="p-3 text-right space-x-1">
                              <button
                                onClick={() => {
                                  setEditingProduct(prod);
                                  setIsProductModalOpen(true);
                                }}
                                className="p-1.5 hover:bg-neutral-100 text-neutral-600 rounded-lg cursor-pointer"
                                title="Edit Spice"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id, prod.name_en)}
                                className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg cursor-pointer"
                                title="Delete Spice"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-2xl border border-[#EADBCA] shadow-2xs">
                <h3 className="font-serif text-sm font-bold text-neutral-900 uppercase tracking-wider mb-2">
                  Live Stock Management & Alert Thresholds
                </h3>
                <p className="text-xs text-neutral-600">
                  Update inventory levels in real-time. Quantities automatically decrease upon customer order placements and lock when depleted.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-[#EADBCA] shadow-2xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF6EE] border-b border-[#F0E6D2] text-neutral-600 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Current Stock</th>
                      <th className="p-3">Alert Threshold</th>
                      <th className="p-3">Quick Restock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0E6D2]">
                    {(products || []).map(prod => {
                      const threshold = typeof prod.low_stock_threshold === 'number' ? prod.low_stock_threshold : 5;
                      const isOutOfStock = prod.stock <= 0;
                      const isLow = !isOutOfStock && prod.stock <= threshold;

                      return (
                        <tr key={prod.id} className="hover:bg-[#FAF6EE]/50">
                          <td className="p-3 flex items-center space-x-3">
                            <img
                              src={(prod.images && prod.images[0]) || '/indima-logo.svg'}
                              alt={prod.name_en}
                              className="w-10 h-10 rounded-lg object-cover border border-amber-100"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (!target.src.includes('indima-logo.svg')) {
                                  target.src = '/indima-logo.svg';
                                }
                              }}
                            />
                            <div>
                              <p className="font-bold text-neutral-900">{prod.name_en}</p>
                              <p className="text-neutral-500 text-[11px]">{prod.weight} • {prod.sku}</p>
                            </div>
                          </td>
                          <td className="p-3">
                            {isOutOfStock ? (
                              <span className="font-bold text-[11px] px-2.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-200 inline-flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
                                <span>Out of Stock</span>
                              </span>
                            ) : isLow ? (
                              <span className="font-bold text-[11px] px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                                <span>Low Stock</span>
                              </span>
                            ) : (
                              <span className="font-bold text-[11px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>In Stock</span>
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min={0}
                                value={prod.stock}
                                onChange={e => {
                                  const val = Math.max(0, Number(e.target.value));
                                  setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, stock: val } : p));
                                }}
                                onBlur={e => handleUpdateStock(prod.id, Math.max(0, Number(e.target.value)), threshold)}
                                className="w-20 px-3 py-1.5 bg-white border-2 border-[#D9C4A2] hover:border-[#993300] focus:border-[#993300] focus:ring-2 focus:ring-[#993300]/20 rounded-lg font-black font-mono text-neutral-900 text-sm shadow-2xs transition-all"
                              />
                              <span className="text-[11px] text-neutral-500 font-medium">units</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min={0}
                                value={threshold}
                                onChange={e => {
                                  const val = Math.max(0, Number(e.target.value));
                                  setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, low_stock_threshold: val } : p));
                                }}
                                onBlur={e => handleUpdateStock(prod.id, prod.stock, Math.max(0, Number(e.target.value)))}
                                className="w-20 px-3 py-1.5 bg-white border-2 border-[#D9C4A2] hover:border-[#993300] focus:border-[#993300] focus:ring-2 focus:ring-[#993300]/20 rounded-lg font-black font-mono text-neutral-900 text-sm shadow-2xs transition-all"
                              />
                              <span className="text-[11px] text-neutral-500 font-medium">units</span>
                            </div>
                          </td>
                          <td className="p-3 space-x-1.5">
                            <button
                              onClick={() => handleUpdateStock(prod.id, prod.stock + 25, threshold)}
                              className="px-2.5 py-1 bg-[#FAF6EE] hover:bg-[#EADBCA] border border-[#D9C4A2] rounded-lg font-bold text-[#993300] cursor-pointer text-xs"
                            >
                              +25
                            </button>
                            <button
                              onClick={() => handleUpdateStock(prod.id, prod.stock + 50, threshold)}
                              className="px-2.5 py-1 bg-[#FAF6EE] hover:bg-[#EADBCA] border border-[#D9C4A2] rounded-lg font-bold text-[#993300] cursor-pointer text-xs"
                            >
                              +50
                            </button>
                            <button
                              onClick={() => handleUpdateStock(prod.id, prod.stock + 100, threshold)}
                              className="px-2.5 py-1 bg-[#FAF6EE] hover:bg-[#EADBCA] border border-[#D9C4A2] rounded-lg font-bold text-[#993300] cursor-pointer text-xs"
                            >
                              +100
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#EADBCA] shadow-2xs">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={e => setOrderSearch(e.target.value)}
                    placeholder="Search by Order ID, Phone, Customer, State..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF6EE] border border-[#D9C4A2] rounded-lg text-neutral-900 placeholder:text-neutral-500 font-medium focus:outline-hidden focus:border-[#993300]"
                  />
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-2xl border border-[#EADBCA] shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF6EE] border-b border-[#F0E6D2] text-neutral-600 uppercase font-semibold">
                      <tr>
                        <th className="p-3">Order ID & Date</th>
                        <th className="p-3">Customer & Mobile</th>
                        <th className="p-3">Destination (Pan-India)</th>
                        <th className="p-3">Amount & UPI</th>
                        <th className="p-3">Status & AWB</th>
                        <th className="p-3 text-right">Manage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0E6D2]">
                      {(orders || [])
                        .filter(
                          o =>
                            o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
                            o.customer_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
                            o.customer_phone.includes(orderSearch) ||
                            o.address_snapshot.state.toLowerCase().includes(orderSearch.toLowerCase()) ||
                            o.address_snapshot.city.toLowerCase().includes(orderSearch.toLowerCase())
                        )
                        .map(ord => (
                          <tr key={ord.id} className="hover:bg-[#FAF6EE]/50 transition-colors">
                            <td className="p-3">
                              <p className="font-mono font-bold text-neutral-900">{ord.id}</p>
                              <p className="text-[11px] text-neutral-500">
                                {new Date(ord.created_at).toLocaleString()}
                              </p>
                            </td>
                            <td className="p-3">
                              <p className="font-bold text-neutral-900">{ord.customer_name}</p>
                              <p className="text-[11px] text-neutral-600">+91 {ord.customer_phone}</p>
                              <p className="text-[10px] text-neutral-400">{ord.customer_email}</p>
                            </td>
                            <td className="p-3">
                              <p className="font-semibold text-neutral-800">
                                {ord.address_snapshot.city}, {ord.address_snapshot.state}
                              </p>
                              <p className="text-[11px] text-neutral-500 font-mono">
                                PIN: {ord.address_snapshot.pincode}
                              </p>
                            </td>
                            <td className="p-3">
                              <p className="font-bold text-[#993300] text-sm">₹{ord.total_amount}</p>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full uppercase">
                                {ord.payment_status}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-sm bg-[#993300] text-white">
                                {ord.status}
                              </span>
                              {ord.tracking_number && (
                                <p className="font-mono text-[10px] text-neutral-600 mt-1">
                                  AWB: {ord.tracking_number}
                                </p>
                              )}
                            </td>
                            <td className="p-3 text-right space-x-1">
                              <button
                                onClick={() => {
                                  setEditingOrder(ord);
                                  setNewOrderStatus(ord.status);
                                  setNewTrackingNumber(ord.tracking_number || '');
                                  setNewExpectedDelivery(ord.expected_delivery || '');
                                  setModifiedAddress({ ...ord.address_snapshot });
                                  setIsOrderModalOpen(true);
                                }}
                                className="px-3 py-1.5 bg-[#FAF6EE] hover:bg-[#EADBCA] text-[#993300] font-bold text-xs rounded-lg border border-[#D9C4A2] cursor-pointer"
                              >
                                Manage
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="bg-white rounded-2xl border border-[#EADBCA] shadow-2xs overflow-hidden">
              <div className="p-4 bg-[#FAF6EE] border-b border-[#F0E6D2] flex items-center justify-between">
                <h3 className="font-serif text-sm font-bold text-neutral-900">
                  Customer Directory ({displayedCustomers.length} Profiles)
                </h3>
                <span className="text-xs text-neutral-500 font-semibold">
                  Verified Contact & Order History
                </span>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF6EE] border-b border-[#F0E6D2] text-neutral-600 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Customer Name</th>
                    <th className="p-3">Phone / Email</th>
                    <th className="p-3">Total Orders</th>
                    <th className="p-3">Total Spent</th>
                    <th className="p-3">Primary Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E6D2]">
                  {displayedCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-neutral-500">
                        No customer profiles recorded yet.
                      </td>
                    </tr>
                  ) : (
                    displayedCustomers.map(cust => (
                      <tr key={cust.phone || cust.id} className="hover:bg-[#FAF6EE]/50">
                        <td className="p-3 font-bold text-neutral-900">{cust.name}</td>
                        <td className="p-3">
                          <p className="font-mono">+91 {cust.phone}</p>
                          <p className="text-neutral-500 text-[11px]">{cust.email || 'No email specified'}</p>
                        </td>
                        <td className="p-3 font-semibold font-mono">{cust.total_orders ?? cust.orders_count ?? 1} orders</td>
                        <td className="p-3 font-bold text-[#993300] font-mono">₹{cust.total_spent || 0}</td>
                        <td className="p-3 text-neutral-700">
                          {cust.saved_address ? `${cust.saved_address.city}, ${cust.saved_address.state} (${cust.saved_address.pincode})` : 'Bengaluru, Karnataka'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 6: PAYMENTS */}
          {activeTab === 'payments' && (
            <AdminPaymentsTab
              token={token}
              orders={orders}
              onOrderUpdated={(updated) => {
                setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
              }}
              onShowSuccess={(msg) => showSuccess(msg)}
            />
          )}

          {/* TAB 7: BANNERS & STOREFRONT MEDIA */}
          {activeTab === 'banners' && (
            <HeroBannerManager
              token={token}
              banners={banners}
              heroBanner={banners.find(b => b.type === 'hero') || banners[0]}
              onBannerSaved={(updatedBanner) => {
                setBanners(prev => {
                  const exists = prev.some(b => b.id === updatedBanner.id);
                  if (exists) {
                    return prev.map(b => b.id === updatedBanner.id ? updatedBanner : b);
                  }
                  return [updatedBanner, ...prev];
                });
              }}
              onBannerUpdated={(updatedBanner) => {
                setBanners(prev => {
                  const exists = prev.some(b => b.id === updatedBanner.id);
                  if (exists) {
                    return prev.map(b => b.id === updatedBanner.id ? updatedBanner : b);
                  }
                  return [updatedBanner, ...prev];
                });
              }}
              onShowSuccess={(msg) => showSuccess(msg)}
            />
          )}

          {/* TAB 8: RECIPES */}
          {activeTab === 'recipes' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-[#EADBCA] shadow-2xs">
                <h3 className="font-serif text-sm font-bold text-neutral-900 uppercase tracking-wider">
                  Karnataka Traditional Recipes
                </h3>
                <button
                  onClick={() => {
                    setEditingRecipe({
                      id: 'rec-' + Date.now(),
                      title_en: '',
                      title_kn: '',
                      description_en: '',
                      description_kn: '',
                      prep_time: '25 Mins',
                      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
                      ingredients_en: ['Indima Sambar Powder', 'Toor Dal', 'Vegetables'],
                      ingredients_kn: ['ಇಂದಿಮಾ ಸಾಂಬಾರ್ ಪುಡಿ', 'ತೊಗರಿ ಬೇಳೆ', 'ತರಕಾರಿಗಳು'],
                      instructions_en: ['Boil dal', 'Add spices', 'Simmer and serve'],
                      instructions_kn: ['ಬೇಳೆ ಬೇಯಿಸಿ', 'ಮಸಾಲೆ ಪುಡಿ ಸೇರಿಸಿ', 'ಕುದಿಸಿ ಬಡಿಸಿ'],
                      related_product_ids: [products[0]?.id || '']
                    });
                    setIsRecipeModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#993300] hover:bg-[#802B00] text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Recipe</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(recipes || []).map(rec => (
                  <div key={rec.id} className="p-4 bg-white rounded-2xl border border-[#EADBCA] shadow-2xs flex space-x-4">
                    <img src={rec.image} alt={rec.title_en} className="w-24 h-24 rounded-xl object-cover border" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-neutral-900">{rec.title_en}</h4>
                        <p className="text-xs text-neutral-500 font-serif">{rec.title_kn}</p>
                        <p className="text-[11px] text-neutral-400 mt-1">Prep: {rec.prep_time}</p>
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <button
                          onClick={() => {
                            setEditingRecipe(rec);
                            setIsRecipeModalOpen(true);
                          }}
                          className="p-1.5 bg-[#FAF6EE] text-[#993300] rounded-lg text-xs font-bold border border-[#D9C4A2] cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecipe(rec.id, rec.title_en)}
                          className="p-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: OFFERS */}
          {activeTab === 'offers' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-[#EADBCA] shadow-2xs">
                <h3 className="font-serif text-sm font-bold text-neutral-900 uppercase tracking-wider">
                  Festival Offers & Discount Coupons
                </h3>
                <button
                  onClick={() => {
                    setEditingOffer({
                      id: 'off-' + Date.now(),
                      code: 'FESTIVE' + Math.floor(10 + Math.random() * 90),
                      title_en: 'Festival Special Discount',
                      title_kn: 'ಹಬ್ಬದ ವಿಶೇಷ ರಿಯಾಯಿತಿ',
                      description_en: 'Flat 15% off on pure spice orders',
                      description_kn: 'ಶುದ್ಧ ಮಸಾಲೆಗಳ ಖರೀದಿಗೆ 15% ರಿಯಾಯಿತಿ',
                      discount_type: 'percentage',
                      discount_value: 15,
                      min_order_amount: 500,
                      active: true
                    });
                    setIsOfferModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#993300] hover:bg-[#802B00] text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Offer</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(offers || []).map(off => (
                  <div key={off.id} className="p-4 bg-white rounded-2xl border-2 border-dashed border-[#D9C4A2] space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-black text-sm text-[#993300] bg-[#FAF6EE] px-2 py-0.5 rounded border">
                        {off.code}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {off.discount_type === 'percentage' ? `${off.discount_value}%` : `₹${off.discount_value}`} OFF
                      </span>
                    </div>
                    <p className="font-bold text-xs text-neutral-900">{off.title_en}</p>
                    <p className="text-[11px] text-neutral-500">Min Order: ₹{off.min_order_amount}</p>
                    <div className="pt-2 flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setEditingOffer(off);
                          setIsOfferModalOpen(true);
                        }}
                        className="p-1.5 text-neutral-600 hover:text-[#993300] cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteOffer(off.id, off.title_en || off.code)}
                        className="p-1.5 text-neutral-600 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: REPORTS & ANALYTICS */}
          {activeTab === 'reports' && (
            <AdminReportsTab
              orders={orders}
              products={products}
              customers={customers}
            />
          )}

          {/* TAB 10: SETTINGS */}
          {activeTab === 'settings' && settings && (
            <div className="space-y-6">
              <AdminSecuritySettings
                token={token}
                settings={settings}
                onSettingsUpdated={(updated) => setSettings(updated)}
                onShowSuccess={(msg) => setActionSuccess(msg)}
              />
            </div>
          )}

          {/* TAB 11: AUDIT LOGS & LEADS */}
          {activeTab === 'audit_logs' && (
            <div className="space-y-6">
              {/* WhatsApp Leads */}
              <div className="bg-white rounded-2xl border border-[#EADBCA] shadow-2xs overflow-hidden">
                <div className="p-4 bg-[#FAF6EE] border-b border-[#F0E6D2]">
                  <h3 className="font-serif text-sm font-bold text-neutral-900">
                    WhatsApp Lead Captures ({leads?.length || 0})
                  </h3>
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF6EE] border-b border-[#F0E6D2] text-neutral-600 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Source</th>
                      <th className="p-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0E6D2]">
                    {(leads || []).map((l, i) => (
                      <tr key={i} className="hover:bg-[#FAF6EE]/50">
                        <td className="p-3 font-mono font-bold">+91 {l.phone}</td>
                        <td className="p-3">{l.source}</td>
                        <td className="p-3 text-neutral-500">{new Date(l.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Audit Logs */}
              <div className="bg-white rounded-2xl border border-[#EADBCA] shadow-2xs overflow-hidden">
                <div className="p-4 bg-[#FAF6EE] border-b border-[#F0E6D2]">
                  <h3 className="font-serif text-sm font-bold text-neutral-900">
                    Security & Admin Audit Trail ({auditLogs?.length || 0})
                  </h3>
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF6EE] border-b border-[#F0E6D2] text-neutral-600 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Admin</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Details / Reason</th>
                      <th className="p-3">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0E6D2]">
                    {(auditLogs || []).map(log => (
                      <tr key={log.id} className="hover:bg-[#FAF6EE]/50">
                        <td className="p-3 font-bold text-neutral-900">{log.admin_username}</td>
                        <td className="p-3 font-mono text-[11px] text-[#993300]">{log.action}</td>
                        <td className="p-3 text-neutral-700">
                          {log.details?.reason || JSON.stringify(log.details)}
                        </td>
                        <td className="p-3 text-neutral-500">{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: EDIT PRODUCT */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#FFFDF9] rounded-3xl max-w-3xl w-full p-4 sm:p-6 space-y-4 sm:space-y-5 border border-[#DFC7A2] max-h-[90vh] overflow-y-auto shadow-2xl text-neutral-900">
            {/* Header with Title and Active Toggle */}
            <div className="flex flex-wrap items-center justify-between border-b border-[#F0E6D2] pb-3 sm:pb-4 gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 rounded-lg bg-amber-100 text-[#993300]">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-neutral-900">
                    {editingProduct.name_en ? `Edit: ${editingProduct.name_en}` : 'Add New Heritage Spice'}
                  </h3>
                </div>
                <p className="text-xs text-neutral-600 mt-0.5">
                  Configure multi-angle photo gallery, promotional video, pricing, and ingredients.
                </p>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-3">
                <label className="flex items-center space-x-2 text-xs font-bold text-neutral-900 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-[#DFC7A2] hover:border-[#993300] shadow-2xs transition-colors">
                  <input
                    type="checkbox"
                    checked={editingProduct.active !== false}
                    onChange={e => setEditingProduct({ ...editingProduct, active: e.target.checked })}
                    className="w-4 h-4 accent-[#993300] text-[#993300] rounded focus:ring-0 cursor-pointer"
                  />
                  <span className="text-neutral-900 font-bold">Active in Store</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-5 text-xs">
              {/* Category & Badge Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF6EE] p-4 rounded-2xl border border-[#EADBCA]">
                <div>
                  <label className="block font-semibold text-neutral-800 mb-1">
                    Spice Category *
                  </label>
                  <select
                    value={editingProduct.category_id}
                    onChange={e => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D9C4A2] rounded-xl font-medium text-neutral-900"
                    required
                  >
                    {(categories || []).map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name_en} ({cat.name_kn})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-800 mb-1.5">
                    Product Badges
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'bestseller', label: 'Bestseller' },
                      { id: 'homemade', label: 'Homemade' },
                      { id: 'natural', label: '100% Natural' },
                      { id: 'festival_special', label: 'Festival Special' },
                      { id: 'single_origin', label: 'Single Origin' }
                    ].map(badge => {
                      const isSelected = (editingProduct.badges || []).includes(badge.id);
                      return (
                        <button
                          key={badge.id}
                          type="button"
                          onClick={() => {
                            const current = editingProduct.badges || [];
                            const updated = isSelected
                              ? current.filter(b => b !== badge.id)
                              : [...current, badge.id];
                            setEditingProduct({ ...editingProduct, badges: updated });
                          }}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#993300] text-white border-[#993300]'
                              : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400'
                          }`}
                        >
                          {isSelected && '✓ '}
                          {badge.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Names: English & Kannada */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-800 mb-1">Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name_en}
                    onChange={e => setEditingProduct({ ...editingProduct, name_en: e.target.value })}
                    placeholder="e.g. Traditional Mysore Rasam Powder"
                    className="w-full px-3 py-2 bg-white border border-[#D9C4A2] rounded-xl text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-800 mb-1">Name (Kannada) *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name_kn}
                    onChange={e => setEditingProduct({ ...editingProduct, name_kn: e.target.value })}
                    placeholder="ಉದಾಹರಣೆಗೆ: ಸಾಂಪ್ರದಾಯಿಕ ಮೈಸೂರು ರಸಂ ಪುಡಿ"
                    className="w-full px-3 py-2 bg-white border border-[#D9C4A2] rounded-xl font-serif text-neutral-900"
                  />
                </div>
              </div>

              {/* Pricing, Weight & Stock Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF6EE]/70 p-4 rounded-2xl border border-[#EADBCA]">
                <div>
                  <label className="block font-semibold text-neutral-800 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editingProduct.price}
                    onChange={e => {
                      const newPrice = Number(e.target.value);
                      const discount = editingProduct.mrp > newPrice
                        ? Math.round(((editingProduct.mrp - newPrice) / editingProduct.mrp) * 100)
                        : 0;
                      setEditingProduct({
                        ...editingProduct,
                        price: newPrice,
                        discount_percentage: discount
                      });
                    }}
                    className="w-full px-3 py-2 bg-white border border-[#D9C4A2] rounded-xl font-bold text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-800 mb-1">MRP Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editingProduct.mrp}
                    onChange={e => {
                      const newMrp = Number(e.target.value);
                      const discount = newMrp > editingProduct.price
                        ? Math.round(((newMrp - editingProduct.price) / newMrp) * 100)
                        : 0;
                      setEditingProduct({
                        ...editingProduct,
                        mrp: newMrp,
                        discount_percentage: discount
                      });
                    }}
                    className="w-full px-3 py-2 bg-white border border-[#D9C4A2] rounded-xl text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-800 mb-1">Net Weight *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.weight}
                    onChange={e => setEditingProduct({ ...editingProduct, weight: e.target.value })}
                    placeholder="250g, 500g, 1kg"
                    className="w-full px-3 py-2 bg-white border border-[#D9C4A2] rounded-xl text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-800 mb-1">SKU Identifier</label>
                  <input
                    type="text"
                    value={editingProduct.sku}
                    onChange={e => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D9C4A2] rounded-xl font-mono text-neutral-900"
                  />
                </div>

                <div className="pt-2">
                  <label className="block font-semibold text-neutral-800 mb-1">Available Stock *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editingProduct.stock}
                    onChange={e => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#D9C4A2] rounded-xl font-bold text-neutral-900"
                  />
                </div>
                <div className="pt-2">
                  <label className="block font-semibold text-neutral-800 mb-1">Low Stock Alert</label>
                  <input
                    type="number"
                    value={editingProduct.low_stock_threshold || 10}
                    onChange={e => setEditingProduct({ ...editingProduct, low_stock_threshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#D9C4A2] rounded-xl text-neutral-900"
                  />
                </div>
                <div className="col-span-2 pt-2 flex items-center justify-end">
                  <div className="text-right">
                    <span className="text-neutral-500 text-[11px] block">Customer Savings:</span>
                    <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block">
                      {editingProduct.discount_percentage || 0}% Discount (Save ₹{Math.max(0, editingProduct.mrp - editingProduct.price)})
                    </span>
                  </div>
                </div>
              </div>

              {/* MULTI-IMAGE GALLERY MANAGER */}
              <div className="p-4 bg-white rounded-2xl border border-[#EADBCA] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4 text-[#993300]" />
                    <h4 className="font-serif text-sm font-bold text-neutral-900">
                      Product Images Gallery ({editingProduct.images?.length || 0})
                    </h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    {Array.isArray(editingProduct.images) && editingProduct.images.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct({
                            ...editingProduct,
                            images: [],
                            image_url: ''
                          });
                          showSuccess('All product photos cleared. You can upload new photos or save.');
                        }}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-[11px] font-bold rounded-lg border border-red-700 shadow-xs cursor-pointer flex items-center space-x-1 transition-all"
                        title="Remove all photos to start fresh with your own uploads"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                        <span>Clear All Photos</span>
                      </button>
                    )}
                    <span className="text-[11px] text-neutral-500 hidden sm:inline">
                      First image is primary display card photo
                    </span>
                  </div>
                </div>

                {/* Upload Buttons and URL Adder */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 flex space-x-2">
                    <input
                      type="text"
                      placeholder="Paste Image URL..."
                      value={newImageUrl}
                      onChange={e => setNewImageUrl(e.target.value)}
                      className="flex-1 px-3 py-2 bg-[#FAF6EE] border border-[#D9C4A2] rounded-xl text-xs text-neutral-900"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newImageUrl.trim()) {
                          const current = editingProduct.images || [];
                          setEditingProduct({
                            ...editingProduct,
                            images: [...current, newImageUrl.trim()]
                          });
                          setNewImageUrl('');
                          showSuccess('Image added');
                        }
                      }}
                      className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-900 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center space-x-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add URL</span>
                    </button>
                  </div>

                  <label className="px-4 py-2 bg-[#993300] hover:bg-[#802B00] text-white font-bold rounded-xl cursor-pointer flex items-center justify-center space-x-1.5 text-xs transition-colors shrink-0 shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Uploading...' : 'Upload Multi-Images'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,.heic,.heif,.jpg,.jpeg,.png,.webp,.svg"
                      className="hidden"
                      disabled={isUploading}
                      onChange={e => handleMultiImageUpload(e.target.files)}
                    />
                  </label>
                </div>

                {/* Thumbnail Preview Grid with Always-Visible Mobile Actions */}
                {Array.isArray(editingProduct.images) && editingProduct.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
                    {editingProduct.images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className={`relative rounded-xl overflow-hidden border-2 bg-neutral-100 flex flex-col justify-between shadow-2xs ${
                          idx === 0 ? 'border-[#993300] ring-2 ring-[#993300]/20' : 'border-[#EADBCA]'
                        }`}
                      >
                        {/* Image Preview */}
                        <div className="relative aspect-square w-full bg-neutral-50 overflow-hidden">
                          <img
                            src={imgUrl}
                            alt={`Product media ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (target.src.toLowerCase().endsWith('.heic')) {
                                target.src = target.src.replace(/\.heic$/i, '.jpg');
                              } else if (!target.src.includes('indima-logo.svg')) {
                                target.src = '/indima-logo.svg';
                              }
                            }}
                          />

                          {/* Primary Cover Badge */}
                          {idx === 0 ? (
                            <div className="absolute top-1.5 left-1.5 bg-[#993300] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md shadow-md z-10">
                              Cover Photo
                            </div>
                          ) : (
                            <div className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md shadow-xs z-10">
                              #{idx + 1}
                            </div>
                          )}

                          {/* ALWAYS-VISIBLE DELETE BUTTON (Essential for mobile touchscreens) */}
                          <button
                            type="button"
                            title="Delete this image"
                            onClick={(e) => {
                              e.stopPropagation();
                              const imgs = editingProduct.images.filter((_, i) => i !== idx);
                              setEditingProduct({
                                ...editingProduct,
                                images: imgs,
                                image_url: imgs[0] || ''
                              });
                              showSuccess('Photo removed');
                            }}
                            className="absolute top-1.5 right-1.5 z-20 w-7 h-7 bg-red-600 hover:bg-red-700 active:scale-90 text-white rounded-full shadow-md flex items-center justify-center cursor-pointer border border-white transition-all"
                            aria-label="Delete this image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Bottom Action Bar for Mobile & Desktop */}
                        <div className="p-1.5 bg-[#FAF6EE] border-t border-[#EADBCA] flex items-center justify-between gap-1 text-[10px]">
                          {/* Reorder Left */}
                          {idx > 0 ? (
                            <button
                              type="button"
                              title="Move photo left"
                              onClick={() => {
                                const imgs = [...editingProduct.images];
                                const temp = imgs[idx - 1];
                                imgs[idx - 1] = imgs[idx];
                                imgs[idx] = temp;
                                setEditingProduct({
                                  ...editingProduct,
                                  images: imgs,
                                  image_url: imgs[0] || editingProduct.image_url
                                });
                              }}
                              className="p-1 bg-white hover:bg-neutral-200 border border-neutral-300 rounded text-neutral-800 cursor-pointer"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          ) : (
                            <div className="w-5" />
                          )}

                          {/* Set as Cover */}
                          {idx !== 0 ? (
                            <button
                              type="button"
                              title="Set as main cover photo"
                              onClick={() => {
                                const imgs = editingProduct.images.filter((_, i) => i !== idx);
                                const updated = [imgUrl, ...imgs];
                                setEditingProduct({
                                  ...editingProduct,
                                  images: updated,
                                  image_url: imgUrl
                                });
                                showSuccess('Set as main cover photo');
                              }}
                              className="px-1.5 py-0.5 bg-amber-200 hover:bg-amber-300 text-amber-900 border border-amber-400/50 rounded font-bold cursor-pointer text-[9px] shrink-0"
                            >
                              Set Cover
                            </button>
                          ) : (
                            <span className="text-[9px] text-[#993300] font-bold px-1">Primary</span>
                          )}

                          {/* Reorder Right */}
                          {idx < editingProduct.images.length - 1 ? (
                            <button
                              type="button"
                              title="Move photo right"
                              onClick={() => {
                                const imgs = [...editingProduct.images];
                                const temp = imgs[idx + 1];
                                imgs[idx + 1] = imgs[idx];
                                imgs[idx] = temp;
                                setEditingProduct({
                                  ...editingProduct,
                                  images: imgs,
                                  image_url: imgs[0] || editingProduct.image_url
                                });
                              }}
                              className="p-1 bg-white hover:bg-neutral-200 border border-neutral-300 rounded text-neutral-800 cursor-pointer"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <div className="w-5" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 text-center border-2 border-dashed border-[#D9C4A2] rounded-xl bg-[#FAF6EE]/50 text-neutral-600 space-y-1">
                    <p className="font-semibold text-xs text-[#7A1F1D]">No product photos currently attached.</p>
                    <p className="text-[11px] text-neutral-500">Upload your own product packaging photos using the button above.</p>
                  </div>
                )}
              </div>

              {/* PRODUCT VIDEO MANAGER */}
              <div className="p-4 bg-white rounded-2xl border border-[#EADBCA] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Video className="w-4 h-4 text-[#993300]" />
                    <h4 className="font-serif text-sm font-bold text-neutral-900">
                      Product Video Showcase
                    </h4>
                  </div>
                  <span className="text-[11px] text-neutral-500">
                    Supports MP4, WebM file uploads, and direct video links
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Enter Video URL (e.g. https://.../video.mp4 or YouTube link)"
                    value={editingProduct.video || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, video: e.target.value })}
                    className="flex-1 px-3 py-2 bg-[#FAF6EE] border border-[#D9C4A2] rounded-xl text-xs text-neutral-900"
                  />

                  <label className="px-4 py-2 bg-neutral-900 hover:bg-black text-amber-300 font-bold rounded-xl cursor-pointer flex items-center justify-center space-x-1.5 text-xs transition-colors shrink-0 shadow-xs">
                    <Film className="w-3.5 h-3.5" />
                    <span>{isUploadingVideo ? 'Uploading Video...' : 'Upload Video File'}</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/*"
                      className="hidden"
                      disabled={isUploadingVideo}
                      onChange={e => {
                        if (e.target.files?.[0]) {
                          handleVideoUpload(e.target.files[0]);
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>

                  {editingProduct.video && (
                    <button
                      type="button"
                      onClick={() => setEditingProduct({ ...editingProduct, video: '' })}
                      className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Remove Video
                    </button>
                  )}
                </div>

                {videoUploadError && (
                  <p className="text-xs text-red-600 font-medium">{videoUploadError}</p>
                )}

                {/* Video Live Preview */}
                {editingProduct.video && (
                  <div className="mt-3 p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-amber-300 flex items-center space-x-1">
                        <Play className="w-3 h-3 fill-amber-300" />
                        <span>Live Video Preview</span>
                      </span>
                    </div>
                    {editingProduct.video.includes('youtube.com') || editingProduct.video.includes('youtu.be') ? (
                      <div className="aspect-video w-full rounded-lg overflow-hidden">
                        <iframe
                          src={
                            editingProduct.video.includes('youtu.be/')
                              ? `https://www.youtube.com/embed/${editingProduct.video.split('youtu.be/')[1]?.split('?')[0]}`
                              : editingProduct.video.includes('watch?v=')
                              ? `https://www.youtube.com/embed/${editingProduct.video.split('watch?v=')[1]?.split('&')[0]}`
                              : editingProduct.video
                          }
                          title="Video Preview"
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <video
                        controls
                        className="w-full max-h-56 rounded-lg bg-black object-contain mx-auto"
                        src={editingProduct.video}
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                )}
              </div>

              {/* Bilingual Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-800 mb-1">
                    Product Description (English)
                  </label>
                  <textarea
                    rows={3}
                    value={editingProduct.description_en}
                    onChange={e => setEditingProduct({ ...editingProduct, description_en: e.target.value })}
                    placeholder="Highlight aroma, authenticity, Karnataka roots..."
                    className="w-full px-3 py-2 bg-white border border-[#D9C4A2] rounded-xl text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-800 mb-1">
                    Product Description (Kannada)
                  </label>
                  <textarea
                    rows={3}
                    value={editingProduct.description_kn}
                    onChange={e => setEditingProduct({ ...editingProduct, description_kn: e.target.value })}
                    placeholder="ವಿವರಣೆ..."
                    className="w-full px-3 py-2 bg-white border border-[#D9C4A2] rounded-xl font-serif text-neutral-900"
                  />
                </div>
              </div>

              {/* Ingredients & Traditional Preparation Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF6EE]/50 p-4 rounded-2xl border border-[#EADBCA]">
                <div>
                  <label className="block font-semibold text-neutral-800 mb-1">
                    Ingredients (English)
                  </label>
                  <textarea
                    rows={2}
                    value={editingProduct.ingredients_en}
                    onChange={e => setEditingProduct({ ...editingProduct, ingredients_en: e.target.value })}
                    placeholder="e.g. Byadgi Chillies, Coriander Seeds, Cumin, Mustard, Curry Leaves..."
                    className="w-full px-3 py-2 bg-white border border-[#D9C4A2] rounded-xl text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-800 mb-1">
                    Ingredients (Kannada)
                  </label>
                  <textarea
                    rows={2}
                    value={editingProduct.ingredients_kn}
                    onChange={e => setEditingProduct({ ...editingProduct, ingredients_kn: e.target.value })}
                    placeholder="ಬ್ಯಾಡಗಿ ಮೆಣಸಿನಕಾಯಿ, ಕೊತ್ತಂಬರಿ ಬೀಜ, ಜೀರಿಗೆ..."
                    className="w-full px-3 py-2 bg-white border border-[#D9C4A2] rounded-xl font-serif text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-800 mb-1">
                    Shelf Life & Storage Instructions
                  </label>
                  <input
                    type="text"
                    value={editingProduct.shelf_life || '12 Months'}
                    onChange={e => setEditingProduct({ ...editingProduct, shelf_life: e.target.value })}
                    placeholder="e.g. 12 Months from packaging"
                    className="w-full px-3 py-2 bg-white border border-[#D9C4A2] rounded-xl text-neutral-900 mb-2"
                  />
                  <input
                    type="text"
                    value={editingProduct.storage_en || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, storage_en: e.target.value })}
                    placeholder="Storage note (English)"
                    className="w-full px-3 py-2 bg-white border border-[#D9C4A2] rounded-xl text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-800 mb-1">
                    Traditional Preparation Method
                  </label>
                  <textarea
                    rows={3}
                    value={editingProduct.traditional_info_en || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, traditional_info_en: e.target.value })}
                    placeholder="Slow roasted on low wood fire and stone ground in small batches..."
                    className="w-full px-3 py-2 bg-white border border-[#D9C4A2] rounded-xl text-neutral-900"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F0E6D2]">
                <div>
                  {editingProduct.id ? (
                    <button
                      type="button"
                      onClick={() => {
                        const id = editingProduct.id;
                        const title = editingProduct.name_en || 'Product';
                        setIsProductModalOpen(false);
                        handleDeleteProduct(id, title);
                      }}
                      className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold rounded-xl cursor-pointer transition-colors flex items-center space-x-1.5 text-xs shadow-2xs"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      <span>Delete This Product</span>
                    </button>
                  ) : <div />}
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-5 py-2.5 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 font-bold rounded-xl cursor-pointer transition-colors text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProduct || isUploadingVideo}
                    className="px-6 py-2.5 bg-[#993300] hover:bg-[#802B00] disabled:bg-[#993300]/60 text-white font-bold rounded-xl cursor-pointer transition-all shadow-md active:scale-98 text-xs flex items-center space-x-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isUploadingVideo ? 'Uploading Video...' : isSavingProduct ? 'Saving Spice Product...' : 'Save Spice Product'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: MANAGE ORDER */}
      {isOrderModalOpen && editingOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#FFFDF9] rounded-2xl max-w-2xl w-full p-4 sm:p-6 space-y-4 sm:space-y-5 border border-[#DFC7A2] max-h-[90vh] overflow-y-auto text-xs text-neutral-900 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#F0E6D2] pb-3">
              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-neutral-900">
                  Manage Order: {editingOrder.id}
                </h3>
                <p className="text-neutral-600 font-medium">
                  {editingOrder.customer_name} • +91 {editingOrder.customer_phone}
                </p>
              </div>
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Download & WhatsApp Notification Banner */}
            <div className="bg-[#FAF6EE] p-3.5 rounded-xl border border-[#DFC7A2] flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#993300]">Order Receipt & Invoicing</span>
                <p className="font-mono text-xs font-bold text-neutral-900">Order ID: {editingOrder.id} • Total: ₹{editingOrder.total_amount}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => downloadReceiptFile(editingOrder, settings)}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-lg flex items-center space-x-1 cursor-pointer transition-colors"
                  title="Download HTML Receipt File"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Download Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => printReceiptDirectly(editingOrder, settings)}
                  className="px-3 py-1.5 bg-white hover:bg-neutral-50 text-neutral-800 border border-[#D9C4A2] font-bold rounded-lg flex items-center space-x-1 cursor-pointer transition-colors"
                  title="Print Order Receipt"
                >
                  <Printer className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>

            {/* Status Transition Control */}
            <div className="bg-[#FAF6EE] p-4 rounded-xl border border-[#DFC7A2] space-y-3">
              <h4 className="font-bold text-neutral-900 uppercase">Update Shipment Status</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-neutral-900 mb-1">Status</label>
                  <select
                    value={newOrderStatus}
                    onChange={e => setNewOrderStatus(e.target.value as OrderStatus)}
                    className="w-full px-3 py-2 bg-white border border-[#D9C4A2] rounded-lg text-neutral-900 font-medium"
                  >
                    <option value="placed">Order Placed</option>
                    <option value="confirmed">Payment Confirmed</option>
                    <option value="processing">In Preparation</option>
                    <option value="packed">Packed</option>
                    <option value="shipped">Shipped</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-900 mb-1">AWB Courier ID</label>
                  <input
                    type="text"
                    value={newTrackingNumber}
                    onChange={e => setNewTrackingNumber(e.target.value)}
                    placeholder="e.g. DTDC-984521"
                    className="w-full px-3 py-2 bg-white border border-[#D9C4A2] rounded-lg font-mono text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-900 mb-1">Expected Delivery Date</label>
                  <input
                    type="text"
                    value={newExpectedDelivery}
                    onChange={e => setNewExpectedDelivery(e.target.value)}
                    placeholder="e.g. 24 Oct 2025"
                    className="w-full px-3 py-2 bg-white border border-[#D9C4A2] rounded-lg text-neutral-900"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleRetryNotification(editingOrder.id)}
                    className="px-3 py-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold rounded-lg flex items-center space-x-1 cursor-pointer text-xs shadow-2xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Trigger System Alert</span>
                  </button>

                  <a
                    href={`https://wa.me/91${editingOrder.customer_phone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(
                      `Namaskara ${editingOrder.customer_name}! 🙏\nUpdate on your Indima Spice Co. Order ${editingOrder.id}:\nStatus: ${newOrderStatus.toUpperCase()}\n${newTrackingNumber ? `Courier AWB: ${newTrackingNumber}\n` : ''}${newExpectedDelivery ? `Expected Delivery: ${newExpectedDelivery}\n` : ''}Track live: ${window.location.origin}/#track\n\nThank you for choosing pure Karnataka spices! 🌿`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center space-x-1 text-xs shadow-2xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Open WhatsApp Chat</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => handleUpdateOrderStatus(editingOrder.id)}
                  className="px-4 py-1.5 bg-[#993300] hover:bg-[#802B00] text-white font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  Save Status
                </button>
              </div>
            </div>

            {/* Emergency Address Modification with Audit Trail */}
            <div className="bg-[#FAF6EE] p-4 rounded-xl border border-[#DFC7A2] space-y-3">
              <div className="flex items-center space-x-1.5 text-[#993300] font-bold uppercase">
                <ShieldCheck className="w-4 h-4" />
                <span>Emergency Address Correction & Audit Log</span>
              </div>
              <p className="text-[11px] text-neutral-600 font-medium">
                Customer delivery addresses are immutable by default. Any manual modification requires an audit reason.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Street / Flat"
                  value={modifiedAddress?.street || ''}
                  onChange={e => setModifiedAddress({ ...modifiedAddress, street: e.target.value })}
                  className="px-3 py-1.5 bg-white border border-[#D9C4A2] rounded text-neutral-900"
                />
                <input
                  type="text"
                  placeholder="PIN Code"
                  value={modifiedAddress?.pincode || ''}
                  onChange={e => setModifiedAddress({ ...modifiedAddress, pincode: e.target.value })}
                  className="px-3 py-1.5 bg-white border border-[#D9C4A2] rounded font-mono text-neutral-900"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-900 mb-1">
                  Reason for Emergency Address Change (Mandatory for Audit Trail) *
                </label>
                <input
                  type="text"
                  required
                  value={addressEditReason}
                  onChange={e => setAddressEditReason(e.target.value)}
                  placeholder="e.g. Customer called support requesting house number correction"
                  className="w-full px-3 py-2 bg-white border border-[#D9C4A2] rounded-lg text-neutral-900 placeholder:text-neutral-400"
                />
              </div>

              <button
                type="button"
                disabled={!addressEditReason.trim()}
                onClick={() => handleUpdateOrderAddress(editingOrder.id)}
                className="px-4 py-2 bg-neutral-900 hover:bg-black text-white font-bold rounded-lg disabled:opacity-40 cursor-pointer shadow-xs"
              >
                Confirm Address Correction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: RECIPE MODAL */}
      {isRecipeModalOpen && editingRecipe && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#FFFDF9] rounded-2xl max-w-lg w-full p-4 sm:p-6 space-y-4 border border-[#DFC7A2] max-h-[90vh] overflow-y-auto text-xs text-neutral-900 shadow-2xl">
            <h3 className="font-serif text-base sm:text-lg font-bold text-neutral-900">
              {editingRecipe.title_en ? `Edit Recipe: ${editingRecipe.title_en}` : 'Add Recipe'}
            </h3>
            <form onSubmit={handleSaveRecipe} className="space-y-3">
              <div>
                <label className="block font-bold text-neutral-900 mb-1">Title (English)</label>
                <input
                  type="text"
                  required
                  value={editingRecipe.title_en}
                  onChange={e => setEditingRecipe({ ...editingRecipe, title_en: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#D9C4A2] rounded-lg text-neutral-900"
                />
              </div>
              <div>
                <label className="block font-bold text-neutral-900 mb-1">Title (Kannada)</label>
                <input
                  type="text"
                  required
                  value={editingRecipe.title_kn}
                  onChange={e => setEditingRecipe({ ...editingRecipe, title_kn: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#D9C4A2] rounded-lg font-serif text-neutral-900"
                />
              </div>
              <div>
                <label className="block font-bold text-neutral-900 mb-1">Prep Time</label>
                <input
                  type="text"
                  value={editingRecipe.prep_time}
                  onChange={e => setEditingRecipe({ ...editingRecipe, prep_time: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#D9C4A2] rounded-lg text-neutral-900"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRecipeModalOpen(false)}
                  className="px-4 py-2 border border-[#D9C4A2] bg-white hover:bg-neutral-100 text-neutral-800 font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#993300] hover:bg-[#802B00] text-white font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: OFFER MODAL */}
      {isOfferModalOpen && editingOffer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#FFFDF9] rounded-2xl max-w-md w-full p-4 sm:p-6 space-y-4 border border-[#DFC7A2] max-h-[90vh] overflow-y-auto text-xs text-neutral-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F0E6D2] pb-3">
              <h3 className="font-serif text-base sm:text-lg font-bold text-neutral-900">
                Manage Coupon
              </h3>
              <label className="flex items-center space-x-2 text-xs font-bold text-neutral-900 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-[#DFC7A2] hover:border-[#993300] shadow-2xs">
                <input
                  type="checkbox"
                  checked={editingOffer.active !== false}
                  onChange={e => setEditingOffer({ ...editingOffer, active: e.target.checked })}
                  className="w-4 h-4 accent-[#993300] text-[#993300] rounded focus:ring-0 cursor-pointer"
                />
                <span className="text-neutral-900 font-bold">Active</span>
              </label>
            </div>
            <form onSubmit={handleSaveOffer} className="space-y-3">
              <div>
                <label className="block font-bold text-neutral-900 mb-1">Coupon Code (e.g. INDIMA10)</label>
                <input
                  type="text"
                  required
                  value={editingOffer.code}
                  onChange={e => setEditingOffer({ ...editingOffer, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-white border border-[#D9C4A2] rounded-lg font-mono font-bold uppercase text-neutral-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-neutral-900 mb-1">Discount Type</label>
                  <select
                    value={editingOffer.discount_type}
                    onChange={e => setEditingOffer({ ...editingOffer, discount_type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-[#D9C4A2] rounded-lg text-neutral-900"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-900 mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={editingOffer.discount_value}
                    onChange={e => setEditingOffer({ ...editingOffer, discount_value: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#D9C4A2] rounded-lg text-neutral-900"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-neutral-900 mb-1">Min Order Amount (₹)</label>
                <input
                  type="number"
                  value={editingOffer.min_order_amount}
                  onChange={e => setEditingOffer({ ...editingOffer, min_order_amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-[#D9C4A2] rounded-lg text-neutral-900"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="px-4 py-2 border border-[#D9C4A2] bg-white hover:bg-neutral-100 text-neutral-800 font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#993300] hover:bg-[#802B00] text-white font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  Save Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: BANNER MODAL */}
      {isBannerModalOpen && editingBanner && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#FFFDF9] rounded-2xl max-w-lg w-full p-4 sm:p-6 space-y-4 border border-[#DFC7A2] max-h-[90vh] overflow-y-auto text-xs text-neutral-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F0E6D2] pb-3">
              <h3 className="font-serif text-base sm:text-lg font-bold text-neutral-900">
                Edit Hero Banner & Media
              </h3>
              <label className="flex items-center space-x-2 text-xs font-bold text-neutral-900 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-[#DFC7A2] hover:border-[#993300] shadow-2xs">
                <input
                  type="checkbox"
                  checked={editingBanner.active !== false}
                  onChange={e => setEditingBanner({ ...editingBanner, active: e.target.checked })}
                  className="w-4 h-4 accent-[#993300] text-[#993300] rounded focus:ring-0 cursor-pointer"
                />
                <span className="text-neutral-900 font-bold">Active</span>
              </label>
            </div>
            <form onSubmit={handleSaveBanner} className="space-y-3">
              <div>
                <label className="block font-bold text-neutral-900 mb-1">Media Type</label>
                <select
                  value={editingBanner.media_type}
                  onChange={e => setEditingBanner({ ...editingBanner, media_type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-[#D9C4A2] rounded-lg text-neutral-900"
                >
                  <option value="image">Image Background</option>
                  <option value="video">Video Background</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-900 mb-1">Media URL / Upload from Device</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={editingBanner.media_url}
                    onChange={e => setEditingBanner({ ...editingBanner, media_url: e.target.value })}
                    className="flex-1 px-3 py-2 bg-white border border-[#D9C4A2] rounded-lg text-neutral-900"
                  />
                  <label className="px-3 py-2 bg-[#993300] hover:bg-[#802B00] text-white font-bold rounded-lg cursor-pointer flex items-center space-x-1 shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept={editingBanner.media_type === 'video' ? 'video/*' : 'image/*'}
                      className="hidden"
                      onChange={async e => {
                        if (e.target.files?.[0]) {
                          const url = await handleFileUpload(e.target.files[0]);
                          if (url) setEditingBanner({ ...editingBanner, media_url: url });
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-900 mb-1">Headline (English)</label>
                <input
                  type="text"
                  value={editingBanner.title_en}
                  onChange={e => setEditingBanner({ ...editingBanner, title_en: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#D9C4A2] rounded-lg text-neutral-900"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-900 mb-1">Headline (Kannada)</label>
                <input
                  type="text"
                  value={editingBanner.title_kn}
                  onChange={e => setEditingBanner({ ...editingBanner, title_kn: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#D9C4A2] rounded-lg font-serif text-neutral-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2 border border-[#D9C4A2] bg-white hover:bg-neutral-100 text-neutral-800 font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#993300] hover:bg-[#802B00] text-white font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-red-400">
              <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800 shrink-0">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-base text-zinc-100">
                  Delete {deleteTarget.type.charAt(0).toUpperCase() + deleteTarget.type.slice(1)}?
                </h3>
                <p className="text-xs text-zinc-400">This action cannot be reversed.</p>
              </div>
            </div>

            <p className="text-sm text-zinc-300">
              Are you sure you want to permanently delete <strong className="text-white">"{deleteTarget.title}"</strong>?
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5"
              >
                {isDeleting ? <span>Deleting...</span> : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
