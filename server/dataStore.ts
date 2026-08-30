import fs from 'fs';
import path from 'path';
import { Firestore as AdminFirestore } from 'firebase-admin/firestore';
import { getFirebaseAdmin, getAdminStorageBucketInstance } from './firebaseAdmin';
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
  tagline_sa: 'ಆಯುರ್ವೇದೋಽಮೃತಾನಾಮ್ • ಶುದ್ಧಂ ಸಾತ್ತ್ವಿಕಂ ದಿವ್ಯಮ್',
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
    id: 'prod-sambar-powder',
    sku: 'IND-SMB-250',
    name_en: 'Karnataka Brahmin Style Sambar Powder',
    name_kn: 'ಕರ್ನಾಟಕ ಬ್ರಾಹ್ಮಣ ಶೈಲಿಯ ಸಾಂಬಾರ್ ಪುಡಿ',
    description_en: 'Traditional Udupi/Brahmin kitchen sambar masala with zero onion/garlic, richly perfumed with freshly roasted fenugreek, coriander, roasted chana dal, and Salem turmeric.',
    description_kn: 'ಈರುಳ್ಳಿ-ಬೆಳ್ಳುಳ್ಳಿ ರಹಿತ, ಮೆಂತ್ಯ, ಕೊತ್ತಂಬರಿ ಮತ್ತು ಶುದ್ಧ ಅರಿಶಿನದ ಸಾಂಪ್ರದಾಯಿಕ ಉಡುಪಿ/ಬ್ರಾಹ್ಮಣ ಶೈಲಿಯ ಸಾಂಬಾರ್ ಪುಡಿ.',
    ingredients_en: 'Coriander Seeds, Byadgi Chillies, Chana Dal, Toor Dal, Fenugreek, Cumin, Mustard, Turmeric, Asafoetida, Curry Leaves.',
    ingredients_kn: 'ಕೊತ್ತಂಬರಿ, ಬ್ಯಾಡಗಿ ಮೆಣಸಿನಕಾಯಿ, ಕಡಲೆಬೇಳೆ, ತೊಗರಿಬೇಳೆ, ಮೆಂತ್ಯ, ಜೀರಿಗೆ, ಸಾಸಿವೆ, ಅರಿಶಿನ, ಇಂಗು, ಕರಿಬೇವು.',
    category_id: 'cat-masala-powders',
    weight: '250g',
    shelf_life: '12 Months',
    storage_en: 'Keep away from humidity. Reseal packet tightly.',
    storage_kn: 'ತೇವಾಂಶದಿಂದ ದೂರವಿಡಿ. ಪ್ಯಾಕೆಟ್ ಅನ್ನು ಬಿಗಿಯಾಗಿ ಮುಚ್ಚಿ.',
    traditional_info_en: 'Stone pounded in wood-fired roasted spice blends.',
    traditional_info_kn: 'ಸೌದೆ ಒಲೆಯಲ್ಲಿ ಹುರಿದು ಕಲ್ಲಿನಿಂದ ಕುಟ್ಟಿದ ಮಸಾಲೆ.',
    mrp: 190,
    price: 150,
    discount_percentage: 21,
    stock: 95,
    low_stock_threshold: 15,
    images: [
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80'
    ],
    badges: ['bestseller', 'homemade'],
    active: true,
    rating: 4.9,
    review_count: 115,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-byadgi-chillies',
    sku: 'IND-BYD-250',
    name_en: 'Stemless Premium Byadgi Red Chillies (Kaddi)',
    name_kn: 'ಕಾಂಡ ರಹಿತ ಪ್ರೀಮಿಯಂ ಬ್ಯಾಡಗಿ ಒಣ ಮೆಣಸಿನಕಾಯಿ',
    description_en: 'Sun-dried wrinkled red chillies from Haveri district of Karnataka. Known globally for its brilliant deep red oil colour and mild, flavourful pungency.',
    description_kn: 'ಹಾವೇರಿ ಜಿಲ್ಲೆಯ ಬ್ಯಾಡಗಿಯಿಂದ ನೇರವಾಗಿ ತಂದ, ಕಾಂಡ ರಹಿತ ನೈಸರ್ಗಿಕ ಕೆಂಪು ಬಣ್ಣ ಮತ್ತು ಹಿತಕರ ಖಾರ ನೀಡುವ ಮೆಣಸಿನಕಾಯಿ.',
    ingredients_en: '100% Pure Byadgi Red Chillies (Stemless).',
    ingredients_kn: '೧೦೦% ಶುದ್ಧ ಬ್ಯಾಡಗಿ ಒಣ ಮೆಣಸಿನಕಾಯಿ (ತೊಟ್ಟು ತೆಗೆದದ್ದು).',
    category_id: 'cat-whole-spices',
    weight: '250g',
    shelf_life: '12 Months',
    storage_en: 'Store in airtight container. Sun-dry occasionally.',
    storage_kn: 'ಗಾಳಿಯಾಡದ ಡಬ್ಬದಲ್ಲಿಡಿ. ಆಗಾಗ ಬಿಸಿಲಿನಲ್ಲಿ ಒಣಗಿಸಿ.',
    traditional_info_en: 'Direct plantation harvest from Byadgi APMC certified farms.',
    traditional_info_kn: 'ಬ್ಯಾಡಗಿಯ ಪ್ರಮಾಣೀಕೃತ ಕೃಷಿಕರಿಂದ ನೇರ ಸಂಗ್ರಹ.',
    mrp: 230,
    price: 185,
    discount_percentage: 20,
    stock: 60,
    low_stock_threshold: 10,
    images: [
      'https://images.unsplash.com/photo-1588165171080-c89acfa5ee83?w=800&auto=format&fit=crop&q=80'
    ],
    badges: ['bestseller', 'natural'],
    active: true,
    rating: 5.0,
    review_count: 76,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-vangibath-powder',
    sku: 'IND-VGB-200',
    name_en: 'Traditional Vangi Bath Powder (Brinjal Rice)',
    name_kn: 'ಸಾಂಪ್ರದಾಯಿಕ ವಾಂಗೀಬಾತ್ ಪುಡಿ',
    description_en: 'Classic Karnataka formulation with roasted dry coconut (kopra), cloves, cinnamon, and Byadgi chillies. Perfect for spicy brinjal or capsicum rice.',
    description_kn: 'ಒಣಕೊಬ್ಬರಿ, ಲವಂಗ ಮತ್ತು ದಾಲ್ಚಿನ್ನಿಯ ಹದವಾದ ಮಿಶ್ರಣ. ಬದನೆಕಾಯಿ ಅಥವಾ ಕ್ಯಾಪ್ಸಿಕಂ ಬಾತ್‌ಗೆ ಅತ್ಯುತ್ತಮ.',
    ingredients_en: 'Coriander, Byadgi Chillies, Chana Dal, Urad Dal, Dry Coconut, Cloves, Cinnamon, Cumin, Fenugreek, Cardamom.',
    ingredients_kn: 'ಕೊತ್ತಂಬರಿ, ಬ್ಯಾಡಗಿ ಮೆಣಸು, ಕಡಲೆಬೇಳೆ, ಉದ್ದಿನಬೇಳೆ, ಒಣಕೊಬ್ಬರಿ, ಲವಂಗ, ದಾಲ್ಚಿನ್ನಿ, ಜೀರಿಗೆ, ಮೆಂತ್ಯ, ಏಲಕ್ಕಿ.',
    category_id: 'cat-karnataka-specials',
    weight: '200g',
    shelf_life: '12 Months',
    storage_en: 'Keep sealed in cool place.',
    storage_kn: 'ತಂಪಾದ ಜಾಗದಲ್ಲಿ ಬಿಗಿಯಾಗಿ ಮುಚ್ಚಿಡಿ.',
    traditional_info_en: 'Traditional recipe with slow roasted copra.',
    traditional_info_kn: 'ಕೊಬ್ಬರಿಯನ್ನು ಹದವಾಗಿ ಹುರಿದು ತಯಾರಿಸಿದ ವಿಧಾನ.',
    mrp: 175,
    price: 140,
    discount_percentage: 20,
    stock: 75,
    low_stock_threshold: 15,
    images: [
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80'
    ],
    badges: ['homemade', 'natural'],
    active: true,
    rating: 4.8,
    review_count: 64,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-chutney-pudi',
    sku: 'IND-CHP-200',
    name_en: 'Shenga (Peanut) Chutney Pudi',
    name_kn: 'ಉತ್ತರ ಕರ್ನಾಟಕದ ಶೇಂಗಾ ಚಟ್ನಿ ಪುಡಿ',
    description_en: 'North Karnataka style crunchy roasted peanut chutney powder with garlic, red chilli, and cumin. The soulmate for piping hot Jolada Rotti, dosas, and idlis.',
    description_kn: 'ಉತ್ತರ ಕರ್ನಾಟಕ ಶೈಲಿಯ ಗರಿಗರಿ ಶೇಂಗಾ, ಬೆಳ್ಳುಳ್ಳಿ, ಜೀರಿಗೆ ಮತ್ತು ಕೆಂಪು ಮೆಣಸಿನ ಚಟ್ನಿ ಪುಡಿ. ಜೋಳದ ರೊಟ್ಟಿ ಮತ್ತು ದೋಸೆಗೆ ಹೇಳಿಮಾಡಿಸಿದ ರುಚಿ.',
    ingredients_en: 'Roasted Peanuts, Garlic, Byadgi Chilli, Cumin Seeds, Tamarind, Jaggery, Curry Leaves, Salt.',
    ingredients_kn: 'ಹುರಿದ ಶೇಂಗಾ, ಬೆಳ್ಳುಳ್ಳಿ, ಬ್ಯಾಡಗಿ ಮೆಣಸಿನಕಾಯಿ, ಜೀರಿಗೆ, ಹುಣಸೆಹಣ್ಣು, ಬೆಲ್ಲ, ಕರಿಬೇವು, ಉಪ್ಪು.',
    category_id: 'cat-traditional-blends',
    weight: '200g',
    shelf_life: '6 Months',
    storage_en: 'Airtight container. Do not expose to moisture.',
    storage_kn: 'ಗಾಳಿಯಾಡದ ಡಬ್ಬದಲ್ಲಿಡಿ. ತೇವಾಂಶ ತಾಗದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.',
    traditional_info_en: 'Stone pounded rustic texture from Dharwad region.',
    traditional_info_kn: 'ಧಾರವಾಡ ಶೈಲಿಯಲ್ಲಿ ಕುಟ್ಟಿದ ಗರಿಗರಿ ಚಟ್ನಿ ಪುಡಿ.',
    mrp: 160,
    price: 130,
    discount_percentage: 19,
    stock: 110,
    low_stock_threshold: 20,
    images: [
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80'
    ],
    badges: ['bestseller', 'homemade'],
    active: true,
    rating: 4.9,
    review_count: 180,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-garam-masala',
    sku: 'IND-GRM-100',
    name_en: 'Royal Malnad Garam Masala Powder',
    name_kn: 'ರಾಜಮನೆತನದ ಮಲೆನಾಡು ಗರಂ ಮಸಾಲೆ ಪುಡಿ',
    description_en: 'Exquisite aromatic whole spice blend from the Western Ghats: green cardamom, mace (javitri), star anise, nutmeg, and black pepper. Unmatched depth of aroma.',
    description_kn: 'ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಹಸಿರು ಏಲಕ್ಕಿ, ಜಾಪತ್ರೆ, ಚಕ್ರಮೊಗ್ಗು, ಜಾಯಿಕಾಯಿ ಮತ್ತು ಕಾಳುಮೆಣಸಿನಿಂದ ತಯಾರಿಸಿದ ಅತ್ಯುನ್ನತ ಸುವಾಸನೆಯ ಗರಂ ಮಸಾಲೆ.',
    ingredients_en: 'Green Cardamom, Black Cardamom, Cloves, Cinnamon, Star Anise, Mace, Nutmeg, Black Pepper, Cumin, Bay Leaf, Coriander.',
    ingredients_kn: 'ಹಸಿರು ಏಲಕ್ಕಿ, ಕಪ್ಪು ಏಲಕ್ಕಿ, ಲವಂಗ, ದಾಲ್ಚಿನ್ನಿ, ಚಕ್ರಮೊಗ್ಗು, ಜಾಪತ್ರೆ, ಜಾಯಿಕಾಯಿ, ಕಾಳುಮೆಣಸು, ಜೀರಿಗೆ, ಪಲಾವ್ ಎಲೆ, ಧನಿಯಾ.',
    category_id: 'cat-traditional-blends',
    weight: '100g',
    shelf_life: '12 Months',
    storage_en: 'Store tightly closed to retain precious volatile essential oils.',
    storage_kn: 'ಸುವಾಸನೆ ಉಳಿಯಲು ಗಾಳಿಯಾಡದಂತೆ ಬಿಗಿಯಾಗಿ ಮುಚ್ಚಿಡಿ.',
    traditional_info_en: 'Cold-ground under low temperature to retain ethereal spice oils.',
    traditional_info_kn: 'ಕಡಿಮೆ ತಾಪಮಾನದಲ್ಲಿ ಬೀಸಿ ನೈಸರ್ಗಿಕ ತೈಲಗಳನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಲಾಗಿದೆ.',
    mrp: 210,
    price: 165,
    discount_percentage: 21,
    stock: 55,
    low_stock_threshold: 10,
    images: [
      'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&auto=format&fit=crop&q=80'
    ],
    badges: ['natural', 'homemade'],
    active: true,
    rating: 4.9,
    review_count: 52,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-combo-grand',
    sku: 'IND-CMB-GRD',
    name_en: 'Indima Karnataka Heritage Master Box (5 Blends)',
    name_kn: 'ಇಂದಿಮಾ ಕರ್ನಾಟಕ ಹೆರಿಟೇಜ್ ಮಾಸ್ಟರ್ ಕಾಂಬೋ ಬಾಕ್ಸ್',
    description_en: 'Our complete traditional collection: Mysuru Bisi Bele Bath (200g), Brahmin Sambar (250g), Maniyara Rasam (250g), Shenga Chutney Pudi (200g), and Malnad Garam Masala (100g).',
    description_kn: 'ನಮ್ಮ ೫ ಪ್ರಮುಖ ಮಸಾಲೆಗಳ ಸಂಪೂರ್ಣ ಕಾಂಬೋ ಬಾಕ್ಸ್: ಬಿಸಿಬೇಳೆಬಾತ್, ಸಾಂಬಾರ್, ರಸಂ, ಶೇಂಗಾ ಚಟ್ನಿ ಪುಡಿ ಮತ್ತು ಗರಂ ಮಸಾಲೆ.',
    ingredients_en: 'Includes 5 full-size spice packs prepared in pure heritage formulations.',
    ingredients_kn: '೫ ಸಾಂಪ್ರದಾಯಿಕ ಮಸಾಲೆ ಪುಡಿಗಳ ಸಂಪೂರ್ಣ ಪ್ಯಾಕ್.',
    category_id: 'cat-combo-packs',
    weight: '1.0 kg (Total)',
    shelf_life: '12 Months',
    storage_en: 'Store each packet in designated glass jar.',
    storage_kn: 'ಪ್ರತಿಯೊಂದು ಪ್ಯಾಕೆಟ್ ಅನ್ನು ಪ್ರತ್ಯೇಕ ಗಾಜಿನ ಜಾರ್‌ನಲ್ಲಿಡಿ.',
    traditional_info_en: 'Perfect festive gift and complete kitchen starter pack.',
    traditional_info_kn: 'ಹಬ್ಬದ ಉಡುಗೊರೆಗೆ ಮತ್ತು ಹೊಸ ಅಡುಗೆ ಮನೆಗೆ ಅತ್ಯುತ್ತಮ ಕೊಡುಗೆ.',
    mrp: 935,
    price: 745,
    discount_percentage: 20,
    stock: 40,
    low_stock_threshold: 8,
    images: [
      'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80'
    ],
    badges: ['bestseller', 'homemade', 'natural'],
    active: true,
    rating: 5.0,
    review_count: 210,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'rec-mysore-bisibelebath',
    title_en: 'Authentic Mysuru Bisi Bele Bath',
    title_kn: 'ಅಪ್ಪಟ ಮೈಸೂರು ಶೈಲಿಯ ಬಿಸಿಬೇಳೆಬಾತ್',
    description_en: 'A wholesome, comforting one-pot meal made with sona masoori rice, toor dal, seasonal vegetables, and aromatic Indima Bisi Bele Bath powder.',
    description_kn: 'ಸೋನಾ ಮಸೂರಿ ಅಕ್ಕಿ, ತೊಗರಿಬೇಳೆ, ತರಕಾರಿಗಳು ಮತ್ತು ಇಂದಿಮಾ ಬಿಸಿಬೇಳೆಬಾತ್ ಪುಡಿಯಿಂದ ತಯಾರಿಸಿದ ರುಚಿಕರ ಊಟ.',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80',
    prep_time: '15 mins',
    cook_time: '35 mins',
    servings: '4 Servings',
    featured_spice_ids: ['prod-bisibelebath'],
    ingredients_en: [
      '1 cup Sona Masoori Rice',
      '3/4 cup Toor Dal (washed)',
      '3 tbsp Indima Mysuru Bisi Bele Bath Powder',
      '1 cup Mixed Veggies (Beans, Carrot, Shallots, Peas)',
      '1/4 cup Tamarind Extract',
      '2 tbsp Ghee',
      'Cashews and Curry Leaves for tempering'
    ],
    ingredients_kn: [
      '೧ ಕಪ್ ಸೋನಾ ಮಸೂರಿ ಅಕ್ಕಿ',
      '೩/೪ ಕಪ್ ತೊಗರಿಬೇಳೆ',
      '೩ ಚಮಚ ಇಂದಿಮಾ ಮೈಸೂರು ಬಿಸಿಬೇಳೆಬಾತ್ ಪುಡಿ',
      '೧ ಕಪ್ ತರಕಾರಿಗಳು (ಹುರುಳಿಕಾಯಿ, ಕ್ಯಾರೆಟ್, ಸಾಂಬಾರ್ ಈರುಳ್ಳಿ, ಬಟಾಣಿ)',
      '೧/೪ ಕಪ್ ಹುಣಸೆಹಣ್ಣಿನ ರಸ',
      '೨ ಚಮಚ ತುಪ್ಪ',
      'ಗೋಡಂಬಿ ಮತ್ತು ಕರಿಬೇವಿನ ಒಗ್ಗರಣೆ'
    ],
    instructions_en: [
      '1. Pressure cook rice and toor dal together with turmeric until soft.',
      '2. Cook vegetables with tamarind extract and a pinch of salt.',
      '3. Mix Indima Bisi Bele Bath powder in 1/2 cup warm water to form a smooth paste and add to vegetables.',
      '4. Add mashed rice-dal mix, adjust consistency with hot water, and simmer for 6-8 minutes.',
      '5. Temper with mustard seeds, curry leaves, and cashews roasted in pure ghee. Serve piping hot with potato chips or boondi raita.'
    ],
    instructions_kn: [
      '೧. ಅಕ್ಕಿ ಮತ್ತು ತೊಗರಿಬೇಳೆಯನ್ನು ಒಟ್ಟಿಗೆ ಮೆತ್ತಗೆ ಬೇಯಿಸಿಕೊಳ್ಳಿ.',
      '೨. ತರಕಾರಿಗಳನ್ನು ಹುಣಸೆ ರಸ ಮತ್ತು ಉಪ್ಪಿನೊಂದಿಗೆ ಬೇಯಿಸಿ.',
      '೩. ಇಂದಿಮಾ ಬಿಸಿಬೇಳೆಬಾತ್ ಪುಡಿಯನ್ನು ನೀರಿನಲ್ಲಿ ಕಲೆಸಿ ತರಕಾರಿಗೆ ಸೇರಿಸಿ.',
      '೪. ಬೆಂದ ಅನ್ನ-ಬೇಳೆ ಮಿಶ್ರಣವನ್ನು ಸೇರಿಸಿ, ೬-೮ ನಿಮಿಷ ಕುದಿಸಿ.',
      '೫. ತುಪ್ಪದಲ್ಲಿ ಗೋಡಂಬಿ ಮತ್ತು ಸಾಸಿವೆ ಒಗ್ಗರಣೆ ನೀಡಿ ಬಿಸಿಬಿಸಿಯಾಗಿ ಸವಿಯಿರಿ.'
    ],
    active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'rec-maniyara-rasam',
    title_en: 'Heritage Pepper Cumin Saaru (Rasam)',
    title_kn: 'ಪಾರಂಪರಿಕ ಮೆಣಸು-ಜೀರಿಗೆ ಮನೆಯ ಸಾರು',
    description_en: 'A soothing South Karnataka digestive rasam loaded with crushed garlic, curry leaves, and golden roasted Indima Rasam Powder.',
    description_kn: 'ಜೀರ್ಣಶಕ್ತಿಗೆ ಅತ್ಯುತ್ತಮವಾದ, ಬಿಸಿ ಅನ್ನಕ್ಕೆ ಮತ್ತು ಕುಡಿಯಲು ಹಿತಕರವಾದ ಘಮಘಮಿಸುವ ಮನೆಯ ಸಾರು.',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80',
    prep_time: '10 mins',
    cook_time: '15 mins',
    servings: '4-5 Servings',
    featured_spice_ids: ['prod-rasam-powder'],
    ingredients_en: [
      '2 ripe Tomatoes (chopped)',
      '2 tbsp Indima Heritage Rasam Powder',
      '1/4 cup Toor Dal Water (optional)',
      '1 tbsp Tamarind pulp',
      '1 tsp Jaggery',
      '6 crushed Garlic cloves',
      'Fresh Coriander and Curry leaves',
      '1 tbsp Ghee for tadka'
    ],
    ingredients_kn: [
      '೨ ಹಣ್ಣಾದ ಟೊಮೆಟೊ',
      '೨ ಚಮಚ ಇಂದಿಮಾ ಪಾರಂಪರಿಕ ರಸಂ ಪುಡಿ',
      '೧/೪ ಕಪ್ ಬೇಳೆ ಕಟ್ಟು',
      '೧ ಚಮಚ ಹುಣಸೆಹಣ್ಣಿನ ರಸ',
      '೧ ಸಣ್ಣ ತುಂಡು ಬೆಲ್ಲ',
      '೬ ಎಸಳು ಜಜ್ಜಿದ ಬೆಳ್ಳುಳ್ಳಿ',
      'ಕೊತ್ತಂಬರಿ ಸೊಪ್ಪು ಮತ್ತು ಕರಿಬೇವು',
      '೧ ಚಮಚ ತುಪ್ಪ'
    ],
    instructions_en: [
      '1. Boil tomatoes, tamarind pulp, salt, and jaggery in 3 cups of water.',
      '2. Add 2 tablespoons of Indima Rasam powder and dal water. Boil for 4 minutes until aromatic.',
      '3. In a small pan, heat ghee. Splutter mustard seeds, cumin, crushed garlic, and curry leaves.',
      '4. Pour hot tadka over rasam, cover immediately with a lid, and garnish with fresh coriander.'
    ],
    instructions_kn: [
      '೧. ಟೊಮೆಟೊ, ಹುಣಸೆ ರಸ, ಉಪ್ಪು ಮತ್ತು ಬೆಲ್ಲವನ್ನು ನೀರಿನಲ್ಲಿ ಚೆನ್ನಾಗಿ ಕುದಿಸಿ.',
      '೨. ಇಂದಿಮಾ ರಸಂ ಪುಡಿ ಮತ್ತು ಬೇಳೆ ಕಟ್ಟು ಸೇರಿಸಿ ೪ ನಿಮಿಷ ಕುದಿಸಿ.',
      '೩. ತುಪ್ಪದಲ್ಲಿ ಸಾಸಿವೆ, ಜೀರಿಗೆ, ಬೆಳ್ಳುಳ್ಳಿ ಮತ್ತು ಕರಿಬೇವಿನ ಒಗ್ಗರಣೆ ಹಾಕಿ.',
      '೪. ಕೊತ್ತಂಬರಿ ಸೊಪ್ಪು ಉದುರಿಸಿ ಮುಚ್ಚಳ ಮುಚ್ಚಿ.'
    ],
    active: true,
    created_at: new Date().toISOString()
  }
];

