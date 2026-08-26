import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  Firestore
} from 'firebase/firestore';
import {
  Product,
  Category,
  Order,
  PaymentStatus,
  Customer,
  Recipe,
  Banner,
  Offer,
  Review,
  BusinessSettings,
  AdminAuditLog,
  Lead
} from '../src/types';

interface DatabaseSchema {
  products: Product[];
  categories: Category[];
  orders: Order[];
  customers: Customer[];
  recipes: Recipe[];
  banners: Banner[];
  offers: Offer[];
  reviews: Review[];
  settings: BusinessSettings;
  auditLogs: AdminAuditLog[];
  leads: Lead[];
}

const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

const INITIAL_SETTINGS: BusinessSettings = {
  business_name: 'Indima Spice Co.',
  tagline_en: "Pure as mother's love",
  tagline_kn: 'ತಾಯಿಯ ಪ್ರೀತಿಯಷ್ಟೇ ಪರಿಶುದ್ಧ',
  tagline_sa: 'आयुर्वेदोऽमृतानाम् • शुद्धं सात्त्विकं दिव्यम्',
  logo_url: '/logo.png',
  phone: '+91 98450 12345',
  whatsapp_number: '919845012345',
  email: 'care@indimaspice.com',
  address_line1: '#42, Traditional Kitchen Heritage Lane, Bull Temple Road',
  address_line2: 'Basavanagudi',
  city: 'Bengaluru',
  state: 'Karnataka',
  pincode: '560004',
  upi_id: 'indimaspice@okaxis',
  upi_merchant_name: 'Indima Spice Co.',
  upi_qr_code_url: '',
  instagram_url: 'https://instagram.com/indimaspiceco',
  facebook_url: 'https://facebook.com/indimaspiceco',
  youtube_url: 'https://youtube.com/@indimaspiceco',
  twitter_url: 'https://twitter.com/indimaspiceco',
  address: '#42, Traditional Kitchen Heritage Lane, Bull Temple Road, Basavanagudi, Bengaluru, Karnataka - 560004',
  free_delivery_threshold: 499,
  standard_shipping_fee: 49,
  floating_whatsapp_enabled: true,
  default_whatsapp_msg_en: 'Namaskara Indima Spice Co! I would like to inquire about your traditional pure spices.',
  default_whatsapp_msg_kn: 'ನಮಸ್ಕಾರ ಇಂದಿಮಾ ಸ್ಪೈಸ್ ಕಂ! ನಿಮ್ಮ ಸಾಂಪ್ರದಾಯಿಕ ಮಸಾಲೆಗಳ ಬಗ್ಗೆ ವಿಚಾರಿಸಬೇಕಾಗಿದೆ.',
  whatsapp_api_configured: false,
  admin_password: process.env.ADMIN_PASSWORD || 'indima@2026',
  policy_privacy_en: 'At Indima Spice Co., we prioritize your privacy. We collect minimal customer contact and Pan-India delivery address information purely to process and safely fulfill your spice orders. We do not sell or trade your personal details with third parties.',
  policy_privacy_kn: 'ಇಂದಿಮಾ ಸ್ಪೈಸ್ ಕಂ. ನಲ್ಲಿ ನಿಮ್ಮ ಗೌಪ್ಯತೆಗೆ ನಾವು ಮೊದಲ ಆದ್ಯತೆ ನೀಡುತ್ತೇವೆ. ನಿಮ್ಮ ಆರ್ಡರ್‌ಗಳನ್ನು ತಲುಪಿಸಲು ಮಾತ್ರ ನಾವು ಅಗತ್ಯ ವಿಳಾಸ ಮತ್ತು ಫೋನ್ ವಿವರಗಳನ್ನು ಬಳಸುತ್ತೇವೆ. ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಬೇರೆಯವರಿಗೆ ಮಾರಾಟ ಮಾಡುವುದಿಲ್ಲ.',
  policy_terms_en: 'All Indima Spice Co. products are crafted using 100% natural, farm-sourced whole spices and authentic traditional formulations. Prices are in Indian Rupees (INR) and include applicable taxes.',
  policy_terms_kn: 'ಇಂದಿಮಾ ಸ್ಪೈಸ್ ಕಂ ಉತ್ಪನ್ನಗಳು 100% ನೈಸರ್ಗಿಕ ಮತ್ತು ಸಾಂಪ್ರದಾಯಿಕ ವಿಧಾನದಲ್ಲಿ ತಯಾರಿಸಲ್ಪಟ್ಟಿವೆ. ಎಲ್ಲಾ ಬೆಲೆಗಳು ಭಾರತೀಯ ರೂಪಾಯಿಗಳಲ್ಲಿವೆ (INR).',
  policy_refund_en: 'Due to the consumable nature of food and spice products, returns are accepted within 48 hours of delivery only if the package arrived damaged, tampered with, or incorrect. Verified refunds will be credited via original UPI within 3-5 business days.',
  policy_refund_kn: 'ಆಹಾರ ಉತ್ಪನ್ನಗಳಾದ ಕಾರಣ, ಪ್ಯಾಕೆಟ್ ಹಾನಿಯಾಗಿದ್ದರೆ ಅಥವಾ ತಪ್ಪಾಗಿ ಬಂದಿದ್ದರೆ ಮಾತ್ರ ವಿತರಣೆಯ 48 ಗಂಟೆಗಳ ಒಳಗೆ ಬದಲಿ ಅಥವಾ ಮರುಪಾವತಿ ನೀಡಲಾಗುತ್ತದೆ.',
  policy_shipping_en: 'We ship across India via trusted express courier partners. Free shipping on all orders above ₹499. Orders are freshly ground and dispatched within 24 hours.',
  policy_shipping_kn: 'ನಾವು ಭಾರತದಾದ್ಯಂತ ಎಕ್ಸ್‌ಪ್ರೆಸ್ ಕೊರಿಯರ್ ಮೂಲಕ ವಿತರಿಸುತ್ತೇವೆ. ₹499 ಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ಆರ್ಡರ್‌ಗಳಿಗೆ ಉಚಿತ ವಿತರಣೆ.'
};

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-karnataka-specials',
    name_en: 'Karnataka Specials',
    name_kn: 'ಕರ್ನಾಟಕದ ವಿಶೇಷಗಳು',
    description_en: 'Authentic heritage blends crafted according to traditional regional recipes.',
    description_kn: 'ಕರ್ನಾಟಕದ ಸಾಂಪ್ರದಾಯಿಕ ಅಡುಗೆ ಮನೆಗಳಿಂದ ನೇರವಾಗಿ ಬಂದ ನೈಜ ಮಸಾಲೆಗಳು.',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
    enabled: true,
    order: 1
  },
  {
    id: 'cat-masala-powders',
    name_en: 'Masala Powders',
    name_kn: 'ಮಸಾಲೆ ಪುಡಿಗಳು',
    description_en: 'Daily kitchen essentials, stone-ground without chemicals or colorants.',
    description_kn: 'ದೈನಂದಿನ ಅಡುಗೆಗೆ ಬೇಕಾದ ಶುದ್ಧ, ಕಲ್ಲಿನಲ್ಲಿ ಬೀಸಿದ ಮಸಾಲೆ ಪುಡಿಗಳು.',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80',
    enabled: true,
    order: 2
  },
  {
    id: 'cat-whole-spices',
    name_en: 'Whole Spices',
    name_kn: 'ಕಾಳು ಮಸಾಲೆಗಳು',
    description_en: 'Sun-dried aromatic whole spices sourced from trusted plantations.',
    description_kn: 'ತೋಟಗಳಿಂದ ನೇರವಾಗಿ ಆರಿಸಿದ, ಬಿಸಿಲಿನಲ್ಲಿ ಒಣಗಿಸಿದ ಕಾಳು ಮಸಾಲೆಗಳು.',
    image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=600&auto=format&fit=crop&q=80',
    enabled: true,
    order: 3
  },
  {
    id: 'cat-traditional-blends',
    name_en: 'Traditional Blends',
    name_kn: 'ಸಾಂಪ್ರದಾಯಿಕ ಮಿಶ್ರಣಗಳು',
    description_en: 'Aromatic Garam Masalas, Curry Powders, and Rasam specialities.',
    description_kn: 'ಗರಂ ಮಸಾಲೆಗಳು, ಸಾಂಬಾರ್ ಮತ್ತು ರಸಂಗೆ ಬೇಕಾದ ಸುಗಂಧಯುಕ್ತ ಮಿಶ್ರಣಗಳು.',
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop&q=80',
    enabled: true,
    order: 4
  },
  {
    id: 'cat-combo-packs',
    name_en: 'Combo Value Packs',
    name_kn: 'ಕಾಂಬೋ ಪ್ಯಾಕ್‌ಗಳು',
    description_en: 'Curated value bundles for festival gifting and complete kitchen pantries.',
    description_kn: 'ಹಬ್ಬದ ಉಡುಗೊರೆಗೆ ಮತ್ತು ಇಡೀ ತಿಂಗಳ ಅಡುಗೆಗೆ ಅನುಕೂಲಕರ ಕಾಂಬೋ ಪ್ಯಾಕ್‌ಗಳು.',
    image: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=600&auto=format&fit=crop&q=80',
    enabled: true,
    order: 5
  }
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-bisibelebath',
    sku: 'IND-BBB-200',
    name_en: 'Traditional Mysuru Bisi Bele Bath Powder',
    name_kn: 'ಸಾಂಪ್ರದಾಯಿಕ ಮೈಸೂರು ಬಿಸಿಬೇಳೆಬಾತ್ ಪುಡಿ',
    description_en: 'Authentic royal Mysore style Bisi Bele Bath masala made with slow-roasted Byadgi chillies, Marathi Moggu, stone flower (Kalpasi), and cinnamon in cold-pressed coconut oil touch.',
    description_kn: 'ಬ್ಯಾಡಗಿ ಮೆಣಸು, ಮರಾಠಿ ಮೊಗ್ಗು, ಕಲ್ಫಾಸಿ ಮತ್ತು ಸಾಂಪ್ರದಾಯಿಕ ಸಾಂಬಾರ ಪದಾರ್ಥಗಳನ್ನು ಮಂದ ಉರಿಯಲ್ಲಿ ಹುರಿದು ಸಿದ್ಧಪಡಿಸಿದ ಅಪ್ಪಟ ಮೈಸೂರು ಶೈಲಿಯ ಬಿಸಿಬೇಳೆಬಾತ್ ಪುಡಿ.',
    ingredients_en: 'Byadgi Chillies, Coriander Seeds, Chana Dal, Urad Dal, Cinnamon, Marathi Moggu, Cloves, Fenugreek, Cumin, Poppy Seeds, Copra, Curry Leaves.',
    ingredients_kn: 'ಬ್ಯಾಡಗಿ ಮೆಣಸಿನಕಾಯಿ, ಕೊತ್ತಂಬರಿ ಬೀಜ, ಕಡಲೆಬೇಳೆ, ಉದ್ದಿನಬೇಳೆ, ದಾಲ್ಚಿನ್ನಿ, ಮರಾಠಿ ಮೊಗ್ಗು, ಲವಂಗ, ಮೆಂತ್ಯ, ಜೀರಿಗೆ, ಗಸಗಸೆ, ಒಣಕೊಬ್ಬರಿ, ಕರಿಬೇವಿನ ಎಲೆ.',
    category_id: 'cat-karnataka-specials',
    weight: '200g',
    shelf_life: '12 Months',
    storage_en: 'Store in an airtight container in a cool, dry place. Keep away from direct sunlight.',
    storage_kn: 'ಗಾಳಿಯಾಡದ ಡಬ್ಬಿಯಲ್ಲಿ ತಂಪಾದ, ಒಣ ಸ್ಥಳದಲ್ಲಿ ಇರಿಸಿ. ನೇರ ಸೂರ್ಯನ ಬೆಳಕಿನಿಂದ ದೂರವಿಡಿ.',
    traditional_info_en: 'Stone-milled in small batches in Basavanagudi to preserve volatile essential oils.',
    traditional_info_kn: 'ನೈಸರ್ಗಿಕ ಸುವಾಸನೆ ಮತ್ತು ತೈಲಾಂಶಗಳನ್ನು ಸಂರಕ್ಷಿಸಲು ಬಸವನಗುಡಿಯಲ್ಲಿ ಸಣ್ಣ ಪ್ರಮಾಣದಲ್ಲಿ ಕಲ್ಲಿನಿಂದ ಬೀಸಲಾಗುತ್ತದೆ.',
    mrp: 180,
    price: 145,
    discount_percentage: 19,
    stock: 85,
    low_stock_threshold: 15,
    images: [
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80'
    ],
    badges: ['bestseller', 'homemade', 'natural'],
    active: true,
    rating: 4.9,
    review_count: 142,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-rasam-powder',
    sku: 'IND-RSM-250',
    name_en: 'Heritage Maniyara Rasam (Saaru) Powder',
    name_kn: 'ಪಾರಂಪರಿಕ ಮನೆಯ ರಸಂ (ಸಾರಿನ) ಪುಡಿ',
    description_en: 'A golden digestive broth masala slow-roasted with Salem turmeric, Malabar black pepper, cumin seeds, and mountain coriander. Warm, comforting, and soul-satisfying.',
    description_kn: 'ಸೇಲಂ ಅರಿಶಿನ, ಕಾಳುಮೆಣಸು, ಜೀರಿಗೆ ಮತ್ತು ಸುವಾಸನೆಯ ಕೊತ್ತಂಬರಿ ಬೀಜಗಳಿಂದ ತಯಾರಾದ, ಜೀರ್ಣಶಕ್ತಿಗೆ ಅತ್ಯುತ್ತಮವಾದ ಮನೆಯ ಸಾರಿನ ಪುಡಿ.',
    ingredients_en: 'Coriander, Cumin, Black Pepper, Red Chillies, Turmeric, Fenugreek, Mustard Seeds, Curry Leaves, Asafoetida (Hing).',
    ingredients_kn: 'ಧನಿಯಾ, ಜೀರಿಗೆ, ಕಾಳುಮೆಣಸು, ಕೆಂಪು ಮೆಣಸು, ಅರಿಶಿನ, ಮೆಂತ್ಯ, ಸಾಸಿವೆ, ಕರಿಬೇವಿನ ಸೊಪ್ಪು, ಇಂಗು.',
    category_id: 'cat-karnataka-specials',
    weight: '250g',
    shelf_life: '12 Months',
    storage_en: 'Use a dry spoon. Keep lid sealed tightly.',
    storage_kn: 'ಒಣಗಿದ ಚಮಚ ಬಳಸಿ. ಡಬ್ಬದ ಮುಚ್ಚಳವನ್ನು ಬಿಗಿಯಾಗಿ ಮುಚ್ಚಿ.',
    traditional_info_en: 'Prepared according to grandmother’s South Karnataka digestive recipe.',
    traditional_info_kn: 'ದಕ್ಷಿಣ ಕರ್ನಾಟಕದ ಅಜ್ಜಿ ಮನೆಯ ಕೈರುಚಿಯ ಪುರಾತನ ವಿಧಾನದಂತೆ ತಯಾರಿಸಲಾಗಿದೆ.',
    mrp: 195,
    price: 155,
    discount_percentage: 20,
    stock: 120,
    low_stock_threshold: 20,
    images: [
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80'
    ],
    badges: ['bestseller', 'natural'],
    active: true,
    rating: 4.8,
    review_count: 98,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-udupi-sambar',
    sku: 'IND-SMB-250',
    name_en: 'Traditional Udupi Temple Sambar Masala',
    name_kn: 'ಸಾಂಪ್ರದಾಯಿಕ ಉಡುಪಿ ದೇವಸ್ಥಾನ ಶೈಲಿಯ ಸಾಂಬಾರ್ ಪುಡಿ',
    description_en: 'Authentic mild sweet-spicy coconut roasted Udupi sambar masala with rich hing and whole fenugreek.',
    description_kn: 'ಉಡುಪಿ ಶೈಲಿಯ ಕಾಯಿ ಹುರಿದ ಸುವಾಸನೆಯುಕ್ತ, ಇಂಗು ಮಿಶ್ರಿತ ರುಚಿಕರ ಸಾಂಬಾರ್ ಪುಡಿ.',
    ingredients_en: 'Coriander, Red Chillies, Chana Dal, Toor Dal, Fenugreek, Cumin, Mustard, Turmeric, Asafoetida.',
    ingredients_kn: 'ಕೊತ್ತಂಬರಿ, ಕೆಂಪು ಮೆಣಸು, ಕಡಲೆಬೇಳೆ, ತೊಗರಿಬೇಳೆ, ಮೆಂತ್ಯ, ಜೀರಿಗೆ, ಸಾಸಿವೆ, ಅರಿಶಿನ, ಶುದ್ಧ ಇಂಗು.',
    category_id: 'cat-masala-powders',
    weight: '250g',
    shelf_life: '12 Months',
    storage_en: 'Keep in an airtight jar.',
    storage_kn: 'ಗಾಳಿಯಾಡದ ಭರಣಿಯಲ್ಲಿ ಇರಿಸಿ.',
    traditional_info_en: 'Temple kitchen inspired formulation with zero onion or garlic.',
    traditional_info_kn: 'ದೇವಸ್ಥಾನದ ಮಡಿಯ ಶೈಲಿಯಲ್ಲಿ ಈರುಳ್ಳಿ-ಬೆಳ್ಳುಳ್ಳಿ ರಹಿತವಾಗಿ ತಯಾರಿಸಲಾಗಿದೆ.',
    mrp: 175,
    price: 139,
    discount_percentage: 20,
    stock: 94,
    low_stock_threshold: 15,
    images: [
      'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&auto=format&fit=crop&q=80'
    ],
    badges: ['natural', 'homemade'],
    active: true,
    rating: 4.9,
    review_count: 87,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-puliyogare-mix',
    sku: 'IND-PLY-200',
    name_en: 'Melukote Style Puliyogare Gojju Mix',
    name_kn: 'ಮೇಲುಕೋಟೆ ಶೈಲಿಯ ಸಾಂಪ್ರದಾಯಿಕ ಪುಳಿಯೋಗರೆ ಪುಡಿ',
    description_en: 'Rich tamarind-spiced traditional dry blend packed with white sesame seeds, black pepper, and roasted spices for instant temple-style tamarind rice.',
    description_kn: 'ಮೇಲುಕೋಟೆಯ ದೇವಸ್ಥಾನದ ರುಚಿಯನ್ನು ನೆನಪಿಸುವ ಎಳ್ಳು, ಮೆಣಸು ಮತ್ತು ಹುಣಸೆ ರುಚಿಯ ಅದ್ಭುತ ಪುಳಿಯೋಗರೆ ಮಸಾಲೆ ಪುಡಿ.',
    ingredients_en: 'Red Chillies, White Sesame, Coriander, Black Pepper, Fenugreek, Mustard, Cumin, Asafoetida, Turmeric, Curry Leaves.',
    ingredients_kn: 'ಕೆಂಪು ಮೆಣಸು, ಬಿಳಿ ಎಳ್ಳು, ಕೊತ್ತಂಬರಿ, ಕಾಳುಮೆಣಸು, ಮೆಂತ್ಯ, ಸಾಸಿವೆ, ಜೀರಿಗೆ, ಇಂಗು, ಅರಿಶಿನ, ಕರಿಬೇವಿನ ಎಲೆ.',
    category_id: 'cat-karnataka-specials',
    weight: '200g',
    shelf_life: '9 Months',
    storage_en: 'Store in a cool dry place.',
    storage_kn: 'ತಂಪಾದ ಒಣ ಸ್ಥಳದಲ್ಲಿ ಶೇಖರಿಸಿ.',
    traditional_info_en: 'Slow-roasted sesame seed technique inspired by Iyengar heritage.',
    traditional_info_kn: 'ಐಯ್ಯಂಗಾರ್ ಪರಂಪರೆಯ ಸಾಂಪ್ರದಾಯಿಕ ಎಳ್ಳು ಹುರಿಯುವ ವಿಧಾನದಲ್ಲಿ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ.',
    mrp: 160,
    price: 129,
    discount_percentage: 19,
    stock: 64,
    low_stock_threshold: 10,
    images: [
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80'
    ],
    badges: ['bestseller', 'festival_special'],
    active: true,
    rating: 5.0,
    review_count: 110,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-byadgi-chillies',
    sku: 'IND-BYD-250',
    name_en: 'Authentic Byadgi Whole Red Chillies (Karnataka GI Tagged)',
    name_kn: 'ಅಪ್ಪಟ ಬ್ಯಾಡಗಿ ಕೆಂಪು ಮೆಣಸಿನಕಾಯಿ (ಕರ್ನಾಟಕ ಜಿಐ ಟ್ಯಾಗ್)',
    description_en: 'Deep crimson, naturally wrinkled, low pungency whole chillies famous for conferring breathtaking natural red color and smoky aroma without excessive heat.',
    description_kn: 'ಅತ್ಯುತ್ತಮ ನೈಸರ್ಗಿಕ ಕೆಂಪು ಬಣ್ಣ ಮತ್ತು ಸುವಾಸನೆಯನ್ನು ನೀಡುವ, ಕಡಿಮೆ ಖಾರವಿರುವ ಅಪ್ಪಟ ಬ್ಯಾಡಗಿ ಮೆಣಸಿನಕಾಯಿ.',
    ingredients_en: '100% Pure Byadgi Whole Red Chillies with Stems Intact.',
    ingredients_kn: '100% ಅಪ್ಪಟ ತೊಟ್ಟು ಸಹಿತ ಬ್ಯಾಡಗಿ ಕೆಂಪು ಮೆಣಸಿನಕಾಯಿ.',
    category_id: 'cat-whole-spices',
    weight: '250g',
    shelf_life: '12 Months',
    storage_en: 'Sun-dry occasionally and store in moisture-proof container.',
    storage_kn: 'ಆಗಾಗ ಬಿಸಿಲಿನಲ್ಲಿ ಒಣಗಿಸಿ ತೇವಾಂಶವಿಲ್ಲದ ಡಬ್ಬದಲ್ಲಿ ಇರಿಸಿ.',
    traditional_info_en: 'Directly sourced from Haveri farmers market, sun-dried on clean stone patios.',
    traditional_info_kn: 'ಹಾವೇರಿ ರೈತರಿಂದ ನೇರವಾಗಿ ಸಂಗ್ರಹಿಸಿ, ನೈಸರ್ಗಿಕ ಬಿಸಿಲಿನಲ್ಲಿ ಒಣಗಿಸಲಾಗಿದೆ.',
    mrp: 220,
    price: 179,
    discount_percentage: 18,
    stock: 45,
    low_stock_threshold: 10,
    images: [
      'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&auto=format&fit=crop&q=80'
    ],
    badges: ['natural', 'featured'],
    active: true,
    rating: 4.9,
    review_count: 65,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-coorg-pepper',
    sku: 'IND-CRG-200',
    name_en: 'Coorg High-Altitude Black Pepper (Tellicherry Grade)',
    name_kn: 'ಕೊಡಗು ಬೆಟ್ಟದ ಅಪ್ಪಟ ಕಪ್ಪು ಕಾಳುಮೆಣಸು',
    description_en: 'Bold, piperine-rich whole black peppercorns shade-grown alongside coffee bushes in the misty hills of Madikeri, Kodagu.',
    description_kn: 'ಕೊಡಗಿನ ಕಾಫಿ ತೋಟಗಳಲ್ಲಿ ಬೆಳೆದ, ಅಧಿಕ ಪೈಪರೀನ್ ಅಂಶವಿರುವ ಅಪ್ಪಟ ಘಾಟಿನ ಕಪ್ಪು ಕಾಳುಮೆಣಸು.',
    ingredients_en: '100% Pure High Grade Coorg Peppercorns.',
    ingredients_kn: '100% ಶುದ್ಧ ಕೊಡಗಿನ ಕಾಳುಮೆಣಸು.',
    category_id: 'cat-whole-spices',
    weight: '200g',
    shelf_life: '24 Months',
    storage_en: 'Store whole and grind fresh right before cooking for maximum aroma.',
    storage_kn: 'ಸಂಪೂರ್ಣ ಕಾಳುಗಳನ್ನೇ ಸಂಗ್ರಹಿಸಿ, ಅಡುಗೆ ಮಾಡುವಾಗ ತಾಜಾವಾಗಿ ಪುಡಿಮಾಡಿ.',
    traditional_info_en: 'Shade-grown under native rainforest canopies in Western Ghats.',
    traditional_info_kn: 'ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಮಳೆಕಾಡುಗಳ ನೆರಳಿನಲ್ಲಿ ನೈಸರ್ಗಿಕವಾಗಿ ಬೆಳೆದದ್ದು.',
    mrp: 260,
    price: 210,
    discount_percentage: 19,
    stock: 58,
    low_stock_threshold: 12,
    images: [
      'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&auto=format&fit=crop&q=80'
    ],
    badges: ['bestseller', 'natural'],
    active: true,
    rating: 5.0,
    review_count: 73,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-malnad-garam-masala',
    sku: 'IND-GRM-150',
    name_en: 'Stone-Ground Malnad Garam Masala',
    name_kn: 'ಕಲ್ಲಿನಲ್ಲಿ ಬೀಸಿದ ಮಲೆನಾಡು ಗರಂ ಮಸಾಲೆ',
    description_en: 'An intensely fragrant royal blend of green cardamom, star anise, nutmeg, mace, cinnamon quill, and cloves. Enhances curries and biryanis with a tiny pinch.',
    description_kn: 'ಏಲಕ್ಕಿ, ಜಾವಿತ್ರಿ, ಜಾಯಿಕಾಯಿ, ಲವಂಗ, ಚಕ್ಕೆ ಮತ್ತು ಅನಾನಸ್ ಹೂವುಗಳ ಸುಗಂಧಭರಿತ ರಾಜಮನೆತನದ ಗರಂ ಮಸಾಲೆ.',
    ingredients_en: 'Green Cardamom, Cloves, Cinnamon, Star Anise, Nutmeg, Mace, Black Pepper, Cumin, Bay Leaf, Shahi Jeera.',
    ingredients_kn: 'ಹಸಿರು ಏಲಕ್ಕಿ, ಲವಂಗ, ದಾಲ್ಚಿನ್ನಿ, ಅನಾನಸ್ ಹೂ, ಜಾಯಿಕಾಯಿ, ಜಾವಿತ್ರಿ, ಕಾಳುಮೆಣಸು, ಜೀರಿಗೆ, ಪಲಾವ್ ಎಲೆ, ಶಾಹಿ ಜೀರಿಗೆ.',
    category_id: 'cat-traditional-blends',
    weight: '150g',
    shelf_life: '12 Months',
    storage_en: 'Keep sealed tightly to preserve volatile aromatic oils.',
    storage_kn: 'ಸುವಾಸನೆ ಉಳಿಯಲು ಗಾಳಿಯಾಡದಂತೆ ಬಿಗಿಯಾಗಿ ಮುಚ್ಚಿಡಿ.',
    traditional_info_en: 'Cold-ground at low RPM to ensure essential aromatics never evaporate.',
    traditional_info_kn: 'ಕಡಿಮೆ ವೇಗದ ಕಲ್ಲಿನ ಬೀಸುವಿಕೆಯಿಂದ ಸುವಾಸನೆಯ ತೈಲಗಳು ಆವಿಯಾಗದಂತೆ ರಕ್ಷಿಸಲಾಗಿದೆ.',
    mrp: 230,
    price: 185,
    discount_percentage: 19,
    stock: 72,
    low_stock_threshold: 15,
    images: [
      'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&auto=format&fit=crop&q=80'
    ],
    badges: ['homemade', 'featured'],
    active: true,
    rating: 4.9,
    review_count: 54,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-karnataka-combo-festive',
    sku: 'IND-BOX-FEST-6',
    name_en: 'Karnataka Grand Festive Spice Box (Set of 6 Essentials)',
    name_kn: 'ಕರ್ನಾಟಕ ಗ್ರ್ಯಾಂಡ್ ಹಬ್ಬದ ಮಸಾಲೆ ಬಾಕ್ಸ್ (೬ ಪ್ರಮುಖ ಮಸಾಲೆಗಳು)',
    description_en: 'The complete heritage kitchen collection: Mysuru Bisi Bele Bath (200g), Maniyara Rasam (250g), Udupi Sambar (250g), Melukote Puliyogare (200g), Coorg Black Pepper (100g), and Malnad Garam Masala (100g).',
    description_kn: 'ಸಂಪೂರ್ಣ ಸಾಂಪ್ರದಾಯಿಕ ಅಡುಗೆಮನೆ ಕಿಟ್: ಬಿಸಿಬೇಳೆಬಾತ್ (200g), ರಸಂ (250g), ಸಾಂಬಾರ್ (250g), ಪುಳಿಯೋಗರೆ (200g), ಕಾಳುಮೆಣಸು (100g) ಮತ್ತು ಗರಂ ಮಸಾಲೆ (100g).',
    ingredients_en: 'Pure 100% Traditional Multi-Spice Blends (6 Full Jars).',
    ingredients_kn: '100% ಶುದ್ಧ ೬ ಸಾಂಪ್ರದಾಯಿಕ ಮಸಾಲೆಗಳ ಸಂಪೂರ್ಣ ಪೆಟ್ಟಿಗೆ.',
    category_id: 'cat-combo-packs',
    weight: '1100g',
    shelf_life: '12 Months',
    storage_en: 'Store individual pouches in spice tins.',
    storage_kn: 'ಪ್ರತಿಯೊಂದು ಪ್ಯಾಕೆಟ್‌ಗಳನ್ನು ಒಣ ಡಬ್ಬಿಗಳಲ್ಲಿ ಇರಿಸಿ.',
    traditional_info_en: 'Packed in traditional craft gift packaging celebrating Karnataka heritage.',
    traditional_info_kn: 'ಕರ್ನಾಟಕದ ಸಂಸ್ಕೃತಿಯನ್ನು ಬಿಂಬಿಸುವ ಪರಿಸರಸ್ನೇಹಿ ಉಡುಗೊರೆ ಪೆಟ್ಟಿಗೆಯಲ್ಲಿ ಪ್ಯಾಕ್ ಮಾಡಲಾಗಿದೆ.',
    mrp: 1180,
    price: 899,
    discount_percentage: 24,
    stock: 35,
    low_stock_threshold: 8,
    images: [
      'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80'
    ],
    badges: ['festival_special', 'bestseller'],
    active: true,
    rating: 5.0,
    review_count: 189,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'rec-bisibelebath',
    title_en: 'Authentic Mysuru Bisi Bele Bath with Ghee Tadka',
    title_kn: 'ಅಪ್ಪಟ ಮೈಸೂರು ಶೈಲಿಯ ತುಪ್ಪದ ಒಗ್ಗರಣೆಯ ಬಿಸಿಬೇಳೆಬಾತ್',
    description_en: 'A wholesome one-pot Karnataka classic made with rice, toor dal, seasonal vegetables, and freshly tempered Indima Bisi Bele Bath powder.',
    description_kn: 'ಅಕ್ಕಿ, ತೊಗರಿಬೇಳೆ, ತರಕಾರಿಗಳು ಮತ್ತು ಇಂದಿಮಾ ಬಿಸಿಬೇಳೆಬಾತ್ ಪುಡಿಯೊಂದಿಗೆ ತುಪ್ಪದ ಒಗ್ಗರಣೆಯಲ್ಲಿ ತಯಾರಿಸುವ ರುಚಿಕರ ಅಡುಗೆ.',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
    prep_time: '15 Mins',
    cook_time: '25 Mins',
    servings: '4 People',
    featured_spice_ids: ['prod-bisibelebath'],
    ingredients_en: [
      '1 cup Sona Masoori Rice',
      '3/4 cup Toor Dal',
      '3 tbsp Indima Traditional Bisi Bele Bath Powder',
      '1.5 cups diced vegetables (Carrot, Beans, Green Peas, Shallots)',
      '1 small lemon sized Tamarind (extracted)',
      '2 tbsp Ghee + 1 tbsp Oil',
      'Mustard seeds, Cashews, Curry leaves & Hing for tempering',
      'Salt to taste'
    ],
    ingredients_kn: [
      '೧ ಕಪ್ ಸೋನಾ ಮಸೂರಿ ಅಕ್ಕಿ',
      '೩/೪ ಕಪ್ ತೊಗರಿಬೇಳೆ',
      '೩ ಚಮಚ ಇಂದಿಮಾ ಸಾಂಪ್ರದಾಯಿಕ ಬಿಸಿಬೇಳೆಬಾತ್ ಪುಡಿ',
      '೧.೫ ಕಪ್ ತರಕಾರಿಗಳು (ಕ್ಯಾರೆಟ್, ಬೀನ್ಸ್, ಬಟಾಣಿ, ಸಣ್ಣ ಈರುಳ್ಳಿ)',
      '೧ ನಿಂಬೆಹಣ್ಣಿನ ಗಾತ್ರದ ಹುಣಸೆಹಣ್ಣಿನ ರಸ',
      '೨ ಚಮಚ ಶುದ್ಧ ಹಸುವಿನ ತುಪ್ಪ + ೧ ಚಮಚ ಎಣ್ಣೆ',
      'ಒಗ್ಗರಣೆಗೆ: ಸಾಸಿವೆ, ಗೋಡಂಬಿ, ಕರಿಬೇವಿನ ಸೊಪ್ಪು ಮತ್ತು ಇಂಗು',
      'ರುಚಿಗೆ ತಕ್ಕಷ್ಟು ಉಪ್ಪು'
    ],
    instructions_en: [
      'Pressure cook rice and toor dal together with turmeric and 4 cups water until soft (4 whistles).',
      'In a thick-bottomed brass or heavy pot, boil the diced vegetables in tamarind water with a pinch of turmeric and salt until tender.',
      'Mix 3 tbsp of Indima Bisi Bele Bath Powder with 1/2 cup warm water into a smooth paste and add to the simmering vegetables.',
      'Add the cooked rice-dal mash, mix well, and simmer on medium flame for 7-8 minutes.',
      'Prepare hot tadka in 2 tbsp ghee with mustard seeds, crunchy cashews, hing, and fresh curry leaves. Pour over the bubbling Bisi Bele Bath and rest covered for 5 minutes before serving hot with boondi or potato chips.'
    ],
    instructions_kn: [
      'ಅಕ್ಕಿ ಮತ್ತು ತೊಗರಿಬೇಳೆಯನ್ನು ಅರಿಶಿನ ಸೇರಿಸಿ ಮೆತ್ತಗೆ ಬೇಯಿಸಿಕೊಳ್ಳಿ (೪ ವಿಷಲ್).',
      'ಒಂದು ಪಾತ್ರೆಯಲ್ಲಿ ತರಕಾರಿಗಳನ್ನು ಹುಣಸೆ ರಸ, ಸ್ವಲ್ಪ ಅರಿಶಿನ ಮತ್ತು ಉಪ್ಪಿನೊಂದಿಗೆ ಬೇಯಿಸಿ.',
      '೩ ಚಮಚ ಇಂದಿಮಾ ಬಿಸಿಬೇಳೆಬಾತ್ ಪುಡಿಯನ್ನು ಸ್ವಲ್ಪ ನೀರಿನಲ್ಲಿ ಕಲಸಿ ತರಕಾರಿಯ ಪಾತ್ರೆಗೆ ಸೇರಿಸಿ ಕುದಿಸಿ.',
      'ಬೇಯಿಸಿದ ಅನ್ನ ಮತ್ತು ಬೇಳೆ ಮಿಶ್ರಣವನ್ನು ಸೇರಿಸಿ, ೭-೮ ನಿಮಿಷಗಳ ಕಾಲ ಮಂದ ಉರಿಯಲ್ಲಿ ಚೆನ್ನಾಗಿ ಕುದಿಸಿ.',
      'ಕೊನೆಯಲ್ಲಿ ಬಿಸಿ ತುಪ್ಪದಲ್ಲಿ ಸಾಸಿವೆ, ಗೋಡಂಬಿ, ಇಂಗು ಮತ್ತು ಕರಿಬೇವಿನ ಒಗ್ಗರಣೆ ಹಾಕಿ ಬಿಸಿಬಿಸಿಯಾಗಿ ಬೂಂದಿಯೊಂದಿಗೆ ಸವಿಯಿರಿ.'
    ],
    active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'rec-maniyara-rasam',
    title_en: 'Traditional Karnataka Tomato-Pepper Saaru',
    title_kn: 'ಸಾಂಪ್ರದಾಯಿಕ ಕರ್ನಾಟಕ ಟೊಮೆಟೊ-ಮೆಣಸಿನ ಸಾರು',
    description_en: 'A revitalizing digestive broth flavored with fresh country tomatoes, curry leaves, and Indima Heritage Rasam Powder.',
    description_kn: 'ನಾಟಿ ಟೊಮೆಟೊ, ಬೆಳ್ಳುಳ್ಳಿ/ಇಂಗು ಮತ್ತು ಇಂದಿಮಾ ರಸಂ ಪುಡಿಯಿಂದ ತಯಾರಿಸಿದ ಸಾಂಪ್ರದಾಯಿಕ ಸಾರು.',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
    prep_time: '5 Mins',
    cook_time: '12 Mins',
    servings: '4 People',
    featured_spice_ids: ['prod-rasam-powder'],
    ingredients_en: [
      '2 ripe country Tomatoes (finely chopped)',
      '1.5 tbsp Indima Heritage Rasam Powder',
      '1 cup cooked Toor Dal water',
      'Small piece of Jaggery',
      'Curry leaves and fresh Coriander',
      '1 tsp Ghee for tempering with Mustard & Hing',
      'Salt to taste'
    ],
    ingredients_kn: [
      '೨ ನಾಟಿ ಟೊಮೆಟೊ (ಸಣ್ಣಗೆ ಹೆಚ್ಚಿದ್ದು)',
      '೧.೫ ಚಮಚ ಇಂದಿಮಾ ಪಾರಂಪರಿಕ ರಸಂ ಪುಡಿ',
      '೧ ಕಪ್ ಬೇಯಿಸಿದ ತೊಗರಿಬೇಳೆಯ ನೀರು (ಕಟ್ಟು)',
      'ಸ್ವಲ್ಪ ಬೆಲ್ಲ',
      'ಕರಿಬೇವು ಮತ್ತು ತಾಜಾ ಕೊತ್ತಂಬರಿ ಸೊಪ್ಪು',
      'ಒಗ್ಗರಣೆಗೆ ತುಪ್ಪ, ಸಾಸಿವೆ ಮತ್ತು ಇಂಗು',
      'ರುಚಿಗೆ ತಕ್ಕಷ್ಟು ಉಪ್ಪು'
    ],
    instructions_en: [
      'Boil chopped tomatoes in 2 cups water with turmeric, slit green chilli, and salt until mushy.',
      'Add Indima Heritage Rasam Powder, jaggery, and cooked dal water. Bring to a gentle frothy boil.',
      'Once frothy on top, turn off the flame immediately without over-boiling.',
      'Temper with ghee, mustard seeds, and generous hing. Garnish with fresh coriander and serve hot.'
    ],
    instructions_kn: [
      'ಟೊಮೆಟೊವನ್ನು ನೀರಿನಲ್ಲಿ ಅರಿಶಿನ ಮತ್ತು ಉಪ್ಪಿನೊಂದಿಗೆ ಚೆನ್ನಾಗಿ ಬೇಯಿಸಿ.',
      'ಇಂದಿಮಾ ರಸಂ ಪುಡಿ, ಬೆಲ್ಲ ಮತ್ತು ಬೇಳೆ ನೀರು ಸೇರಿಸಿ ಮಂದ ಉರಿಯಲ್ಲಿ ನೊರೆ ಬರುವವರೆಗೆ ಕುದಿಸಿ.',
      'ಮೇಲೆ ನೊರೆ ಬಂದ ತಕ್ಷಣ ಉರಿ ಆರಿಸಿ, ತುಪ್ಪದ ಒಗ್ಗರಣೆ ನೀಡಿ ಕೊತ್ತಂಬರಿ ಸೊಪ್ಪಿನಿಂದ ಅಲಂಕರಿಸಿ.'
    ],
    active: true,
    created_at: new Date().toISOString()
  }
];

