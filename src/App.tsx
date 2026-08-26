import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { CartProvider, useCart } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext';

import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryBar } from './components/CategoryBar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { TrackOrderModal } from './components/TrackOrderModal';
import { RecipeSection } from './components/RecipeSection';
import { HeritageStorySection } from './components/HeritageStorySection';
import { HealthWisdomSection } from './components/HealthWisdomSection';
import { FestivalOffersSection } from './components/FestivalOffersSection';
import { AncientSpiceHistorySection } from './components/AncientSpiceHistorySection';
import { CustomerReviewsSection } from './components/CustomerReviewsSection';
import { WishlistModal } from './components/WishlistModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { LeadPopup } from './components/LeadPopup';
import { PolicyModal } from './components/PolicyModal';
import { Footer } from './components/Footer';

import { AdminLogin } from './views/admin/AdminLogin';
import { AdminDashboard } from './views/admin/AdminDashboard';

import { api } from './services/api';
import { Product, Category, Banner, Recipe, Offer, Review, BusinessSettings, Order } from './types';
import { Sparkles, SlidersHorizontal, Search, RefreshCw, ShoppingBag, ArrowRight } from 'lucide-react';

const Storefront: React.FC<{ onNavigateToAdmin: () => void }> = ({ onNavigateToAdmin }) => {
  const { language, t } = useLanguage();
  const isKn = language === 'kn';
  const { applyCoupon, setIsCartOpen, totalItems, totalAmount } = useCart();

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating'>('featured');

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [policyModalType, setPolicyModalType] = useState<'privacy' | 'terms' | 'refund' | 'shipping' | null>(null);

  // Initial Data Fetch
  const fetchData = async () => {
    setLoading(true);
    try {
      const [prods, cats, bans, recs, offs, revs, sets] = await Promise.all([
        api.getProducts({ activeOnly: true }),
        api.getCategories(),
        api.getBanners(),
        api.getRecipes(),
        api.getOffers(),
        api.getReviews(),
        api.getSettings()
      ]);

      setProducts(prods || []);
      setCategories(cats || []);
      setBanners(bans || []);
      setRecipes(recs || []);
      setOffers(offs || []);
      setReviews(revs || []);
      setSettings(sets || null);
    } catch (e) {
      console.error('Error loading storefront data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter and Sort Products
  const filteredProducts = (products || []).filter(product => {
    const matchesCategory = !selectedCategoryId || product.category_id === selectedCategoryId;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (product.name_en || '').toLowerCase().includes(query) ||
      (product.name_kn || '').toLowerCase().includes(query) ||
      (product.description_en || '').toLowerCase().includes(query) ||
      (product.description_kn || '').toLowerCase().includes(query) ||
      (product.sku || '').toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // featured default
  });

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleApplyOfferCoupon = (offer: Offer) => {
    applyCoupon(offer.code, offers);
    setIsCartOpen(true);
  };

  const handleReviewAdded = (newReview: Review) => {
    setReviews(prev => [newReview, ...(prev || [])]);
  };

  if (loading && !settings) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-[#FFFDF9] border border-[#DFC7A2] flex items-center justify-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-amber-500/10 blur-xl rounded-full" />
          <Sparkles className="w-8 h-8 text-[#993300] animate-pulse relative z-10" />
        </div>
        <p className="font-serif text-xl font-bold text-[#2C1810] tracking-wide">
          Indima Spice Co.
        </p>
        <p className="text-xs text-[#8C6D53] font-sans tracking-wider uppercase">
          {isKn ? 'ಪರಿಶುದ್ಧ ಮಸಾಲೆಗಳ ಸುವಾಸನೆ...' : 'Pure Stone-Ground Heritage Spices'}
        </p>
      </div>
    );
  }

  const fallbackSettings: BusinessSettings = settings || {
    business_name: 'Indima Spice Co.',
    tagline_en: "Pure as mother's love",
    tagline_kn: 'ತಾಯಿಯ ಪ್ರೀತಿಯಷ್ಟೇ ಪರಿಶುದ್ಧ',
    phone: '9845012345',
    whatsapp_number: '9845012345',
    email: 'hello@indimaspices.com',
    address: 'Indima Heritage Mill, Old Mysore Road, Karnataka 570001, India',
    upi_id: 'indima@okhdfcbank',
    upi_merchant_name: 'Indima Spice Co.',
    logo_url: '/indima-logo.svg',
    free_shipping_threshold: 499,
    standard_shipping_fee: 40,
    policy_privacy_en: '',
    policy_privacy_kn: '',
    policy_terms_en: '',
    policy_terms_kn: '',
    policy_refund_en: '',
    policy_refund_kn: '',
    policy_shipping_en: '',
    policy_shipping_kn: ''
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#2C1810] flex flex-col selection:bg-[#993300] selection:text-white font-sans antialiased">
      {/* Header */}
      <Header
        settings={fallbackSettings}
        products={products}
        onOpenProduct={setSelectedProduct}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        onNavigateToSection={scrollToSection}
        onNavigateToAdmin={onNavigateToAdmin}
      />

      {/* Main Storefront Body */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroBanner
          banner={(banners || []).find(b => b.active) || banners?.[0]}
          onShopClick={() => scrollToSection('products-section')}
          onOffersClick={() => scrollToSection('offers-section')}
        />

        {/* Categories Bar */}
        <CategoryBar
          categories={categories || []}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={catId => {
            setSelectedCategoryId(catId);
            scrollToSection('products-section');
          }}
        />

        {/* Products Grid Section */}
        <section id="products-section" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header & Filters Bento Pod */}
          <div className="bg-[#FFFDF9] border border-[#DFC7A2] rounded-3xl p-6 sm:p-8 shadow-sm mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 blur-[90px] rounded-full pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#FAF3E0] border border-[#DFC7A2] rounded-full text-xs font-bold text-[#7A1F1D] mb-3 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#993300]" />
                <span>{t('allSpicesCategory')}</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#2C1810] tracking-tight">
                {selectedCategoryId
                  ? (categories || []).find(c => c.id === selectedCategoryId)?.[isKn ? 'name_kn' : 'name_en']
                  : t('allSpices')}
              </h2>
              <p className="text-xs sm:text-sm text-[#5C4535] mt-1 max-w-xl font-normal">
                {isKn
                  ? 'ಸಾಂಪ್ರದಾಯಿಕ ಕಲ್ಲಿನ ಬೀಸುವ ವಿಧಾನದಿಂದ ತಯಾರಿಸಿದ ಅಪ್ಪಟ, ಸುಗಂಧಭರಿತ ಮಸಾಲೆಗಳು'
                  : 'Stone-ground in micro-batches to preserve essential volatile aroma & authentic flavour.'}
              </p>
            </div>

            {/* Live Search & Sort Controls */}
            <div className="relative z-10 flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-[#8C6D53] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#FAF6EE] border border-[#DFC7A2] hover:border-[#993300] focus:border-[#993300] rounded-2xl text-[#2C1810] placeholder-[#8C6D53]/60 focus:outline-hidden transition-all shadow-inner"
                />
              </div>

              <div className="flex items-center space-x-2 bg-[#FAF6EE] border border-[#DFC7A2] hover:border-[#993300] rounded-2xl px-3.5 py-2 text-xs text-[#2C1810]">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#8C6D53]" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs font-bold text-[#2C1810] focus:outline-hidden cursor-pointer"
                >
                  <option value="featured" className="bg-[#FAF6EE] text-[#2C1810]">Featured</option>
                  <option value="price_asc" className="bg-[#FAF6EE] text-[#2C1810]">Price: Low to High</option>
                  <option value="price_desc" className="bg-[#FAF6EE] text-[#2C1810]">Price: High to Low</option>
                  <option value="rating" className="bg-[#FAF6EE] text-[#2C1810]">Top Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Bento Grid */}
          {sortedProducts.length === 0 ? (
            <div className="py-20 text-center bg-[#FFFDF9] rounded-3xl border border-[#DFC7A2] space-y-4">
              <p className="text-sm font-semibold text-[#5C4535]">
                {isKn ? 'ಯಾವುದೇ ಮಸಾಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ' : 'No spices found matching your criteria.'}
              </p>
              <button
                onClick={() => {
                  setSelectedCategoryId(null);
                  setSearchQuery('');
                }}
                className="px-5 py-2.5 rounded-2xl bg-[#993300] text-white text-xs font-bold hover:bg-[#7A1F1D] transition-colors cursor-pointer shadow-sm"
              >
                {isKn ? 'ಎಲ್ಲಾ ಮಸಾಲೆಗಳನ್ನು ತೋರಿಸಿ' : 'Reset Filters'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {(sortedProducts || []).map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetails={setSelectedProduct}
                />
              ))}
            </div>
          )}
        </section>

        {/* Ancient Spice History & Sacred Ayurvedic Wisdom Section */}
        <AncientSpiceHistorySection />

        {/* Festival Offers Section */}
        <FestivalOffersSection
          offers={offers}
          onApplyCoupon={handleApplyOfferCoupon}
        />

        {/* Recipes & Culinary Pairing */}
        <RecipeSection
          recipes={recipes}
          products={products}
          onOpenProduct={setSelectedProduct}
        />

        {/* Health & Ayurvedic Wisdom */}
        <HealthWisdomSection />

        {/* Heritage Story & Stone-Ground Process */}
        <HeritageStorySection />

        {/* Customer Reviews & Feedback */}
        <CustomerReviewsSection
          reviews={reviews}
          products={products}
          onReviewAdded={handleReviewAdded}
        />
      </main>

      {/* Footer */}
      <Footer
        settings={fallbackSettings}
        onOpenPolicy={setPolicyModalType}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        onNavigateToSection={scrollToSection}
      />

      {/* Floating WhatsApp Quick Ordering Button */}
      <FloatingWhatsApp settings={fallbackSettings} />

      {/* Mobile Floating Cart Bar - Generous and always accessible */}
      {totalItems > 0 && !isCheckoutOpen && (
        <div className="fixed bottom-4 left-4 right-4 sm:hidden z-35 animate-in slide-in-from-bottom-4 duration-200">
          <div className="bg-[#8B3214] text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between border border-amber-300/30 backdrop-blur-md">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-amber-200 shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-amber-100 truncate">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} • ₹{totalAmount}
                </p>
                <p className="text-[10px] text-amber-200/80 truncate">
                  {isKn ? 'ಆರ್ಡರ್ ಮುಂದುವರಿಸಿ' : 'View Cart & Checkout'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(true)}
              id="mobile-floating-cart-btn"
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-[#1F1610] rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer active:scale-95 shrink-0"
            >
              <span>{isKn ? 'ಬುಟ್ಟಿ' : 'View Cart'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Lead Capture Popup */}
      <LeadPopup />

      {/* Modals & Drawers */}
      <CartDrawer
        settings={fallbackSettings}
        offers={offers}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        settings={fallbackSettings}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={order => {
          setIsCheckoutOpen(false);
          setConfirmedOrder(order);
        }}
      />

      <OrderConfirmationModal
        order={confirmedOrder}
        settings={fallbackSettings}
        onClose={() => setConfirmedOrder(null)}
        onTrackOrder={(orderId, phone) => {
          setConfirmedOrder(null);
          setIsTrackOrderOpen(true);
        }}
      />

      <TrackOrderModal
        isOpen={isTrackOrderOpen}
        onClose={() => setIsTrackOrderOpen(false)}
      />

      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        onOpenProduct={prod => setSelectedProduct(prod)}
      />

      <PolicyModal
        type={policyModalType}
        settings={fallbackSettings}
        onClose={() => setPolicyModalType(null)}
      />
    </div>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState<'store' | 'admin_login' | 'admin_dashboard'>('store');

  // Handle URL hash / path navigation
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path === '/admin' || path === '/admin-dashboard') {
        setCurrentView('admin_dashboard');
      } else if (path === '/admin-login') {
        setCurrentView('admin_login');
      } else {
        setCurrentView('store');
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigateTo = (view: 'store' | 'admin_login' | 'admin_dashboard') => {
    setCurrentView(view);
    const path = view === 'admin_dashboard' ? '/admin' : view === 'admin_login' ? '/admin-login' : '/';
    window.history.pushState({}, '', path);
  };

  return (
    <LanguageProvider>
      <AdminAuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AppRoot currentView={currentView} navigateTo={navigateTo} />
          </WishlistProvider>
        </CartProvider>
      </AdminAuthProvider>
    </LanguageProvider>
  );
}

function AppRoot({
  currentView,
  navigateTo
}: {
  currentView: 'store' | 'admin_login' | 'admin_dashboard';
  navigateTo: (view: 'store' | 'admin_login' | 'admin_dashboard') => void;
}) {
  const { isAuthenticated } = useAdminAuth();

  if (currentView === 'admin_dashboard' || currentView === 'admin_login') {
    if (isAuthenticated) {
      return <AdminDashboard onBackToStore={() => navigateTo('store')} />;
    }
    return <AdminLogin onBackToStore={() => navigateTo('store')} />;
  }

  return <Storefront onNavigateToAdmin={() => navigateTo('admin_login')} />;
}
