export type Language = 'en' | 'kn';

export interface ProductBadge {
  type: 'bestseller' | 'new' | 'homemade' | 'natural' | 'festival_special' | 'limited_stock' | 'featured';
  label_en: string;
  label_kn: string;
}

export interface Product {
  id: string;
  sku: string;
  name_en: string;
  name_kn: string;
  description_en: string;
  description_kn: string;
  ingredients_en: string;
  ingredients_kn: string;
  category_id: string;
  weight: string; // e.g. "100g", "250g", "500g"
  shelf_life: string; // e.g. "12 Months"
  storage_en: string;
  storage_kn: string;
  traditional_info_en: string;
  traditional_info_kn: string;
  mrp: number;
  price: number;
  discount_percentage: number;
  stock: number;
  low_stock_threshold: number;
  images: string[];
  video?: string;
  badges: ('bestseller' | 'new' | 'homemade' | 'natural' | 'festival_special' | 'limited_stock' | 'featured')[];
  active: boolean;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name_en: string;
  name_kn: string;
  description_en: string;
  description_kn: string;
  image: string;
  enabled: boolean;
  order: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selected_weight?: string;
}

export interface Address {
  fullName: string;
  phone: string;
  email: string;
  houseFlat: string;
  street: string;
  area: string;
  landmark?: string;
  pincode: string;
  city: string;
  district: string;
  state: string;
  deliveryInstructions?: string;
}

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'payment_failed'
  | 'Order Placed'
  | 'Payment Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Payment Failed';

export type PaymentStatus =
  | 'Pending'
  | 'Payment Pending'
  | 'Processing'
  | 'Successful'
  | 'PAID'
  | 'Failed'
  | 'FAILED'
  | 'CANCELLED'
  | 'Refunded'
  | 'confirmed'
  | 'pending'
  | 'failed';

export interface OrderItem {
  product_id: string;
  sku: string;
  name_en: string;
  name_kn: string;
  image: string;
  quantity: number;
  unit_price: number;
  mrp: number;
  discount: number;
  subtotal: number;
  weight?: string;
  total_price?: number;
}

export interface Order {
  id: string;
  internal_order_id?: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  items: OrderItem[];
  subtotal: number;
  discount_amount: number;
  coupon_code?: string;
  shipping_fee: number;
  total_amount: number;
  amount?: number;
  currency?: string;
  address_snapshot: Address;
  payment_method: 'UPI' | 'Razorpay' | 'UPI / Razorpay' | string;
  payment_status: PaymentStatus;
  status: OrderStatus;
  order_status?: OrderStatus;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  paid_at?: string;
  transaction_id?: string;
  upi_reference_id?: string;
  utr_reference?: string;
  payment_timestamp?: string;
  payment_details?: {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    utr_reference?: string;
    transaction_id?: string;
    method?: string;
  };
  tracking_number?: string;
  expected_delivery?: string;
  whatsapp_notification_status?: 'Sent' | 'Pending' | 'Failed' | 'sent' | 'pending' | 'failed';
  whatsapp_notification_error?: string;
  stock_restored?: boolean;
  created_at: string;
  order_date?: string;
  updated_at?: string;
  address_change_history?: {
    changed_at: string;
    changed_by: string;
    old_address: Address;
    new_address: Address;
    reason: string;
  }[];
}

export interface Customer {
  id: string;
  phone: string;
  name: string;
  email: string;
  saved_address?: Address;
  created_at: string;
  updated_at?: string;
  total_spent: number;
  total_orders: number;
  orders_count?: number;
}

export interface AdminStats {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  lowStockProducts: Product[];
  ordersByStatus: {
    placed: number;
    processing: number;
    packed: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    [key: string]: number;
  };
  recentOrders: Order[];
  recentCustomers: Customer[];
}

export interface Recipe {
  id: string;
  title_en: string;
  title_kn: string;
  description_en: string;
  description_kn: string;
  image: string;
  video?: string;
  prep_time: string;
  cook_time: string;
  servings: string;
  featured_spice_ids: string[];
  ingredients_en: string[];
  ingredients_kn: string[];
  instructions_en: string[];
  instructions_kn: string[];
  active: boolean;
  created_at: string;
}

export interface Banner {
  id: string;
  type: 'hero' | 'festival' | 'campaign' | 'offer';
  media_type: 'image' | 'video';
  media_url: string;
  fallback_image?: string;
  badge_en: string;
  badge_kn: string;
  title_en: string;
  title_kn: string;
  subtitle_en: string;
  subtitle_kn: string;
  offer_text_en: string;
  offer_text_kn: string;
  festival_greeting_en?: string;
  festival_greeting_kn?: string;
  primary_btn_text_en: string;
  primary_btn_text_kn: string;
  primary_btn_action: string;
  secondary_btn_text_en: string;
  secondary_btn_text_kn: string;
  secondary_btn_action: string;
  enabled: boolean;
  start_date?: string;
  end_date?: string;
}

export interface Offer {
  id: string;
  code: string;
  title_en: string;
  title_kn: string;
  description_en: string;
  description_kn: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number;
  active: boolean;
  start_date?: string;
  end_date?: string;
}

export interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  customer_city: string;
  rating: number;
  comment_en: string;
  comment_kn?: string;
  date: string;
  approved: boolean;
}

export interface BusinessSettings {
  business_name: string;
  tagline_en: string;
  tagline_kn: string;
  tagline_sa?: string; // Ancient Sanskrit Shloka: e.g. "आयुर्वेदोऽमृतानाम् • शुद्धं सात्त्विकं दिव्यम्"
  logo_url: string;
  phone: string;
  whatsapp_number: string;
  email: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  upi_id: string;
  upi_merchant_name: string;
  upi_qr_code_url?: string;
  instagram_url: string;
  facebook_url: string;
  youtube_url: string;
  twitter_url?: string;
  address?: string;
  free_delivery_threshold: number;
  standard_shipping_fee: number;
  floating_whatsapp_enabled: boolean;
  default_whatsapp_msg_en: string;
  default_whatsapp_msg_kn: string;
  whatsapp_api_configured: boolean;
  whatsapp_api_token?: string;
  admin_password?: string;
  policy_privacy_en: string;
  policy_privacy_kn: string;
  policy_terms_en: string;
  policy_terms_kn: string;
  policy_refund_en: string;
  policy_refund_kn: string;
  policy_shipping_en: string;
  policy_shipping_kn: string;
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  admin_username: string;
  action_type: string;
  target_id: string;
  details: string;
}

export interface Lead {
  id: string;
  phone: string;
  created_at: string;
  source: string;
}
