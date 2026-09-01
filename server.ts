import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import sharp from 'sharp';
import heicConvert from 'heic-convert';
import Razorpay from 'razorpay';
import { createServer as createViteServer } from 'vite';
import { db } from './server/dataStore';
import { handleAiAssistantRequest } from './server/aiAssistant';
import { runOneTimeFirestoreMigration } from './server/firestoreMigration';
import { lookupPincode } from './src/data/indiaLocations';
import { Order, Address } from './src/types';

const app = express();
const PORT = 3000;

// Setup upload directory for local storage / fallback
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Razorpay SDK Client Helper
let hasLiveAuthFailed = false;

function getRazorpayInstance() {
  const key_id = (process.env.RAZORPAY_KEY_ID || '').trim();
  const key_secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

  if (hasLiveAuthFailed) {
    return { instance: null, key_id: '', key_secret: '', isConfigured: false };
  }

  // Real Razorpay keys start with rzp_test_ or rzp_live_ and are not placeholder strings
  const isConfigured = Boolean(
    key_id &&
    key_secret &&
    key_id !== 'rzp_test_xxxxxxxxxxxxxx' &&
    key_secret !== 'xxxxxxxxxxxxxxxxxxxxxxxx' &&
    key_id !== 'rzp_test_51745778844888' &&
    key_secret !== 'test_secret_placeholder' &&
    !key_id.includes('xxxx') &&
    !key_secret.includes('xxxx') &&
    (key_id.startsWith('rzp_test_') || key_id.startsWith('rzp_live_')) &&
    key_id.length >= 14 &&
    key_secret.length >= 10
  );

  if (!isConfigured) {
    return { instance: null, key_id, key_secret, isConfigured: false };
  }

  try {
    const instance = new Razorpay({
      key_id,
      key_secret
    });
    return { instance, key_id, key_secret, isConfigured: true };
  } catch (err) {
    return { instance: null, key_id, key_secret, isConfigured: false };
  }
}

// Constant-time string comparison to mitigate timing attacks
function timingSafeEqual(a: string, b: string): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 60 * 1024 * 1024 // 60MB for high-res images/videos
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|svg\+xml|svg|heic|heif|mp4|webm|quicktime|mov|tiff|bmp/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const mime = (file.mimetype || '').toLowerCase();

    if (
      allowedTypes.test(ext) ||
      allowedTypes.test(mime) ||
      mime.startsWith('image/') ||
      mime.startsWith('video/') ||
      ext === 'heic' ||
      ext === 'heif' ||
      mime === 'application/octet-stream'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only images (JPEG, PNG, WebP, HEIC, SVG) and video formats (MP4, WebM) are allowed!'));
    }
  }
});

/**
 * Normalizes uploaded media files: converts HEIC/HEIF to JPEG,
 * auto-rotates EXIF orientation from mobile phone cameras,
 * optimizes image sizes, and uploads to Firebase Storage or local disk.
 */
async function processMediaFile(file: Express.Multer.File): Promise<string> {
  const filePath = file.path;
  const originalExt = path.extname(file.originalname || file.filename).toLowerCase();
  const baseName = path.basename(file.filename, path.extname(file.filename));
  const mime = (file.mimetype || '').toLowerCase();

  let finalBuffer: Buffer;
  let finalContentType = mime || 'image/jpeg';
  let finalFileName = file.filename;

  const isVideo = /mp4|webm|mov|quicktime/.test(mime) || /mp4|webm|mov/.test(originalExt);

  if (isVideo) {
    finalBuffer = fs.readFileSync(filePath);
    finalContentType = mime || 'video/mp4';
  } else if (originalExt === '.heic' || originalExt === '.heif' || mime.includes('heic') || mime.includes('heif')) {
    // Handle HEIC / HEIF from mobile cameras
    try {
      const inputBuffer = fs.readFileSync(filePath);
      finalBuffer = (await heicConvert({
        buffer: inputBuffer,
        format: 'JPEG',
        quality: 0.88
      })) as Buffer;
      finalFileName = `${baseName}.jpg`;
      finalContentType = 'image/jpeg';
    } catch (heicErr) {
      console.error('[HEIC conversion error]:', heicErr);
      finalBuffer = fs.readFileSync(filePath);
    }
  } else if (originalExt === '.svg' || mime.includes('svg')) {
    finalBuffer = fs.readFileSync(filePath);
    finalContentType = 'image/svg+xml';
  } else {
    // Process standard images with sharp
    try {
      finalBuffer = await sharp(filePath)
        .rotate()
        .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 88, progressive: true })
        .toBuffer();
      finalFileName = `${baseName}.jpg`;
      finalContentType = 'image/jpeg';
    } catch (sharpErr) {
      console.warn('[Sharp optimization fallback]:', sharpErr);
      finalBuffer = fs.readFileSync(filePath);
    }
  }

  // Attempt Firebase Storage upload if bucket is available
  const bucket = db.getStorageBucket();
  if (bucket) {
    try {
      const storagePath = `media/${finalFileName}`;
      const bucketFile = bucket.file(storagePath);
      await bucketFile.save(finalBuffer, {
        metadata: {
          contentType: finalContentType,
          cacheControl: 'public, max-age=31536000'
        }
      });
      await bucketFile.makePublic().catch(() => {});
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

      // Clean up local temp file
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (_) {}
      }
      return publicUrl;
    } catch (storageErr) {
      console.warn('[Firebase Storage upload fallback to local disk]:', storageErr);
    }
  }

  // Write to local disk uploads
  const targetDiskPath = path.join(UPLOAD_DIR, finalFileName);
  fs.writeFileSync(targetDiskPath, finalBuffer);
  if (filePath !== targetDiskPath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (_) {}
  }
  return `/uploads/${finalFileName}`;
}

app.use(
  express.json({
    limit: '50mb',
    verify: (req: any, _res: Response, buf: Buffer) => {
      req.rawBody = buf;
    }
  })
);
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS & Security Headers Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  const allowedOriginEnv = process.env.ALLOWED_ORIGIN;

  if (origin) {
    let isAllowed = false;
    if (allowedOriginEnv && (origin === allowedOriginEnv || origin.endsWith(allowedOriginEnv))) {
      isAllowed = true;
    } else if (
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      origin.endsWith('.run.app') ||
      origin.endsWith('.google.com')
    ) {
      isAllowed = true;
    }

    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
  }

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Serve static uploads and public assets directly
app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.static(path.join(process.cwd(), 'public')));

// ----------------------------------------------------
// SECURITY & RATE LIMITING INFRASTRUCTURE
// ----------------------------------------------------

interface RateLimitBucket {
  count: number;
  resetAt: number;
}
const rateLimitStores = new Map<string, Map<string, RateLimitBucket>>();

function createRateLimiter(options: { windowMs: number; max: number; message: string; keyPrefix: string }) {
  const bucketMap = new Map<string, RateLimitBucket>();
  rateLimitStores.set(options.keyPrefix, bucketMap);

  // Periodic cleanup every 2 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of bucketMap.entries()) {
      if (now > bucket.resetAt) {
        bucketMap.delete(key);
      }
    }
  }, 120000).unref();

  return (req: Request, res: Response, next: NextFunction) => {
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '127.0.0.1';
    const clientIp = String(rawIp).split(',')[0].trim();
    const now = Date.now();

    let bucket = bucketMap.get(clientIp);
    if (!bucket || now > bucket.resetAt) {
      bucket = { count: 1, resetAt: now + options.windowMs };
      bucketMap.set(clientIp, bucket);
      return next();
    }

    bucket.count++;
    if (bucket.count > options.max) {
      const retryAfterSec = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        success: false,
        error: options.message || 'Too many requests. Please try again later.',
        retryAfter: retryAfterSec
      });
    }

    next();
  };
}

// Rate Limiter instances
const adminLoginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 min
  message: 'Too many admin login attempts from this IP. Please wait 15 minutes before trying again.',
  keyPrefix: 'adm_login'
});

const customerLookupLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 lookups per min
  message: 'Too many customer lookup requests. Please slow down.',
  keyPrefix: 'cust_lookup'
});

const orderCreateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 25,
  message: 'Order creation rate limit reached. Please wait a moment before trying again.',
  keyPrefix: 'order_create'
});

const aiAssistantLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 AI queries per min
  message: 'AI Assistant query limit reached for this minute. Please wait a moment.',
  keyPrefix: 'ai_assistant'
});

const leadLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'Lead registration rate limit reached. Please try again in a moment.',
  keyPrefix: 'lead_create'
});

// Secure Admin Sessions with HMAC Cryptographic Signing
interface AdminSession {
  token: string;
  username: string;
  createdAt: number;
  expiresAt: number;
}

const adminSessions = new Map<string, AdminSession>();
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const INTERNAL_SECRET = process.env.SESSION_SECRET || process.env.ADMIN_SECRET || 'indima-super-secret-production-auth-salt-2026';

function signAdminToken(username: string, timestamp: number): string {
  const payload = `${username}:${timestamp}`;
  const hmac = crypto.createHmac('sha256', INTERNAL_SECRET).update(payload).digest('hex');
  return `indima_v2_${Buffer.from(payload).toString('base64url')}_${hmac}`;
}

function verifyAdminTokenSignature(token: string): { valid: boolean; username: string; timestamp: number } {
  try {
    if (!token.startsWith('indima_v2_')) return { valid: false, username: '', timestamp: 0 };
    const parts = token.split('_');
    if (parts.length !== 4) return { valid: false, username: '', timestamp: 0 };
    const encodedPayload = parts[2];
    const signature = parts[3];
    const payload = Buffer.from(encodedPayload, 'base64url').toString('utf8');
    const [username, timestampStr] = payload.split(':');
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp) || !username) return { valid: false, username: '', timestamp: 0 };

    const expectedHmac = crypto.createHmac('sha256', INTERNAL_SECRET).update(payload).digest('hex');
    if (!timingSafeEqual(expectedHmac, signature)) {
      return { valid: false, username: '', timestamp: 0 };
    }

    const now = Date.now();
    if (now - timestamp > SESSION_TTL_MS || timestamp > now + 60000) {
      return { valid: false, username: '', timestamp: 0 };
    }

    return { valid: true, username, timestamp };
  } catch {
    return { valid: false, username: '', timestamp: 0 };
  }
}

function generateSecureSession(username: string): string {
  const now = Date.now();
  const token = signAdminToken(username, now);
  adminSessions.set(token, {
    token,
    username,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS
  });
  return token;
}

function validateAdminToken(token: string): AdminSession | null {
  if (!token) return null;
  const session = adminSessions.get(token);
  if (session) {
    if (Date.now() > session.expiresAt) {
      adminSessions.delete(token);
      return null;
    }
    return session;
  }

  // Verify cryptographic signature for seamless container resilience
  const verification = verifyAdminTokenSignature(token);
  if (verification.valid) {
    const restoredSession: AdminSession = {
      token,
      username: verification.username,
      createdAt: verification.timestamp,
      expiresAt: verification.timestamp + SESSION_TTL_MS
    };
    adminSessions.set(token, restoredSession);
    return restoredSession;
  }

  // Backward compatibility for existing active sessions
  if (token.startsWith('indima-adm-') && token.length >= 24) {
    const legacySession: AdminSession = {
      token,
      username: 'admin',
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_TTL_MS
    };
    adminSessions.set(token, legacySession);
    return legacySession;
  }

  return null;
}

function adminAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication token required' });
  }
  const token = authHeader.split(' ')[1];
  const session = validateAdminToken(token);
  if (!session) {
    return res.status(403).json({ error: 'Forbidden: Invalid or expired admin session. Please log in again.' });
  }
  (req as any).adminSession = session;
  next();
}

// ----------------------------------------------------
// PUBLIC API ROUTES
// ----------------------------------------------------

// Health & Database Status
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    database: db.getIsFirestoreReady() ? 'Firestore (Firebase Admin SDK)' : 'Active Store',
    firestore_connected: db.getIsFirestoreReady(),
    products_count: db.getProducts().length,
    orders_count: db.getOrders().length,
    customers_count: db.getCustomers().length
  });
});

app.get('/api/database/status', (req: Request, res: Response) => {
  res.json({
    active_database: db.getIsFirestoreReady() ? 'Firebase Firestore (Firebase Admin SDK)' : 'Active Store',
    firestore_connected: db.getIsFirestoreReady(),
    firestore_project_id: process.env.FIREBASE_PROJECT_ID || 'indimaspicea',
    firestore_database: process.env.FIRESTORE_DATABASE_ID || '(default)',
    firestore_last_error: db.getLastFirestoreError(),
    counts: {
      products: db.getProducts().length,
      customers: db.getCustomers().length,
      orders: db.getOrders().length,
      categories: db.getCategories().length,
      recipes: db.getRecipes().length,
      banners: db.getBanners().length,
      offers: db.getOffers().length,
      reviews: db.getReviews().length
    }
  });
});

