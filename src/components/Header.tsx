import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ShoppingBag,
  Heart,
  Truck,
  Globe,
  Menu,
  X,
  UserCheck,
  MapPin,
  Leaf,
  ShieldCheck,
  Sparkles,
  ChefHat,
  Tag,
  Star,
  Package,
  MessageCircle,
  Phone,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { Product, BusinessSettings } from '../types';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  settings: BusinessSettings;
  products?: Product[];
  onOpenProduct: (product: Product) => void;
  onOpenTrackOrder: () => void;
  onOpenWishlist: () => void;
  onOpenAiAssistant?: () => void;
  onNavigateToSection: (sectionId: string) => void;
  onNavigateToAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  products = [],
  onOpenProduct,
  onOpenTrackOrder,
  onOpenWishlist,
  onOpenAiAssistant,
  onNavigateToSection,
  onNavigateToAdmin
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { totalItems, totalAmount, setIsCartOpen } = useCart();
  const { wishlist } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchFocused, setIsMobileSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  const isKn = language === 'kn';

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    const matches = (products || [])
      .filter(
        p =>
          p?.active &&
          (p.name_en?.toLowerCase().includes(q) ||
            p.name_kn?.toLowerCase().includes(q) ||
            p.description_en?.toLowerCase().includes(q) ||
            p.ingredients_en?.toLowerCase().includes(q) ||
            p.sku?.toLowerCase().includes(q))
      )
      .slice(0, 6);
    setSearchResults(matches);
  }, [searchQuery, products]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)) {
        setIsMobileSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const toggleLang = () => {
    setLanguage(language === 'en' ? 'kn' : 'en');
  };

  const handleNavClick = (sectionId: string) => {
    onNavigateToSection(sectionId);
    setIsMobileMenuOpen(false);
  };

  const renderSearchResults = () => (
    <div className="absolute top-full left-0 right-0 mt-2 bg-[#FFFDF9] border border-[#E8DFD3] rounded-2xl shadow-xl z-50 overflow-hidden py-2 divide-y divide-[#F5EFEB] max-h-80 overflow-y-auto">
      <div className="px-3.5 py-1 text-[11px] font-bold text-[#8B3214] uppercase tracking-wider bg-[#FAF7F2]">
        {isKn ? 'ಮಸಾಲೆ ಫಲಿತಾಂಶಗಳು' : 'Pure Spice Matches'}
      </div>
      {searchResults.map(p => (
        <div
          key={p.id}
          onClick={() => {
            onOpenProduct(p);
            setIsSearchFocused(false);
            setIsMobileSearchFocused(false);
            setSearchQuery('');
          }}
          className="p-3 hover:bg-[#FAF7F2] flex items-center space-x-3 cursor-pointer transition-colors"
        >
          <img
            src={(p.images && p.images[0]) || '/indima-logo.svg'}
            alt={p.name_en}
            className="w-10 h-10 rounded-xl object-cover border border-[#E8DFD3] shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#1F1610] truncate">
              {isKn ? p.name_kn : p.name_en}
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-[#7A6455]">
              <span className="font-semibold text-[#8B3214]">₹{p.price}</span>
              <span>•</span>
              <span>{p.weight}</span>
            </div>
          </div>
          <span className="text-[10px] text-[#2B5329] bg-[#EAF2EB] px-2 py-0.5 rounded-full font-bold shrink-0">
            {isKn ? 'ನೈಸರ್ಗಿಕ' : 'Pure'}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 border-b border-[#E8DFD3] backdrop-blur-md transition-all w-full">
      {/* Top Announcement Bar */}
      <div className="bg-[#8B3214] text-[#FFF9F2] text-[11px] font-medium py-1.5 px-3 sm:px-4 shadow-2xs w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Announcement text */}
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#6E240D] text-amber-200 text-[10px] font-bold tracking-wide shrink-0">
              <MapPin className="w-3 h-3 mr-0.5" />
              BENGALURU
            </span>
            <span className="font-medium text-amber-50 truncate text-[11px]">
              {isKn
                ? 'ಬೆಂಗಳೂರಿನಲ್ಲಿ ಕಲ್ಲಿನ ಬೀಸುವ ಪದ್ಧತಿಯಲ್ಲಿ ತಯಾರಾದ 100% ನೈಸರ್ಗಿಕ ಮಸಾಲೆಗಳು'
                : 'Freshly Stone-Ground in Bengaluru • 100% Natural, Chemical-Free Spices'}
            </span>
          </div>

          {/* Top Links */}
          <div className="flex items-center space-x-2 sm:space-x-4 text-xs text-amber-100/90 shrink-0">
            <div className="hidden lg:flex items-center space-x-1.5">
              <Truck className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {isKn
                  ? `₹${settings.free_delivery_threshold || 499} ಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ಆರ್ಡರ್‌ಗಳಿಗೆ ಉಚಿತ ವಿತರಣೆ`
                  : `Free Delivery > ₹${settings.free_delivery_threshold || 499}`}
              </span>
            </div>
            <button
              onClick={onOpenTrackOrder}
              id="top-track-order-btn"
              className="hover:text-white flex items-center space-x-1 transition-colors cursor-pointer text-amber-200 hover:underline text-[10px] sm:text-xs"
            >
              <Package className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{isKn ? 'ಆರ್ಡರ್ ಟ್ರ್ಯಾಕ್' : 'Track Order'}</span>
            </button>
            {onNavigateToAdmin && (
              <button
                onClick={onNavigateToAdmin}
                className="hidden sm:inline-flex items-center text-amber-200 hover:text-white text-[10px] sm:text-[11px] font-medium transition-colors cursor-pointer bg-[#6E240D] px-2 py-0.5 rounded-full border border-amber-300/20"
              >
                <UserCheck className="w-3 h-3 inline mr-1" />
                <span>Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
        {/* DESKTOP ROW (md and up) */}
        <div className="hidden md:flex items-center justify-between gap-4">
          {/* Logo and Brand Identity */}
          <div
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer select-none group shrink-0"
            onClick={() => onNavigateToSection('hero-section')}
          >
            <BrandLogo customUrl={settings.logo_url} size="md" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#1F1610]">
                  {settings.business_name || 'Indima Spice Co.'}
                </span>
                <span className="inline-block px-2 py-0.5 bg-[#EAF2EB] text-[#2B5329] text-[10px] font-bold rounded-full border border-[#CDE0D0]">
                  {isKn ? '100% ನೈಸರ್ಗಿಕ' : '100% Pure'}
                </span>
              </div>
              <p className="text-[11px] text-[#7A6455] font-serif italic">
                {isKn ? 'ತಾಯಿಯ ಪ್ರೀತಿಯಷ್ಟೇ ಪರಿಶುದ್ಧ • ಬೆಂಗಳೂರು' : "Pure as mother's love • Bengaluru"}
              </p>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div ref={searchRef} className="flex-1 max-w-md mx-4 relative">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[#8C7667] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                placeholder={isKn ? 'ಸಾಂಬಾರ್ ಪುಡಿ, ರಸಂ ಪುಡಿ, ಅರಿಶಿನ ಹುಡುಕಿ...' : 'Search pure homemade spices, sambar, rasam...'}
                className="w-full pl-10 pr-8 py-2 text-xs bg-[#FFFDF9] border border-[#DFCFC0] hover:border-[#8B3214] focus:border-[#8B3214] rounded-full text-[#1F1610] placeholder-[#9C8778] focus:outline-hidden transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live Search Results Dropdown (Desktop) */}
            {isSearchFocused && searchResults.length > 0 && renderSearchResults()}
          </div>

          {/* Right Action Icons: Indima AI, Language, Wishlist, Cart */}
          <div className="flex items-center space-x-2.5 shrink-0">
            {/* Indima AI Quick Trigger */}
            {onOpenAiAssistant && (
              <button
                onClick={onOpenAiAssistant}
                id="header-indima-ai-btn"
                title="Indima AI Recipe & Spice Guide"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-linear-to-r from-amber-500 to-[#8B3214] hover:from-amber-600 hover:to-[#6E240D] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-95 min-h-[38px] border border-amber-300/40"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
                <span className="font-serif tracking-wide">{isKn ? 'ಇಂದಿಮಾ AI' : 'Indima AI'}</span>
              </button>
            )}

            {/* Language Switcher */}
            <button
              onClick={toggleLang}
              id="header-language-toggle"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#FFFDF9] border border-[#DFCFC0] hover:border-[#8B3214] text-xs font-semibold text-[#1F1610] transition-colors cursor-pointer shadow-2xs min-h-[38px]"
            >
              <Globe className="w-3.5 h-3.5 text-[#8B3214]" />
              <span>{language === 'en' ? 'ಕನ್ನಡ' : 'EN'}</span>
            </button>

            {/* Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              id="header-wishlist-btn"
              title="Wishlist"
              className="relative p-2.5 rounded-full bg-[#FFFDF9] border border-[#DFCFC0] hover:border-[#8B3214] text-[#1F1610] hover:text-[#8B3214] transition-colors cursor-pointer shadow-2xs min-w-[38px] min-h-[38px] flex items-center justify-center"
            >
              <Heart className="w-4 h-4" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#8B3214] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              id="header-cart-btn"
              className="flex items-center space-x-2 px-3.5 py-2 rounded-full bg-[#8B3214] hover:bg-[#6E240D] text-white text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95 min-h-[38px]"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-amber-200" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-neutral-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="font-bold">
                {totalItems > 0 ? `₹${totalAmount}` : (isKn ? 'ಬುಟ್ಟಿ' : 'Cart')}
              </span>
            </button>
          </div>
        </div>

        {/* MOBILE HEADER ROW (< md): [☰] [INDIMA] [Language & Cart] */}
        <div className="flex md:hidden items-center justify-between gap-2">
          {/* Left: Mobile Menu Trigger (Touch-friendly 44x44 target) */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            className="w-11 h-11 rounded-2xl bg-[#FFFDF9] border border-[#DFCFC0] text-[#1F1610] flex items-center justify-center cursor-pointer shadow-2xs active:scale-95 shrink-0"
          >
            <Menu className="w-5 h-5 text-[#8B3214]" />
          </button>

          {/* Center: Brand Identity */}
          <div
            className="flex items-center space-x-2 cursor-pointer select-none min-w-0"
            onClick={() => onNavigateToSection('hero-section')}
          >
            <BrandLogo customUrl={settings.logo_url} size="sm" />
            <div className="min-w-0">
              <span className="font-serif text-base sm:text-lg font-bold tracking-tight text-[#1F1610] block truncate">
                {settings.business_name || 'Indima'}
              </span>
              <span className="text-[10px] text-[#2B5329] font-bold block truncate">
                {isKn ? '100% ನೈಸರ್ಗಿಕ' : 'Stone-Ground • Pure'}
              </span>
            </div>
          </div>

          {/* Right: Language Switcher & Cart */}
          <div className="flex items-center space-x-1.5 shrink-0">
            {/* Compact Language Toggle */}
            <button
              onClick={toggleLang}
              id="mobile-language-toggle"
              aria-label="Switch language"
              className="h-10 px-2.5 rounded-xl bg-[#FFFDF9] border border-[#DFCFC0] text-[11px] font-bold text-[#1F1610] flex items-center space-x-1 cursor-pointer active:scale-95"
            >
              <Globe className="w-3.5 h-3.5 text-[#8B3214]" />
              <span>{language === 'en' ? 'ಕನ್ನಡ' : 'EN'}</span>
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              id="mobile-cart-header-btn"
              aria-label="View shopping cart"
              className="h-10 px-3 rounded-xl bg-[#8B3214] text-white flex items-center space-x-1.5 font-bold text-xs shadow-sm cursor-pointer active:scale-95"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-amber-200" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-400 text-neutral-950 text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="tabular-nums">
                {totalItems > 0 ? `₹${totalAmount}` : (isKn ? 'ಬುಟ್ಟಿ' : 'Cart')}
              </span>
            </button>
          </div>
        </div>

        {/* MOBILE SEARCH BAR (Immediately below header row) */}
        <div ref={mobileSearchRef} className="mt-2 md:hidden relative w-full">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[#8C7667] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsMobileSearchFocused(true)}
              onChange={e => {
                setSearchQuery(e.target.value);
                setIsMobileSearchFocused(true);
              }}
              placeholder={isKn ? 'ಸಾಂಬಾರ್ ಪುಡಿ, ರಸಂ ಪುಡಿ, ಅರಿಶಿನ...' : 'Search pure homemade spices, sambar, rasam...'}
              className="w-full pl-10 pr-8 py-2 text-xs bg-[#FFFDF9] border border-[#DFCFC0] rounded-xl text-[#1F1610] placeholder-[#9C8778] focus:outline-hidden focus:border-[#8B3214] shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Live Search Results Dropdown (Mobile) */}
          {isMobileSearchFocused && searchResults.length > 0 && renderSearchResults()}
        </div>

        {/* DESKTOP NAVIGATION STRIP (md:flex) */}
        <nav className="hidden md:flex items-center justify-between pt-2.5 mt-1 border-t border-[#F0E6D8] text-xs font-semibold text-[#5C483B] flex-wrap gap-2">
          <div className="flex items-center space-x-4 lg:space-x-6 flex-wrap">
            <button
              onClick={() => onNavigateToSection('products-section')}
              className="hover:text-[#8B3214] transition-colors cursor-pointer flex items-center space-x-1"
            >
              <span>{isKn ? 'ಎಲ್ಲಾ ಶುದ್ಧ ಮಸಾಲೆಗಳು' : 'All Pure Spices'}</span>
            </button>
            <button
              onClick={() => onNavigateToSection('health-truth-section')}
              className="hover:text-[#8B3214] transition-colors cursor-pointer text-[#2B5329] font-bold flex items-center space-x-1 bg-[#EAF2EB] px-2.5 py-0.5 rounded-full"
            >
              <Leaf className="w-3 h-3 text-[#2B5329]" />
              <span>{isKn ? 'ಆರೋಗ್ಯ & ರಾಸಾಯನಿಕ-ಮುಕ್ತ ಶುದ್ಧತೆ' : 'Health Benefits & 0% Chemicals'}</span>
            </button>
            <button
              onClick={() => onNavigateToSection('recipes-section')}
              className="hover:text-[#8B3214] transition-colors cursor-pointer"
            >
              <span>{isKn ? 'ಸಾಂಪ್ರದಾಯಿಕ ಅಡುಗೆಗಳು' : 'Traditional Recipes'}</span>
            </button>
            <button
              onClick={() => onNavigateToSection('heritage-story-section')}
              className="hover:text-[#8B3214] transition-colors cursor-pointer"
            >
              <span>{isKn ? 'ಬೆಂಗಳೂರು ಪರಂಪರೆ' : 'Bengaluru Heritage'}</span>
            </button>
            <button
              onClick={() => onNavigateToSection('offers-section')}
              className="hover:text-[#8B3214] transition-colors cursor-pointer text-[#8B3214]"
            >
              <span>{isKn ? 'ಕಾಂಬೋ ಉಳಿತಾಯ' : 'Combo Value Packs'}</span>
            </button>
            <button
              onClick={() => onNavigateToSection('reviews-section')}
              className="hover:text-[#8B3214] transition-colors cursor-pointer"
            >
              <span>{isKn ? 'ಗ್ರಾಹಕರ ಅಭಿಪ್ರಾಯಗಳು' : 'Customer Reviews'}</span>
            </button>
          </div>

          <div className="text-[11px] text-[#7A6455] hidden lg:flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block animate-pulse"></span>
            <span>{isKn ? 'ಬೆಂಗಳೂರಿನಲ್ಲಿ ತಾಜಾವಾಗಿ ತಯಾರಿಸಲ್ಪಟ್ಟಿದೆ' : 'Freshly Ground Weekly in Bengaluru'}</span>
          </div>
        </nav>
      </div>

      {/* FULL RESPONSIVE MOBILE DRAWER (Slide-over navigation) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Slide-over Drawer Panel */}
          <div
            className="relative w-4/5 max-w-xs sm:max-w-sm bg-[#FAF7F2] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200 border-r border-[#E8DFD3]"
          >
            {/* Drawer Header */}
            <div className="p-4 bg-[#FFFDF9] border-b border-[#E8DFD3] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <BrandLogo customUrl={settings.logo_url} size="sm" />
                <div>
                  <h3 className="font-serif text-base font-bold text-[#1F1610]">
                    {settings.business_name || 'Indima'}
                  </h3>
                  <p className="text-[10px] text-[#7A6455] font-serif italic">
                    {isKn ? 'ತಾಯಿಯ ಪ್ರೀತಿಯಷ್ಟೇ ಪರಿಶುದ್ಧ' : "Pure as mother's love"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
                className="w-9 h-9 rounded-xl bg-[#FAF7F2] hover:bg-[#F3ECE0] text-[#1F1610] flex items-center justify-center cursor-pointer border border-[#DFCFC0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Indima AI Assistant Featured Card */}
              {onOpenAiAssistant && (
                <button
                  onClick={() => {
                    onOpenAiAssistant();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full p-3.5 bg-linear-to-r from-amber-500 via-[#8B3214] to-[#6E240D] text-white rounded-2xl text-left flex items-center justify-between font-bold shadow-md cursor-pointer active:scale-98 border border-amber-300/40"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-serif text-xs font-bold text-white truncate">
                        {isKn ? 'ಇಂದಿಮಾ AI ಪಾಕವಿಧಾನ ಸಹಾಯಕ' : 'Ask Indima AI Guide'}
                      </p>
                      <p className="text-[10px] text-amber-100 font-normal">
                        {isKn ? 'ಮಸಾಲೆ ಪ್ರಮಾಣ & ಅಡುಗೆ ಸಲಹೆ' : 'Cooking tips & spice pairing'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-200 shrink-0" />
                </button>
              )}

              {/* Primary Navigation Links */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8B3214] px-2 mb-1">
                  {isKn ? 'ಮಸಾಲೆಗಳ ಅನ್ವೇಷಣೆ' : 'Explore Indima'}
                </p>

                <button
                  onClick={() => handleNavClick('products-section')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#FFFDF9] border border-[#E8DFD3] text-[#1F1610] hover:border-[#8B3214] font-semibold text-xs cursor-pointer active:bg-[#FAF7F2]"
                >
                  <div className="flex items-center space-x-2.5">
                    <Sparkles className="w-4 h-4 text-[#8B3214]" />
                    <span>{isKn ? 'ಎಲ್ಲಾ ಶುದ್ಧ ಮಸಾಲೆಗಳು' : 'All Pure Spices'}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                <button
                  onClick={() => handleNavClick('health-truth-section')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#EAF2EB] border border-[#CDE0D0] text-[#2B5329] font-bold text-xs cursor-pointer active:scale-98"
                >
                  <div className="flex items-center space-x-2.5">
                    <Leaf className="w-4 h-4 text-[#2B5329]" />
                    <span>{isKn ? 'ಆರೋಗ್ಯ & ರಾಸಾಯನಿಕ-ಮುಕ್ತ ಶುದ್ಧತೆ' : 'Health Benefits & 0% Chemicals'}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#2B5329]" />
                </button>

                <button
                  onClick={() => handleNavClick('recipes-section')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#FFFDF9] border border-[#E8DFD3] text-[#1F1610] hover:border-[#8B3214] font-semibold text-xs cursor-pointer active:bg-[#FAF7F2]"
                >
                  <div className="flex items-center space-x-2.5">
                    <ChefHat className="w-4 h-4 text-[#8B3214]" />
                    <span>{isKn ? 'ಸಾಂಪ್ರದಾಯಿಕ ಅಡುಗೆಗಳು' : 'Traditional Recipes'}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                <button
                  onClick={() => handleNavClick('heritage-story-section')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#FFFDF9] border border-[#E8DFD3] text-[#1F1610] hover:border-[#8B3214] font-semibold text-xs cursor-pointer active:bg-[#FAF7F2]"
                >
                  <div className="flex items-center space-x-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#8B3214]" />
                    <span>{isKn ? 'ಬೆಂಗಳೂರು ಪರಂಪರೆ' : 'Bengaluru Heritage'}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                <button
                  onClick={() => handleNavClick('offers-section')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#FFFDF9] border border-[#E8DFD3] text-[#8B3214] font-bold text-xs cursor-pointer active:bg-[#FAF7F2]"
                >
                  <div className="flex items-center space-x-2.5">
                    <Tag className="w-4 h-4 text-[#8B3214]" />
                    <span>{isKn ? 'ಕಾಂಬೋ ಉಳಿತಾಯ & ಕೂಪನ್‌ಗಳು' : 'Festive Value Offers'}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#8B3214]" />
                </button>

                <button
                  onClick={() => handleNavClick('reviews-section')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#FFFDF9] border border-[#E8DFD3] text-[#1F1610] hover:border-[#8B3214] font-semibold text-xs cursor-pointer active:bg-[#FAF7F2]"
                >
                  <div className="flex items-center space-x-2.5">
                    <Star className="w-4 h-4 text-[#C27803]" />
                    <span>{isKn ? 'ಗ್ರಾಹಕರ ಅಭಿಪ್ರಾಯಗಳು' : 'Customer Reviews'}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                </button>
              </div>

              {/* Account, Orders & Support */}
              <div className="space-y-1 pt-2 border-t border-[#E8DFD3]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A6455] px-2 mb-1">
                  {isKn ? 'ಸೇವೆಗಳು & ಸಹಾಯ' : 'Services & Orders'}
                </p>

                <button
                  onClick={() => {
                    onOpenTrackOrder();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#FFFDF9] border border-[#E8DFD3] text-[#1F1610] font-semibold text-xs cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <Package className="w-4 h-4 text-[#8B3214]" />
                    <span>{isKn ? 'ಆರ್ಡರ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ' : 'Track Order Status'}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                <button
                  onClick={() => {
                    onOpenWishlist();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#FFFDF9] border border-[#E8DFD3] text-[#1F1610] font-semibold text-xs cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <Heart className="w-4 h-4 text-[#8B3214]" />
                    <span>{isKn ? 'ನನ್ನ ಇಷ್ಟದ ಪಟ್ಟಿ' : 'My Wishlist'}</span>
                  </div>
                  {wishlist.length > 0 && (
                    <span className="bg-[#8B3214] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {wishlist.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    toggleLang();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#FFFDF9] border border-[#E8DFD3] text-[#1F1610] font-semibold text-xs cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <Globe className="w-4 h-4 text-[#8B3214]" />
                    <span>{isKn ? 'English Version' : 'ಕನ್ನಡ ಆವೃತ್ತಿಗೆ ಬದಲಿಸಿ'}</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#8B3214] bg-[#FAF7F2] px-2 py-0.5 rounded-md border border-[#E8DFD3]">
                    {language === 'en' ? 'ಕನ್ನಡ' : 'EN'}
                  </span>
                </button>

                {onNavigateToAdmin && (
                  <button
                    onClick={() => {
                      onNavigateToAdmin();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3] text-[#7A6455] hover:text-[#1F1610] font-medium text-xs cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <UserCheck className="w-4 h-4 text-[#7A6455]" />
                      <span>Admin Panel</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Drawer Bottom Kitchen Support */}
            <div className="p-4 bg-[#FFFDF9] border-t border-[#E8DFD3] space-y-2">
              <a
                href={`https://wa.me/${(settings.whatsapp_number || '919845012345').replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>{isKn ? 'ವಾಟ್ಸಾಪ್ ಸಹಾಯವಾಣಿ' : 'WhatsApp Support'}</span>
              </a>

              <p className="text-[10px] text-center text-[#7A6455]">
                {settings.phone ? `Call: +91 ${settings.phone}` : 'Bengaluru, Karnataka'}
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