const INITIAL_BANNERS: Banner[] = [
  {
    id: 'ban-hero-main',
    type: 'hero',
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1600&auto=format&fit=crop&q=80',
    fallback_image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1600&auto=format&fit=crop&q=80',
    badge_en: 'Festival of Flavours • ಹಬ್ಬದ ಸಂಭ್ರಮ',
    badge_kn: 'ಸುವಾಸನೆಗಳ ಹಬ್ಬ • ಪಾರಂಪರಿಕ ಮಸಾಲೆ',
    title_en: 'From Nature to Your Kitchen — With Purity, Care & Tradition',
    title_kn: 'ಪ್ರಕೃತಿಯಿಂದ ನಿಮ್ಮ ಅಡುಗೆಮನೆಗೆ — ಪರಿಶುದ್ಧತೆ, ಪ್ರೀತಿ ಮತ್ತು ಸಂಪ್ರದಾಯ',
    subtitle_en: 'Handcrafted Karnataka spice blends, stone-ground with motherly love and authentic traditional recipes.',
    subtitle_kn: 'ತಾಯಿಯ ಕೈರುಚಿಯಂತೆ, ಸಾಂಪ್ರದಾಯಿಕ ಕಲ್ಲಿನ ಬೀಸುವ ಪದ್ಧತಿಯಲ್ಲಿ ತಯಾರಿಸಲಾದ ಕರ್ನಾಟಕದ ಅಪ್ಪಟ ಮಸಾಲೆಗಳು.',
    offer_text_en: 'Festive Special: FREE Delivery on orders above ₹499 + Up to 25% OFF',
    offer_text_kn: 'ವಿಶೇಷ ಹಬ್ಬದ ಕೊಡುಗೆ: ₹೪೯೯ ಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ಆರ್ಡರ್‌ಗಳಿಗೆ ಉಚಿತ ಡೆಲಿವರಿ + ೨೫% ವರೆಗೆ ರಿಯಾಯಿತಿ',
    festival_greeting_en: 'Shubhashayagalu! Welcome to Authentic Karnataka Spices',
    festival_greeting_kn: 'ಹಬ್ಬದ ಹಾರ್ದಿಕ ಶುಭಾಶಯಗಳು! ಅಪ್ಪಟ ಕರ್ನಾಟಕದ ಮಸಾಲೆಗಳಿಗೆ ಸ್ವಾಗತ',
    primary_btn_text_en: 'Shop Pure Spices',
    primary_btn_text_kn: 'ಮಸಾಲೆಗಳನ್ನು ಖರೀದಿಸಿ',
    primary_btn_action: '#products-section',
    secondary_btn_text_en: 'View Combos & Offers',
    secondary_btn_text_kn: 'ಕೊಡುಗೆಗಳನ್ನು ನೋಡಿ',
    secondary_btn_action: '#offers-section',
    enabled: true
  },
  {
    id: 'ban-fest-diwali',
    type: 'festival',
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=1200&auto=format&fit=crop&q=80',
    badge_en: 'Festive Heritage Sale',
    badge_kn: 'ಹಬ್ಬದ ವಿಶೇಷ ಮಾರಾಟ',
    title_en: 'Karnataka Grand Festive Gift Box',
    title_kn: 'ಕರ್ನಾಟಕ ಗ್ರಾಂಡ್ ಹಬ್ಬದ ಉಡುಗೊರೆ ಬಾಕ್ಸ್',
    subtitle_en: 'The auspicious gift of pure aroma and good health for family and loved ones.',
    subtitle_kn: 'ಕುಟುಂಬ ಮತ್ತು ಬಂಧು-ಮಿತ್ರರಿಗೆ ಪರಿಶುದ್ಧ ಸುವಾಸನೆ ಮತ್ತು ಆರೋಗ್ಯದ ಶ್ರೇಷ್ಠ ಉಡುಗೊರೆ.',
    offer_text_en: 'Special Flat ₹280 OFF on Grand Box • Code: INDIMA10',
    offer_text_kn: 'ಗ್ರ್ಯಾಂಡ್ ಬಾಕ್ಸ್ ಮೇಲೆ ₹೨೮೦ ನೇರ ರಿಯಾಯಿತಿ • ಕೋಡ್: INDIMA10',
    primary_btn_text_en: 'Order Gift Box',
    primary_btn_text_kn: 'ಉಡುಗೊರೆ ಬಾಕ್ಸ್ ಖರೀದಿಸಿ',
    primary_btn_action: '#products-section',
    secondary_btn_text_en: 'Chat on WhatsApp',
    secondary_btn_text_kn: 'ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ವಿಚಾರಿಸಿ',
    secondary_btn_action: 'whatsapp',
    enabled: true
  }
];