const INITIAL_BANNERS: Banner[] = [
  {
    id: 'ban-main-hero',
    type: 'hero',
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1600&auto=format&fit=crop&q=80',
    badge_en: '100% Heritage Stone Ground',
    badge_kn: '೧೦೦% ನೈಸರ್ಗಿಕ ಕಲ್ಲಿನಿಂದ ಬೀಸಿದ ಮಸಾಲೆಗಳು',
    title_en: 'Authentic Pure Spices from Traditional Karnataka Kitchens',
    title_kn: 'ಕರ್ನಾಟಕದ ಮನೆ ಮನೆಗಳ ಸಾಂಪ್ರದಾಯಿಕ ಪರಿಶುದ್ಧ ಮಸಾಲೆಗಳು',
    subtitle_en: 'Hand-roasted spices with zero preservatives, colorants, or synthetic flavour enhancers. Freshly packed in Basavanagudi.',
    subtitle_kn: 'ಯಾವುದೇ ರಾಸಾಯನಿಕ ಅಥವಾ ಕೃತಕ ಬಣ್ಣಗಳಿಲ್ಲದ, ಅಜ್ಜಿ ಮನೆಯ ಕೈರುಚಿಯ ಅಪ್ಪಟ ಸುವಾಸನೆ.',
    offer_text_en: 'Special Festive Offer: Flat 10% OFF on Orders Above ₹399 • Code: INDIMA10',
    offer_text_kn: 'ಹಬ್ಬದ ವಿಶೇಷ ರಿಯಾಯಿತಿ: ₹೩೯೯ ಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ಆರ್ಡರ್‌ಗಳ ಮೇಲೆ 10% ರಿಯಾಯಿತಿ • ಕೋಡ್: INDIMA10',
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
  private firestore: AdminFirestore | null = null;
  private isFirestoreReady = false;
  private lastFirestoreError: string | null = null;

  constructor() {
    this.data = this.loadDatabase();
    this.initFirestore().catch(e => {
      console.warn('[Firestore Admin] Async initialization notice:', e.message);
    });
  }

  public async initFirestore(): Promise<boolean> {
    try {
      const adminConfig = getFirebaseAdmin();
      this.firestore = adminConfig.firestore;

      console.log(`[Firestore Admin] Target database: "${adminConfig.databaseId}" in project "${adminConfig.projectId}" (Auth source: ${adminConfig.source})`);
      await this.reloadFromFirestore();
      this.isFirestoreReady = true;
      this.lastFirestoreError = null;
      console.log(
        `[Firestore Admin] Authoritative catalog synced: ${this.data.products.length} products, ${this.data.customers.length} customers, ${this.data.orders.length} orders.`
      );
      return true;
    } catch (err: any) {
      this.isFirestoreReady = false;
      this.lastFirestoreError = err.message || String(err);
      console.error('[Firestore Admin] ❌ Connection error:', err.message || err);
      return false;
    }
  }

  public getIsFirestoreReady(): boolean {
    return this.isFirestoreReady && this.firestore !== null;
  }

  public getLastFirestoreError(): string | null {
    return this.lastFirestoreError;
  }

  public getStorageBucket() {
    return getAdminStorageBucketInstance();
  }

  public async reloadFromFirestore(): Promise<void> {
    if (!this.firestore) return;
    try {
      // Check if products exist in Firestore
      const prodSnap = await this.firestore.collection('products').get();
      if (!prodSnap.empty) {
        const prods: Product[] = [];
        prodSnap.forEach(d => prods.push(d.data() as Product));
        this.data.products = prods;
      }

      // 2. Categories
      const catSnap = await this.firestore.collection('categories').get();
      if (!catSnap.empty) {
        const cats: Category[] = [];
        catSnap.forEach(d => cats.push(d.data() as Category));
        this.data.categories = cats.sort((a, b) => (a.order || 0) - (b.order || 0));
      }

      // 3. Orders
      const orderSnap = await this.firestore.collection('orders').get();
      if (!orderSnap.empty) {
        const ords: Order[] = [];
        orderSnap.forEach(d => ords.push(d.data() as Order));
        this.data.orders = ords.sort(
          (a, b) => new Date(b.order_date || b.created_at).getTime() - new Date(a.order_date || a.created_at).getTime()
        );
      }

      // 4. Customers
      const custSnap = await this.firestore.collection('customers').get();
      if (!custSnap.empty) {
        const custs: Customer[] = [];
        custSnap.forEach(d => custs.push(d.data() as Customer));
        this.data.customers = custs;
      }

      // 5. Recipes
      const recSnap = await this.firestore.collection('recipes').get();
      if (!recSnap.empty) {
        const recs: Recipe[] = [];
        recSnap.forEach(d => recs.push(d.data() as Recipe));
        this.data.recipes = recs;
      }

      // 6. Banners
      const banSnap = await this.firestore.collection('banners').get();
      if (!banSnap.empty) {
        const bans: Banner[] = [];
        banSnap.forEach(d => bans.push(d.data() as Banner));
        this.data.banners = bans;
      }

      // 7. Offers
      const offSnap = await this.firestore.collection('offers').get();
      if (!offSnap.empty) {
        const offs: Offer[] = [];
        offSnap.forEach(d => offs.push(d.data() as Offer));
        this.data.offers = offs;
      }

      // 8. Reviews
      const revSnap = await this.firestore.collection('reviews').get();
      if (!revSnap.empty) {
        const revs: Review[] = [];
        revSnap.forEach(d => revs.push(d.data() as Review));
        this.data.reviews = revs;
      }

      // 9. Audit Logs
      const auditSnap = await this.firestore.collection('audit_logs').get();
      if (!auditSnap.empty) {
        const logs: AdminAuditLog[] = [];
        auditSnap.forEach(d => logs.push(d.data() as AdminAuditLog));
        this.data.auditLogs = logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }

      // 10. Leads
      const leadSnap = await this.firestore.collection('leads').get();
      if (!leadSnap.empty) {
        const lds: Lead[] = [];
        leadSnap.forEach(d => lds.push(d.data() as Lead));
        this.data.leads = lds;
      }

      // 11. Settings
      const setDoc = await this.firestore.collection('settings').doc('store_settings').get();
      if (setDoc.exists) {
        this.data.settings = { ...INITIAL_SETTINGS, ...(setDoc.data() as BusinessSettings) };
      }

      this.persistNow(this.data);
    } catch (e: any) {
      console.warn('[Firestore Admin] Notice loading collections from Firestore:', e.message);
    }
  }

  private async getFirestoreInstance(): Promise<AdminFirestore | null> {
    if (this.firestore) return this.firestore;
    await this.initFirestore();
    return this.firestore;
  }

  public async setFirestoreDoc(collectionName: string, docId: string, itemData: any): Promise<void> {
    try {
      const fsDb = await this.getFirestoreInstance();
      if (!fsDb) {
        const errMsg = `Firestore Admin instance unavailable (${this.lastFirestoreError || 'Not connected'}). Write failed for ${collectionName}/${docId}`;
        console.error(`[Firestore Admin] ❌ ${errMsg}`);
        throw new Error(errMsg);
      }
      const clean = JSON.parse(JSON.stringify(itemData));
      await fsDb.collection(collectionName).doc(String(docId)).set(clean, { merge: true });
    } catch (err: any) {
      console.error(`[Firestore Admin] ❌ Error writing document ${collectionName}/${docId}:`, err.message || err);
      throw err;
    }
  }

  public async deleteFirestoreDoc(collectionName: string, docId: string): Promise<void> {
    try {
      const fsDb = await this.getFirestoreInstance();
      if (!fsDb) {
        const errMsg = `Firestore Admin instance unavailable (${this.lastFirestoreError || 'Not connected'}). Delete failed for ${collectionName}/${docId}`;
        console.error(`[Firestore Admin] ❌ ${errMsg}`);
        throw new Error(errMsg);
      }
      await fsDb.collection(collectionName).doc(String(docId)).delete();
    } catch (err: any) {
      console.error(`[Firestore Admin] ❌ Error deleting document ${collectionName}/${docId}:`, err.message || err);
      throw err;
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
      console.error('Error loading fallback database, initializing defaults:', e);
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
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    // data/db.json and data/db.backup.json are strictly preserved as read-only historical assets.
    // Cloud Firestore is the authoritative database.
  }

  public save() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    // No disk writes - state is managed in memory and synced directly to Cloud Firestore
    this.saveTimeout = setTimeout(() => {
      this.saveTimeout = null;
      this.persistNow(this.data);
    }, 100);
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
    return Boolean(password && current && password.trim() === current.trim());
  }

  public async setAdminPassword(newPassword: string, adminUser = 'Admin'): Promise<boolean> {
    if (!newPassword || newPassword.trim().length < 6) {
      return false;
    }
    this.data.settings.admin_password = newPassword.trim();
    this.save();
    Promise.allSettled([
      this.logAudit(adminUser, 'ADMIN_PASSWORD_CHANGED', 'security', 'Admin master password updated'),
      this.setFirestoreDoc('settings', 'store_settings', this.data.settings)
    ]).catch(() => {});
    return true;
  }

  public async updateSettings(updates: Partial<BusinessSettings>, adminUser = 'Admin'): Promise<BusinessSettings> {
    this.data.settings = { ...this.data.settings, ...updates };
    this.save();
    Promise.allSettled([
      this.logAudit(adminUser, 'SETTINGS_UPDATED', 'settings', 'Business settings updated'),
      this.setFirestoreDoc('settings', 'store_settings', this.data.settings)
    ]).catch(() => {});
    return this.data.settings;
  }

  // --- Products ---
  public getProducts(): Product[] {
    return this.data.products;
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  public async addProduct(product: Partial<Product>, adminUser = 'Admin'): Promise<Product> {
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
      images:
        Array.isArray(product.images) && product.images.length > 0
          ? product.images
          : ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80'],
      badges: Array.isArray(product.badges) ? product.badges : ['natural', 'homemade'],
      active: product.active !== false,
      rating: Number(product.rating) || 5.0,
      review_count: Number(product.review_count) || 0,
      video: product.video || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.products.unshift(newProduct);
    this.save();
    
    Promise.allSettled([
      this.setFirestoreDoc('products', newProduct.id, newProduct),
      this.logAudit(adminUser, 'PRODUCT_CREATED', newProduct.id, `Created product ${newProduct.name_en}`)
    ]).catch(() => {});

    return newProduct;
  }

  public async updateProduct(id: string, updates: Partial<Product>, adminUser = 'Admin'): Promise<Product | null> {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.products[idx] = {
      ...this.data.products[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    const updatedProd = this.data.products[idx];
    this.save();

    Promise.allSettled([
      this.setFirestoreDoc('products', id, updatedProd),
      this.logAudit(adminUser, 'PRODUCT_UPDATED', id, `Updated product ${updatedProd.name_en}`)
    ]).catch(() => {});

    return updatedProd;
  }

  public async deleteProduct(id: string, adminUser = 'Admin'): Promise<boolean> {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    const name = this.data.products[idx].name_en;
    this.data.products.splice(idx, 1);
    this.save();

    Promise.allSettled([
      this.deleteFirestoreDoc('products', id),
      this.logAudit(adminUser, 'PRODUCT_DELETED', id, `Deleted product ${name}`)
    ]).catch(() => {});

    return true;
  }

  // --- Categories ---
  public getCategories(): Category[] {
    return this.data.categories.sort((a, b) => a.order - b.order);
  }

  public async addCategory(cat: Omit<Category, 'id'>, adminUser = 'Admin'): Promise<Category> {
    const newCat: Category = {
      ...cat,
      id: 'cat-' + Date.now()
    };
    this.data.categories.push(newCat);
    this.save();

    Promise.allSettled([
      this.setFirestoreDoc('categories', newCat.id, newCat),
      this.logAudit(adminUser, 'CATEGORY_CREATED', newCat.id, `Created category ${newCat.name_en}`)
    ]).catch(() => {});

    return newCat;
  }

  public async updateCategory(id: string, updates: Partial<Category>, adminUser = 'Admin'): Promise<Category | null> {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
    const updated = this.data.categories[idx];
    this.save();

    Promise.allSettled([
      this.setFirestoreDoc('categories', id, updated),
      this.logAudit(adminUser, 'CATEGORY_UPDATED', id, `Updated category ${updated.name_en}`)
    ]).catch(() => {});

    return updated;
  }

  public async deleteCategory(id: string, adminUser = 'Admin'): Promise<boolean> {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return false;
    const name = this.data.categories[idx].name_en;
    this.data.categories.splice(idx, 1);
    this.save();

    Promise.allSettled([
      this.deleteFirestoreDoc('categories', id),
      this.logAudit(adminUser, 'CATEGORY_DELETED', id, `Deleted category ${name}`)
    ]).catch(() => {});

    return true;
  }

  // --- Inventory Quick Stock Update ---
  public async updateStock(id: string, newStock: number, threshold?: number, adminUser = 'Admin'): Promise<Product | null> {
    const product = this.data.products.find(p => p.id === id);
    if (!product) return null;
    product.stock = Math.max(0, newStock);
    if (threshold !== undefined) {
      product.low_stock_threshold = Math.max(0, threshold);
    }
    product.updated_at = new Date().toISOString();
    this.save();

    Promise.allSettled([
      this.setFirestoreDoc('products', id, product),
      this.logAudit(adminUser, 'INVENTORY_STOCK_UPDATE', id, `Updated stock to ${newStock} for ${product.name_en}`)
    ]).catch(() => {});

    return product;
  }

  // --- Customers ---
  public findCustomerByPhone(phone: string): Customer | undefined {
    const clean = phone.replace(/\D/g, '').slice(-10);
    return this.data.customers.find(c => c.phone.replace(/\D/g, '').slice(-10) === clean);
  }

  public getCustomers(): Customer[] {
    return this.data.customers;
  }

  public async upsertCustomer(
    customerData: Partial<Customer> & { phone: string; name: string; email: string }
  ): Promise<Customer> {
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
    await this.setFirestoreDoc('customers', customer.id, customer);
    this.save();
    return customer;
  }

  public async deleteCustomer(id: string, adminUser = 'Admin'): Promise<boolean> {
    const idx = this.data.customers.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.data.customers.splice(idx, 1);
    await this.logAudit(adminUser, 'CUSTOMER_DELETED', id, `Deleted customer ${id}`);
    await this.deleteFirestoreDoc('customers', id);
    this.save();
    return true;
  }

  // --- Orders ---
  public getOrders(): Order[] {
    return this.data.orders.sort(
      (a, b) => new Date(b.order_date || b.created_at).getTime() - new Date(a.order_date || a.created_at).getTime()
    );
  }

  public getOrderById(id: string): Order | undefined {
    if (!id || typeof id !== 'string') return undefined;
    const cleanId = id.trim().toLowerCase();
    return this.data.orders.find(o => {
      const matchId = o.id && o.id.trim().toLowerCase() === cleanId;
      const matchInternal = o.internal_order_id && o.internal_order_id.trim().toLowerCase() === cleanId;
      const matchRzpOrder = o.razorpay_order_id && o.razorpay_order_id.trim().toLowerCase() === cleanId;
      const matchRzpPay = o.razorpay_payment_id && o.razorpay_payment_id.trim().toLowerCase() === cleanId;
      const matchTxn = o.transaction_id && o.transaction_id.trim().toLowerCase() === cleanId;
      const matchUtr = o.utr_reference && o.utr_reference.trim().toLowerCase() === cleanId;
      return matchId || matchInternal || matchRzpOrder || matchRzpPay || matchTxn || matchUtr;
    });
  }

  public async findOrFetchOrder(id: string): Promise<Order | undefined> {
    const existing = this.getOrderById(id);
    if (existing) return existing;

    if (!id || typeof id !== 'string') return undefined;
    const cleanId = id.trim();

    // Check Firestore directly if not yet loaded in cache
    try {
      const fsDb = await this.getFirestoreInstance();
      if (fsDb) {
        // Try direct doc lookup
        const docSnap = await fsDb.collection('orders').doc(cleanId).get();
        if (docSnap.exists) {
          const order = docSnap.data() as Order;
          if (!this.data.orders.some(o => o.id === order.id)) {
            this.data.orders.unshift(order);
          }
          return order;
        }

        // Try querying by lowercase or alternative ID
        const orderSnap = await fsDb.collection('orders').get();
        if (!orderSnap.empty) {
          const lowerId = cleanId.toLowerCase();
          for (const doc of orderSnap.docs) {
            const ord = doc.data() as Order;
            if (
              (ord.id && ord.id.toLowerCase() === lowerId) ||
              (ord.internal_order_id && ord.internal_order_id.toLowerCase() === lowerId) ||
              (ord.razorpay_order_id && ord.razorpay_order_id.toLowerCase() === lowerId)
            ) {
              if (!this.data.orders.some(o => o.id === ord.id)) {
                this.data.orders.unshift(ord);
              }
              return ord;
            }
          }
        }
      }
    } catch (e: any) {
      console.warn('[Firestore Admin] Notice fetching order fallback:', e.message);
    }

    return undefined;
  }

  public getOrdersByPhone(phone: string): Order[] {
    const clean = phone.replace(/\D/g, '').slice(-10);
    return this.data.orders
      .filter(o => o.customer_phone.replace(/\D/g, '').slice(-10) === clean)
      .sort(
        (a, b) => new Date(b.order_date || b.created_at).getTime() - new Date(a.order_date || a.created_at).getTime()
      );
  }

  public async createOrder(order: Order): Promise<Order> {
    this.data.orders.unshift(order);

    // Update customer stats
    const customer = this.findCustomerByPhone(order.customer_phone);
    if (customer) {
      customer.total_orders += 1;
      customer.total_spent += order.total_amount;
      customer.saved_address = order.address_snapshot;
      customer.updated_at = new Date().toISOString();
      await this.setFirestoreDoc('customers', customer.id, customer);
    }

    // Atomically decrement inventory for ordered items
    for (const item of order.items) {
      const prod = this.getProductById(item.product_id);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        prod.updated_at = new Date().toISOString();
        await this.setFirestoreDoc('products', prod.id, prod);
      }
    }

    await this.logAudit('System', 'ORDER_CREATED', order.id, `Order of ₹${order.total_amount} placed by ${order.customer_name}`);
    await this.setFirestoreDoc('orders', order.id, order);
    this.save();
    return order;
  }

  public async updateOrderStatus(
    orderId: string,
    orderStatus?: Order['order_status'],
    trackingNumber?: string,
    expectedDelivery?: string,
    paymentStatus?: PaymentStatus,
    adminUser = 'Admin'
  ): Promise<Order | null> {
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

    await this.logAudit(
      adminUser,
      'ORDER_STATUS_CHANGED',
      orderId,
      `Status updated: ${orderStatus || ''} ${paymentStatus ? `Payment: ${paymentStatus}` : ''}`
    );
    await this.setFirestoreDoc('orders', orderId, order);
    this.save();
    return order;
  }

  public async updateOrder(order: Order): Promise<Order> {
    const idx = this.data.orders.findIndex(o => o.id === order.id);
    if (idx !== -1) {
      this.data.orders[idx] = { ...order };
    }
    await this.setFirestoreDoc('orders', order.id, order);
    this.save();
    return order;
  }

  public async updateOrderAddress(
    orderId: string,
    newAddress: Order['address_snapshot'],
    reason: string,
    adminUser = 'Admin'
  ): Promise<Order | null> {
    const order = this.getOrderById(orderId);
    if (!order) return null;

    const oldAddress = { ...order.address_snapshot };
    order.address_snapshot = { ...newAddress };
    order.updated_at = new Date().toISOString();

    if (!order.address_change_history) order.address_change_history = [];
    order.address_change_history.push({
      changed_at: new Date().toISOString(),
      changed_by: adminUser,
      old_address: oldAddress,
      new_address: newAddress,
      reason: reason || 'Administrative address correction'
    });

    await this.logAudit(adminUser, 'ORDER_ADDRESS_MODIFIED', orderId, `Address amended: ${reason}`);
    await this.setFirestoreDoc('orders', orderId, order);
    this.save();
    return order;
  }

  public async updateNotificationStatus(
    orderId: string,
    status: 'Sent' | 'Pending' | 'Failed',
    error?: string
  ): Promise<Order | null> {
    const order = this.getOrderById(orderId);
    if (!order) return null;
    order.whatsapp_notification_status = status;
    order.whatsapp_notification_error = error;
    order.updated_at = new Date().toISOString();
    await this.setFirestoreDoc('orders', orderId, order);
    this.save();
    return order;
  }

  public async deleteOrder(orderId: string, adminUser = 'Admin'): Promise<boolean> {
    const idx = this.data.orders.findIndex(o => o.id === orderId);
    if (idx === -1) return false;
    this.data.orders.splice(idx, 1);
    await this.logAudit(adminUser, 'ORDER_DELETED', orderId, `Deleted test order ${orderId}`);
    await this.deleteFirestoreDoc('orders', orderId);
    this.save();
    return true;
  }

  // --- Banners ---
  public getBanners(): Banner[] {
    return this.data.banners;
  }

  public async updateBanner(id: string, updates: Partial<Banner>, adminUser = 'Admin'): Promise<Banner | null> {
    const idx = this.data.banners.findIndex(b => b.id === id);
    if (idx === -1) return null;
    this.data.banners[idx] = { ...this.data.banners[idx], ...updates };
    const updated = this.data.banners[idx];
    await this.logAudit(adminUser, 'BANNER_UPDATED', id, `Updated banner ${updated.title_en}`);
    await this.setFirestoreDoc('banners', id, updated);
    this.save();
    return updated;
  }

  public async addBanner(banner: Omit<Banner, 'id'>, adminUser = 'Admin'): Promise<Banner> {
    const newBanner: Banner = { ...banner, id: 'ban-' + Date.now() };
    this.data.banners.push(newBanner);
    await this.logAudit(adminUser, 'BANNER_CREATED', newBanner.id, `Added banner ${newBanner.title_en}`);
    await this.setFirestoreDoc('banners', newBanner.id, newBanner);
    this.save();
    return newBanner;
  }

  public async deleteBanner(id: string, adminUser = 'Admin'): Promise<boolean> {
    const idx = this.data.banners.findIndex(b => b.id === id);
    if (idx === -1) return false;
    this.data.banners.splice(idx, 1);
    await this.logAudit(adminUser, 'BANNER_DELETED', id, 'Deleted banner');
    await this.deleteFirestoreDoc('banners', id);
    this.save();
    return true;
  }

  // --- Recipes ---
  public getRecipes(): Recipe[] {
    return this.data.recipes;
  }

  public async addRecipe(recipe: Omit<Recipe, 'id' | 'created_at'>, adminUser = 'Admin'): Promise<Recipe> {
    const newRec: Recipe = {
      ...recipe,
      id: 'rec-' + Date.now(),
      created_at: new Date().toISOString()
    };
    this.data.recipes.push(newRec);
    await this.logAudit(adminUser, 'RECIPE_CREATED', newRec.id, `Created recipe ${newRec.title_en}`);
    await this.setFirestoreDoc('recipes', newRec.id, newRec);
    this.save();
    return newRec;
  }

  public async updateRecipe(id: string, updates: Partial<Recipe>, adminUser = 'Admin'): Promise<Recipe | null> {
    const idx = this.data.recipes.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.data.recipes[idx] = { ...this.data.recipes[idx], ...updates };
    const updated = this.data.recipes[idx];
    await this.logAudit(adminUser, 'RECIPE_UPDATED', id, `Updated recipe ${updated.title_en}`);
    await this.setFirestoreDoc('recipes', id, updated);
    this.save();
    return updated;
  }

  public async deleteRecipe(id: string, adminUser = 'Admin'): Promise<boolean> {
    const idx = this.data.recipes.findIndex(r => r.id === id);
    if (idx === -1) return false;
    this.data.recipes.splice(idx, 1);
    await this.logAudit(adminUser, 'RECIPE_DELETED', id, 'Deleted recipe');
    await this.deleteFirestoreDoc('recipes', id);
    this.save();
    return true;
  }

  // --- Offers ---
  public getOffers(): Offer[] {
    return this.data.offers;
  }

  public async addOffer(offer: Omit<Offer, 'id'>, adminUser = 'Admin'): Promise<Offer> {
    const newOff: Offer = { ...offer, id: 'off-' + Date.now() };
    this.data.offers.push(newOff);
    await this.logAudit(adminUser, 'OFFER_CREATED', newOff.id, `Created offer ${newOff.code}`);
    await this.setFirestoreDoc('offers', newOff.id, newOff);
    this.save();
    return newOff;
  }

  public async updateOffer(id: string, updates: Partial<Offer>, adminUser = 'Admin'): Promise<Offer | null> {
    const idx = this.data.offers.findIndex(o => o.id === id);
    if (idx === -1) return null;
    this.data.offers[idx] = { ...this.data.offers[idx], ...updates };
    const updated = this.data.offers[idx];
    await this.logAudit(adminUser, 'OFFER_UPDATED', id, `Updated offer ${updated.code}`);
    await this.setFirestoreDoc('offers', id, updated);
    this.save();
    return updated;
  }

  public async deleteOffer(id: string, adminUser = 'Admin'): Promise<boolean> {
    const idx = this.data.offers.findIndex(o => o.id === id);
    if (idx === -1) return false;
    this.data.offers.splice(idx, 1);
    await this.logAudit(adminUser, 'OFFER_DELETED', id, 'Deleted offer');
    await this.deleteFirestoreDoc('offers', id);
    this.save();
    return true;
  }

  // --- Reviews ---
  public getReviews(): Review[] {
    return this.data.reviews;
  }

  public async addReview(review: Omit<Review, 'id' | 'date' | 'approved'>): Promise<Review> {
    const newRev: Review = {
      ...review,
      id: 'rev-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      approved: true
    };
    this.data.reviews.unshift(newRev);
    await this.setFirestoreDoc('reviews', newRev.id, newRev);
    this.save();
    return newRev;
  }

  public async updateReviewStatus(id: string, approved: boolean, adminUser = 'Admin'): Promise<boolean> {
    const rev = this.data.reviews.find(r => r.id === id);
    if (!rev) return false;
    rev.approved = approved;
    await this.logAudit(adminUser, 'REVIEW_STATUS', id, `Review ${approved ? 'approved' : 'hidden'}`);
    await this.setFirestoreDoc('reviews', id, rev);
    this.save();
    return true;
  }

  public async deleteReview(id: string, adminUser = 'Admin'): Promise<boolean> {
    const idx = this.data.reviews.findIndex(r => r.id === id);
    if (idx === -1) return false;
    this.data.reviews.splice(idx, 1);
    await this.logAudit(adminUser, 'REVIEW_DELETED', id, 'Deleted review');
    await this.deleteFirestoreDoc('reviews', id);
    this.save();
    return true;
  }

  // --- Leads ---
  public async addLead(phone: string, source = 'Popup 10% OFF'): Promise<Lead> {
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
    await this.setFirestoreDoc('leads', lead.id, lead);
    this.save();
    return lead;
  }

  public getLeads(): Lead[] {
    return this.data.leads;
  }

  // --- Audit Logs ---
  public async logAudit(adminUser: string, actionType: string, targetId: string, details: string): Promise<void> {
    const log: AdminAuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      timestamp: new Date().toISOString(),
      admin_username: adminUser,
      action_type: actionType,
      target_id: targetId,
      details
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs.pop();
    }
    await this.setFirestoreDoc('audit_logs', log.id, log);
  }

  public getAuditLogs(): AdminAuditLog[] {
    return this.data.auditLogs;
  }
}

export const db = new DataStore();