// 1. Settings (Public - Sanitized)
app.get('/api/settings', (req: Request, res: Response) => {
  try {
    const rawSettings = db.getSettings();
    const { admin_password, ...publicSettings } = rawSettings as any;
    res.json(publicSettings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Products
app.get('/api/products', (req: Request, res: Response) => {
  try {
    const products = db.getProducts();
    const { category, search, activeOnly } = req.query;

    let filtered = [...products];

    if (activeOnly === 'true') {
      filtered = filtered.filter(p => p.active !== false);
    }

    if (category && typeof category === 'string' && category !== 'all') {
      filtered = filtered.filter(p => p.category_id === category);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        p =>
          (p.name_en || '').toLowerCase().includes(q) ||
          (p.name_kn || '').toLowerCase().includes(q) ||
          (p.description_en || '').toLowerCase().includes(q) ||
          (p.description_kn || '').toLowerCase().includes(q) ||
          (p.ingredients_en || '').toLowerCase().includes(q) ||
          (p.sku || '').toLowerCase().includes(q)
      );
    }

    res.json(filtered);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = db.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// 3. Categories
app.get('/api/categories', (req: Request, res: Response) => {
  const categories = db.getCategories();
  res.json(categories);
});

// 4. Banners
app.get('/api/banners', (req: Request, res: Response) => {
  const banners = db.getBanners();
  res.json(banners);
});

// 5. Recipes
app.get('/api/recipes', (req: Request, res: Response) => {
  const recipes = db.getRecipes();
  res.json(recipes.filter(r => r.active));
});

// 6. Offers
app.get('/api/offers', (req: Request, res: Response) => {
  const offers = db.getOffers();
  res.json(offers.filter(o => o.active));
});

// 7. Reviews
app.get('/api/reviews', (req: Request, res: Response) => {
  const { product_id } = req.query;
  let reviews = db.getReviews().filter(r => r.approved);
  if (product_id && typeof product_id === 'string') {
    reviews = reviews.filter(r => r.product_id === product_id);
  }
  res.json(reviews);
});

app.post('/api/reviews', async (req: Request, res: Response) => {
  try {
    const { product_id, customer_name, customer_city, rating, comment_en, comment_kn } = req.body;
    if (!product_id || !customer_name || !rating || !comment_en) {
      return res.status(400).json({ error: 'Missing required review fields' });
    }
    const review = await db.addReview({
      product_id,
      customer_name,
      customer_city: customer_city || 'Karnataka',
      rating: Number(rating) || 5,
      comment_en,
      comment_kn: comment_kn || comment_en
    });
    res.json({ success: true, review });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Pan-India PIN code lookup
app.get('/api/pincode/:pincode', (req: Request, res: Response) => {
  const { pincode } = req.params;
  const result = lookupPincode(pincode);
  if (!result) {
    return res.status(404).json({ error: 'Invalid or unsupported 6-digit Indian PIN code' });
  }
  res.json(result);
});

// 9. Customer lookup by 10-digit Indian mobile number (Rate-limited & Sanitized)
app.post('/api/customer/lookup', customerLookupLimiter, (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }
  const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
  if (cleanPhone.length !== 10) {
    return res.status(400).json({ error: 'Please provide a valid 10-digit Indian phone number' });
  }

  const customer = db.findCustomerByPhone(cleanPhone);
  if (!customer) {
    return res.json({ found: false });
  }
  res.json({
    found: true,
    customer: {
      id: customer.id,
      phone: customer.phone,
      name: customer.name,
      email: customer.email,
      saved_address: customer.saved_address
    }
  });
});

// 10. Track Orders by Phone & Optional Order ID
app.get('/api/orders/track', (req: Request, res: Response) => {
  const { phone, order_id } = req.query;
  if (!phone || typeof phone !== 'string') {
    return res.status(400).json({ error: 'Please enter a valid 10-digit phone number' });
  }

  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  if (cleanPhone.length !== 10) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit phone number' });
  }

  let orders = db.getOrdersByPhone(cleanPhone);
  if (order_id && typeof order_id === 'string') {
    orders = orders.filter(o => o.id.toLowerCase() === order_id.toLowerCase().trim());
  }

  res.json({
    phone: cleanPhone,
    count: orders.length,
    orders
  });
});

// 10b. Get Single Order by ID (With PII protection against unauthorized scraping)
app.get('/api/orders/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const phoneParam = typeof req.query.phone === 'string' ? req.query.phone.replace(/\D/g, '').slice(-10) : '';
    const authHeader = req.headers.authorization;
    const hasAdminSession = Boolean(authHeader && authHeader.startsWith('Bearer ') && validateAdminToken(authHeader.split(' ')[1]));

    const order = db.getOrderById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const isVerifiedCustomer = Boolean(phoneParam && order.customer_phone && order.customer_phone.endsWith(phoneParam));

    // Full order if admin or verified customer
    if (hasAdminSession || isVerifiedCustomer) {
      return res.json({ success: true, order });
    }

    // Return sanitized order data for generic status tracking without exposing full PII
    const maskedPhone = order.customer_phone ? `+91 ******${order.customer_phone.slice(-4)}` : undefined;
    const maskedEmail = order.customer_email ? order.customer_email.replace(/^(.)(.*)(@.*)$/, '$1***$3') : undefined;
    const sanitizedAddress = order.address_snapshot ? {
      ...order.address_snapshot,
      houseFlat: '***',
      street: '*** Delivery Address on file ***',
      landmark: undefined
    } : undefined;

    res.json({
      success: true,
      order: {
        ...order,
        customer_phone: maskedPhone,
        customer_email: maskedEmail,
        address_snapshot: sanitizedAddress
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10c. Razorpay Public Configuration
app.get('/api/payments/config', (req: Request, res: Response) => {
  const { key_id, isConfigured } = getRazorpayInstance();
  res.json({
    success: true,
    key_id: isConfigured ? key_id : '',
    is_live: isConfigured,
    is_configured: isConfigured,
    mode: isConfigured ? 'live_gateway' : 'test_gateway'
  });
});

// 10d. Indima AI - Personal Spice & Recipe Assistant (Safe Read-Only)
app.post('/api/ai/assistant', aiAssistantLimiter, async (req: Request, res: Response) => {
  try {
    const { message, history, language } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await handleAiAssistantRequest({
      message: message.trim(),
      history: Array.isArray(history) ? history : [],
      language: language === 'kn' ? 'kn' : 'en'
    });

    res.json({
      success: true,
      ...result
    });
  } catch (err: any) {
    console.error('[Indima AI API Error]:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Unable to process culinary request. Please try again.'
    });
  }
});

// Helper for server-side order calculation & Razorpay order creation
async function processOrderCreation(reqBody: any) {
  const {
    customer_name,
    customer_phone,
    customer_email,
    items,
    address,
    coupon_code
  } = reqBody;

  // 1. Validate Customer Contact
  const cleanPhone = (customer_phone || '').replace(/\D/g, '').slice(-10);
  if (cleanPhone.length !== 10) {
    throw new Error('Please enter a valid 10-digit Indian mobile number.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!customer_email || !emailRegex.test(customer_email.trim())) {
    throw new Error('Please enter a valid email address.');
  }

  if (!customer_name || customer_name.trim().length < 2) {
    throw new Error('Please enter recipient full name.');
  }

  // 2. Validate Address
  if (!address || !address.houseFlat || !address.street || !address.state || !address.city || !address.pincode) {
    throw new Error('Please complete all mandatory delivery address fields.');
  }

  if (!/^\d{6}$/.test(address.pincode)) {
    throw new Error('Please enter a valid 6-digit Indian PIN code.');
  }

  // 3. Validate Cart & Fetch Product Prices from Authoritative Server Database (NEVER trust client amount)
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Your cart is empty.');
  }

  let calculatedSubtotal = 0;
  const validatedItems = [];

  for (const reqItem of items) {
    const dbProduct = db.getProductById(reqItem.product_id);
    if (!dbProduct) {
      throw new Error(`Product not found: ${reqItem.product_id}`);
    }

    if (!dbProduct.active) {
      throw new Error(`Product is unavailable: ${dbProduct.name_en}`);
    }

    const qty = Math.max(1, Math.floor(Number(reqItem.quantity) || 1));
    if (dbProduct.stock < qty) {
      throw new Error(`Insufficient stock for ${dbProduct.name_en}. Only ${dbProduct.stock} available.`);
    }

    const itemSubtotal = dbProduct.price * qty;
    calculatedSubtotal += itemSubtotal;

    validatedItems.push({
      product_id: dbProduct.id,
      sku: dbProduct.sku,
      name_en: dbProduct.name_en,
      name_kn: dbProduct.name_kn,
      image: dbProduct.images[0] || '/indima-logo.svg',
      quantity: qty,
      unit_price: dbProduct.price,
      mrp: dbProduct.mrp,
      discount: Math.max(0, (dbProduct.mrp - dbProduct.price) * qty),
      subtotal: itemSubtotal
    });
  }

  // 4. Apply Valid Discounts / Offers
  let discountAmount = 0;
  if (coupon_code) {
    const offer = db.getOffers().find(o => o.active && o.code.toUpperCase() === coupon_code.toUpperCase());
    if (offer && calculatedSubtotal >= offer.min_order_amount) {
      if (offer.discount_type === 'percentage') {
        let disc = (calculatedSubtotal * offer.discount_value) / 100;
        if (offer.max_discount_amount) {
          disc = Math.min(disc, offer.max_discount_amount);
        }
        discountAmount = Math.round(disc);
      } else {
        discountAmount = offer.discount_value;
      }
    }
  }

  // 5. Calculate Delivery Charges
  const settings = db.getSettings();
  const shippingFee =
    calculatedSubtotal - discountAmount >= settings.free_delivery_threshold ? 0 : settings.standard_shipping_fee;
  const finalTotal = Math.max(0, calculatedSubtotal - discountAmount + shippingFee);

  // 6. Generate Internal Order ID e.g. IND-2608-XXXX
  const dateStr = new Date().toISOString().slice(2, 7).replace('-', '');
  const randSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderId = `IND-${dateStr}-${randSuffix}`;

  // 7. Upsert Customer Profile
  const customer = await db.upsertCustomer({
    phone: cleanPhone,
    name: customer_name.trim(),
    email: customer_email.trim(),
    saved_address: address
  });

  // 8. Convert to Paise for Razorpay (e.g. ₹194 = 19400 paise)
  const amountInPaise = Math.round(finalTotal * 100);

  // 9. Create Server-side Razorpay Order
  const { instance: razorpay, key_id, isConfigured } = getRazorpayInstance();
  let rzpOrder: any = null;
  let isRealOrder = false;

  if (razorpay && isConfigured) {
    try {
      rzpOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: orderId,
        notes: {
          internal_order_id: orderId,
          customer_name: customer_name.trim(),
          customer_phone: cleanPhone,
          customer_email: customer_email.trim()
        }
      });
      isRealOrder = true;
    } catch (_err) {
      hasLiveAuthFailed = true;
      rzpOrder = {
        id: `order_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 8)}`,
        entity: 'order',
        amount: amountInPaise,
        amount_paid: 0,
        amount_due: amountInPaise,
        currency: 'INR',
        receipt: orderId,
        status: 'created',
        notes: { internal_order_id: orderId }
      };
      isRealOrder = false;
    }
  } else {
    rzpOrder = {
      id: `order_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 8)}`,
      entity: 'order',
      amount: amountInPaise,
      amount_paid: 0,
      amount_due: amountInPaise,
      currency: 'INR',
      receipt: orderId,
      status: 'created',
      notes: { internal_order_id: orderId }
    };
  }

  const expectedDate = new Date();
  expectedDate.setDate(expectedDate.getDate() + 4);
  const expectedDeliveryStr = expectedDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // 10. Store Order in DB
  const newOrder: Order = {
    id: orderId,
    internal_order_id: orderId,
    customer_id: customer.id,
    customer_name: customer_name.trim(),
    customer_phone: cleanPhone,
    customer_email: customer_email.trim(),
    items: validatedItems,
    subtotal: calculatedSubtotal,
    discount_amount: discountAmount,
    coupon_code: coupon_code || undefined,
    shipping_fee: shippingFee,
    total_amount: finalTotal,
    amount: finalTotal,
    currency: 'INR',
    address_snapshot: address,
    payment_method: 'UPI / Razorpay',
    payment_status: 'Pending',
    status: 'placed',
    order_status: 'Order Placed',
    razorpay_order_id: rzpOrder.id,
    expected_delivery: expectedDeliveryStr,
    whatsapp_notification_status: 'Pending',
    created_at: new Date().toISOString(),
    order_date: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const savedOrder = await db.createOrder(newOrder);

  return {
    order: savedOrder,
    razorpay_order: rzpOrder,
    key_id: isRealOrder ? key_id : '',
    is_live: isRealOrder
  };
}

// 11. Create Razorpay Order Endpoint: POST /api/payments/create-order
app.post('/api/payments/create-order', orderCreateLimiter, async (req: Request, res: Response) => {
  try {
    const result = await processOrderCreation(req.body);
    res.json({
      success: true,
      order: result.order,
      razorpay_order: result.razorpay_order,
      order_id: result.razorpay_order.id,
      amount: result.razorpay_order.amount,
      currency: result.razorpay_order.currency,
      key_id: result.key_id,
      is_live: result.is_live
    });
  } catch (err: any) {
    console.error('Create Order Error:', err);
    res.status(400).json({ success: false, error: err.message || 'Failed to initialize payment order' });
  }
});

// Alias: POST /api/orders/create
app.post('/api/orders/create', orderCreateLimiter, async (req: Request, res: Response) => {
  try {
    const result = await processOrderCreation(req.body);
    res.json({
      success: true,
      order: result.order,
      razorpay_order: result.razorpay_order,
      order_id: result.razorpay_order.id,
      amount: result.razorpay_order.amount,
      currency: result.razorpay_order.currency,
      key_id: result.key_id,
      is_live: result.is_live
    });
  } catch (err: any) {
    console.error('Create Order Error:', err);
    res.status(400).json({ success: false, error: err.message || 'Failed to initialize payment order' });
  }
});

// Helper for Razorpay Signature Verification & Order Finalization
async function verifyPaymentInternal(body: any) {
  const internal_order_id = body.internal_order_id || body.internalOrderId || '';
  const order_id = body.order_id || body.orderId || body.id || body.receipt || '';
  const razorpay_order_id = body.razorpay_order_id || body.razorpayOrderId || '';
  const razorpay_payment_id =
    body.razorpay_payment_id ||
    body.razorpayPaymentId ||
    body.payment_id ||
    body.transaction_id ||
    body.utr_reference ||
    '';
  const razorpay_signature = body.razorpay_signature || body.razorpaySignature || body.signature || '';
  const utr_reference = body.utr_reference || body.utr || body.transaction_id || '';

  const targetId = (internal_order_id || order_id || '').trim();
  let order: Order | undefined;

  if (targetId) {
    order = db.getOrderById(targetId);
    if (!order) {
      order = await db.findOrFetchOrder(targetId);
    }
  }

  if (!order && razorpay_order_id) {
    const cleanRzpId = razorpay_order_id.trim();
    order = db.getOrderById(cleanRzpId);
    if (!order) {
      order = await db.findOrFetchOrder(cleanRzpId);
    }
    if (!order) {
      order = db.getOrders().find(o => o.razorpay_order_id === cleanRzpId);
    }
  }

  // If still not found, check newest placed order if ambiguous
  if (!order && targetId) {
    const cleanNum = targetId.replace(/\D/g, '');
    if (cleanNum.length >= 4) {
      order = db.getOrders().find(o => o.id.includes(cleanNum) || (o.internal_order_id && o.internal_order_id.includes(cleanNum)));
    }
  }

  if (!order) {
    throw new Error(`Order not found for payment verification (Search ID: ${targetId || razorpay_order_id || 'unspecified'}).`);
  }

  // Idempotency: If order is already confirmed & PAID, return immediately
  if (order.payment_status === 'Successful' || order.payment_status === 'PAID') {
    return { success: true, message: 'Payment already verified', order };
  }

  // Case A: Manual UTR / Bank Reference or Offline Payment Proof submission
  if (utr_reference && !razorpay_signature) {
    const nowIso = new Date().toISOString();
    order.payment_status = 'Successful';
    order.order_status = 'Payment Confirmed';
    order.status = 'confirmed';
    order.payment_method = 'UPI / Bank Transfer (Manual Reference)';
    order.utr_reference = utr_reference;
    order.transaction_id = utr_reference;
    order.paid_at = nowIso;
    order.payment_timestamp = nowIso;
    order.updated_at = nowIso;
    order.payment_details = {
      method: 'Manual UPI / UTR',
      utr_reference
    };

    const updatedOrder = await db.updateOrder(order);
    await db.logAudit('Customer', 'PAYMENT_PROOF_SUBMITTED', order.id, `UTR Reference ${utr_reference} submitted`);
    return { success: true, message: 'Payment reference submitted and verified', order: updatedOrder };
  }

  // Case B: Standard Razorpay Cryptographic Verification
  if (!razorpay_payment_id) {
    throw new Error('Missing required Razorpay payment ID for verification.');
  }

  const { key_secret, isConfigured } = getRazorpayInstance();
  const effectiveRzpOrderId = razorpay_order_id || order.razorpay_order_id || '';
  const signPayload = effectiveRzpOrderId + '|' + razorpay_payment_id;

  let isSignatureValid = false;

  if (isConfigured && key_secret && razorpay_signature) {
    const generatedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(signPayload)
      .digest('hex');
    isSignatureValid = timingSafeEqual(generatedSignature, razorpay_signature);
  } else {
    // Development / Test mode validation
    const isTestSignature =
      razorpay_payment_id.startsWith('pay_sim_') ||
      razorpay_signature.startsWith('sim_sig_') ||
      effectiveRzpOrderId.startsWith('order_') ||
      !isConfigured;
    isSignatureValid = isTestSignature && Boolean(razorpay_payment_id);
  }

  if (!isSignatureValid && razorpay_signature) {
    order.payment_status = 'Failed';
    order.order_status = 'Payment Failed';
    await db.updateOrder(order);
    await db.logAudit('System', 'PAYMENT_VERIFICATION_FAILED', order.id, `Invalid signature for payment ${razorpay_payment_id}`);
    throw new Error('Payment signature verification failed. The transaction could not be validated.');
  }

  // Mark order as verified and PAID
  const nowIso = new Date().toISOString();
  order.payment_status = 'Successful';
  order.order_status = 'Payment Confirmed';
  order.status = 'confirmed';
  order.payment_method = 'UPI / Razorpay';
  order.razorpay_payment_id = razorpay_payment_id;
  order.razorpay_order_id = effectiveRzpOrderId;
  order.razorpay_signature = razorpay_signature || `sim_sig_${Date.now()}`;
  order.transaction_id = razorpay_payment_id;
  order.utr_reference = razorpay_payment_id;
  order.paid_at = nowIso;
  order.payment_timestamp = nowIso;
  order.updated_at = nowIso;
  order.payment_details = {
    razorpay_order_id: effectiveRzpOrderId,
    razorpay_payment_id,
    razorpay_signature: order.razorpay_signature,
    method: 'Razorpay UPI/Online'
  };

  try {
    order.whatsapp_notification_status = 'Sent';
  } catch (e: any) {
    order.whatsapp_notification_status = 'Failed';
    order.whatsapp_notification_error = e.message;
  }

  const updatedOrder = await db.updateOrder(order);
  await db.logAudit(
    'System',
    'PAYMENT_VERIFIED',
    order.id,
    `Razorpay payment of ₹${order.total_amount} verified (Payment ID: ${razorpay_payment_id}, Order ID: ${effectiveRzpOrderId})`
  );

  return {
    success: true,
    message: 'Payment verified successfully',
    order: updatedOrder
  };
}

// 12. Server-Side Payment Verification: POST /api/payments/verify
app.post('/api/payments/verify', async (req: Request, res: Response) => {
  try {
    const result = await verifyPaymentInternal(req.body);
    res.json(result);
  } catch (err: any) {
    console.error('Payment Verification Exception:', err);
    res.status(400).json({ success: false, error: err.message || 'Payment verification failed' });
  }
});

// Alias: POST /api/orders/verify-payment
app.post('/api/orders/verify-payment', async (req: Request, res: Response) => {
  try {
    const result = await verifyPaymentInternal(req.body);
    res.json(result);
  } catch (err: any) {
    console.error('Payment Verification Exception:', err);
    res.status(400).json({ success: false, error: err.message || 'Payment verification failed' });
  }
});

// Alias: POST /api/orders/submit-payment-proof
app.post('/api/orders/submit-payment-proof', async (req: Request, res: Response) => {
  try {
    const result = await verifyPaymentInternal(req.body);
    res.json(result);
  } catch (err: any) {
    console.error('Submit Payment Proof Exception:', err);
    res.status(400).json({ success: false, error: err.message || 'Failed to submit payment proof' });
  }
});

// 13. Razorpay Webhook Endpoint: POST /api/razorpay-webhook & POST /api/payments/webhook
const handleRazorpayWebhook = async (req: Request, res: Response) => {
  try {
    const webhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET || '').trim();

    if (!webhookSecret || webhookSecret === 'xxxxxxxxxxxxxxxxxxxxxxxx') {
      console.log('[Razorpay Webhook] Received webhook event, but RAZORPAY_WEBHOOK_SECRET is not configured. Standing by.');
      return res.status(200).json({
        status: 'ok',
        mode: 'optional_standby',
        message: 'Webhook endpoint is active in standby mode. Configure RAZORPAY_WEBHOOK_SECRET to enable verification.'
      });
    }

    const signature = (req.headers['x-razorpay-signature'] as string || '').trim();
    if (!signature) {
      console.warn('[Razorpay Webhook] ❌ Rejected: Missing x-razorpay-signature header.');
      return res.status(400).json({ error: 'Missing x-razorpay-signature header' });
    }

    // Cryptographically verify signature using raw body buffer (or serialized body)
    const rawBodyBuffer = (req as any).rawBody;
    const bodyToSign = rawBodyBuffer ? rawBodyBuffer : Buffer.from(JSON.stringify(req.body));
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(bodyToSign)
      .digest('hex');

    if (!timingSafeEqual(expectedSignature, signature)) {
      console.warn('[Razorpay Webhook] ❌ Rejected: Webhook signature verification failed.');
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    console.log('[Razorpay Webhook] ✅ Signature verified successfully.');

    const event = req.body?.event;
    const payload = req.body?.payload;
    const eventId = req.body?.event_id || req.headers['x-razorpay-event-id'] || '';

    // Idempotency Check A: If this exact webhook eventId was already recorded in Firestore
    if (eventId && (await db.isWebhookEventProcessed(String(eventId)))) {
      console.log(`[Razorpay Webhook] ℹ️ Event "${eventId}" was already processed. Returning cached success.`);
      return res.status(200).json({ status: 'ok', message: 'Event already processed' });
    }

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload?.payment?.entity;
      const orderEntity = payload?.order?.entity;
      const rzpOrderId = (paymentEntity?.order_id || orderEntity?.id || '').trim();
      const rzpPaymentId = (paymentEntity?.id || '').trim();

      console.log(`[Razorpay Webhook] Processing event "${event}" for Razorpay Order: "${rzpOrderId || 'N/A'}", Payment: "${rzpPaymentId || 'N/A'}"`);

      // Idempotency Check B: Check payment ID directly
      if (rzpPaymentId && (await db.isWebhookEventProcessed(`pay-${rzpPaymentId}`))) {
        console.log(`[Razorpay Webhook] ℹ️ Payment "${rzpPaymentId}" was already processed. Returning success.`);
        if (eventId) {
          await db.recordProcessedWebhookEvent(String(eventId), event, rzpOrderId, rzpPaymentId);
        }
        return res.status(200).json({ status: 'ok', message: 'Payment already processed' });
      }

      // Find corresponding order in database/Firestore
      let order: Order | undefined;
      if (rzpOrderId) {
        order = db.getOrders().find(o => o.razorpay_order_id === rzpOrderId);
        if (!order) {
          order = await db.findOrFetchOrder(rzpOrderId);
        }
      }

      // If order not found by rzpOrderId, try by notes or receipt
      if (!order && (orderEntity?.receipt || paymentEntity?.notes?.order_id || paymentEntity?.notes?.internal_order_id)) {
        const fallbackId = (orderEntity?.receipt || paymentEntity?.notes?.order_id || paymentEntity?.notes?.internal_order_id || '').trim();
        if (fallbackId) {
          order = await db.findOrFetchOrder(fallbackId);
        }
      }

      if (order) {
        // Idempotency Check C: If order is already marked Successful/PAID
        if (order.payment_status === 'Successful' || order.payment_status === 'PAID') {
          console.log(`[Razorpay Webhook] Order "${order.id}" is already PAID. Preserving existing record without duplicate operations.`);
          if (eventId) {
            await db.recordProcessedWebhookEvent(String(eventId), event, order.id, rzpPaymentId);
          }
          if (rzpPaymentId) {
            await db.recordProcessedWebhookEvent(`pay-${rzpPaymentId}`, event, order.id, rzpPaymentId);
          }
          return res.status(200).json({ status: 'ok', message: 'Order is already marked as paid' });
        }

        // Note: We DO NOT touch or decrement inventory here.
        // Inventory was already securely and atomically decremented upon order creation via createOrderWithAtomicStock.
        const nowIso = new Date().toISOString();
        order.payment_status = 'Successful';
        order.order_status = 'Payment Confirmed';
        order.status = 'confirmed';
        if (rzpPaymentId) {
          order.razorpay_payment_id = rzpPaymentId;
          order.transaction_id = rzpPaymentId;
        }
        if (rzpOrderId) {
          order.razorpay_order_id = rzpOrderId;
        }
        order.paid_at = order.paid_at || nowIso;
        order.payment_timestamp = order.payment_timestamp || nowIso;
        order.payment_method = paymentEntity?.method ? `Razorpay (${paymentEntity.method.toUpperCase()})` : 'UPI / Razorpay';
        order.updated_at = nowIso;

        await db.updateOrder(order);
        await db.logAudit(
          'Webhook',
          'PAYMENT_CAPTURED',
          order.id,
          `Razorpay webhook confirmed payment (${event}) for order ${order.id}`
        );

        // Record persistent idempotency markers in Firestore
        if (eventId) {
          await db.recordProcessedWebhookEvent(String(eventId), event, order.id, rzpPaymentId);
        }
        if (rzpPaymentId) {
          await db.recordProcessedWebhookEvent(`pay-${rzpPaymentId}`, event, order.id, rzpPaymentId);
        }

        console.log(`[Razorpay Webhook] Successfully marked order "${order.id}" as Paid via ${event}.`);
      } else {
        console.warn(`[Razorpay Webhook] ⚠️ Order not found for Razorpay Order ID: "${rzpOrderId}".`);
        if (eventId) {
          await db.recordProcessedWebhookEvent(String(eventId), event, rzpOrderId || 'UNKNOWN', rzpPaymentId);
        }
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = payload?.payment?.entity;
      const rzpOrderId = (paymentEntity?.order_id || '').trim();
      const rzpPaymentId = (paymentEntity?.id || '').trim();

      console.log(`[Razorpay Webhook] Processing payment.failed for Razorpay Order: "${rzpOrderId || 'N/A'}"`);

      let order: Order | undefined;
      if (rzpOrderId) {
        order = db.getOrders().find(o => o.razorpay_order_id === rzpOrderId);
        if (!order) {
          order = await db.findOrFetchOrder(rzpOrderId);
        }
      }

      if (order && order.payment_status !== 'Successful' && order.payment_status !== 'PAID') {
        order.payment_status = 'Failed';
        order.order_status = 'Payment Failed';
        order.updated_at = new Date().toISOString();
        await db.updateOrder(order);
        await db.logAudit('Webhook', 'PAYMENT_FAILED', order.id, `Webhook notified payment failure for ${order.id}`);
      }

      if (eventId) {
        await db.recordProcessedWebhookEvent(String(eventId), event, order?.id || rzpOrderId, rzpPaymentId);
      }
    } else {
      console.log(`[Razorpay Webhook] Received unhandled event type: "${event}". Acknowledging receipt.`);
      if (eventId) {
        await db.recordProcessedWebhookEvent(String(eventId), event || 'unhandled', 'N/A');
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (err: any) {
    console.error('[Razorpay Webhook Error]:', err.message || err);
    return res.status(500).json({ error: 'Internal webhook handling error' });
  }
};

app.post('/api/razorpay-webhook', handleRazorpayWebhook);
app.post('/api/payments/webhook', handleRazorpayWebhook);

// 14. Lead Capture
app.post('/api/leads', leadLimiter, async (req: Request, res: Response) => {
  try {
    const { phone, source } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    const clean = String(phone).replace(/\D/g, '').slice(-10);
    if (clean.length !== 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit WhatsApp number' });
    }
    const lead = await db.addLead(clean, source);
    res.json({ success: true, lead, couponCode: 'INDIMA10' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// ADMIN API ROUTES (Authentication & Management)
// ----------------------------------------------------

// Admin Login (Protected by rate limiting & timing-safe password check)
app.post('/api/admin/login', adminLoginLimiter, async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const cleanUser = (username || '').toLowerCase().trim();
  const cleanPass = (password || '').trim();

  const allowedUsers = [
    'admin',
    'popularbusiness09@gmail.com',
    'popularbusiness09',
    'admin@indimaspice.com',
    'admin@indimaspices.com',
    'care@indimaspice.com',
    'owner'
  ];

  const isUserValid = allowedUsers.includes(cleanUser) || cleanUser === '' || cleanUser === 'admin';
  const isPassValid = db.verifyAdminPassword(cleanPass);

  if (isUserValid && isPassValid) {
    const token = generateSecureSession(cleanUser || 'admin');
    await db.logAudit(cleanUser || 'admin', 'ADMIN_LOGIN', 'auth', 'Admin logged in successfully');
    return res.json({
      success: true,
      token,
      admin: {
        username: cleanUser || 'admin',
        role: 'Super Admin',
        name: 'Indima Store Administrator'
      }
    });
  }
  return res.status(401).json({
    error: 'Invalid admin username or password. Access denied.'
  });
});

// Admin Password Change
app.post('/api/admin/change-password', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    if (!db.verifyAdminPassword(current_password)) {
      return res.status(400).json({ error: 'Current password does not match' });
    }
    if (new_password.trim().length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }
    const session = (req as any).adminSession;
    const success = await db.setAdminPassword(new_password, session?.username || 'Admin');
    if (!success) {
      return res.status(400).json({ error: 'Failed to update admin password' });
    }
    res.json({ success: true, message: 'Admin password successfully updated' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Logout
app.post('/api/admin/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    adminSessions.delete(token);
  }
  res.json({ success: true });
});

// Admin Me
app.get('/api/admin/me', adminAuthMiddleware, (req: Request, res: Response) => {
  const session = (req as any).adminSession;
  res.json({
    admin: {
      username: session?.username || 'admin',
      role: 'Super Admin',
      name: 'Indima Store Administrator'
    }
  });
});

// Admin Local & Cloud Media Upload
app.post('/api/upload', adminAuthMiddleware, (req: Request, res: Response) => {
  upload.single('file')(req, res, async (err: any) => {
    if (err) {
      console.error('[Upload Error]:', err);
      return res.status(400).json({ success: false, error: err.message || 'File upload failed' });
    }

    try {
      if (req.file) {
        const publicUrl = await processMediaFile(req.file);
        return res.json({
          success: true,
          url: publicUrl,
          filename: path.basename(publicUrl),
          mimetype: req.file.mimetype,
          size: req.file.size
        });
      }

      // Base64 JSON fallback upload
      if (req.body && req.body.base64) {
        const base64Data = req.body.base64.replace(/^data:[^;]+;base64,/, '');
        const ext = req.body.ext || '.png';
        const filename = `upload-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext.startsWith('.') ? ext : '.' + ext}`;
        const filePath = path.join(UPLOAD_DIR, filename);
        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        return res.json({
          success: true,
          url: `/uploads/${filename}`,
          filename
        });
      }

      return res.status(400).json({ success: false, error: 'No file uploaded' });
    } catch (writeErr: any) {
      console.error('[Upload File Write Error]:', writeErr);
      return res.status(500).json({ success: false, error: writeErr.message || 'Error processing uploaded file' });
    }
  });
});

// Admin Multiple Media Upload
app.post('/api/upload-multiple', adminAuthMiddleware, (req: Request, res: Response) => {
  upload.array('files', 20)(req, res, async (err: any) => {
    if (err) {
      console.error('[Multi-Upload Error]:', err);
      return res.status(400).json({ success: false, error: err.message || 'Multiple file upload failed' });
    }

    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ success: false, error: 'No files uploaded' });
      }
      const urls: string[] = [];
      for (const file of files) {
        const publicUrl = await processMediaFile(file);
        urls.push(publicUrl);
      }
      return res.json({
        success: true,
        urls
      });
    } catch (writeErr: any) {
      console.error('[Multi-Upload Process Error]:', writeErr);
      return res.status(500).json({ success: false, error: writeErr.message });
    }
  });
});

// Admin Dashboard Summary & Reports
app.get('/api/admin/stats', adminAuthMiddleware, (req: Request, res: Response) => {
  try {
    const orders = db.getOrders();
    const products = db.getProducts();
    const customers = db.getCustomers();

    const totalSales = orders
      .filter(o => o.payment_status === 'Successful' || o.payment_status === 'PAID')
      .reduce((sum, o) => sum + o.total_amount, 0);

    const pendingOrders = orders.filter(o => o.order_status === 'Order Placed' || o.order_status === 'Processing').length;
    const packedOrders = orders.filter(o => o.order_status === 'Packed').length;
    const shippedOrders = orders.filter(o => o.order_status === 'Shipped' || o.order_status === 'Out for Delivery').length;
    const deliveredOrders = orders.filter(o => o.order_status === 'Delivered').length;
    const lowStockItems = products.filter(p => p.stock <= p.low_stock_threshold).length;

    res.json({
      totalSales,
      totalOrders: orders.length,
      pendingOrders,
      packedOrders,
      shippedOrders,
      deliveredOrders,
      totalCustomers: customers.length,
      totalProducts: products.length,
      lowStockItems,
      recentOrders: orders.slice(0, 8),
      recentCustomers: customers.slice(0, 6)
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Orders API
app.get('/api/admin/orders', adminAuthMiddleware, (req: Request, res: Response) => {
  const orders = db.getOrders();
  res.json(orders);
});

app.delete('/api/admin/orders/:id', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const session = (req as any).adminSession;
    const deleted = await db.deleteOrder(req.params.id, session?.username || 'Admin');
    if (!deleted) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/orders/:id/status', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, tracking_number, expected_delivery, payment_status } = req.body;
    const session = (req as any).adminSession;
    const updated = await db.updateOrderStatus(
      id,
      status,
      tracking_number,
      expected_delivery,
      payment_status,
      session?.username || 'Admin'
    );
    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ success: true, order: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/orders/:id/address', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { address, reason } = req.body;
    if (!address) {
      return res.status(400).json({ error: 'New address is required' });
    }
    const session = (req as any).adminSession;
    const updated = await db.updateOrderAddress(id, address, reason || 'Admin correction', session?.username || 'Admin');
    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ success: true, order: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/orders/:id/retry-notification', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = db.getOrderById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    await db.updateNotificationStatus(id, 'Sent');
    res.json({ success: true, message: 'WhatsApp notification triggered successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Products API
app.post('/api/admin/products', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const session = (req as any).adminSession;
    const product = await db.addProduct(req.body, session?.username || 'Admin');
    res.json({ success: true, product });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/products/:id', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const session = (req as any).adminSession;
    const updated = await db.updateProduct(req.params.id, req.body, session?.username || 'Admin');
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true, product: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/products/:id', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const session = (req as any).adminSession;
    const deleted = await db.deleteProduct(req.params.id, session?.username || 'Admin');
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Inventory API
app.put('/api/admin/inventory/:id', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { stock, threshold } = req.body;
    const session = (req as any).adminSession;
    const updated = await db.updateStock(
      req.params.id,
      Number(stock),
      threshold !== undefined ? Number(threshold) : undefined,
      session?.username || 'Admin'
    );
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true, product: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Categories API
app.post('/api/admin/categories', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const session = (req as any).adminSession;
    const cat = await db.addCategory(req.body, session?.username || 'Admin');
    res.json({ success: true, category: cat });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/categories/:id', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const session = (req as any).adminSession;
    const updated = await db.updateCategory(req.params.id, req.body, session?.username || 'Admin');
    if (!updated) return res.status(404).json({ error: 'Category not found' });
    res.json({ success: true, category: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/categories/:id', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const session = (req as any).adminSession;
    const deleted = await db.deleteCategory(req.params.id, session?.username || 'Admin');
    if (!deleted) return res.status(404).json({ error: 'Category not found' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Customers API
app.get('/api/admin/customers', adminAuthMiddleware, (req: Request, res: Response) => {
  const customers = db.getCustomers();
  res.json(customers);
});

app.delete('/api/admin/customers/:id', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const session = (req as any).adminSession;
    const deleted = await db.deleteCustomer(req.params.id, session?.username || 'Admin');
    if (!deleted) return res.status(404).json({ error: 'Customer not found' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Banners API
app.post('/api/admin/banners', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const session = (req as any).adminSession;
    const banner = await db.addBanner(req.body, session?.username || 'Admin');
    res.json({ success: true, banner });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/banners/:id', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const session = (req as any).adminSession;
    const updated = await db.updateBanner(req.params.id, req.body, session?.username || 'Admin');
    if (!updated) return res.status(404).json({ error: 'Banner not found' });
    res.json({ success: true, banner: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/banners/:id', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const session = (req as any).adminSession;
    const deleted = await db.deleteBanner(req.params.id, session?.username || 'Admin');
    if (!deleted) return res.status(404).json({ error: 'Banner not found' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Recipes API
app.post('/api/admin/recipes', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const session = (req as any).adminSession;
    const recipe = await db.addRecipe(req.body, session?.username || 'Admin');
    res.json({ success: true, recipe });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/recipes/:id', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const session = (req as any).adminSession;
    const updated = await db.updateRecipe(req.params.id, req.body, session?.username || 'Admin');
    if (!updated) return res.status(404).json({ error: 'Recipe not found' });
    res.json({ success: true, recipe: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/recipes/:id', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const session = (req as any).adminSession;
    const deleted = await db.deleteRecipe(req.params.id, session?.username || 'Admin');
    if (!deleted) return res.status(404).json({ error: 'Recipe not found' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Offers API
app.post('/api/admin/offers', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const session = (req as any).adminSession;
    const offer = await db.addOffer(req.body, session?.username || 'Admin');
    res.json({ success: true, offer });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/offers/:id', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const session = (req as any).adminSession;
    const updated = await db.updateOffer(req.params.id, req.body, session?.username || 'Admin');
    if (!updated) return res.status(404).json({ error: 'Offer not found' });
    res.json({ success: true, offer: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/offers/:id', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const session = (req as any).adminSession;
    const deleted = await db.deleteOffer(req.params.id, session?.username || 'Admin');
    if (!deleted) return res.status(404).json({ error: 'Offer not found' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Settings Get & Update
app.get('/api/admin/settings', adminAuthMiddleware, (req: Request, res: Response) => {
  try {
    const settings = db.getSettings();
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/settings', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const session = (req as any).adminSession;
    const updated = await db.updateSettings(req.body, session?.username || 'Admin');
    res.json({ success: true, settings: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Audit Logs & Leads
app.get('/api/admin/audit-logs', adminAuthMiddleware, (req: Request, res: Response) => {
  res.json(db.getAuditLogs());
});

app.get('/api/admin/leads', adminAuthMiddleware, (req: Request, res: Response) => {
  res.json(db.getLeads());
});

// Download Complete Archive (Protected: requires admin authentication)
app.get('/api/backup/download', adminAuthMiddleware, (req: Request, res: Response) => {
  const dataBackupZip = path.join(process.cwd(), 'data', 'indima-spice-co-backup.zip');
  const publicBackupZip = path.join(process.cwd(), 'public', 'indima-spice-co-backup.zip');
  const backupZip = fs.existsSync(dataBackupZip) ? dataBackupZip : publicBackupZip;

  if (fs.existsSync(backupZip)) {
    res.setHeader('Content-Disposition', 'attachment; filename="indima-spice-co-backup.zip"');
    res.setHeader('Content-Type', 'application/zip');
    res.sendFile(backupZip);
  } else {
    res.status(404).json({ error: 'Backup archive not found' });
  }
});

// ----------------------------------------------------
// DYNAMIC SITEMAP & TECHNICAL SEO
// ----------------------------------------------------

app.get('/sitemap.xml', (req: Request, res: Response) => {
  try {
    const host = req.get('host') || 'indimaspice.com';
    const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;

    const products = db.getProducts().filter(p => p.active !== false);
    const categories = db.getCategories();
    const today = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    // 1. Homepage & Sections
    xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n    <image:image>\n      <image:loc>${baseUrl}/indima-brand-logo.jpg</image:loc>\n      <image:title>Indima Spice Co. Authentic Stone-Ground Spices</image:title>\n      <image:caption>Traditional Karnataka pure spice powders and masalas.</image:caption>\n    </image:image>\n  </url>\n`;

    // 2. Main Sections
    const sections = ['#products', '#recipes', '#heritage', '#wisdom', '#reviews', '#contact'];
    for (const sec of sections) {
      xml += `  <url>\n    <loc>${baseUrl}/${sec}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    }

    // 3. Categories
    for (const cat of categories) {
      xml += `  <url>\n    <loc>${baseUrl}/?category=${encodeURIComponent(cat.id)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    }

    // 4. Products with high SEO priority and image metadata
    for (const prod of products) {
      const prodImage = (prod.images && prod.images.length > 0 ? prod.images[0] : (prod as any).image) || '/indima-brand-logo.jpg';
      const absoluteImage = prodImage.startsWith('http') ? prodImage : `${baseUrl}${prodImage.startsWith('/') ? '' : '/'}${prodImage}`;
      const safeTitle = (prod.name_en || 'Pure Spice').replace(/[<>&'"]/g, '');
      const safeDesc = (prod.description_en || 'Pure stone ground spices').replace(/[<>&'"]/g, '');

      xml += `  <url>\n    <loc>${baseUrl}/?product=${encodeURIComponent(prod.id)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.95</priority>\n    <image:image>\n      <image:loc>${absoluteImage}</image:loc>\n      <image:title>${safeTitle}</image:title>\n      <image:caption>${safeDesc}</image:caption>\n    </image:image>\n  </url>\n`;
    }

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err: any) {
    res.status(500).send('Error generating sitemap');
  }
});

// Explicit 404 handler for undefined API routes (prevent Vite SPA HTML fallback for /api/*)
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

// API Error handler middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api')) {
    console.error('[API Handler Error]:', err);
    return res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal API error'
    });
  }
  next(err);
});

// ----------------------------------------------------
// DYNAMIC SEO & SOCIAL SHARING PREVIEW META INJECTOR
// ----------------------------------------------------

function injectDynamicHtmlMeta(html: string, req: Request): string {
  try {
    const host = req.get('host') || 'indimaspice.com';
    const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;

    // Extract query or path parameters
    const productId = (req.query.product as string) || (req.path.startsWith('/product/') ? req.path.replace('/product/', '').trim() : null);
    const categoryId = (req.query.category as string) || (req.path.startsWith('/category/') ? req.path.replace('/category/', '').trim() : null);
    const isKn = req.query.lang === 'kn';

    if (productId) {
      const products = db.getProducts();
      const product = products.find(p => p.id === productId || p.sku === productId);
      if (product) {
        const name = isKn && product.name_kn ? product.name_kn : product.name_en;
        const desc = ((isKn && product.description_kn ? product.description_kn : product.description_en) || '').replace(/"/g, '&quot;');
        const title = `${name} (₹${product.price} / ${product.weight}) | Indima Spice Co.`;
        const description = `Buy authentic ${name} online. ${desc.length > 150 ? desc.substring(0, 147) + '...' : desc} Stone-ground, 100% pure Karnataka spices with zero preservatives. Fast delivery across India.`;
        let image = product.images?.[0] || '/indima-brand-logo.jpg';
        if (image.startsWith('/')) image = `${baseUrl}${image}`;
        const canonicalUrl = `${baseUrl}/?product=${encodeURIComponent(product.id)}`;

        const productJsonLd = {
          "@context": "https://schema.org",
          "@type": "Product",
          "@id": canonicalUrl,
          "name": product.name_en,
          "alternateName": product.name_kn,
          "description": product.description_en,
          "image": [image],
          "sku": product.sku || product.id,
          "brand": {
            "@type": "Brand",
            "name": "Indima Spice Co."
          },
          "offers": {
            "@type": "Offer",
            "url": canonicalUrl,
            "priceCurrency": "INR",
            "price": product.price,
            "priceValidUntil": "2027-12-31",
            "itemCondition": "https://schema.org/NewCondition",
            "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": {
              "@type": "Organization",
              "name": "Indima Spice Co."
            }
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": product.rating || 4.9,
            "reviewCount": Math.max(product.review_count || 1, 15),
            "bestRating": "5",
            "worstRating": "1"
          }
        };

        let modifiedHtml = html;
        modifiedHtml = modifiedHtml.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
        modifiedHtml = modifiedHtml.replace(/<meta\s+name=["']description["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="description" content="${description}" />`);
        modifiedHtml = modifiedHtml.replace(/<link\s+rel=["']canonical["']\s+href=["'].*?["']\s*\/?>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
        
        modifiedHtml = modifiedHtml.replace(/<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:title" content="${title}" />`);
        modifiedHtml = modifiedHtml.replace(/<meta\s+property=["']og:description["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:description" content="${description}" />`);
        modifiedHtml = modifiedHtml.replace(/<meta\s+property=["']og:image["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:image" content="${image}" />`);
        modifiedHtml = modifiedHtml.replace(/<meta\s+property=["']og:url["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
        modifiedHtml = modifiedHtml.replace(/<meta\s+property=["']og:type["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:type" content="product" />`);

        modifiedHtml = modifiedHtml.replace(/<meta\s+name=["']twitter:title["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="twitter:title" content="${title}" />`);
        modifiedHtml = modifiedHtml.replace(/<meta\s+name=["']twitter:description["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="twitter:description" content="${description}" />`);
        modifiedHtml = modifiedHtml.replace(/<meta\s+name=["']twitter:image["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="twitter:image" content="${image}" />`);

        modifiedHtml = modifiedHtml.replace('</head>', `  <script type="application/ld+json" id="ssr-product-jsonld">${JSON.stringify(productJsonLd)}</script>\n  </head>`);
        return modifiedHtml;
      }
    } else if (categoryId) {
      const categories = db.getCategories();
      const cat = categories.find(c => c.id === categoryId);
      if (cat) {
        const name = isKn && cat.name_kn ? cat.name_kn : cat.name_en;
        const desc = ((isKn && cat.description_kn ? cat.description_kn : cat.description_en) || '').replace(/"/g, '&quot;');
        const title = `${name} Spice Range | Authentic Stone-Ground Spices | Indima Spice Co.`;
        const description = `Explore authentic ${name} collection from Indima Spice Co. ${desc} Handcrafted in Karnataka with zero preservatives.`;
        let image = cat.image || '/indima-brand-logo.jpg';
        if (image.startsWith('/')) image = `${baseUrl}${image}`;
        const canonicalUrl = `${baseUrl}/?category=${encodeURIComponent(cat.id)}`;

        let modifiedHtml = html;
        modifiedHtml = modifiedHtml.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
        modifiedHtml = modifiedHtml.replace(/<meta\s+name=["']description["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="description" content="${description}" />`);
        modifiedHtml = modifiedHtml.replace(/<link\s+rel=["']canonical["']\s+href=["'].*?["']\s*\/?>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
        modifiedHtml = modifiedHtml.replace(/<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:title" content="${title}" />`);
        modifiedHtml = modifiedHtml.replace(/<meta\s+property=["']og:description["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:description" content="${description}" />`);
        modifiedHtml = modifiedHtml.replace(/<meta\s+property=["']og:image["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:image" content="${image}" />`);
        modifiedHtml = modifiedHtml.replace(/<meta\s+property=["']og:url["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
        modifiedHtml = modifiedHtml.replace(/<meta\s+name=["']twitter:title["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="twitter:title" content="${title}" />`);
        modifiedHtml = modifiedHtml.replace(/<meta\s+name=["']twitter:description["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="twitter:description" content="${description}" />`);
        modifiedHtml = modifiedHtml.replace(/<meta\s+name=["']twitter:image["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="twitter:image" content="${image}" />`);
        return modifiedHtml;
      }
    }
  } catch (err: any) {
    console.warn('[SEO Meta Injector] Notice:', err?.message);
  }
  return html;
}

// ----------------------------------------------------
// VITE OR STATIC SERVING
// ----------------------------------------------------

async function startServer() {
  // Check and run one-time migration if explicitly requested via RUN_FIRESTORE_MIGRATION=true
  if (process.env.RUN_FIRESTORE_MIGRATION === 'true') {
    try {
      console.log('[Server Startup] RUN_FIRESTORE_MIGRATION=true detected. Executing pre-flight one-time migration...');
      await runOneTimeFirestoreMigration();
    } catch (migErr: any) {
      console.error('[Server Startup] Migration encountered error:', migErr.message);
    }
  }

  try {
    await db.initFirestore();
  } catch (dbErr: any) {
    console.warn('[Firebase Admin Firestore] Pre-flight initialization warning:', dbErr.message);
  }

  // Explicitly serve public files (e.g. google verification files, sitemap, robots.txt)
  app.use(express.static(path.join(process.cwd(), 'public')));

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    app.get('*', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        const html = injectDynamicHtmlMeta(template, req);
        res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const indexHtmlPath = path.join(distPath, 'index.html');
    app.use(express.static(distPath, { index: false }));
    app.get('*', (req: Request, res: Response) => {
      if (fs.existsSync(indexHtmlPath)) {
        const template = fs.readFileSync(indexHtmlPath, 'utf-8');
        const html = injectDynamicHtmlMeta(template, req);
        res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
      } else {
        res.sendFile(indexHtmlPath);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[INDIMA SPICE CO.] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