const INITIAL_OFFERS: Offer[] = [
  {
    id: 'off-welcome10',
    code: 'INDIMA10',
    title_en: '10% Welcome Festive Discount',
    title_kn: 'ಮೊದಲ ಖರೀದಿಯ ಮೇಲೆ 10% ರಿಯಾಯಿತಿ',
    description_en: 'Get flat 10% instant festive discount on orders above ₹399 across all spice blends.',
    description_kn: '₹೩೯೯ ಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ಎಲ್ಲಾ ಆರ್ಡರ್‌ಗಳ ಮೇಲೆ ತಕ್ಷಣದ 10% ಹಬ್ಬದ ರಿಯಾಯಿತಿ ಪಡೆಯಿರಿ.',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 399,
    max_discount_amount: 150,
    active: true
  },
  {
    id: 'off-festive50',
    code: 'FESTIVE50',
    title_en: 'Flat ₹50 OFF on Combos',
    title_kn: 'ಕಾಂಬೋ ಪ್ಯಾಕ್‌ಗಳ ಮೇಲೆ ₹50 ನೇರ ರಿಯಾಯಿತಿ',
    description_en: 'Flat ₹50 OFF on any combo or value basket over ₹699.',
    description_kn: '₹೬೯೯ ಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ಕಾಂಬೋ ಬಾಕ್ಸ್ ಖರೀದಿಯ ಮೇಲೆ ₹೫೦ ನೇರ ರಿಯಾಯಿತಿ.',
    discount_type: 'fixed',
    discount_value: 50,
    min_order_amount: 699,
    active: true
  }
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    product_id: 'prod-bisibelebath',
    customer_name: 'Sharada Ramamurthy',
    customer_city: 'Bengaluru (Jayanagar)',
    rating: 5,
    comment_en: 'The aroma of Marathi Moggu and stone flower in this Bisi Bele Bath powder took me straight back to my grandmother’s kitchen in Malleshwaram. Pure bliss!',
    comment_kn: 'ಈ ಬಿಸಿಬೇಳೆಬಾತ್ ಪುಡಿಯಲ್ಲಿರುವ ಮರಾಠಿ ಮೊಗ್ಗು ಮತ್ತು ಕಲ್ಫಾಸಿಯ ಸುವಾಸನೆ ನಮ್ಮ ಅಜ್ಜಿ ಮನೆಯ ಕೈರುಚಿಯನ್ನೇ ನೆನಪಿಸಿತು. ಅತ್ಯುತ್ತಮ ಗುಣಮಟ್ಟ!',
    date: '2026-08-15',
    approved: true
  },
  {
    id: 'rev-2',
    product_id: 'prod-rasam-powder',
    customer_name: 'Venkatesh Prasad',
    customer_city: 'Mysuru',
    rating: 5,
    comment_en: 'We tried the Maniyara Rasam powder. The pepper and cumin proportion is absolute perfection. My whole family loved the soothing warmth.',
    comment_kn: 'ಮನೆಯ ರಸಂ ಪುಡಿ ಅದ್ಭುತವಾಗಿದೆ. ಮೆಣಸು ಮತ್ತು ಜೀರಿಗೆಯ ಹದ ಬಹಳ ಚೆನ್ನಾಗಿದೆ. ಜೀರ್ಣಕ್ಕೂ ತುಂಬಾ ಹಿತಕರ.',
    date: '2026-08-18',
    approved: true
  },
  {
    id: 'rev-3',
    product_id: 'prod-byadgi-chillies',
    customer_name: 'Ananya Hegde',
    customer_city: 'Mangaluru',
    rating: 5,
    comment_en: 'Top grade Byadgi chillies. Gave my Kundapura style chicken curry a vibrant deep red colour without burning heat. Highly recommended!',
    comment_kn: 'ಅಪ್ಪಟ ಬ್ಯಾಡಗಿ ಮೆಣಸು. ಅಡುಗೆಗೆ ಗಾಢವಾದ ಕೆಂಪು ಬಣ್ಣ ನೀಡುತ್ತದೆ. ಯಾವುದೇ ಕಲಬೆರಕೆ ಇಲ್ಲ.',
    date: '2026-08-19',
    approved: true
  }
];

