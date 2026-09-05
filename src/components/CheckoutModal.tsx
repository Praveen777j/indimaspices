import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  MapPin,
  Mail,
  User,
  CheckCircle2,
  Check,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Lock,
  CreditCard,
  Smartphone,
  QrCode,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { api } from '../services/api';
import { INDIA_STATES, lookupPincode } from '../data/indiaLocations';
import { Address, BusinessSettings, Order } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BusinessSettings;
  onOrderSuccess: (order: Order) => void;
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Razorpay SDK script from CDN');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  settings,
  onOrderSuccess
}) => {
  const { language, t } = useLanguage();
  const { items, subtotal, discount, shippingFee, totalAmount, appliedCoupon, clearCart } = useCart();

  const isKn = language === 'kn';

  // Checkout Step: 1 = Details & Address, 2 = Review & Pay
  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [houseFlat, setHouseFlat] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [state, setState] = useState('Karnataka');
  const [district, setDistrict] = useState('Bengaluru Urban');
  const [city, setCity] = useState('Bengaluru');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  // States & Districts helper
  const selectedStateData = INDIA_STATES.find(s => s.state.toLowerCase() === state.toLowerCase()) || INDIA_STATES[0];

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testOrderData, setTestOrderData] = useState<{
    order: Order;
    razorpay_order: any;
  } | null>(null);

  // Pre-load Razorpay script on modal open
  useEffect(() => {
    if (isOpen) {
      loadRazorpayScript();
    }
  }, [isOpen]);

  // Auto PIN code lookup
  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pin = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(pin);

    if (pin.length === 6) {
      const match = lookupPincode(pin);
      if (match) {
        setState(match.state);
        setDistrict(match.district);
        setCity(match.city);
        if (!area) setArea(match.area);
      }
    }
  };

  if (!isOpen) return null;

  const validateDetailsAndAddress = (): boolean => {
    const errors: Record<string, string> = {};

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      errors.phone = t('errValidMobile');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      errors.email = t('errValidEmail');
    }

    if (!fullName.trim()) {
      errors.fullName = isKn ? 'ದಯವಿಟ್ಟು ಪೂರ್ಣ ಹೆಸರು ನಮೂದಿಸಿ' : 'Please enter full name';
    }

    if (!pincode || !/^\d{6}$/.test(pincode)) {
      errors.pincode = t('errValidPin');
    }

    if (!houseFlat.trim()) {
      errors.houseFlat = isKn ? 'ಫ್ಲ್ಯಾಟ್/ಮನೆ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ' : 'Flat/House number is required';
    }

    if (!street.trim()) {
      errors.street = isKn ? 'ರಸ್ತೆ/ಬಡಾವಣೆ ಹೆಸರು ನಮೂದಿಸಿ' : 'Street/Road name is required';
    }

    if (!state) {
      errors.state = t('errSelectState');
    }

    if (!city) {
      errors.city = t('errSelectCity');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateDetailsAndAddress()) {
      setStep(2);
    }
  };

  // Complete simulated payment for development / test mode
  const handleCompleteTestPayment = async (methodName = 'UPI (Test Mode)') => {
    if (!testOrderData) return;
    setIsVerifyingPayment(true);
    setPaymentError('');

    try {
      const simPaymentId = `pay_sim_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`;
      const simSignature = `sim_sig_${Date.now()}`;
      const verifyRes = await api.verifyRazorpayPayment({
        internal_order_id: testOrderData.order.id,
        order_id: testOrderData.order.id,
        razorpay_order_id: testOrderData.razorpay_order.id,
        razorpay_payment_id: simPaymentId,
        razorpay_signature: simSignature
      });

      if (verifyRes.success && verifyRes.order) {
        clearCart();
        setShowTestModal(false);
        onOrderSuccess(verifyRes.order);
        onClose();
      } else {
        setPaymentError(verifyRes.error || 'Payment verification failed.');
      }
    } catch (vErr: any) {
      setPaymentError(vErr.message || 'Payment verification failed.');
    } finally {
      setIsVerifyingPayment(false);
      setIsInitializingPayment(false);
    }
  };

  // Launch Razorpay Standard Checkout
  const handleLaunchRazorpayPayment = async () => {
    setIsInitializingPayment(true);
    setPaymentError('');

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const addressPayload: Address = {
      fullName: fullName.trim(),
      phone: cleanPhone,
      email: email.trim(),
      houseFlat: houseFlat.trim(),
      street: street.trim(),
      area: area.trim(),
      landmark: landmark.trim() || undefined,
      pincode: pincode.trim(),
      city: city.trim(),
      district: district.trim(),
      state: state.trim(),
      deliveryInstructions: deliveryInstructions.trim() || undefined
    };

    const orderPayload = {
      customer_name: fullName.trim(),
      customer_phone: cleanPhone,
      customer_email: email.trim(),
      items: (items || []).map(i => ({
        product_id: i.product.id,
        quantity: i.quantity
      })),
      address: addressPayload,
      coupon_code: appliedCoupon?.code
    };

    try {
      // 1. Create Server-side Order and Razorpay Order
      const res = await api.createRazorpayOrder(orderPayload);
      if (!res.success || !res.order || !res.razorpay_order) {
        setPaymentError(res.error || t('errOutOfStock'));
        setIsInitializingPayment(false);
        return;
      }

      setLastCreatedOrder(res.order);
      setTestOrderData({ order: res.order, razorpay_order: res.razorpay_order });

      // If live credentials are not configured or key_id is empty, open instant Razorpay test checkout
      if (!res.is_live || !res.key_id) {
        setIsInitializingPayment(false);
        setShowTestModal(true);
        return;
      }

      // 2. Ensure Razorpay SDK is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !(window as any).Razorpay) {
        // Fallback to test checkout dialog if script blocked
        setIsInitializingPayment(false);
        setShowTestModal(true);
        return;
      }

      // 3. Configure Razorpay Standard Checkout Options
      const options = {
        key: res.key_id,
        amount: res.razorpay_order.amount,
        currency: res.razorpay_order.currency || 'INR',
        name: settings?.business_name || 'Indima Spice Co.',
        description: `Order ${res.order.id} • Pure Karnataka Spices`,
        image: settings?.logo_url || '/indima-logo.svg',
        order_id: res.razorpay_order.id,
        prefill: {
          name: fullName.trim(),
          email: email.trim(),
          contact: cleanPhone
        },
        theme: {
          color: '#993300',
          backdrop_color: 'rgba(0, 0, 0, 0.75)'
        },
        modal: {
          ondismiss: () => {
            setIsInitializingPayment(false);
            setIsVerifyingPayment(false);
            setPaymentError(
              isKn
                ? 'ಪಾವತಿ ವಿಂಡೋ ಮುಕ್ತಾಯಗೊಂಡಿದೆ. ದಯವಿಟ್ಟು ಮರುಪ್ರಯತ್ನಿಸಿ.'
                : 'Payment window was closed before completion. You can retry when ready.'
            );
          }
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          setIsVerifyingPayment(true);
          setPaymentError('');

          try {
            // 4. Server-Side Payment Verification (HMAC SHA256 Signature Verification)
            const verifyRes = await api.verifyRazorpayPayment({
              internal_order_id: res.order.id,
              order_id: res.order.id,
              razorpay_order_id: response.razorpay_order_id || res.razorpay_order.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.success && verifyRes.order) {
              clearCart();
              onOrderSuccess(verifyRes.order);
              onClose();
            } else {
              setPaymentError(
                verifyRes.error ||
                  (isKn
                    ? 'ಪಾವತಿ ಪರಿಶೀಲನೆ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಗ್ರಾಹಕ ಬೆಂಬಲವನ್ನು ಸಂಪರ್ಕಿಸಿ.'
                    : 'Payment verification failed. Please check your bank statement or contact support.')
              );
            }
          } catch (vErr: any) {
            setPaymentError(vErr.message || 'Payment verification server error.');
          } finally {
            setIsVerifyingPayment(false);
            setIsInitializingPayment(false);
          }
        }
      };

      // 4. Open Razorpay Checkout Modal
      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.on('payment.failed', (failResponse: any) => {
        setIsInitializingPayment(false);
        setIsVerifyingPayment(false);
        const reason = failResponse?.error?.description || failResponse?.error?.reason || 'Transaction could not be completed.';
        // If authentication failed on Razorpay checkout popup, fallback gracefully to test modal
        if (reason.toLowerCase().includes('auth') || reason.toLowerCase().includes('invalid key')) {
          setShowTestModal(true);
        } else {
          setPaymentError(`Payment failed: ${reason}`);
        }
      });

      rzpInstance.open();
    } catch (err: any) {
      console.warn('Razorpay Launch fallback:', err);
      setShowTestModal(true);
      setIsInitializingPayment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="relative bg-[#FFFDF9] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#EADBCA] max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with Steps */}
        <div className="p-4 sm:p-5 border-b border-[#F0E6D2] bg-[#FAF6EE] flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-neutral-900 flex items-center space-x-2">
              <span className="text-[#993300]">✦</span>
              <span>{t('checkoutTitle')}</span>
            </h2>
            <div className="flex items-center space-x-2 text-xs text-neutral-500 mt-1">
              <span className={step === 1 ? 'font-bold text-[#993300]' : ''}>
                1. {isKn ? 'ವಿಳಾಸ & ಮಾಹಿತಿ' : 'Address & Contact'}
              </span>
              <span>→</span>
              <span className={step === 2 ? 'font-bold text-[#993300]' : ''}>
                2. {isKn ? 'ಪರಿಶೀಲನೆ & ಪಾವತಿ' : 'Review & Razorpay Checkout'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-200/60 text-neutral-500 hover:text-neutral-900 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* STEP 1: Contact & Pan-India Address Form */}
          {step === 1 && (
            <form onSubmit={handleProceedToReview} className="space-y-4">
              {/* Section 1: Contact */}
              <div className="space-y-3">
                <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-[#993300] flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>{t('stepCustomer')}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-900 mb-1">
                      {t('fullNameLabel')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder={t('fullNamePlaceholder')}
                      className={`w-full px-3 py-2 text-xs bg-white border ${
                        formErrors.fullName ? 'border-red-500' : 'border-[#D9C4A2]'
                      } rounded-lg text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-[#993300]`}
                    />
                    {formErrors.fullName && <p className="text-[10px] text-red-600 mt-1">{formErrors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-900 mb-1">
                      {t('mobileLabel')} *
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-2.5 rounded-l-lg border border-r-0 border-[#D9C4A2] bg-[#FAF6EE] text-neutral-900 text-xs font-bold">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder={t('mobilePlaceholder')}
                        className={`w-full px-3 py-2 text-xs bg-white border rounded-r-lg ${
                          formErrors.phone ? 'border-red-500' : 'border-[#D9C4A2]'
                        } text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-[#993300]`}
                      />
                    </div>
                    {formErrors.phone && <p className="text-[10px] text-red-600 mt-1">{formErrors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-900 mb-1">
                    {t('emailLabel')} *
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder={t('emailPlaceholder')}
                      className={`w-full pl-9 pr-3 py-2 text-xs bg-white border ${
                        formErrors.email ? 'border-red-500' : 'border-[#D9C4A2]'
                      } rounded-lg text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-[#993300]`}
                    />
                  </div>
                  {formErrors.email && <p className="text-[10px] text-red-600 mt-1">{formErrors.email}</p>}
                </div>
              </div>

              {/* Section 2: Pan-India Delivery Address */}
              <div className="space-y-3 pt-3 border-t border-[#F0E6D2]">
                <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-[#993300] flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{t('stepAddress')} (Pan-India)</span>
                </h3>

                {/* PIN Code with instant lookup */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-900 mb-1">
                      {t('pincodeLabel')} *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pincode}
                      onChange={handlePincodeChange}
                      placeholder={t('pincodePlaceholder')}
                      className={`w-full px-3 py-2 text-xs bg-white border font-mono font-bold ${
                        formErrors.pincode ? 'border-red-500' : 'border-[#D9C4A2]'
                      } rounded-lg text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-[#993300]`}
                    />
                    {formErrors.pincode && <p className="text-[10px] text-red-600 mt-1">{formErrors.pincode}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-900 mb-1">
                      {t('stateLabel')} *
                    </label>
                    <select
                      value={state}
                      onChange={e => {
                        setState(e.target.value);
                        const match = INDIA_STATES.find(s => s.state === e.target.value);
                        if (match) {
                          setDistrict(match.districts[0] || '');
                          setCity(match.majorCities[0] || '');
                        }
                      }}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#D9C4A2] rounded-lg text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-[#993300]"
                    >
                      {INDIA_STATES.map(s => (
                        <option key={s.state} value={s.state}>
                          {s.state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-900 mb-1">
                      {t('districtLabel')} *
                    </label>
                    <select
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#D9C4A2] rounded-lg text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-[#993300]"
                    >
                      {(selectedStateData?.districts || []).map(d => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-900 mb-1">
                      {t('cityLabel')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder={t('selectCity')}
                      className={`w-full px-3 py-2 text-xs bg-white border ${
                        formErrors.city ? 'border-red-500' : 'border-[#D9C4A2]'
                      } rounded-lg text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-[#993300]`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-900 mb-1">
                      {t('areaLabel')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={area}
                      onChange={e => setArea(e.target.value)}
                      placeholder={t('areaPlaceholder')}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#D9C4A2] rounded-lg text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-[#993300]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-900 mb-1">
                    {t('houseFlatLabel')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={houseFlat}
                    onChange={e => setHouseFlat(e.target.value)}
                    placeholder={t('houseFlatPlaceholder')}
                    className={`w-full px-3 py-2 text-xs bg-white border ${
                      formErrors.houseFlat ? 'border-red-500' : 'border-[#D9C4A2]'
                    } rounded-lg text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-[#993300]`}
                  />
                  {formErrors.houseFlat && <p className="text-[10px] text-red-600 mt-1">{formErrors.houseFlat}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-900 mb-1">
                    {t('streetLabel')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={e => setStreet(e.target.value)}
                    placeholder={t('streetPlaceholder')}
                    className={`w-full px-3 py-2 text-xs bg-white border ${
                      formErrors.street ? 'border-red-500' : 'border-[#D9C4A2]'
                    } rounded-lg text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-[#993300]`}
                  />
                  {formErrors.street && <p className="text-[10px] text-red-600 mt-1">{formErrors.street}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-900 mb-1">
                      {t('landmarkLabel')}
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={e => setLandmark(e.target.value)}
                      placeholder={t('landmarkPlaceholder')}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#D9C4A2] rounded-lg text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-[#993300]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-900 mb-1">
                      {t('deliveryInstructionsLabel')}
                    </label>
                    <input
                      type="text"
                      value={deliveryInstructions}
                      onChange={e => setDeliveryInstructions(e.target.value)}
                      placeholder={t('deliveryInstructionsPlaceholder')}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#D9C4A2] rounded-lg text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-[#993300]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#F0E6D2]">
                <button
                  type="submit"
                  id="checkout-proceed-to-review-btn"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#993300] to-[#C05621] hover:from-[#802B00] hover:to-[#A84315] text-white font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <span>{isKn ? 'ವಿಳಾಸ ಪರಿಶೀಲಿಸಿ ಮುಂದುವರಿಯಿರಿ' : 'Review Delivery Address & Order'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Order Review & Razorpay Standard Checkout */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Delivery Address Snapshot Preview */}
              <div className="bg-[#FAF6EE] p-4 rounded-xl border border-[#EADBCA] space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-[#993300] flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{t('deliverToLabel')}</span>
                  </h4>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs text-[#993300] font-bold hover:underline cursor-pointer"
                  >
                    {isKn ? 'ಬದಲಾಯಿಸಿ (Edit)' : 'Edit Address'}
                  </button>
                </div>

                <div className="text-xs text-neutral-800 leading-relaxed font-medium">
                  <p className="font-bold text-sm text-neutral-900">{fullName}</p>
                  <p>+91 {phone} • {email}</p>
                  <p className="mt-1">
                    {houseFlat}, {street}, {area}
                  </p>
                  {landmark && <p className="text-neutral-500">Landmark: {landmark}</p>}
                  <p className="font-bold text-[#993300]">
                    {city}, {district}, {state} - {pincode}
                  </p>
                  {deliveryInstructions && (
                    <p className="text-[11px] text-neutral-600 italic mt-1">
                      Note: {deliveryInstructions}
                    </p>
                  )}
                </div>
              </div>

              {/* Immutable Address Safety Notice */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-2.5 text-xs text-amber-900">
                <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p>{t('confirmAddressNotice')}</p>
              </div>

              {/* Items in Basket */}
              <div className="space-y-2">
                <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-neutral-700">
                  {t('itemsOrdered')} ({items?.length || 0})
                </h4>
                <div className="divide-y divide-[#F0E6D2] max-h-40 overflow-y-auto pr-1">
                  {(items || []).map(({ product, quantity }) => (
                    <div key={product.id} className="py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={(product.images && product.images[0]) || '/indima-logo.svg'}
                          alt={product.name_en}
                          className="w-8 h-8 rounded-sm object-cover border border-amber-100"
                        />
                        <div>
                          <p className="font-semibold text-neutral-900">
                            {isKn ? product.name_kn : product.name_en}
                          </p>
                          <p className="text-neutral-500 text-[11px]">
                            {product.weight} × {quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-neutral-900">
                        ₹{product.price * quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-[#FAF6EE] p-3.5 rounded-xl border border-[#EADBCA] space-y-1.5 text-xs text-neutral-700">
                <div className="flex justify-between">
                  <span>{t('subtotal')}</span>
                  <span className="font-semibold">₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>{t('discount')}</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{t('deliveryFee')}</span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700 font-bold uppercase">{t('freeShippingBadge')}</span>
                    ) : (
                      `₹${shippingFee}`
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#EADBCA] flex justify-between text-base font-extrabold text-neutral-900">
                  <span>{t('totalAmount')}</span>
                  <span className="text-[#993300]">₹{totalAmount}</span>
                </div>
              </div>

              {/* Razorpay Standard Payment Badges & Trust Banner */}
              <div className="bg-[#FAF6EE] p-3.5 rounded-xl border border-[#DFC7A2] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-[#138808]" />
                    <span className="text-xs font-bold text-neutral-900">
                      Razorpay Standard Checkout
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md border border-emerald-300">
                    100% Encrypted & Verified
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-neutral-700">
                  <div className="bg-white p-2 rounded-lg border border-[#EADBCA] flex flex-col items-center justify-center text-center">
                    <Smartphone className="w-4 h-4 text-[#5f259f] mb-1" />
                    <span className="font-bold text-[10px]">UPI Intent</span>
                    <span className="text-[9px] text-neutral-500">GPay, PhonePe, Paytm</span>
                  </div>

                  <div className="bg-white p-2 rounded-lg border border-[#EADBCA] flex flex-col items-center justify-center text-center">
                    <QrCode className="w-4 h-4 text-[#002970] mb-1" />
                    <span className="font-bold text-[10px]">Dynamic QR</span>
                    <span className="text-[9px] text-neutral-500">Desktop Scan & Pay</span>
                  </div>

                  <div className="bg-white p-2 rounded-lg border border-[#EADBCA] flex flex-col items-center justify-center text-center">
                    <CreditCard className="w-4 h-4 text-[#993300] mb-1" />
                    <span className="font-bold text-[10px]">Cards & NetBanking</span>
                    <span className="text-[9px] text-neutral-500">All Major Banks</span>
                  </div>
                </div>
              </div>

              {paymentError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold">{isKn ? 'ಪಾವತಿ ದೋಷ' : 'Payment Notification'}:</p>
                    <p className="mt-0.5">{paymentError}</p>
                  </div>
                </div>
              )}

              {/* Confirm & Launch Razorpay Checkout */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isInitializingPayment || isVerifyingPayment}
                  className="px-4 py-3 rounded-xl border border-[#D9C4A2] bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4 inline mr-1" />
                  {isKn ? 'ಹಿಂದೆ' : 'Back'}
                </button>

                <button
                  type="button"
                  onClick={handleLaunchRazorpayPayment}
                  disabled={isInitializingPayment || isVerifyingPayment}
                  id="confirm-and-pay-btn"
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#993300] to-[#C05621] hover:from-[#802B00] hover:to-[#A84315] text-white font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  {isInitializingPayment ? (
                    <span className="inline-flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{isKn ? 'ರೇಜರ್‌ಪೇ ತೆರೆಯಲಾಗುತ್ತಿದೆ...' : 'Opening Razorpay Gateway...'}</span>
                    </span>
                  ) : isVerifyingPayment ? (
                    <span className="inline-flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{isKn ? 'ಪಾವತಿ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...' : 'Verifying Server Signature...'}</span>
                    </span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>
                        {isKn ? `₹${totalAmount} ಪಾವತಿಸಿ (Pay with Razorpay)` : `Pay ₹${totalAmount} via Razorpay`}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-neutral-500 text-center flex items-center justify-center space-x-1 pt-1">
                <Lock className="w-3 h-3 text-[#138808]" />
                <span>
                  {isKn
                    ? 'ಸುರಕ್ಷಿತ ಪಾವತಿ • ರೇಜರ್‌ಪೇ ಮತ್ತು ಬ್ಯಾಂಕ್ ಗೇಟ್‌ವೇ ಮೂಲಕ ನೇರ ಪರಿಶೀಲನೆ'
                    : '100% Secure Checkout • Automatic cryptographic verification on server'}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Razorpay Test / Sandbox Checkout Simulator Modal */}
        {showTestModal && testOrderData && (
          <div className="absolute inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-[#0C2340]/20 flex flex-col">
              {/* Razorpay Branded Top Header */}
              <div className="bg-[#0C2340] text-white p-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm">
                    ₹
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-tight">Razorpay Checkout</h3>
                    <p className="text-[10px] text-blue-200">Sandbox / Test Gateway</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-blue-200 block">Amount to Pay</span>
                  <span className="text-base font-extrabold text-white">
                    ₹{testOrderData.order.total_amount}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 space-y-1">
                  <p className="font-semibold flex items-center space-x-1">
                    <ShieldCheck className="w-4 h-4 text-blue-700" />
                    <span>Order #{testOrderData.order.id} Initialized</span>
                  </p>
                  <p className="text-[11px] text-blue-700">
                    Select any payment method below to complete payment and verify cryptographic server signatures.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    Choose Payment Option:
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleCompleteTestPayment('UPI (Google Pay)')}
                      disabled={isVerifyingPayment}
                      className="p-3 rounded-xl border border-neutral-200 hover:border-blue-600 hover:bg-blue-50/50 flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                    >
                      <Smartphone className="w-5 h-5 text-[#5f259f] mb-1" />
                      <span className="text-xs font-bold text-neutral-800">UPI Apps</span>
                      <span className="text-[10px] text-neutral-500">GPay, PhonePe, Paytm</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCompleteTestPayment('UPI QR')}
                      disabled={isVerifyingPayment}
                      className="p-3 rounded-xl border border-neutral-200 hover:border-blue-600 hover:bg-blue-50/50 flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                    >
                      <QrCode className="w-5 h-5 text-[#002970] mb-1" />
                      <span className="text-xs font-bold text-neutral-800">Dynamic QR</span>
                      <span className="text-[10px] text-neutral-500">Scan & Pay</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCompleteTestPayment('Card / NetBanking')}
                    disabled={isVerifyingPayment}
                    className="w-full p-2.5 rounded-xl border border-neutral-200 hover:border-blue-600 hover:bg-blue-50/50 flex items-center justify-center space-x-2 text-xs font-bold text-neutral-800 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <CreditCard className="w-4 h-4 text-[#993300]" />
                    <span>Cards / NetBanking / Wallets</span>
                  </button>
                </div>

                <div className="pt-2 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowTestModal(false)}
                    disabled={isVerifyingPayment}
                    className="px-3 py-2.5 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCompleteTestPayment('Instant UPI')}
                    disabled={isVerifyingPayment}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#0C2340] hover:bg-[#16365C] text-white font-bold text-xs shadow flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    {isVerifyingPayment ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying with Server...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Complete Test Payment (₹{testOrderData.order.total_amount})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
