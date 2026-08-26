import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Offer, BusinessSettings } from '../types';
import { useLanguage } from './LanguageContext';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, delta: number) => void;
  setItemQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItems: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  totalAmount: number;
  appliedCoupon: Offer | null;
  applyCoupon: (offer: Offer | null) => void;
  getItemQuantity: (productId: string) => number;
  generateWhatsAppOrderUrl: (settings: BusinessSettings, customerName?: string, customerPhone?: string, addressStr?: string) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language } = useLanguage();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('indima_cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(i => i && i.product && typeof i.product.price === 'number');
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Offer | null>(() => {
    try {
      const saved = localStorage.getItem('indima_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('indima_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem('indima_coupon', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('indima_coupon');
      }
    } catch (e) {
      console.error(e);
    }
  }, [appliedCoupon]);

  const addItem = (product: Product, quantity = 1) => {
    setItems(prev => {
      const existingIdx = prev.findIndex(item => item.product.id === product.id);
      if (existingIdx > -1) {
        const nextQty = Math.min(product.stock, prev[existingIdx].quantity + quantity);
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], quantity: nextQty };
        return updated;
      } else {
        const initialQty = Math.min(product.stock, Math.max(1, quantity));
        return [...prev, { product, quantity: initialQty }];
      }
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setItems(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            const cappedQty = Math.min(item.product.stock, nextQty);
            return { ...item, quantity: cappedQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const setItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const cappedQty = Math.min(item.product.stock, quantity);
          return { ...item, quantity: cappedQty };
        }
        return item;
      });
    });
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const getItemQuantity = (productId: string): number => {
    const found = items.find(item => item.product.id === productId);
    return found ? found.quantity : 0;
  };

  const applyCoupon = (offer: Offer | null) => {
    setAppliedCoupon(offer);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  let discount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.min_order_amount) {
    if (appliedCoupon.discount_type === 'percentage') {
      let disc = (subtotal * appliedCoupon.discount_value) / 100;
      if (appliedCoupon.max_discount_amount) {
        disc = Math.min(disc, appliedCoupon.max_discount_amount);
      }
      discount = Math.round(disc);
    } else {
      discount = appliedCoupon.discount_value;
    }
  }

  const freeShippingThreshold = 499;
  const standardShipping = 49;
  const shippingFee = (subtotal - discount) >= freeShippingThreshold || subtotal === 0 ? 0 : standardShipping;
  const totalAmount = Math.max(0, subtotal - discount + shippingFee);

  const generateWhatsAppOrderUrl = (
    settings: BusinessSettings,
    customerName?: string,
    customerPhone?: string,
    addressStr?: string
  ): string => {
    const rawNumber = (settings.whatsapp_number || '919845012345').replace(/\D/g, '');
    const isKn = language === 'kn';

    const itemsSummary = items
      .map(
        i =>
          `• ${isKn ? i.product.name_kn : i.product.name_en} (${i.product.weight}) × ${i.quantity} = ₹${i.product.price * i.quantity}`
      )
      .join('\n');

    let text = isKn
      ? `*ಇಂದಿಮಾ ಸ್ಪೈಸ್ ಕಂ. — ಹೊಸ ಮಸಾಲೆ ಆರ್ಡರ್*\n\n`
      : `*INDIMA SPICE CO. — CUSTOMER ORDER*\n\n`;

    text += isKn
      ? `ನಮಸ್ಕಾರ, ನಾನು ಈ ಕೆಳಗಿನ ಶುದ್ಧ ಮಸಾಲೆಗಳನ್ನು ಆರ್ಡರ್ ಮಾಡಲು ಬಯಸುತ್ತೇನೆ:\n\n`
      : `Namaskara! I would like to order the following pure spices:\n\n`;

    text += `${itemsSummary}\n\n`;
    text += isKn ? `*ಉತ್ಪನ್ನಗಳ ಒಟ್ಟು ಮೊತ್ತ:* ₹${subtotal}\n` : `*Items Subtotal:* ₹${subtotal}\n`;

    if (discount > 0) {
      text += isKn ? `*ಹಬ್ಬದ ರಿಯಾಯಿತಿ:* -₹${discount}\n` : `*Discount Applied:* -₹${discount}\n`;
    }

    text += isKn ? `*ವಿತರಣಾ ಶುಲ್ಕ:* ₹${shippingFee}\n` : `*Delivery Fee:* ₹${shippingFee}\n`;
    text += isKn ? `*ಒಟ್ಟು ಪಾವತಿಸಬೇಕಾದ ಮೊತ್ತ:* ₹${totalAmount}\n\n` : `*Total Amount:* ₹${totalAmount}\n\n`;

    if (customerName || customerPhone) {
      text += isKn ? `*ಗ್ರಾಹಕರ ವಿವರ:*\n` : `*Customer Info:*\n`;
      if (customerName) text += `ಹೆಸರು/Name: ${customerName}\n`;
      if (customerPhone) text += `ಮೊಬೈಲ್/Phone: +91 ${customerPhone}\n`;
    }

    if (addressStr) {
      text += isKn ? `\n*ವಿತರಣಾ ವಿಳಾಸ:*\n${addressStr}\n` : `\n*Delivery Address:*\n${addressStr}\n`;
    }

    text += isKn
      ? `\nದಯವಿಟ್ಟು ಯುಪಿಐ ಪಾವತಿ ಲಿಂಕ್ ಮತ್ತು ದೃಢೀಕರಣವನ್ನು ಕಳುಹಿಸಿ. ಧನ್ಯವಾದಗಳು!`
      : `\nPlease confirm and share UPI payment details for instant processing. Dhanyavadagalu!`;

    return `https://wa.me/${rawNumber}?text=${encodeURIComponent(text)}`;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        setItemQuantity,
        removeItem,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        subtotal,
        discount,
        shippingFee,
        totalAmount,
        appliedCoupon,
        applyCoupon,
        getItemQuantity,
        generateWhatsAppOrderUrl
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