class DataStore {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;
  private firestore: Firestore | null = null;
  private isFirestoreReady = false;

  constructor() {
    this.data = this.loadDatabase();
    this.initFirestore().catch(e => {
      console.warn('[Firestore] Async initialization warning:', e.message);
    });
  }

  public async initFirestore(): Promise<boolean> {
    try {
      const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
      if (!fs.existsSync(configPath)) {
        console.warn('[Firestore] firebase-applet-config.json not found, using local fallback.');
        return false;
      }
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      const app = getApps().length > 0 ? getApp() : initializeApp(config);
      this.firestore = getFirestore(app, config.firestoreDatabaseId || '(default)');
      
      console.log(`[Firestore] Initialized connection to Firestore db: ${config.firestoreDatabaseId || '(default)'}`);
      await this.reloadFromFirestore();
      this.isFirestoreReady = true;
      console.log(`[Firestore] Sync complete. Active Firestore records: ${this.data.products.length} products, ${this.data.customers.length} customers, ${this.data.orders.length} orders.`);
      return true;
    } catch (err: any) {
      console.error('[Firestore] Initialization error (continuing with local cache):', err.message);
      return false;
    }
  }

  public getIsFirestoreReady(): boolean {
    return this.isFirestoreReady && this.firestore !== null;
  }

  public async reloadFromFirestore(): Promise<void> {
    if (!this.firestore) return;
    try {
      // 1. Products
      const prodSnap = await getDocs(collection(this.firestore, 'products'));
      if (!prodSnap.empty) {
        const prods: Product[] = [];
        prodSnap.forEach(d => prods.push(d.data() as Product));
        this.data.products = prods;
      }

      // 2. Categories
      const catSnap = await getDocs(collection(this.firestore, 'categories'));
      if (!catSnap.empty) {
        const cats: Category[] = [];
        catSnap.forEach(d => cats.push(d.data() as Category));
        this.data.categories = cats.sort((a, b) => (a.order || 0) - (b.order || 0));
      }

      // 3. Orders
      const orderSnap = await getDocs(collection(this.firestore, 'orders'));
      if (!orderSnap.empty) {
        const ords: Order[] = [];
        orderSnap.forEach(d => ords.push(d.data() as Order));
        this.data.orders = ords.sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());
      }

      // 4. Customers
      const custSnap = await getDocs(collection(this.firestore, 'customers'));
      if (!custSnap.empty) {
        const custs: Customer[] = [];
        custSnap.forEach(d => custs.push(d.data() as Customer));
        this.data.customers = custs;
      }

      // 5. Recipes
      const recSnap = await getDocs(collection(this.firestore, 'recipes'));
      if (!recSnap.empty) {
        const recs: Recipe[] = [];
        recSnap.forEach(d => recs.push(d.data() as Recipe));
        this.data.recipes = recs;
      }

      // 6. Banners
      const banSnap = await getDocs(collection(this.firestore, 'banners'));
      if (!banSnap.empty) {
        const bans: Banner[] = [];
        banSnap.forEach(d => bans.push(d.data() as Banner));
        this.data.banners = bans;
      }

      // 7. Offers
      const offSnap = await getDocs(collection(this.firestore, 'offers'));
      if (!offSnap.empty) {
        const offs: Offer[] = [];
        offSnap.forEach(d => offs.push(d.data() as Offer));
        this.data.offers = offs;
      }

      // 8. Reviews
      const revSnap = await getDocs(collection(this.firestore, 'reviews'));
      if (!revSnap.empty) {
        const revs: Review[] = [];
        revSnap.forEach(d => revs.push(d.data() as Review));
        this.data.reviews = revs;
      }

      // 9. Audit Logs
      const auditSnap = await getDocs(collection(this.firestore, 'audit_logs'));
      if (!auditSnap.empty) {
        const logs: AdminAuditLog[] = [];
        auditSnap.forEach(d => logs.push(d.data() as AdminAuditLog));
        this.data.auditLogs = logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }

      // 10. Leads
      const leadSnap = await getDocs(collection(this.firestore, 'leads'));
      if (!leadSnap.empty) {
        const lds: Lead[] = [];
        leadSnap.forEach(d => lds.push(d.data() as Lead));
        this.data.leads = lds;
      }

      // 11. Settings
      const setDocSnap = await getDoc(doc(this.firestore, 'settings', 'store_settings'));
      if (setDocSnap.exists()) {
        this.data.settings = { ...INITIAL_SETTINGS, ...(setDocSnap.data() as BusinessSettings) };
      }

      // Sync updated memory cache to local offline fallback file
      this.persistNow(this.data);
    } catch (e: any) {
      console.error('[Firestore] Error reloading from Firestore collections:', e.message);
    }
  }

  private async getFirestoreInstance(): Promise<Firestore | null> {
    if (this.firestore) return this.firestore;
    await this.initFirestore();
    return this.firestore;
  }

  private async setFirestoreDoc(collectionName: string, docId: string, itemData: any) {
    try {
      const fsDb = await this.getFirestoreInstance();
      if (!fsDb) {
        console.warn(`[Firestore Warning] No Firestore instance available for ${collectionName}/${docId}`);
        return;
      }
      // Strip undefined properties for clean Firestore serialization
      const clean = JSON.parse(JSON.stringify(itemData));
      await setDoc(doc(fsDb, collectionName, String(docId)), clean, { merge: true });
      console.log(`[Firestore Success] Persisted ${collectionName}/${docId} to Firestore`);
    } catch (err: any) {
      console.error(`[Firestore Error] Failed to write ${collectionName}/${docId}:`, err.message);
    }
  }

  private async deleteFirestoreDoc(collectionName: string, docId: string) {
    try {
      const fsDb = await this.getFirestoreInstance();
      if (!fsDb) return;
      await deleteDoc(doc(fsDb, collectionName, String(docId)));
      console.log(`[Firestore Success] Removed ${collectionName}/${docId} from Firestore`);
    } catch (err: any) {
      console.error(`[Firestore Error] Failed to delete ${collectionName}/${docId}:`, err.message);
    }
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          products: Array.isArray(parsed.products) ? parsed.products : INITIAL_PRODUCTS,
          categories: Array.isArray(parsed.categories) ? parsed.categories : INITIAL_CATEGORIES,
          orders: Array.isArray(parsed.orders) ? parsed.orders : [],
          customers: Array.isArray(parsed.customers) ? parsed.customers : [],
          recipes: Array.isArray(parsed.recipes) ? parsed.recipes : INITIAL_RECIPES,
          banners: Array.isArray(parsed.banners) ? parsed.banners : INITIAL_BANNERS,
          offers: Array.isArray(parsed.offers) ? parsed.offers : INITIAL_OFFERS,
          reviews: Array.isArray(parsed.reviews) ? parsed.reviews : INITIAL_REVIEWS,
          settings: { ...INITIAL_SETTINGS, ...(parsed.settings || {}) },
          auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : [],
          leads: Array.isArray(parsed.leads) ? parsed.leads : []
        };
      }
    } catch (e) {
      console.error('Error loading database, initializing defaults:', e);
    }

    const initial: DatabaseSchema = {
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      orders: [],
      customers: [],
      recipes: INITIAL_RECIPES,
      banners: INITIAL_BANNERS,
      offers: INITIAL_OFFERS,
      reviews: INITIAL_REVIEWS,
      settings: INITIAL_SETTINGS,
      auditLogs: [],
      leads: []
    };
    this.persistNow(initial);
    return initial;
  }

  private persistNow(data: DatabaseSchema) {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write db.json fallback:', e);
    }
  }

  public save() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    this.persistNow(this.data);
  }

  // --- Settings & Security ---
  public getSettings(): BusinessSettings {
    return this.data.settings;
  }

  public getAdminPassword(): string {
    return this.data.settings.admin_password || process.env.ADMIN_PASSWORD || 'indima@2026';
  }

  public verifyAdminPassword(password: string): boolean {
    const current = this.getAdminPassword();
    return password === current;
  }

  public setAdminPassword(newPassword: string, admin = 'Admin'): boolean {
    if (!newPassword || newPassword.trim().length < 6) {
      return false;
    }
    this.data.settings.admin_password = newPassword.trim();
    this.logAudit(admin, 'ADMIN_PASSWORD_CHANGED', 'security', 'Admin master password updated');
    this.setFirestoreDoc('settings', 'store_settings', this.data.settings);
    this.save();
    return true;
  }

  public updateSettings(updates: Partial<BusinessSettings>, admin = 'Admin'): BusinessSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.logAudit(admin, 'SETTINGS_UPDATED', 'settings', 'Business settings updated');
    this.setFirestoreDoc('settings', 'store_settings', this.data.settings);
    this.save();
    return this.data.settings;
  }

  // --- Products ---
  public getProducts(): Product[] {
    return this.data.products;
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  public addProduct(product: Partial<Product>, admin = 'Admin'): Product {
    const newProduct: Product = {
      id: product.id || ('prod-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)),
      sku: product.sku || ('IND-SP-' + Math.floor(100 + Math.random() * 900)),
      name_en: product.name_en || 'Spice Item',
      name_kn: product.name_kn || product.name_en || 'ಮಸಾಲೆ',
      description_en: product.description_en || '',
      description_kn: product.description_kn || '',
      ingredients_en: product.ingredients_en || '',
      ingredients_kn: product.ingredients_kn || '',
      category_id: product.category_id || 'cat-karnataka-specials',
      weight: product.weight || '250g',
      shelf_life: product.shelf_life || '12 Months',
      storage_en: product.storage_en || 'Store in airtight container',
      storage_kn: product.storage_kn || 'ಗಾಳಿಯಾಡದ ಡಬ್ಬದಲ್ಲಿ ಇರಿಸಿ',
      traditional_info_en: product.traditional_info_en || 'Stone-ground heritage Karnataka method',
      traditional_info_kn: product.traditional_info_kn || 'ಸಾಂಪ್ರದಾಯಿಕ ಕಲ್ಲಿನ ಬೀಸುವ ವಿಧಾನ',
      mrp: Number(product.mrp) || 150,
      price: Number(product.price) || 120,
      discount_percentage: Number(product.discount_percentage) || 0,
      stock: Number(product.stock) >= 0 ? Number(product.stock) : 50,
      low_stock_threshold: Number(product.low_stock_threshold) || 10,
      images: Array.isArray(product.images) && product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80'],
      badges: Array.isArray(product.badges) ? product.badges : ['natural', 'homemade'],
      active: product.active !== false,
      rating: Number(product.rating) || 5.0,
      review_count: Number(product.review_count) || 0,
      video: product.video || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.products.push(newProduct);
    this.logAudit(admin, 'PRODUCT_CREATED', newProduct.id, `Created product ${newProduct.name_en}`);
    this.setFirestoreDoc('products', newProduct.id, newProduct);
    this.save();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>, admin = 'Admin'): Product | null {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.products[idx] = {
      ...this.data.products[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    const updatedProd = this.data.products[idx];
    this.logAudit(admin, 'PRODUCT_UPDATED', id, `Updated product ${updatedProd.name_en}`);
    this.setFirestoreDoc('products', id, updatedProd);
    this.save();
    return updatedProd;
  }

  public deleteProduct(id: string, admin = 'Admin'): boolean {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    const name = this.data.products[idx].name_en;
    this.data.products.splice(idx, 1);
    this.logAudit(admin, 'PRODUCT_DELETED', id, `Deleted product ${name}`);
    this.deleteFirestoreDoc('products', id);
    this.save();
    return true;
  }

  // --- Categories ---
  public getCategories(): Category[] {
    return this.data.categories.sort((a, b) => a.order - b.order);
  }

  public addCategory(cat: Omit<Category, 'id'>, admin = 'Admin'): Category {
    const newCat: Category = {
      ...cat,
      id: 'cat-' + Date.now()
    };
    this.data.categories.push(newCat);
    this.logAudit(admin, 'CATEGORY_CREATED', newCat.id, `Created category ${newCat.name_en}`);
    this.setFirestoreDoc('categories', newCat.id, newCat);
    this.save();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Category>, admin = 'Admin'): Category | null {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
    const updated = this.data.categories[idx];
    this.logAudit(admin, 'CATEGORY_UPDATED', id, `Updated category ${updated.name_en}`);
    this.setFirestoreDoc('categories', id, updated);
    this.save();
    return updated;
  }

  public deleteCategory(id: string, admin = 'Admin'): boolean {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.data.categories.splice(idx, 1);
    this.logAudit(admin, 'CATEGORY_DELETED', id, 'Deleted category');
    this.deleteFirestoreDoc('categories', id);
    this.save();
    return true;
  }

  // --- Inventory ---
  public updateStock(productId: string, newStock: number, threshold?: number, admin = 'Admin'): Product | null {
    const p = this.getProductById(productId);
    if (!p) return null;
    const oldStock = p.stock;
    p.stock = Math.max(0, newStock);
    if (threshold !== undefined) p.low_stock_threshold = threshold;
    p.updated_at = new Date().toISOString();
    this.logAudit(admin, 'STOCK_CHANGED', productId, `Stock adjusted from ${oldStock} to ${p.stock}`);
    this.setFirestoreDoc('products', productId, p);
    this.save();
    return p;
  }

  // --- Customers ---
  public findCustomerByPhone(phone: string): Customer | undefined {
    const clean = phone.replace(/\D/g, '').slice(-10);
    return this.data.customers.find(c => c.phone.replace(/\D/g, '').slice(-10) === clean);
  }

  public getCustomers(): Customer[] {
    return this.data.customers;
  }

  public upsertCustomer(customerData: Partial<Customer> & { phone: string; name: string; email: string }): Customer {
    const cleanPhone = customerData.phone.replace(/\D/g, '').slice(-10);
    let customer = this.data.customers.find(c => c.phone.replace(/\D/g, '').slice(-10) === cleanPhone);

    if (customer) {
      customer.name = customerData.name || customer.name;
      customer.email = customerData.email || customer.email;
      if (customerData.saved_address) {
        customer.saved_address = customerData.saved_address;
      }
      customer.updated_at = new Date().toISOString();
    } else {
      customer = {
        id: 'cust-' + Date.now(),
        phone: cleanPhone,
        name: customerData.name,
        email: customerData.email,
        saved_address: customerData.saved_address,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        total_spent: 0,
        total_orders: 0
      };
      this.data.customers.push(customer);
    }
    this.setFirestoreDoc('customers', customer.id, customer);
    this.save();
    return customer;
  }

  public deleteCustomer(id: string, admin = 'Admin'): boolean {
    const idx = this.data.customers.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.data.customers.splice(idx, 1);
    this.logAudit(admin, 'CUSTOMER_DELETED', id, `Deleted customer ${id}`);
    this.deleteFirestoreDoc('customers', id);
    this.save();
    return true;
  }

  // --- Orders ---
  public getOrders(): Order[] {
    return this.data.orders.sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id);
  }

  public getOrdersByPhone(phone: string): Order[] {
    const clean = phone.replace(/\D/g, '').slice(-10);
    return this.data.orders
      .filter(o => o.customer_phone.replace(/\D/g, '').slice(-10) === clean)
      .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());
  }

  public createOrder(order: Order): Order {
    this.data.orders.unshift(order);

    // Update customer stats
    const customer = this.findCustomerByPhone(order.customer_phone);
    if (customer) {
      customer.total_orders += 1;
      customer.total_spent += order.total_amount;
      customer.saved_address = order.address_snapshot;
      customer.updated_at = new Date().toISOString();
      this.setFirestoreDoc('customers', customer.id, customer);
    }

    // Atomically decrement inventory for ordered items
    for (const item of order.items) {
      const prod = this.getProductById(item.product_id);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        prod.updated_at = new Date().toISOString();
        this.setFirestoreDoc('products', prod.id, prod);
      }
    }

    this.logAudit('System', 'ORDER_CREATED', order.id, `Order of ₹${order.total_amount} placed by ${order.customer_name}`);
    this.setFirestoreDoc('orders', order.id, order);
    this.save();
    return order;
  }

  public updateOrderStatus(
    orderId: string,
    orderStatus?: Order['order_status'],
    trackingNumber?: string,
    expectedDelivery?: string,
    paymentStatus?: PaymentStatus,
    admin = 'Admin'
  ): Order | null {
    const order = this.getOrderById(orderId);
    if (!order) return null;

    if (orderStatus) {
      order.order_status = orderStatus;
      order.status = orderStatus.toLowerCase().includes('deliv')
        ? 'delivered'
        : orderStatus.toLowerCase().includes('ship')
        ? 'shipped'
        : orderStatus.toLowerCase().includes('pack')
        ? 'packed'
        : orderStatus.toLowerCase().includes('process')
        ? 'confirmed'
        : order.status;
    }
    if (paymentStatus) {
      order.payment_status = paymentStatus;
    }
    if (trackingNumber !== undefined) order.tracking_number = trackingNumber;
    if (expectedDelivery !== undefined) order.expected_delivery = expectedDelivery;
    order.updated_at = new Date().toISOString();

    this.logAudit(admin, 'ORDER_STATUS_CHANGED', orderId, `Status updated: ${orderStatus || ''} ${paymentStatus ? `Payment: ${paymentStatus}` : ''}`);
    this.setFirestoreDoc('orders', orderId, order);
    this.save();
    return order;
  }

  public updateOrder(order: Order): Order {
    const idx = this.data.orders.findIndex(o => o.id === order.id);
    if (idx !== -1) {
      this.data.orders[idx] = { ...order };
    }
    this.setFirestoreDoc('orders', order.id, order);
    this.save();
    return order;
  }

  public updateOrderAddress(
    orderId: string,
    newAddress: Order['address_snapshot'],
    reason: string,
    admin = 'Admin'
  ): Order | null {
    const order = this.getOrderById(orderId);
    if (!order) return null;

    const oldAddress = { ...order.address_snapshot };
    order.address_snapshot = { ...newAddress };
    order.updated_at = new Date().toISOString();

    if (!order.address_change_history) order.address_change_history = [];
    order.address_change_history.push({
      changed_at: new Date().toISOString(),
      changed_by: admin,
      old_address: oldAddress,
      new_address: newAddress,
      reason: reason || 'Administrative address correction'
    });

    this.logAudit(admin, 'ORDER_ADDRESS_MODIFIED', orderId, `Address amended: ${reason}`);
    this.setFirestoreDoc('orders', orderId, order);
    this.save();
    return order;
  }

  public updateNotificationStatus(orderId: string, status: 'Sent' | 'Pending' | 'Failed', error?: string): Order | null {
    const order = this.getOrderById(orderId);
    if (!order) return null;
    order.whatsapp_notification_status = status;
    order.whatsapp_notification_error = error;
    order.updated_at = new Date().toISOString();
    this.setFirestoreDoc('orders', orderId, order);
    this.save();
    return order;
  }

  public deleteOrder(orderId: string, admin = 'Admin'): boolean {
    const idx = this.data.orders.findIndex(o => o.id === orderId);
    if (idx === -1) return false;
    this.data.orders.splice(idx, 1);
    this.logAudit(admin, 'ORDER_DELETED', orderId, `Deleted test order ${orderId}`);
    this.deleteFirestoreDoc('orders', orderId);
    this.save();
    return true;
  }

  // --- Banners ---
  public getBanners(): Banner[] {
    return this.data.banners;
  }

  public updateBanner(id: string, updates: Partial<Banner>, admin = 'Admin'): Banner | null {
    const idx = this.data.banners.findIndex(b => b.id === id);
    if (idx === -1) return null;
    this.data.banners[idx] = { ...this.data.banners[idx], ...updates };
    const updated = this.data.banners[idx];
    this.logAudit(admin, 'BANNER_UPDATED', id, `Updated banner ${updated.title_en}`);
    this.setFirestoreDoc('banners', id, updated);
    this.save();
    return updated;
  }

  public addBanner(banner: Omit<Banner, 'id'>, admin = 'Admin'): Banner {
    const newBanner: Banner = { ...banner, id: 'ban-' + Date.now() };
    this.data.banners.push(newBanner);
    this.logAudit(admin, 'BANNER_CREATED', newBanner.id, `Added banner ${newBanner.title_en}`);
    this.setFirestoreDoc('banners', newBanner.id, newBanner);
    this.save();
    return newBanner;
  }

  public deleteBanner(id: string, admin = 'Admin'): boolean {
    const idx = this.data.banners.findIndex(b => b.id === id);
    if (idx === -1) return false;
    this.data.banners.splice(idx, 1);
    this.logAudit(admin, 'BANNER_DELETED', id, 'Deleted banner');
    this.deleteFirestoreDoc('banners', id);
    this.save();
    return true;
  }

  // --- Recipes ---
  public getRecipes(): Recipe[] {
    return this.data.recipes;
  }

  public addRecipe(recipe: Omit<Recipe, 'id' | 'created_at'>, admin = 'Admin'): Recipe {
    const newRec: Recipe = {
      ...recipe,
      id: 'rec-' + Date.now(),
      created_at: new Date().toISOString()
    };
    this.data.recipes.push(newRec);
    this.logAudit(admin, 'RECIPE_CREATED', newRec.id, `Created recipe ${newRec.title_en}`);
    this.setFirestoreDoc('recipes', newRec.id, newRec);
    this.save();
    return newRec;
  }

  public updateRecipe(id: string, updates: Partial<Recipe>, admin = 'Admin'): Recipe | null {
    const idx = this.data.recipes.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.data.recipes[idx] = { ...this.data.recipes[idx], ...updates };
    const updated = this.data.recipes[idx];
    this.logAudit(admin, 'RECIPE_UPDATED', id, `Updated recipe ${updated.title_en}`);
    this.setFirestoreDoc('recipes', id, updated);
    this.save();
    return updated;
  }

  public deleteRecipe(id: string, admin = 'Admin'): boolean {
    const idx = this.data.recipes.findIndex(r => r.id === id);
    if (idx === -1) return false;
    this.data.recipes.splice(idx, 1);
    this.logAudit(admin, 'RECIPE_DELETED', id, 'Deleted recipe');
    this.deleteFirestoreDoc('recipes', id);
    this.save();
    return true;
  }

  // --- Offers ---
  public getOffers(): Offer[] {
    return this.data.offers;
  }

  public addOffer(offer: Omit<Offer, 'id'>, admin = 'Admin'): Offer {
    const newOff: Offer = { ...offer, id: 'off-' + Date.now() };
    this.data.offers.push(newOff);
    this.logAudit(admin, 'OFFER_CREATED', newOff.id, `Created offer ${newOff.code}`);
    this.setFirestoreDoc('offers', newOff.id, newOff);
    this.save();
    return newOff;
  }

  public updateOffer(id: string, updates: Partial<Offer>, admin = 'Admin'): Offer | null {
    const idx = this.data.offers.findIndex(o => o.id === id);
    if (idx === -1) return null;
    this.data.offers[idx] = { ...this.data.offers[idx], ...updates };
    const updated = this.data.offers[idx];
    this.logAudit(admin, 'OFFER_UPDATED', id, `Updated offer ${updated.code}`);
    this.setFirestoreDoc('offers', id, updated);
    this.save();
    return updated;
  }

  public deleteOffer(id: string, admin = 'Admin'): boolean {
    const idx = this.data.offers.findIndex(o => o.id === id);
    if (idx === -1) return false;
    this.data.offers.splice(idx, 1);
    this.logAudit(admin, 'OFFER_DELETED', id, 'Deleted offer');
    this.deleteFirestoreDoc('offers', id);
    this.save();
    return true;
  }

  // --- Reviews ---
  public getReviews(): Review[] {
    return this.data.reviews;
  }

  public addReview(review: Omit<Review, 'id' | 'date' | 'approved'>): Review {
    const newRev: Review = {
      ...review,
      id: 'rev-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      approved: true // Approved by default or moderateable
    };
    this.data.reviews.unshift(newRev);
    this.setFirestoreDoc('reviews', newRev.id, newRev);
    this.save();
    return newRev;
  }

  public updateReviewStatus(id: string, approved: boolean, admin = 'Admin'): boolean {
    const rev = this.data.reviews.find(r => r.id === id);
    if (!rev) return false;
    rev.approved = approved;
    this.logAudit(admin, 'REVIEW_STATUS', id, `Review ${approved ? 'approved' : 'hidden'}`);
    this.setFirestoreDoc('reviews', id, rev);
    this.save();
    return true;
  }

  public deleteReview(id: string, admin = 'Admin'): boolean {
    const idx = this.data.reviews.findIndex(r => r.id === id);
    if (idx === -1) return false;
    this.data.reviews.splice(idx, 1);
    this.logAudit(admin, 'REVIEW_DELETED', id, 'Deleted review');
    this.deleteFirestoreDoc('reviews', id);
    this.save();
    return true;
  }

  // --- Leads ---
  public addLead(phone: string, source = 'Popup 10% OFF'): Lead {
    const clean = phone.replace(/\D/g, '').slice(-10);
    const existing = this.data.leads.find(l => l.phone === clean);
    if (existing) return existing;

    const lead: Lead = {
      id: 'lead-' + Date.now(),
      phone: clean,
      created_at: new Date().toISOString(),
      source
    };
    this.data.leads.unshift(lead);
    this.setFirestoreDoc('leads', lead.id, lead);
    this.save();
    return lead;
  }

  public getLeads(): Lead[] {
    return this.data.leads;
  }

  // --- Audit Logs ---
  public logAudit(admin: string, actionType: string, targetId: string, details: string) {
    const log: AdminAuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      timestamp: new Date().toISOString(),
      admin_username: admin,
      action_type: actionType,
      target_id: targetId,
      details
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs.pop();
    }
    this.setFirestoreDoc('audit_logs', log.id, log);
  }

  public getAuditLogs(): AdminAuditLog[] {
    return this.data.auditLogs;
  }
}

export const db = new DataStore();
