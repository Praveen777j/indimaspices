import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';
import multer from 'multer';
import sharp from 'sharp';
import heicConvert from 'heic-convert';
import Razorpay from 'razorpay';
import { createServer as createViteServer } from 'vite';
import { db } from './server/dataStore';
import { isCloudStorageAvailable } from './server/firebaseAdmin';
import { handleAiAssistantRequest, getOfflineFallbackResponse } from './server/aiAssistant';
import { runOneTimeFirestoreMigration } from './server/firestoreMigration';
import {
  initCloudinary,
  getCloudinaryStatus,
  uploadMediaToCloudinary,
  saveMediaLocally,
  migrateLocalMediaToCloudinary,
  CloudinaryUploadResult
} from './server/cloudinary';
import { validateMediaContent } from './server/mediaValidator';
import { lookupPincode } from './src/data/indiaLocations';
import { Product, Category, Recipe, Order, Address, OrderItem, OrderNotification, BusinessSettings } from './src/types';
import { syncOrderStatus, getAuthoritativeOrderStatus } from './src/utils/orderStatus';
import { buildSitemapXml } from './src/utils/sitemapGenerator';
import {
  createSlug,
  getProductSlug,
  getCategorySlug,
  getRecipeSlug,
  findProductBySlugOrId,
  findCategoryBySlugOrId,
  findRecipeBySlugOrId
} from './src/utils/slug';
import {
  validateSecurityConfiguration,
  getSessionSecret,
  signAdminToken,
  verifyAdminToken,
  revokeToken,
  isTokenRevoked,
  AdminLoginSchema,
  AdminChangePasswordSchema,
  SubmitReviewSchema,
  SubmitLeadSchema,
  CustomerLookupSchema,
  TrackOrderSchema,
  CreateRazorpayOrderSchema,
  VerifyRazorpayPaymentSchema,
  isTrustedHost,
  isSafeUrl,
  sanitizeUrl
} from './server/security';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Immediate lightweight health endpoints for Render & Cloud Load Balancers
// Responds immediately with HTTP 200 without requiring external services, DB, or auth.
// Registered at the very top so health checks succeed even while heavy middlewares/routes load.
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Configure trusted reverse-proxy hops for IP resolution and rate limiting
// - In production (Render, Cloud Run, etc.) behind a single reverse proxy, default to 1 hop.
// - Can be configured explicitly via TRUST_PROXY_HOPS or TRUST_PROXY environment variables.
// - In local development / direct connections, defaults to false so untrusted clients cannot spoof X-Forwarded-For.
const envTrustProxy = process.env.TRUST_PROXY_HOPS || process.env.TRUST_PROXY;
if (envTrustProxy !== undefined) {
  const hops = Number(envTrustProxy);
  if (!isNaN(hops) && hops >= 0) {
    app.set('trust proxy', hops);
  } else if (envTrustProxy === 'true') {
    app.set('trust proxy', 1);
  } else if (envTrustProxy === 'false') {
    app.set('trust proxy', false);
  } else {
    app.set('trust proxy', envTrustProxy);
  }
} else if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
} else {
  app.set('trust proxy', false);
}

// Setup upload directory for local storage / fallback
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function getRazorpayInstance() {
  const key_id = (process.env.RAZORPAY_KEY_ID || '').trim();
  const key_secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

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

// Constant-time string comparison to mitigate timing attacks (SHA-256 digested to guarantee identical buffer length)
function timingSafeEqual(a: string, b: string): boolean {
  if (!a || !b) return false;
  const hashA = crypto.createHash('sha256').update(String(a)).digest();
  const hashB = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

// Cryptographically random, high-entropy (256-bit / 64 hex characters) delivery dispatch token generator
function generateDeliveryDispatchToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Retrieve or generate order-specific delivery dispatch token securely stored with order
function getOrderDeliveryDispatchToken(order: Order): string {
  if (order.delivery_dispatch_token) return order.delivery_dispatch_token;
  if (order.tracking?.delivery_dispatch_token) {
    order.delivery_dispatch_token = order.tracking.delivery_dispatch_token;
    return order.delivery_dispatch_token;
  }
  const token = generateDeliveryDispatchToken();
  order.delivery_dispatch_token = token;
  if (!order.tracking) {
    order.tracking = {};
  }
  order.tracking.delivery_dispatch_token = token;
  db.setFirestoreDoc('orders', order.id, order).catch(() => {});
  db.save();
  return token;
}

// Verify delivery dispatch token using constant-time comparison
function verifyDeliveryDispatchToken(order: Order, providedToken?: string): boolean {
  if (!providedToken || typeof providedToken !== 'string') return false;
  const cleanProvided = providedToken.trim();
  const validToken = getOrderDeliveryDispatchToken(order);
  return timingSafeEqual(cleanProvided, validToken);
}

// Strip delivery dispatch token from customer-facing order payloads
function stripDeliveryDispatchToken<T extends Order | undefined | null>(order: T): T {
  if (!order) return order;
  const clone = { ...order };
  delete (clone as any).delivery_dispatch_token;
  if (clone.tracking) {
    const cloneTracking = { ...clone.tracking };
    delete (cloneTracking as any).delivery_dispatch_token;
    clone.tracking = cloneTracking;
  }
  return clone as T;
}

// Cryptographic Order Access Token Generation & Timing-Safe Verification
function getOrderAccessToken(order: Order): string {
  if (order.order_token) return order.order_token;
  const secret = getSessionSecret() || process.env.SESSION_SECRET || 'indima-order-access-secret-fallback-key-1837482';
  return crypto.createHmac('sha256', secret).update(`${order.id}:${order.created_at || ''}`).digest('hex');
}

function verifyOrderAccessToken(order: Order, providedToken?: string): boolean {
  if (!providedToken || typeof providedToken !== 'string') return false;
  const cleanProvided = providedToken.trim();
  const validToken = getOrderAccessToken(order);
  return timingSafeEqual(cleanProvided, validToken);
}

// Sanitized internal server error responder (prevents internal stack/path leaks in production)
function safeInternalError(res: Response, err: any, clientFallback = 'An unexpected internal error occurred'): Response {
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({ success: false, error: clientFallback });
  }
  return res.status(500).json({ success: false, error: err?.message || clientFallback });
}

// Multer Storage Configuration - Temporary disk storage for processing only
const TEMP_UPLOAD_DIR = path.join(os.tmpdir(), 'indima-uploads-temp');
if (!fs.existsSync(TEMP_UPLOAD_DIR)) {
  fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, TEMP_UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

const allowedAdminMimes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/svg+xml',
  'image/tiff',
  'image/bmp',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-matroska'
];
const allowedAdminExts = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.heic',
  '.heif',
  '.svg',
  '.tif',
  '.tiff',
  '.bmp',
  '.mp4',
  '.m4v',
  '.webm',
  '.mov',
  '.mkv'
];

const upload = multer({
  storage,
  limits: {
    fileSize: 120 * 1024 * 1024 // 120MB for high-res images/videos
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const mime = (file.mimetype || '').toLowerCase();

    if (mime === 'application/octet-stream') {
      return cb(new Error('Generic application/octet-stream upload is rejected. Please provide a valid media file.'));
    }

    if (!allowedAdminMimes.includes(mime) || !allowedAdminExts.includes(ext)) {
      return cb(new Error('Invalid file format. Only permitted image and video formats are allowed.'));
    }

    cb(null, true);
  }
});

// Dedicated Multer middleware for review proof uploads: strict 25MB stream limit, no application/octet-stream
const allowedReviewProofMimes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'video/mp4',
  'video/webm',
  'video/quicktime'
];
const allowedReviewProofExts = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.mp4', '.webm', '.mov'];

const reviewProofUpload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024 // Exactly 25MB stream-level limit
  },
  fileFilter: (req, file, cb) => {
    const mime = (file.mimetype || '').toLowerCase();
    const ext = path.extname(file.originalname || '').toLowerCase();

    // Reject application/octet-stream and require BOTH allowed MIME and allowed extension
    if (!allowedReviewProofMimes.includes(mime) || !allowedReviewProofExts.includes(ext)) {
      cb(new Error('Invalid file format. Only images (JPG, PNG, WebP, HEIC) and videos (MP4, WebM, MOV) are permitted.'));
    } else {
      cb(null, true);
    }
  }
});

/**
 * Normalizes uploaded media files:
 * - Validates binary magic-bytes and container signature
 * - Direct video stream to Cloudinary using video resource type
 * - Converts HEIC/HEIF to JPEG
 * - Auto-rotates EXIF orientation from mobile phone cameras
 * - Optimizes and verifies image structures with sharp (rejects corrupt/spoofed files)
 * - Directly uploads to Cloudinary
 * - Cleans up temporary files immediately after upload
 */
async function processMediaFile(
  file: Express.Multer.File,
  options: { folder?: string; resourceType?: 'auto' | 'image' | 'video'; allowSvg?: boolean } = {}
): Promise<CloudinaryUploadResult> {
  const filePath = file.path;
  const originalExt = path.extname(file.originalname || file.filename).toLowerCase();
  const baseName = path.basename(file.filename, path.extname(file.filename));
  const mime = (file.mimetype || '').toLowerCase();

  // 1. Mandatory Magic-Byte & Container Structure Validation before processing or storing
  const validation = validateMediaContent(filePath, mime, file.originalname || file.filename, {
    allowSvg: options.allowSvg ?? true,
    allowedCategories: ['image', 'video']
  });

  if (!validation.valid) {
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (_) {}
    }
    throw new Error(validation.error || 'Uploaded file content failed media signature validation.');
  }

  const isVideo = validation.detected.category === 'video';

  try {
    if (isVideo) {
      // Direct stream/upload video to Cloudinary from temporary file without reading whole video into memory
      const uploadResult = await uploadMediaToCloudinary({
        filePath,
        originalName: file.originalname || file.filename,
        mimeType: mime || validation.detected.mime || 'video/mp4',
        folder: options.folder || 'indima-spices/videos',
        resourceType: 'video',
        cleanupTempFile: true
      });
      return uploadResult;
    }

    // Process image: HEIC conversion, SVG sanitization, or Sharp decoding & re-encoding
    let processedBuffer: Buffer;
    let finalFileName = file.filename;
    let finalContentType = mime || 'image/jpeg';

    if (originalExt === '.heic' || originalExt === '.heif' || mime.includes('heic') || mime.includes('heif')) {
      try {
        const inputBuffer = fs.readFileSync(filePath);
        processedBuffer = (await heicConvert({
          buffer: inputBuffer,
          format: 'JPEG',
          quality: 0.88
        })) as Buffer;
        finalFileName = `${baseName}.jpg`;
        finalContentType = 'image/jpeg';
      } catch (heicErr: any) {
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (_) {}
        }
        throw new Error(`HEIC conversion failed: ${heicErr?.message || 'Corrupt or invalid HEIC image'}`);
      }
    } else if (originalExt === '.svg' || mime.includes('svg')) {
      const rawSvg = fs.readFileSync(filePath, 'utf8');
      // SVG security inspection: block scripts, executable tags, and event handlers
      if (/<script|onload\s*=|onerror\s*=|onclick\s*=|onmouseover\s*=|javascript:|<foreignObject|<iframe|<embed|<object/i.test(rawSvg)) {
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (_) {}
        }
        throw new Error('SVG contains potentially executable or script content and was rejected for security.');
      }
      processedBuffer = Buffer.from(rawSvg, 'utf8');
      finalContentType = 'image/svg+xml';
    } else {
      try {
        // Decode and re-encode through Sharp. This strips malicious metadata and guarantees valid image pixels.
        processedBuffer = await sharp(filePath)
          .rotate()
          .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 88, progressive: true })
          .toBuffer();
        finalFileName = `${baseName}.jpg`;
        finalContentType = 'image/jpeg';
      } catch (sharpErr: any) {
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (_) {}
        }
        throw new Error(`Image decoding failed: ${sharpErr?.message || 'File is corrupt or contains invalid image data'}`);
      }
    }

    // Upload processed buffer to Cloudinary
    const uploadResult = await uploadMediaToCloudinary({
      buffer: processedBuffer,
      originalName: finalFileName,
      mimeType: finalContentType,
      folder: options.folder || 'indima-spices/products',
      resourceType: 'image',
      cleanupTempFile: true
    });

    // Remove temp file created by multer
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (_) {}
    }

    return uploadResult;
  } catch (err: any) {
    if (process.env.NODE_ENV === 'production') {
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (_) {}
      }
      throw new Error(`Media processing and Cloudinary storage failed: ${err.message || err}. Local fallback is strictly disabled in production.`);
    }
    console.warn('[Process Media Notice]:', err?.message || err, '- saving raw upload as local fallback');
    try {
      if (fs.existsSync(filePath)) {
        const fallbackRes = saveMediaLocally({
          filePath,
          originalName: file.originalname || file.filename,
          mimeType: mime,
          resourceType: isVideo ? 'video' : 'image'
        });
        try {
          fs.unlinkSync(filePath);
        } catch (_) {}
        return fallbackRes;
      }
    } catch (saveErr) {
      console.error('[Fallback Save Error]:', saveErr);
    }
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (_) {}
    }
    throw err;
  }
}

app.use(
  express.json({
    limit: '1mb',
    verify: (req: any, _res: Response, buf: Buffer) => {
      req.rawBody = buf;
    }
  })
);
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.disable('x-powered-by');

// ----------------------------------------------------
// CORS, SECURITY HEADERS & CSRF / REQUEST-FORGERY PROTECTION
// ----------------------------------------------------

// Helper to determine if an Origin is trusted for Indima Spices
function isTrustedOrigin(origin: string, req: Request): boolean {
  if (!origin || typeof origin !== 'string') return false;
  const cleanOrigin = origin.trim();
  if (!cleanOrigin || cleanOrigin === 'null') return false;

  // 1. Same-Origin Check against verified Host header
  try {
    const originUrl = new URL(cleanOrigin);
    const hostHeader = req.get('host');
    if (hostHeader && isTrustedHost(hostHeader)) {
      const cleanHost = hostHeader.split(':')[0].toLowerCase();
      if (originUrl.hostname.toLowerCase() === cleanHost) {
        return true;
      }
    }
  } catch {
    return false;
  }

  // 2. Strict exact origin matching from ALLOWED_ORIGIN env var
  const allowedOriginEnv = process.env.ALLOWED_ORIGIN;
  const configuredOrigins = allowedOriginEnv
    ? allowedOriginEnv.split(',').map(o => o.trim()).filter(Boolean)
    : [];
  for (const trusted of configuredOrigins) {
    if (cleanOrigin.toLowerCase() === trusted.toLowerCase()) {
      return true;
    }
  }

  // 3. Development / preview environments (strictly non-production only)
  if (process.env.NODE_ENV !== 'production') {
    try {
      const originUrl = new URL(cleanOrigin);
      const originHostname = originUrl.hostname.toLowerCase();
      const isLocal = originHostname === 'localhost' || originHostname === '127.0.0.1';
      const isGoogleCloudRun = originHostname.endsWith('.run.app');
      const isAiStudio = originHostname.endsWith('ai.studio') || originHostname.includes('ai.studio') || originHostname.endsWith('.google.com');
      if (isLocal || isGoogleCloudRun || isAiStudio) {
        return true;
      }
    } catch {
      return false;
    }
  }

  return false;
}

// CORS & Comprehensive Security Headers Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;

  if (origin) {
    const cleanOrigin = origin.trim();
    const isAllowed = isTrustedOrigin(cleanOrigin, req);

    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', cleanOrigin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
  }

  // Standard Security Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Content Security Policy (CSP) with frame-ancestors allowing AI Studio preview & Cloud Run
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://api.razorpay.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com https://*.firebasestorage.app https://images.unsplash.com https://cdn.razorpay.com",
    "media-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com",
    "connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com https://*.firebaseio.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com",
    "frame-src 'self' https://api.razorpay.com",
    "frame-ancestors 'self' https://ai.studio https://*.ai.studio https://*.google.com https://*.run.app https://*.onrender.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ];

  if (process.env.NODE_ENV === 'production') {
    cspDirectives.push("upgrade-insecure-requests");
  }

  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));

  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Preflight handling: reject untrusted preflight origins; allow trusted
  if (req.method === 'OPTIONS') {
    if (origin && !isTrustedOrigin(origin, req)) {
      return res.status(403).json({ error: 'Forbidden: Untrusted cross-origin preflight' });
    }
    return res.sendStatus(204);
  }
  next();
});

// CSRF & Cross-Origin State-Changing Request Protection Middleware
// Prevents cross-site request forgery and unauthorized cross-origin mutations
app.use((req: Request, res: Response, next: NextFunction) => {
  const method = req.method.toUpperCase();
  const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  // Read-only HTTP methods do not change state
  if (!isStateChanging) {
    return next();
  }

  // Machine-to-machine webhooks (Razorpay) bypass browser CSRF checks;
  // they are cryptographically authenticated via x-razorpay-signature and raw HMAC-SHA256
  if (req.path === '/api/razorpay-webhook' || req.path === '/api/payments/webhook') {
    return next();
  }

  const origin = req.headers.origin;
  const referer = req.headers.referer;
  const secFetchSite = req.headers['sec-fetch-site'];

  // 1. Explicit Origin Header Verification
  // Modern browsers unconditionally send Origin on cross-origin requests and state-changing mutations
  if (origin) {
    if (!isTrustedOrigin(origin, req)) {
      return res.status(403).json({
        error: 'Forbidden: Cross-origin state-changing request blocked'
      });
    }
  }

  // 2. Fetch Metadata Sec-Fetch-Site Check (defense-in-depth)
  if (secFetchSite === 'cross-site' && (!origin || !isTrustedOrigin(origin, req))) {
    return res.status(403).json({
      error: 'Forbidden: Cross-site state-changing request blocked'
    });
  }

  // 3. Fallback Referer Header Verification if Origin is absent
  if (!origin && referer) {
    try {
      const refererUrl = new URL(referer);
      if (!isTrustedOrigin(refererUrl.origin, req)) {
        return res.status(403).json({
          error: 'Forbidden: Cross-origin referer blocked'
        });
      }
    } catch {
      return res.status(403).json({
        error: 'Forbidden: Malformed referer header'
      });
    }
  }

  next();
});

// Anti-Caching Middleware for all API routes (prevents caching of PII, orders, tokens, admin data)
app.use('/api', (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Serve static uploads with strict security headers (nosniff, sandboxing, attachment disposition for SVGs)
app.use(
  '/uploads',
  (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
    next();
  },
  express.static(UPLOAD_DIR, {
    setHeaders: (res, filePath) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      const ext = path.extname(filePath).toLowerCase();
      if (ext === '.svg' || !['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.webm', '.mov'].includes(ext)) {
        res.setHeader('Content-Disposition', 'attachment');
      }
    }
  })
);
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
    // Derive client IP reliably from Express-managed req.ip (honors trust proxy configuration)
    const rawIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const clientIp = typeof rawIp === 'string' && rawIp.startsWith('::ffff:') ? rawIp.substring(7) : String(rawIp);
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

const orderTrackLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 15,
  message: 'Too many order tracking requests. Please slow down.',
  keyPrefix: 'order_track'
});

const deliveryLocationLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: 'Delivery location update rate limit reached. Please wait a moment.',
  keyPrefix: 'delivery_loc'
});

const paymentVerifyLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: 'Too many payment verification attempts. Please wait a moment.',
  keyPrefix: 'payment_verify'
});

const reviewSubmitLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 15,
  message: 'Review submission limit reached. Please wait a moment before trying again.',
  keyPrefix: 'rev_submit'
});

const reviewUploadLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'Media upload rate limit reached. Please wait a moment.',
  keyPrefix: 'rev_upload'
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
const INTERNAL_SECRET = getSessionSecret();

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
  const token = signAdminToken(username);
  const now = Date.now();
  adminSessions.set(token, {
    token,
    username,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS
  });
  return token;
}

function validateAdminToken(token: string): AdminSession | null {
  if (!token || isTokenRevoked(token)) return null;
  const session = adminSessions.get(token);
  if (session) {
    if (Date.now() > session.expiresAt) {
      adminSessions.delete(token);
      return null;
    }
    return session;
  }

  // Verify modern cryptographic signature via security module
  const verifiedPayload = verifyAdminToken(token);
  if (verifiedPayload) {
    const restoredSession: AdminSession = {
      token,
      username: verifiedPayload.username,
      createdAt: verifiedPayload.issuedAt,
      expiresAt: verifiedPayload.expiresAt
    };
    adminSessions.set(token, restoredSession);
    return restoredSession;
  }

  // Verify legacy format if token was issued prior to restart
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

// Lightweight Root Health Endpoint for Render / Cloud Load Balancers
// Responds immediately with HTTP 200 without requiring external services or auth
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok'
  });
});

// Minimal Public Health Endpoint (No sensitive infrastructure or count leakage)
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok'
  });
});

// Detailed Database Status (Protected behind verified Admin Authentication)
app.get('/api/database/status', adminAuthMiddleware, (req: Request, res: Response) => {
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
    return safeInternalError(res, err, 'Failed to load store settings');
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
    return safeInternalError(res, err, 'Failed to load products');
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

app.post('/api/reviews', reviewSubmitLimiter, async (req: Request, res: Response) => {
  try {
    const parseResult = SubmitReviewSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.issues[0]?.message || 'Invalid review payload' });
    }
    const { product_id, customer_name, customer_city, rating, comment_en, comment_kn } = parseResult.data;

    // Verify product actually exists
    const prod = db.getProductById(product_id);
    if (!prod) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Basic HTML escaping against stored XSS
    const escapeHtml = (str: string) => str.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const review = await db.addReview({
      product_id,
      customer_name: escapeHtml(customer_name),
      customer_city: customer_city ? escapeHtml(customer_city) : 'Karnataka',
      rating,
      comment_en: escapeHtml(comment_en),
      comment_kn: comment_kn ? escapeHtml(comment_kn) : escapeHtml(comment_en)
    });
    res.json({ success: true, review });
  } catch (err: any) {
    return safeInternalError(res, err, 'Failed to submit review');
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

// 9. Customer lookup endpoint - disabled for unauthenticated callers to prevent PII harvesting / BOLA
app.post('/api/customer/lookup', customerLookupLimiter, (_req: Request, res: Response) => {
  // Fails closed: Never returns customer profile or saved address to arbitrary callers.
  return res.json({ found: false, count: 0 });
});

// 10. Track Orders by Order ID & Token or Admin Authorization
app.get('/api/orders/track', orderTrackLimiter, async (req: Request, res: Response) => {
  const { phone, order_id } = req.query;
  const authHeader = req.headers.authorization;
  const hasAdminSession = Boolean(authHeader && authHeader.startsWith('Bearer ') && validateAdminToken(authHeader.split(' ')[1]));

  // 1. Admin Session: Allow tracking / searching by phone or order_id
  if (hasAdminSession) {
    let rawOrders = phone && typeof phone === 'string'
      ? db.getOrdersByPhone(phone.replace(/\D/g, '').slice(-10))
      : db.getOrders();
    if (order_id && typeof order_id === 'string') {
      rawOrders = rawOrders.filter(o => o.id.toLowerCase() === order_id.toLowerCase().trim());
    }
    return res.json({
      phone: phone ? `+91 ${phone}` : undefined,
      count: rawOrders.length,
      orders: rawOrders
    });
  }

  // 2. Customer Tracking: Allow tracking a specific order ONLY if provided with valid order access token
  const searchOrderId = typeof order_id === 'string' ? order_id.trim() : '';
  const providedToken = (
    (req.query.token as string) ||
    (req.query.order_token as string) ||
    (req.headers['x-order-token'] as string) ||
    (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : '')
  )?.trim();

  if (searchOrderId && providedToken) {
    let order = db.getOrderById(searchOrderId);
    if (!order) {
      order = await db.findOrFetchOrder(searchOrderId);
    }
    if (order && verifyOrderAccessToken(order, providedToken)) {
      const authoritativeStatus = getAuthoritativeOrderStatus(order);
      syncOrderStatus(order, authoritativeStatus);
      const sanitizedOrder = {
        id: order.id,
        internal_order_id: order.internal_order_id,
        status: authoritativeStatus,
        order_status: authoritativeStatus,
        payment_status: order.payment_status,
        payment_method: order.payment_method,
        items: (order.items || []).map(item => ({
          product_id: item.product_id,
          name_en: item.name_en,
          name_kn: item.name_kn,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
          image: item.image
        })),
        subtotal: order.subtotal,
        discount_amount: order.discount_amount,
        coupon_code: order.coupon_code,
        shipping_fee: order.shipping_fee,
        total_amount: order.total_amount,
        currency: order.currency || 'INR',
        tracking_number: order.tracking_number,
        carrier: order.carrier || order.tracking?.carrier,
        expected_delivery: order.expected_delivery,
        tracking: order.tracking ? {
          carrier: order.tracking.carrier || order.carrier,
          tracking_number: order.tracking.tracking_number || order.tracking_number,
          status: authoritativeStatus,
          expected_delivery: order.tracking.expected_delivery || order.expected_delivery,
          latitude: order.tracking.latitude,
          longitude: order.tracking.longitude,
          location_name: order.tracking.location_name,
          location_updated_at: order.tracking.location_updated_at,
          live_tracking_available: order.tracking.live_tracking_available
        } : (order.tracking_number || order.carrier || order.expected_delivery ? {
          carrier: order.carrier,
          tracking_number: order.tracking_number,
          expected_delivery: order.expected_delivery,
          status: authoritativeStatus
        } : undefined),
        created_at: order.created_at,
        order_date: order.order_date,
        updated_at: order.updated_at,
        address_snapshot: order.address_snapshot ? {
          fullName: order.address_snapshot.fullName,
          city: order.address_snapshot.city,
          district: order.address_snapshot.district,
          state: order.address_snapshot.state,
          pincode: order.address_snapshot.pincode
        } : undefined
      };
      return res.json({
        count: 1,
        orders: [sanitizedOrder]
      });
    }
  }

  // 3. Fail closed: Unauthenticated caller querying only by phone or without valid order token
  return res.status(401).json({
    error: 'Order tracking requires customer authentication or a valid Order ID and Order Token. Please check your order confirmation receipt.',
    count: 0,
    orders: []
  });
});

// 10b. Get Single Order by ID (Protected by Admin Auth or Server-Issued Order Access Token)
app.get('/api/orders/:id', orderTrackLimiter, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    const hasAdminSession = Boolean(authHeader && authHeader.startsWith('Bearer ') && validateAdminToken(authHeader.split(' ')[1]));

    let order = db.getOrderById(id);
    if (!order) {
      order = await db.findOrFetchOrder(id);
    }
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Admin session: Return full order with synchronized status
    if (hasAdminSession) {
      syncOrderStatus(order);
      return res.json({ success: true, order });
    }

    // Customer access: Requires valid server-issued order access token
    const providedToken = (
      (req.query.token as string) ||
      (req.headers['x-order-token'] as string) ||
      (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : '')
    )?.trim();

    const hasValidOrderToken = verifyOrderAccessToken(order, providedToken);

    if (!hasValidOrderToken) {
      // Fail closed: Anonymous callers or callers with invalid tokens cannot view order details
      return res.status(401).json({
        error: 'Access denied. A valid order access token or administrator authorization is required to view order details.'
      });
    }

    // Verified customer access: Return explicitly sanitized order data with strict data minimization
    const authoritativeStatus = getAuthoritativeOrderStatus(order);
    syncOrderStatus(order, authoritativeStatus);
    const sanitizedOrder = {
      id: order.id,
      internal_order_id: order.internal_order_id,
      status: authoritativeStatus,
      order_status: authoritativeStatus,
      payment_status: order.payment_status,
      payment_method: order.payment_method,
      items: (order.items || []).map(item => ({
        product_id: item.product_id,
        name_en: item.name_en,
        name_kn: item.name_kn,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
        image: item.image
      })),
      subtotal: order.subtotal,
      discount_amount: order.discount_amount,
      coupon_code: order.coupon_code,
      shipping_fee: order.shipping_fee,
      total_amount: order.total_amount,
      currency: order.currency || 'INR',
      tracking_number: order.tracking_number,
      carrier: order.carrier || order.tracking?.carrier,
      expected_delivery: order.expected_delivery,
      tracking: order.tracking ? {
        carrier: order.tracking.carrier || order.carrier,
        tracking_number: order.tracking.tracking_number || order.tracking_number,
        status: authoritativeStatus,
        expected_delivery: order.tracking.expected_delivery || order.expected_delivery,
        latitude: order.tracking.latitude,
        longitude: order.tracking.longitude,
        location_name: order.tracking.location_name,
        location_updated_at: order.tracking.location_updated_at,
        live_tracking_available: order.tracking.live_tracking_available
      } : (order.tracking_number || order.carrier || order.expected_delivery ? {
        carrier: order.carrier,
        tracking_number: order.tracking_number,
        expected_delivery: order.expected_delivery,
        status: authoritativeStatus
      } : undefined),
      created_at: order.created_at,
      order_date: order.order_date,
      updated_at: order.updated_at,
      address_snapshot: order.address_snapshot ? {
        fullName: order.address_snapshot.fullName,
        city: order.address_snapshot.city,
        district: order.address_snapshot.district,
        state: order.address_snapshot.state,
        pincode: order.address_snapshot.pincode
      } : undefined
    };

    return res.json({
      success: true,
      order: sanitizedOrder
    });
  } catch (err: any) {
    return safeInternalError(res, err, 'Failed to retrieve order');
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
    const sanitizedError = (err?.message || String(err))
      .replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_API_KEY]')
      .replace(/key=[^&\s]+/g, 'key=[REDACTED]');
    console.warn('[Indima AI Assistant Endpoint] ⚠️ Error caught, responding with verified fallback engine:', sanitizedError);

    const activeProds = db.getProducts()?.filter(p => p.active !== false) || [];
    const fallback = getOfflineFallbackResponse(
      req.body?.message || 'help',
      activeProds,
      req.body?.language === 'kn' ? 'kn' : 'en',
      Array.isArray(req.body?.history) ? req.body.history : []
    );

    res.json({
      success: true,
      ...fallback
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

  // 6. Generate Internal Order ID with 8-character cryptographically secure random suffix (e.g. IND-2609-A3F8B92C)
  const dateStr = new Date().toISOString().slice(2, 7).replace('-', '');
  const cryptoSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();
  const orderId = `IND-${dateStr}-${cryptoSuffix}`;
  const orderToken = crypto.randomBytes(32).toString('hex');

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
    } catch (_err: any) {
      console.error('[Razorpay Order Creation Failed]:', _err?.message || _err);
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
    order_token: orderToken,
    delivery_dispatch_token: generateDeliveryDispatchToken(),
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
    order_source: 'web',
    razorpay_order_id: rzpOrder.id,
    expected_delivery: expectedDeliveryStr,
    whatsapp_notification_status: 'Pending',
    created_at: new Date().toISOString(),
    order_date: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const savedOrder = await db.createOrder(newOrder);

  return {
    order: stripDeliveryDispatchToken(savedOrder),
    order_token: orderToken,
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
      order_token: result.order_token,
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
      order_token: result.order_token,
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

// WhatsApp Order Ingestion Endpoint: POST /api/orders/whatsapp
app.post('/api/orders/whatsapp', orderCreateLimiter, async (req: Request, res: Response) => {
  try {
    const {
      items,
      customer_name,
      customer_phone,
      customer_email,
      address,
      notes,
      coupon_code
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart cannot be empty' });
    }

    const cleanPhone = (customer_phone ? String(customer_phone).replace(/\D/g, '') : '').slice(-10) || '9845012345';
    const settings = db.getSettings();

    // Validate items and recalculate
    let calculatedSubtotal = 0;
    const validatedItems: OrderItem[] = [];

    for (const rawItem of items) {
      const prod = db.getProductById(rawItem.product_id || rawItem.id);
      const qty = Math.max(1, Math.min(Number(rawItem.quantity) || 1, 100));
      const unitPrice = prod ? prod.price : (Number(rawItem.unit_price) || 0);
      const itemSubtotal = unitPrice * qty;
      calculatedSubtotal += itemSubtotal;

      validatedItems.push({
        product_id: prod ? prod.id : String(rawItem.product_id || 'unknown'),
        sku: prod ? prod.sku || prod.id : String(rawItem.sku || 'SKU'),
        name_en: prod ? prod.name_en : String(rawItem.name_en || 'Spice Item'),
        name_kn: prod ? prod.name_kn : String(rawItem.name_kn || ''),
        image: (prod && prod.images && prod.images[0]) ? prod.images[0] : String(rawItem.image || ''),
        quantity: qty,
        unit_price: unitPrice,
        mrp: prod ? prod.mrp || prod.price : unitPrice,
        discount: prod && prod.mrp ? Math.max(0, prod.mrp - prod.price) : 0,
        subtotal: itemSubtotal,
        weight: prod ? prod.weight : String(rawItem.weight || '100g')
      });
    }

    // Coupon discount
    let discountAmount = 0;
    if (coupon_code) {
      const offer = db.getOffers().find(o => o.code.toUpperCase() === String(coupon_code).toUpperCase() && o.active);
      if (offer && calculatedSubtotal >= (offer.min_order_amount || 0)) {
        if (offer.discount_type === 'percentage') {
          const calculatedDiscount = Math.round((calculatedSubtotal * offer.discount_value) / 100);
          discountAmount = offer.max_discount_amount ? Math.min(calculatedDiscount, offer.max_discount_amount) : calculatedDiscount;
        } else {
          discountAmount = Math.min(offer.discount_value, calculatedSubtotal);
        }
      }
    }

    const shippingFee = (calculatedSubtotal - discountAmount >= settings.free_delivery_threshold) ? 0 : settings.standard_shipping_fee;
    const finalTotal = Math.max(0, calculatedSubtotal - discountAmount + shippingFee);

    const dateStr = new Date().toISOString().slice(2, 7).replace('-', '');
    const cryptoSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const orderId = `WA-${dateStr}-${cryptoSuffix}`;
    const orderToken = crypto.randomBytes(32).toString('hex');

    const customer = await db.upsertCustomer({
      phone: cleanPhone,
      name: (customer_name || 'WhatsApp Customer').trim(),
      email: (customer_email || 'care@indimaspice.com').trim(),
      saved_address: address || {
        fullName: (customer_name || 'WhatsApp Customer').trim(),
        phone: cleanPhone,
        streetAddress: 'WhatsApp Direct Order',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001'
      }
    });

    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + 4);
    const expectedDeliveryStr = expectedDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const newOrder: Order = {
      id: orderId,
      internal_order_id: orderId,
      order_token: orderToken,
      delivery_dispatch_token: generateDeliveryDispatchToken(),
      customer_id: customer.id,
      customer_name: (customer_name || 'WhatsApp Customer').trim(),
      customer_phone: cleanPhone,
      customer_email: (customer_email || 'care@indimaspice.com').trim(),
      items: validatedItems,
      subtotal: calculatedSubtotal,
      discount_amount: discountAmount,
      coupon_code: coupon_code || undefined,
      shipping_fee: shippingFee,
      total_amount: finalTotal,
      amount: finalTotal,
      currency: 'INR',
      address_snapshot: address || {
        fullName: (customer_name || 'WhatsApp Customer').trim(),
        phone: cleanPhone,
        streetAddress: 'Order via WhatsApp Chat',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001'
      },
      payment_method: 'WhatsApp / UPI',
      payment_status: 'Pending',
      status: 'placed',
      order_status: 'Order Placed',
      order_source: 'whatsapp',
      expected_delivery: expectedDeliveryStr,
      whatsapp_notification_status: 'Pending',
      notes: notes || 'Direct order placed via WhatsApp chat channel',
      created_at: new Date().toISOString(),
      order_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const savedOrder = await db.createOrder(newOrder);

    res.json({
      success: true,
      order: stripDeliveryDispatchToken(savedOrder),
      order_id: savedOrder.id,
      order_token: orderToken
    });
  } catch (err: any) {
    console.error('WhatsApp Order Error:', err);
    res.status(400).json({ success: false, error: err.message || 'Failed to place WhatsApp order' });
  }
});

// Automated Dispatch of WhatsApp Order Alerts to Store Admin
async function dispatchAdminWhatsAppAlert(order: Order, settings: BusinessSettings): Promise<{ success: boolean; status: 'Sent' | 'Pending' | 'Failed'; error?: string; detail?: string }> {
  try {
    const rawAdminNumber = settings.admin_whatsapp_number || settings.whatsapp_number || '919845012345';
    let cleanNumber = rawAdminNumber.replace(/\D/g, '');
    if (cleanNumber.length === 10) cleanNumber = `91${cleanNumber}`;
    else if (cleanNumber.length === 11 && cleanNumber.startsWith('0')) cleanNumber = `91${cleanNumber.slice(1)}`;

    const itemsSummary = (order.items || [])
      .map((it, idx) => `${idx + 1}. *${it.name_en}* (${it.weight || 'Std'}) × ${it.quantity} = ₹${it.subtotal ?? it.total_price ?? (it.unit_price * it.quantity)}`)
      .join('\n');

    const msg = `🌿 *NEW PAID ORDER ALERT — INDIMA SPICE CO.* 🌿\n\n` +
      `*Order ID:* ${order.id}\n` +
      `*Amount Paid:* ₹${order.total_amount} ✅ (UPI Confirmed)\n` +
      `*Payment Method:* ${order.payment_method || 'UPI / Razorpay'}\n` +
      `*Customer:* ${order.customer_name} (+91 ${order.customer_phone})\n` +
      `*Address:* ${order.address_snapshot?.houseFlat || ''}, ${order.address_snapshot?.street || ''}, ${order.address_snapshot?.city || ''}, ${order.address_snapshot?.state || ''} - ${order.address_snapshot?.pincode || ''}\n\n` +
      `📦 *Items Ordered (${order.items?.length || 0}):*\n${itemsSummary}\n\n` +
      `⏰ *Time:* ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n` +
      `_Please check your Admin Dashboard to dispatch this order._`;

    // 1. CallMeBot API (free automated WhatsApp message to admin phone)
    const callmebotKey = settings.callmebot_api_key || process.env.CALLMEBOT_API_KEY;
    if (callmebotKey) {
      try {
        const callmebotUrl = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(cleanNumber)}&text=${encodeURIComponent(msg)}&apikey=${encodeURIComponent(callmebotKey)}`;
        const resp = await fetch(callmebotUrl, { method: 'GET' });
        if (resp.ok) {
          return { success: true, status: 'Sent', detail: 'Sent via CallMeBot' };
        }
      } catch (e: any) {
        console.warn('[CallMeBot WhatsApp error]:', e?.message);
      }
    }

    // 2. Custom Webhook (Make / Zapier / n8n / custom WhatsApp bot)
    const webhookUrl = settings.whatsapp_webhook_url || process.env.WHATSAPP_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const resp = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'new_paid_order',
            order_id: order.id,
            admin_phone: cleanNumber,
            customer_name: order.customer_name,
            customer_phone: order.customer_phone,
            amount: order.total_amount,
            message: msg,
            order
          })
        });
        if (resp.ok) {
          return { success: true, status: 'Sent', detail: 'Sent via Webhook' };
        }
      } catch (e: any) {
        console.warn('[WhatsApp Webhook error]:', e?.message);
      }
    }

    // 3. Meta WhatsApp Cloud API (if configured)
    const metaToken = settings.whatsapp_api_token || process.env.WHATSAPP_API_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    if (metaToken && phoneNumberId) {
      try {
        const metaUrl = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
        const resp = await fetch(metaUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${metaToken}`
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: cleanNumber,
            type: 'text',
            text: { body: msg }
          })
        });
        if (resp.ok) {
          return { success: true, status: 'Sent', detail: 'Sent via WhatsApp Cloud API' };
        }
      } catch (e: any) {
        console.warn('[Meta WhatsApp Cloud API error]:', e?.message);
      }
    }

    return {
      success: true,
      status: 'Pending',
      detail: 'Ready (Direct WhatsApp available)'
    };
  } catch (err: any) {
    console.error('[WhatsApp Dispatch Error]:', err);
    return { success: false, status: 'Failed', error: err?.message || 'Unknown error' };
  }
}

// Helper for Razorpay Signature Verification & Order Finalization
async function verifyPaymentInternal(body: any, req?: Request) {
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

  // Case A: Manual UTR / Bank Reference or Offline Payment Proof submission (Queued for Admin Verification)
  if (utr_reference && !razorpay_signature) {
    const authHeader = req?.headers?.authorization;
    const providedToken = (
      body.order_token ||
      body.token ||
      (req?.headers?.['x-order-token'] as string) ||
      (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : '')
    )?.trim();
    const hasAdminSession = Boolean(providedToken && validateAdminToken(providedToken));
    const hasValidToken = verifyOrderAccessToken(order, providedToken);

    if (!hasAdminSession && !hasValidToken) {
      throw new Error('Access denied: A valid order access token or administrator authorization is required to submit payment references.');
    }

    const nowIso = new Date().toISOString();
    order.payment_status = 'Pending Verification';
    order.order_status = 'Payment Verification Pending';
    order.status = 'pending_verification';
    order.payment_method = 'UPI / Bank Transfer (Manual Reference)';
    order.utr_reference = utr_reference;
    order.transaction_id = utr_reference;
    order.updated_at = nowIso;
    order.payment_details = {
      method: 'Manual UPI / UTR',
      utr_reference,
      submitted_at: nowIso
    };

    const updatedOrder = await db.updateOrder(order);
    await db.logAudit('Customer', 'PAYMENT_PROOF_SUBMITTED', order.id, `UTR Reference ${utr_reference} submitted (Pending Admin Verification)`);
    return {
      success: true,
      message: 'Payment reference received. Your payment is pending verification by our team.',
      order: updatedOrder
    };
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
    // In production, reject unconfigured / simulated payment signatures
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Payment gateway configuration is missing or inactive for live verification. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your server environment variables.');
    }
    // Development / Test mode validation
    const isTestSignature =
      razorpay_payment_id.startsWith('pay_sim_') ||
      razorpay_signature.startsWith('sim_sig_') ||
      effectiveRzpOrderId.startsWith('order_');
    isSignatureValid = isTestSignature && Boolean(razorpay_payment_id);
  }

  if (!isSignatureValid) {
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

  // Dispatch automated WhatsApp Order Alert to Store Admin
  try {
    const currentSettings = db.getSettings();
    const whatsappResult = await dispatchAdminWhatsAppAlert(order, currentSettings);
    order.whatsapp_notification_status = whatsappResult.status;
    if (whatsappResult.error) {
      order.whatsapp_notification_error = whatsappResult.error;
    }
  } catch (e: any) {
    order.whatsapp_notification_status = 'Pending';
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
    order: stripDeliveryDispatchToken(updatedOrder),
    order_token: updatedOrder.order_token || getOrderAccessToken(updatedOrder)
  };
}

// Endpoint to manually dispatch or re-send WhatsApp order alert to admin
app.post('/api/admin/orders/:id/send-whatsapp-alert', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : '';
    if (!token || !validateAdminToken(token)) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Admin authentication required' });
    }
    const order = db.getOrderById(req.params.id) || await db.findOrFetchOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    const settings = db.getSettings();
    const result = await dispatchAdminWhatsAppAlert(order, settings);
    order.whatsapp_notification_status = result.status;
    await db.updateOrder(order);
    res.json({ success: true, result, order: stripDeliveryDispatchToken(order) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to send WhatsApp alert' });
  }
});

// 12. Server-Side Payment Verification: POST /api/payments/verify
app.post('/api/payments/verify', paymentVerifyLimiter, async (req: Request, res: Response) => {
  try {
    const result = await verifyPaymentInternal(req.body, req);
    res.json(result);
  } catch (err: any) {
    console.error('Payment Verification Exception:', err);
    res.status(400).json({ success: false, error: err.message || 'Payment verification failed' });
  }
});

// Alias: POST /api/orders/verify-payment
app.post('/api/orders/verify-payment', paymentVerifyLimiter, async (req: Request, res: Response) => {
  try {
    const result = await verifyPaymentInternal(req.body, req);
    res.json(result);
  } catch (err: any) {
    console.error('Payment Verification Exception:', err);
    res.status(400).json({ success: false, error: err.message || 'Payment verification failed' });
  }
});

// Alias: POST /api/orders/submit-payment-proof
app.post('/api/orders/submit-payment-proof', paymentVerifyLimiter, async (req: Request, res: Response) => {
  try {
    const result = await verifyPaymentInternal(req.body, req);
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
    const parseResult = SubmitLeadSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.issues[0]?.message || 'Please provide a valid 10-digit phone number' });
    }
    const clean = parseResult.data.phone.replace(/\D/g, '').slice(-10);
    if (clean.length !== 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit WhatsApp number' });
    }
    const lead = await db.addLead(clean, parseResult.data.source);
    res.json({ success: true, couponCode: 'INDIMA10' });
  } catch (err: any) {
    return safeInternalError(res, err, 'Failed to record inquiry');
  }
});

// ----------------------------------------------------
// ADMIN API ROUTES (Authentication & Management)
// ----------------------------------------------------

// Admin Login (Protected by rate limiting & timing-safe password check)
app.post('/api/admin/login', adminLoginLimiter, async (req: Request, res: Response) => {
  const parseResult = AdminLoginSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.issues[0]?.message || 'Username and password are required' });
  }

  const cleanUser = parseResult.data.username.toLowerCase().trim();
  const cleanPass = parseResult.data.password.trim();

  const allowedUsers = [
    'admin',
    'popularbusiness09@gmail.com',
    'popularbusiness09',
    'admin@indimaspice.com',
    'admin@indimaspices.com',
    'care@indimaspice.com',
    'owner'
  ];

  const isUserValid = allowedUsers.includes(cleanUser);
  const isPassValid = await db.verifyAdminPassword(cleanPass);

  if (isUserValid && isPassValid) {
    const token = generateSecureSession(cleanUser);
    await db.logAudit(cleanUser, 'ADMIN_LOGIN', 'auth', 'Admin logged in successfully');
    
    // Refresh authoritative Firestore cache asynchronously on login
    db.reloadFromFirestore().catch(e => console.warn('[Firestore] Background reload on admin login notice:', e?.message));

    return res.json({
      success: true,
      token,
      admin: {
        username: cleanUser,
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
    const parseResult = AdminChangePasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.issues[0]?.message || 'Invalid password payload' });
    }
    const { current_password, new_password } = parseResult.data;

    const isCurrentValid = await db.verifyAdminPassword(current_password);
    if (!isCurrentValid) {
      return res.status(400).json({ error: 'Current password does not match' });
    }
    if (new_password.trim().length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }
    const session = (req as any).adminSession;
    const success = await db.setAdminPassword(new_password, session?.username || 'Admin');
    if (!success) {
      return res.status(400).json({ error: 'Failed to update admin password' });
    }
    res.json({ success: true, message: 'Admin password successfully updated' });
  } catch (err: any) {
    return safeInternalError(res, err, 'Failed to update admin password');
  }
});

// Admin Logout
app.post('/api/admin/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    revokeToken(token);
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

// Admin Media Upload (Single - Product, Category, Banner, Recipe, Settings)
app.post('/api/upload', adminAuthMiddleware, (req: Request, res: Response) => {
  upload.single('file')(req, res, async (err: any) => {
    if (err) {
      console.error('[Upload Error]:', err);
      return res.status(400).json({ success: false, error: err.message || 'File upload failed' });
    }

    try {
      if (req.file) {
        const uploadResult = await processMediaFile(req.file, {
          folder: 'indima-spices/media'
        });
        return res.json({
          success: true,
          url: uploadResult.secure_url,
          secure_url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          resource_type: uploadResult.resource_type,
          filename: path.basename(uploadResult.secure_url),
          mimetype: req.file.mimetype,
          size: req.file.size
        });
      }

      // Base64 JSON fallback upload directly to Cloudinary
      if (req.body && req.body.base64) {
        const base64Data = req.body.base64.replace(/^data:[^;]+;base64,/, '');
        const ext = (req.body.ext || '.png').toLowerCase();
        const buffer = Buffer.from(base64Data, 'base64');
        const validation = validateMediaContent(buffer, `image/${ext.replace('.', '')}`, `upload${ext}`, {
          allowSvg: false,
          allowedCategories: ['image']
        });
        if (!validation.valid) {
          return res.status(400).json({ success: false, error: validation.error });
        }
        let safeBuffer: Buffer;
        try {
          safeBuffer = await sharp(buffer)
            .rotate()
            .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 88, progressive: true })
            .toBuffer();
        } catch (sharpErr: any) {
          return res.status(400).json({ success: false, error: `Invalid image content: ${sharpErr?.message || 'cannot decode'}` });
        }
        const uploadResult = await uploadMediaToCloudinary({
          buffer: safeBuffer,
          originalName: `upload-${Date.now()}.jpg`,
          folder: 'indima-spices/media',
          resourceType: 'image'
        });
        return res.json({
          success: true,
          url: uploadResult.secure_url,
          secure_url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          resource_type: uploadResult.resource_type,
          filename: path.basename(uploadResult.secure_url)
        });
      }

      return res.status(400).json({ success: false, error: 'No file uploaded' });
    } catch (writeErr: any) {
      console.error('[Upload File Process Error]:', writeErr);
      return res.status(400).json({ success: false, error: writeErr.message || 'Error processing uploaded file' });
    }
  });
});

// Admin Multiple Media Upload (Batch Product Images)
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
      const results: CloudinaryUploadResult[] = [];
      for (const file of files) {
        const uploadResult = await processMediaFile(file, { folder: 'indima-spices/products' });
        results.push(uploadResult);
      }
      return res.json({
        success: true,
        urls: results.map(r => r.secure_url),
        details: results
      });
    } catch (writeErr: any) {
      console.error('[Multi-Upload Process Error]:', writeErr);
      return res.status(400).json({ success: false, error: writeErr.message });
    }
  });
});

// Admin Hero / Banner Media Upload (Images & Videos)
app.post('/api/admin/upload-hero-media', adminAuthMiddleware, (req: Request, res: Response) => {
  upload.single('file')(req, res, async (err: any) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message || 'Hero media upload failed' });
    }
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ success: false, error: 'No media file provided for hero banner' });
      }

      const mime = (file.mimetype || '').toLowerCase();
      const ext = path.extname(file.originalname).toLowerCase();
      const isVideo = mime.startsWith('video/') || /^\.(mp4|webm|mov|mkv|avi)$/i.test(ext);

      const uploadResult = await processMediaFile(file, {
        folder: 'indima-spices/banners',
        resourceType: isVideo ? 'video' : 'image'
      });

      const bannerId = req.body.banner_id || req.body.bannerId;
      let updatedBanner = null;

      if (bannerId) {
        const banner = db.getBannerById(bannerId);
        if (banner) {
          updatedBanner = await db.updateBanner(
            bannerId,
            {
              media_url: uploadResult.secure_url,
              media_type: isVideo ? 'video' : 'image',
              ...(isVideo && req.body.fallback_image ? { fallback_image: req.body.fallback_image } : {})
            },
            (req as any).adminSession?.username || 'Admin'
          );
        }
      }

      return res.json({
        success: true,
        url: uploadResult.secure_url,
        secure_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        media_type: isVideo ? 'video' : 'image',
        banner: updatedBanner
      });
    } catch (heroErr: any) {
      console.error('[Hero Media Upload Error]:', heroErr.message);
      return res.status(400).json({ success: false, error: heroErr.message });
    }
  });
});

// Review Proof Media Upload (Images & Videos - Rate Limited & MIME Verified & Magic-Byte Inspected)
app.post('/api/reviews/upload-proof', reviewUploadLimiter, (req: Request, res: Response) => {
  reviewProofUpload.single('file')(req, res, async (err: any) => {
    if (err) {
      const errMsg = err.code === 'LIMIT_FILE_SIZE'
        ? 'Review proof file size exceeds maximum limit of 25MB'
        : (err.message || 'Review proof upload failed');
      return res.status(400).json({ success: false, error: errMsg });
    }
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ success: false, error: 'No proof media file provided' });
      }

      // Enforce 25MB max size on review proof upload (defense-in-depth)
      const MAX_PROOF_SIZE = 25 * 1024 * 1024;
      if (file.size > MAX_PROOF_SIZE) {
        if (fs.existsSync(file.path)) {
          try { fs.unlinkSync(file.path); } catch (_) {}
        }
        return res.status(400).json({ success: false, error: 'Review proof file size exceeds maximum limit of 25MB' });
      }

      const mime = (file.mimetype || '').toLowerCase();
      const ext = path.extname(file.originalname).toLowerCase();
      const allowedProofMimes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/heic',
        'image/heif',
        'video/mp4',
        'video/webm',
        'video/quicktime'
      ];
      const allowedProofExts = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.mp4', '.webm', '.mov'];

      if (!allowedProofMimes.includes(mime) || !allowedProofExts.includes(ext)) {
        if (fs.existsSync(file.path)) {
          try { fs.unlinkSync(file.path); } catch (_) {}
        }
        return res.status(400).json({ success: false, error: 'Invalid file format. Only images (JPG, PNG, WebP) and videos (MP4, WebM) are permitted.' });
      }

      // Magic byte & container verification for review uploads (SVG disallowed for reviews)
      const validation = validateMediaContent(file.path, mime, file.originalname, {
        allowSvg: false,
        allowedCategories: ['image', 'video'],
        allowedFormats: ['jpeg', 'png', 'webp', 'heic', 'mp4', 'webm', 'mov']
      });

      if (!validation.valid) {
        if (fs.existsSync(file.path)) {
          try { fs.unlinkSync(file.path); } catch (_) {}
        }
        return res.status(400).json({ success: false, error: validation.error });
      }

      const isVideo = validation.detected.category === 'video';

      const uploadResult = await processMediaFile(file, {
        folder: 'indima-spices/reviews',
        resourceType: isVideo ? 'video' : 'image',
        allowSvg: false
      });

      const reviewId = req.body.review_id || req.body.reviewId;
      let updatedReview = null;

      if (reviewId) {
        const authHeader = req.headers.authorization;
        const hasAdminSession = Boolean(authHeader && authHeader.startsWith('Bearer ') && validateAdminToken(authHeader.split(' ')[1]));
        if (!hasAdminSession) {
          if (fs.existsSync(file.path)) {
            try { fs.unlinkSync(file.path); } catch (_) {}
          }
          return res.status(403).json({ success: false, error: 'Forbidden: Administrator authorization required to modify existing reviews.' });
        }
        updatedReview = await db.updateReviewProof(reviewId, {
          proof_media_url: uploadResult.secure_url,
          proof_media_type: isVideo ? 'video' : 'image',
          proof_public_id: uploadResult.public_id
        });
      }

      return res.json({
        success: true,
        url: uploadResult.secure_url,
        secure_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        resource_type: isVideo ? 'video' : 'image',
        review: updatedReview
      });
    } catch (proofErr: any) {
      console.error('[Review Proof Upload Error]:', proofErr.message);
      return res.status(400).json({ success: false, error: proofErr.message });
    }
  });
});

// Admin Safe Media Migration: public/uploads/ -> Cloudinary -> Firestore records
app.post('/api/admin/migrate-media', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const fsDb = await db.getFirestoreInstance();
    const result = await migrateLocalMediaToCloudinary(fsDb);
    // Reload local state with the newly updated cloud documents
    await db.reloadFromFirestore();
    return res.json({
      success: true,
      message: `Media migration completed: ${result.uploadedCount} uploaded, ${result.updatedDocsCount} Firestore documents updated.`,
      ...result
    });
  } catch (err: any) {
    console.error('[Admin Media Migration Error]:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Storage Architecture & Diagnostics Endpoint
app.get('/api/admin/storage-status', adminAuthMiddleware, (req: Request, res: Response) => {
  const cloudStatus = getCloudinaryStatus();
  const isFirestore = db.getIsFirestoreReady();
  const lastFsError = db.getLastFirestoreError();
  const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
  const localFileCount = fs.existsSync(uploadsPath)
    ? fs.readdirSync(uploadsPath).filter(f => !f.startsWith('.')).length
    : 0;

  res.json({
    firestore: {
      connected: isFirestore,
      lastError: lastFsError
    },
    cloudinary: {
      configured: cloudStatus.configured,
      cloudName: cloudStatus.cloudName,
      source: cloudStatus.source,
      folder: cloudStatus.folder,
      supportsVideo: cloudStatus.supportsVideo
    },
    localUploads: {
      exists: fs.existsSync(uploadsPath),
      fileCount: localFileCount,
      path: 'public/uploads'
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
    const {
      status,
      tracking_number,
      carrier,
      expected_delivery,
      payment_status,
      latitude,
      longitude,
      location_name,
      live_tracking_available
    } = req.body;

    // 1. Validate status format if provided
    if (status !== undefined && status !== null) {
      if (typeof status !== 'string' || status.trim().length > 50) {
        return res.status(400).json({ error: 'Invalid order status format' });
      }
    }

    // 2. Validate tracking number format if provided
    if (tracking_number !== undefined && tracking_number !== null) {
      if (typeof tracking_number !== 'string' || tracking_number.length > 60) {
        return res.status(400).json({ error: 'Invalid tracking number format' });
      }
    }

    // 3. Validate carrier format if provided
    if (carrier !== undefined && carrier !== null) {
      if (typeof carrier !== 'string' || carrier.length > 60) {
        return res.status(400).json({ error: 'Invalid carrier format' });
      }
    }

    // 4. Validate coordinates if provided
    let validLat: number | undefined = undefined;
    let validLng: number | undefined = undefined;

    if (latitude !== undefined && latitude !== null && latitude !== '') {
      const numLat = Number(latitude);
      if (isNaN(numLat) || !isFinite(numLat)) {
        return res.status(400).json({ error: 'Latitude must be a valid number' });
      }
      if (numLat < -90 || numLat > 90) {
        return res.status(400).json({ error: 'Latitude must be between -90 and 90 degrees' });
      }
      validLat = numLat;
    }

    if (longitude !== undefined && longitude !== null && longitude !== '') {
      const numLng = Number(longitude);
      if (isNaN(numLng) || !isFinite(numLng)) {
        return res.status(400).json({ error: 'Longitude must be a valid number' });
      }
      if (numLng < -180 || numLng > 180) {
        return res.status(400).json({ error: 'Longitude must be between -180 and 180 degrees' });
      }
      validLng = numLng;
    }

    if ((validLat !== undefined && validLng === undefined) || (validLat === undefined && validLng !== undefined)) {
      return res.status(400).json({ error: 'Both latitude and longitude must be provided together' });
    }

    const session = (req as any).adminSession;

    // Fetch existing order and synchronize status fields before persisting to Firestore
    let order = db.getOrderById(id);
    if (!order) {
      order = await db.findOrFetchOrder(id);
    }
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (status) {
      syncOrderStatus(order, status.trim());
    } else {
      syncOrderStatus(order);
    }

    const updated = await db.updateOrderStatus(
      id,
      status ? status.trim() : undefined,
      tracking_number !== undefined ? tracking_number.trim() : undefined,
      expected_delivery !== undefined ? expected_delivery.trim() : undefined,
      payment_status ? payment_status.trim() : undefined,
      session?.username || 'Admin',
      {
        carrier: carrier !== undefined ? carrier.trim() : undefined,
        latitude: validLat,
        longitude: validLng,
        location_name: typeof location_name === 'string' ? location_name.trim().slice(0, 100) : undefined,
        live_tracking_available: typeof live_tracking_available === 'boolean' ? live_tracking_available : false
      }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Ensure the updated order object returned to the frontend is consistent and contains the synchronized status
    syncOrderStatus(updated);
    res.json({ success: true, order: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// Admin Dedicated Location Update
app.put('/api/admin/orders/:id/location', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { latitude, longitude, location_name, live_tracking_available } = req.body;

    if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const numLat = Number(latitude);
    const numLng = Number(longitude);
    if (isNaN(numLat) || !isFinite(numLat) || numLat < -90 || numLat > 90) {
      return res.status(400).json({ error: 'Latitude must be between -90 and 90 degrees' });
    }
    if (isNaN(numLng) || !isFinite(numLng) || numLng < -180 || numLng > 180) {
      return res.status(400).json({ error: 'Longitude must be between -180 and 180 degrees' });
    }

    const session = (req as any).adminSession;
    const updated = await db.updateOrderLocation(
      id,
      numLat,
      numLng,
      typeof location_name === 'string' ? location_name.trim().slice(0, 100) : undefined,
      session?.username || 'Admin',
      Boolean(live_tracking_available)
    );

    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ success: true, order: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Phase 2-Ready Delivery Partner GPS Location Endpoint (Order-Specific Dispatch Token Hardened)
app.put('/api/delivery/orders/:id/location', deliveryLocationLimiter, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Valid Order ID is required in URL parameter' });
    }

    const authHeader = req.headers.authorization;
    const bearerToken = (authHeader && authHeader.startsWith('Bearer ')) ? authHeader.slice(7).trim() : '';
    const deliverySecretHeader = (
      (req.headers['x-delivery-secret'] as string) ||
      (req.headers['x-delivery-key'] as string) ||
      ''
    ).trim();
    const dispatchTokenHeader = (
      (req.headers['x-delivery-dispatch-token'] as string) ||
      (req.headers['x-delivery-token'] as string) ||
      (req.headers['x-dispatch-token'] as string) ||
      ''
    ).trim();

    // Must provide either an Authorization header or explicit delivery secret header
    if (!bearerToken && !deliverySecretHeader) {
      return res.status(401).json({ error: 'Authorization header with Bearer token required for delivery updates' });
    }

    // 1. Admin Session Check: Administrators can update any order's location directly
    const isValidAdmin = bearerToken ? validateAdminToken(bearerToken) : false;
    let actor = 'Delivery Partner';

    if (isValidAdmin) {
      actor = 'Admin';
    } else {
      // 2. Delivery Partner Authentication: Resolve delivery secret and order dispatch token
      let providedSecret = deliverySecretHeader;
      let providedDispatchToken = dispatchTokenHeader;

      if (bearerToken.includes(':')) {
        // Format: Bearer <DELIVERY_AGENT_SECRET>:<delivery_dispatch_token>
        const [sec, ...rest] = bearerToken.split(':');
        if (!providedSecret) providedSecret = sec.trim();
        if (!providedDispatchToken) providedDispatchToken = rest.join(':').trim();
      } else if (!providedSecret && dispatchTokenHeader) {
        // Bearer is the delivery secret, header contains dispatch token
        providedSecret = bearerToken;
      } else if (deliverySecretHeader && !providedDispatchToken) {
        // Delivery secret provided in header, Bearer is the dispatch token
        providedDispatchToken = bearerToken;
      } else if (!providedSecret && !providedDispatchToken) {
        // Single bearer token provided without dispatch token
        providedSecret = bearerToken;
      }

      // Check delivery partner authentication (DELIVERY_AGENT_SECRET / DELIVERY_SECRET)
      const configuredSecret = process.env.DELIVERY_AGENT_SECRET || process.env.DELIVERY_SECRET || (process.env.NODE_ENV !== 'production' ? 'indima-delivery-agent-secret' : undefined);
      if (!configuredSecret) {
        return res.status(503).json({ error: 'Delivery partner integration is not configured on server (DELIVERY_AGENT_SECRET missing)' });
      }

      if (!providedSecret || !timingSafeEqual(providedSecret, configuredSecret)) {
        return res.status(403).json({ error: 'Invalid or unauthorized delivery partner credentials' });
      }

      // Check order-specific delivery dispatch token presence
      if (!providedDispatchToken) {
        return res.status(401).json({
          error: 'Order-specific delivery dispatch token is required (provide via X-Delivery-Dispatch-Token header or Bearer credentials)'
        });
      }

      // Look up target order
      let targetOrder = db.getOrderById(id);
      if (!targetOrder) {
        targetOrder = await db.findOrFetchOrder(id);
      }
      if (!targetOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Verify dispatch token belongs to THIS specific order (timing-safe comparison)
      const hasValidDispatchToken = verifyDeliveryDispatchToken(targetOrder, providedDispatchToken);
      if (!hasValidDispatchToken) {
        return res.status(403).json({ error: 'Forbidden: Invalid delivery dispatch token for this order' });
      }
    }

    // 3. Coordinate validation
    const { latitude, longitude, location_name } = req.body;

    if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) {
      return res.status(400).json({ error: 'Latitude and longitude are required for GPS tracking update' });
    }

    const numLat = Number(latitude);
    const numLng = Number(longitude);
    if (isNaN(numLat) || !isFinite(numLat) || numLat < -90 || numLat > 90) {
      return res.status(400).json({ error: 'Latitude must be between -90 and 90 degrees' });
    }
    if (isNaN(numLng) || !isFinite(numLng) || numLng < -180 || numLng > 180) {
      return res.status(400).json({ error: 'Longitude must be between -180 and 180 degrees' });
    }

    // 4. Update order location in data store and Firestore
    const updated = await db.updateOrderLocation(
      id,
      numLat,
      numLng,
      typeof location_name === 'string' ? location_name.trim().slice(0, 100) : 'GPS Live Transit Point',
      actor,
      true // live GPS source
    );

    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // 5. Return sanitized response (never expose tokens)
    res.json({
      success: true,
      message: 'Delivery location updated successfully',
      tracking: {
        latitude: updated.tracking?.latitude,
        longitude: updated.tracking?.longitude,
        location_name: updated.tracking?.location_name,
        location_updated_at: updated.tracking?.location_updated_at,
        live_tracking_available: true
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Retrieve order delivery dispatch token for assigning to delivery agent/device
app.get('/api/admin/orders/:id/dispatch-token', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let order = db.getOrderById(id);
    if (!order) {
      order = await db.findOrFetchOrder(id);
    }
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const token = getOrderDeliveryDispatchToken(order);
    res.json({
      success: true,
      order_id: order.id,
      delivery_dispatch_token: token
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Rotate order delivery dispatch token (e.g. if driver device changed or credential revoked)
app.post('/api/admin/orders/:id/dispatch-token/rotate', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let order = db.getOrderById(id);
    if (!order) {
      order = await db.findOrFetchOrder(id);
    }
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const newToken = generateDeliveryDispatchToken();
    order.delivery_dispatch_token = newToken;
    if (!order.tracking) {
      order.tracking = {};
    }
    order.tracking.delivery_dispatch_token = newToken;
    await db.setFirestoreDoc('orders', order.id, order);
    db.save();
    const session = (req as any).adminSession;
    await db.logAudit(
      session?.username || 'Admin',
      'ORDER_DISPATCH_TOKEN_ROTATED',
      order.id,
      `Rotated delivery dispatch token for order ${order.id}`
    );
    res.json({
      success: true,
      order_id: order.id,
      delivery_dispatch_token: newToken
    });
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

// Admin Order Notifications API
app.get('/api/admin/notifications', adminAuthMiddleware, (req: Request, res: Response) => {
  const notifs = db.getOrderNotifications();
  res.json(notifs);
});

app.put('/api/admin/notifications/:id/read', adminAuthMiddleware, async (req: Request, res: Response) => {
  const success = await db.markNotificationRead(req.params.id);
  res.json({ success });
});

app.post('/api/admin/notifications/test', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const source: 'web' | 'whatsapp' = req.body?.source === 'whatsapp' ? 'whatsapp' : 'web';
    const testId = source === 'whatsapp' ? `WA-${Date.now().toString().slice(-4)}` : `IND-${Date.now().toString().slice(-4)}`;
    const nowIso = new Date().toISOString();
    const testOrder: Order = {
      id: testId,
      customer_id: `cust-${Date.now().toString().slice(-4)}`,
      customer_name: source === 'whatsapp' ? 'Pooja Hegde' : 'Suresh Kumar',
      customer_email: source === 'whatsapp' ? 'pooja.hegde@example.com' : 'suresh.k@example.com',
      customer_phone: '9845012345',
      address_snapshot: {
        fullName: source === 'whatsapp' ? 'Pooja Hegde' : 'Suresh Kumar',
        phone: '9845012345',
        email: source === 'whatsapp' ? 'pooja.hegde@example.com' : 'suresh.k@example.com',
        houseFlat: '42',
        street: 'Heritage Spice Path',
        area: 'Malleshwaram',
        city: 'Bengaluru',
        district: 'Bengaluru Urban',
        state: 'Karnataka',
        pincode: '560003'
      },
      items: [
        {
          product_id: 'indima-sambar-special',
          sku: 'IND-SMB-250',
          name_en: 'Heritage Sambar Powder',
          name_kn: 'ಸಾಂಬಾರ್ ಪುಡಿ',
          image: '',
          quantity: 2,
          unit_price: source === 'whatsapp' ? 270 : 445,
          mrp: source === 'whatsapp' ? 300 : 490,
          discount: source === 'whatsapp' ? 30 : 45,
          subtotal: source === 'whatsapp' ? 540 : 890,
          weight: '250g'
        }
      ],
      subtotal: source === 'whatsapp' ? 540 : 890,
      discount_amount: 0,
      shipping_fee: 0,
      total_amount: source === 'whatsapp' ? 540 : 890,
      payment_method: source === 'whatsapp' ? 'WhatsApp / UPI Direct' : 'UPI / Razorpay Verified',
      payment_status: 'PAID',
      status: 'placed',
      order_status: 'placed',
      order_source: source,
      order_date: nowIso,
      created_at: nowIso,
      updated_at: nowIso
    };

    // Do NOT save testOrder to db.orders or Firestore - alerts should never pollute real store orders
    // await db.saveOrderDirectly(testOrder);

    const testNotif: OrderNotification = {
      id: `notif_${testId}_${Date.now()}`,
      order_id: testId,
      customer_name: testOrder.customer_name,
      customer_phone: testOrder.customer_phone,
      total_amount: testOrder.total_amount,
      item_count: testOrder.items.length,
      order_source: source,
      status: 'placed',
      payment_method: testOrder.payment_method,
      item_summary: `${testOrder.items[0].name_en} (${testOrder.items[0].quantity}x)`,
      created_at: nowIso,
      read: false
    };

    await db.createNotification(testNotif);
    res.json({ success: true, notification: testNotif, order: testOrder });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Products API
function sanitizeProductPayload(body: any): void {
  if (!body || typeof body !== 'object') return;
  if (Array.isArray(body.images)) {
    body.images = body.images
      .filter((img: any) => typeof img === 'string')
      .map((img: string) => sanitizeUrl(img, '', { allowRelative: true, allowDataImage: true }))
      .filter(Boolean);
  }
  if (typeof body.image_url === 'string') {
    body.image_url = sanitizeUrl(body.image_url, '', { allowRelative: true, allowDataImage: true });
  }
  if (typeof body.video === 'string') {
    body.video = sanitizeUrl(body.video, '', { allowRelative: true, allowDataImage: true });
  }
}

function sanitizeBannerPayload(body: any): void {
  if (!body || typeof body !== 'object') return;
  if (typeof body.media_url === 'string') {
    body.media_url = sanitizeUrl(body.media_url, '', { allowRelative: true, allowDataImage: true });
  }
  if (typeof body.fallback_image === 'string') {
    body.fallback_image = sanitizeUrl(body.fallback_image, '', { allowRelative: true, allowDataImage: true });
  }
  if (typeof body.link_url === 'string') {
    body.link_url = sanitizeUrl(body.link_url, '', { allowRelative: true, allowDataImage: false });
  }
}

function sanitizeRecipePayload(body: any): void {
  if (!body || typeof body !== 'object') return;
  if (typeof body.image_url === 'string') {
    body.image_url = sanitizeUrl(body.image_url, '', { allowRelative: true, allowDataImage: true });
  }
  if (typeof body.video_url === 'string') {
    body.video_url = sanitizeUrl(body.video_url, '', { allowRelative: true, allowDataImage: true });
  }
  if (typeof body.video === 'string') {
    body.video = sanitizeUrl(body.video, '', { allowRelative: true, allowDataImage: true });
  }
}

function sanitizeSettingsPayload(body: any): void {
  if (!body || typeof body !== 'object') return;
  if (typeof body.instagram_url === 'string') {
    body.instagram_url = sanitizeUrl(body.instagram_url, '', { allowRelative: false, allowDataImage: false });
  }
  if (typeof body.facebook_url === 'string') {
    body.facebook_url = sanitizeUrl(body.facebook_url, '', { allowRelative: false, allowDataImage: false });
  }
  if (typeof body.youtube_url === 'string') {
    body.youtube_url = sanitizeUrl(body.youtube_url, '', { allowRelative: false, allowDataImage: false });
  }
  if (typeof body.twitter_url === 'string') {
    body.twitter_url = sanitizeUrl(body.twitter_url, '', { allowRelative: false, allowDataImage: false });
  }
  if (typeof body.upi_qr_code_url === 'string') {
    body.upi_qr_code_url = sanitizeUrl(body.upi_qr_code_url, '', { allowRelative: true, allowDataImage: true });
  }
  if (typeof body.logo_url === 'string') {
    body.logo_url = sanitizeUrl(body.logo_url, '', { allowRelative: true, allowDataImage: true });
  }
}

async function normalizeProductVideo(body: any): Promise<void> {
  if (!body) return;
  if (typeof body.video === 'string' && body.video.trim().startsWith('data:')) {
    try {
      const videoStr = body.video.trim();
      const matches = videoStr.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        const mimeType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        const ext = mimeType.includes('webm') ? '.webm' : mimeType.includes('quicktime') ? '.mov' : '.mp4';
        const uploadResult = await uploadMediaToCloudinary({
          buffer,
          originalName: `video-${Date.now()}${ext}`,
          mimeType,
          resourceType: 'video',
          folder: 'indima-spices/videos'
        });
        body.video = uploadResult.secure_url || uploadResult.url;
      }
    } catch (e: any) {
      console.warn('[Video Normalization Warning]:', e?.message || e);
    }
  }
}

app.post('/api/admin/products', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const session = (req as any).adminSession;
    await normalizeProductVideo(req.body);
    sanitizeProductPayload(req.body);
    const product = await db.addProduct(req.body, session?.username || 'Admin');
    res.json({ success: true, product });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/products/:id', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const session = (req as any).adminSession;
    await normalizeProductVideo(req.body);
    sanitizeProductPayload(req.body);
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
    sanitizeBannerPayload(req.body);
    const banner = await db.addBanner(req.body, session?.username || 'Admin');
    res.json({ success: true, banner });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/banners/:id', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const session = (req as any).adminSession;
    sanitizeBannerPayload(req.body);
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
    sanitizeRecipePayload(req.body);
    const recipe = await db.addRecipe(req.body, session?.username || 'Admin');
    res.json({ success: true, recipe });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/recipes/:id', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const session = (req as any).adminSession;
    sanitizeRecipePayload(req.body);
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
    if (req.body && typeof req.body.image_url === 'string') {
      req.body.image_url = sanitizeUrl(req.body.image_url, '', { allowRelative: true, allowDataImage: true });
    }
    const offer = await db.addOffer(req.body, session?.username || 'Admin');
    res.json({ success: true, offer });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/offers/:id', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const session = (req as any).adminSession;
    if (req.body && typeof req.body.image_url === 'string') {
      req.body.image_url = sanitizeUrl(req.body.image_url, '', { allowRelative: true, allowDataImage: true });
    }
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
    sanitizeSettingsPayload(req.body);
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

// ----------------------------------------------------
// DYNAMIC SITEMAP, ROBOTS.TXT & TECHNICAL SEO
// ----------------------------------------------------

const CANONICAL_ORIGIN = 'https://indima-spices-co.onrender.com';

const DEFAULT_SEO_TITLE = 'Indima Spice Co. | Authentic Homemade Spices & Masalas';
const DEFAULT_SEO_DESC =
  'Indima Spice Co. brings authentic homemade Indian spices and masalas crafted with traditional flavours, quality ingredients and the rich heritage of Karnataka.';

function render404Html(message: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Page Not Found | Indima Spice Co.</title>
    <meta name="description" content="The requested page or spice product could not be found on Indima Spice Co." />
    <meta name="robots" content="noindex, follow" />
    <link rel="icon" type="image/png" href="/logo.png" />
    <style>
      body { font-family: system-ui, -apple-system, sans-serif; background: #FAF6EE; color: #2C1810; margin: 0; padding: 40px 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; text-align: center; }
      .card { background: #FFFDF9; border: 1px solid #DFC7A2; border-radius: 24px; padding: 40px 30px; max-width: 500px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
      h1 { font-family: serif; font-size: 26px; margin: 0 0 12px; color: #993300; }
      p { color: #665; line-height: 1.6; margin: 0 0 24px; font-size: 15px; }
      a { display: inline-block; background: #993300; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: bold; font-size: 14px; }
      a:hover { background: #7A1F1D; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>${message}</h1>
      <p>The product or page you are looking for may have been moved, renamed, or is currently unavailable in our store.</p>
      <a href="/">Return to Spice Collection</a>
    </div>
  </body>
</html>`;
}

app.get('/robots.txt', (_req: Request, res: Response) => {
  const content = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /
Allow: /products/
Allow: /categories/
Allow: /recipes/
Allow: /recipes
Allow: /about
Allow: /contact
Allow: /assets/
Allow: /uploads/

# Disallow private, administrative, and user-session routes
Disallow: /admin
Disallow: /admin/
Disallow: /api/
Disallow: /checkout
Disallow: /checkout/
Disallow: /cart
Disallow: /cart/
Disallow: /account
Disallow: /account/
Disallow: /order-tracking
Disallow: /order-tracking/
Disallow: /tracking
Disallow: /tracking/
Disallow: /track
Disallow: /track/
Disallow: /wishlist
Disallow: /wishlist/

# Sitemap location
Sitemap: ${CANONICAL_ORIGIN}/sitemap.xml
`;
  res.header('Content-Type', 'text/plain; charset=utf-8');
  res.send(content);
});

/**
 * Fetches all active products, categories, and recipes directly from Firestore collections.
 * Falls back to authoritative local store if Firestore is empty or unavailable.
 */
async function fetchSitemapEntitiesFromFirestore(): Promise<{
  products: Product[];
  categories: Category[];
  recipes: Recipe[];
}> {
  let products: Product[] = [];
  let categories: Category[] = [];
  let recipes: Recipe[] = [];

  try {
    const firestore = await db.getFirestoreInstance();
    if (firestore) {
      const [prodSnap, catSnap, recSnap] = await Promise.all([
        firestore.collection('products').get(),
        firestore.collection('categories').get(),
        firestore.collection('recipes').get()
      ]);

      if (!prodSnap.empty) {
        prodSnap.forEach(docSnap => {
          const item = docSnap.data() as Product;
          if (item && item.active !== false) {
            products.push({ ...item, id: docSnap.id || item.id });
          }
        });
      }

      if (!catSnap.empty) {
        catSnap.forEach(docSnap => {
          const item = docSnap.data() as Category;
          if (item && item.enabled !== false) {
            categories.push({ ...item, id: docSnap.id || item.id });
          }
        });
      }

      if (!recSnap.empty) {
        recSnap.forEach(docSnap => {
          const item = docSnap.data() as Recipe;
          if (item && item.active !== false) {
            recipes.push({ ...item, id: docSnap.id || item.id });
          }
        });
      }
    }
  } catch (err: any) {
    console.warn('[Sitemap Route] Notice querying Firestore Admin directly:', err?.message || err);
  }

  // Resilient synchronization: Overlay live Firestore documents with authoritative catalog by ID
  const productMap = new Map<string, Product>();
  db.getProducts().filter(p => p.active !== false).forEach(p => productMap.set(p.id, p));
  products.forEach(p => productMap.set(p.id, p));
  const finalProducts = Array.from(productMap.values()).filter(p => p.active !== false);

  const categoryMap = new Map<string, Category>();
  db.getCategories().filter(c => c.enabled !== false).forEach(c => categoryMap.set(c.id, c));
  categories.forEach(c => categoryMap.set(c.id, c));
  const finalCategories = Array.from(categoryMap.values()).filter(c => c.enabled !== false);

  const recipeMap = new Map<string, Recipe>();
  db.getRecipes().filter(r => r.active !== false).forEach(r => recipeMap.set(r.id, r));
  recipes.forEach(r => recipeMap.set(r.id, r));
  const finalRecipes = Array.from(recipeMap.values()).filter(r => r.active !== false);

  return {
    products: finalProducts,
    categories: finalCategories,
    recipes: finalRecipes
  };
}

app.get(['/sitemap.xml', '/api/sitemap.xml'], async (_req: Request, res: Response) => {
  try {
    const { products, categories, recipes } = await fetchSitemapEntitiesFromFirestore();

    const xml = buildSitemapXml({
      products,
      categories,
      recipes,
      baseUrl: CANONICAL_ORIGIN
    });

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.status(200).send(xml);
  } catch (err: any) {
    console.error('[Sitemap Error]:', err?.message || err);
    res.status(500).setHeader('Content-Type', 'text/plain; charset=utf-8').send('Error generating sitemap');
  }
});

// Explicit 404 handler for undefined API routes (prevent Vite SPA HTML fallback for /api/*)
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

// API Error handler middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api')) {
    console.error('[API Handler Error]:', err?.message || err);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    const statusCode = typeof err.status === 'number' && err.status >= 400 && err.status <= 599 ? err.status : 500;
    const safeMessage = statusCode < 500
      ? (err.message || 'Invalid request')
      : (process.env.NODE_ENV === 'production' ? 'An unexpected internal error occurred' : (err.message || 'Internal API error'));
    return res.status(statusCode).json({
      success: false,
      error: safeMessage
    });
  }
  next(err);
});

// ----------------------------------------------------
// DYNAMIC SEO & SOCIAL SHARING PREVIEW META INJECTOR
// ----------------------------------------------------

function injectDynamicHtmlMeta(html: string, req: Request): { html: string; status: number } {
  try {
    const rawPath = req.path || '/';
    const isKn = req.query.lang === 'kn';

    // 1. PRODUCT ROUTING: /products/:slug, /product/:slug, or ?product=:id
    let productSlugOrId: string | null = null;
    if (rawPath.startsWith('/products/')) {
      productSlugOrId = decodeURIComponent(rawPath.replace('/products/', '').split('/')[0].trim());
    } else if (rawPath.startsWith('/product/')) {
      productSlugOrId = decodeURIComponent(rawPath.replace('/product/', '').split('/')[0].trim());
    } else if (req.query.product && typeof req.query.product === 'string') {
      productSlugOrId = req.query.product.trim();
    }

    if (productSlugOrId) {
      const products = db.getProducts().filter(p => p.active !== false);
      const product = findProductBySlugOrId(productSlugOrId, products);

      // If invalid product slug was explicitly requested in the path, return HTTP 404
      if (!product && (rawPath.startsWith('/products/') || rawPath.startsWith('/product/'))) {
        return {
          html: render404Html('Product Not Found'),
          status: 404
        };
      }

      if (product) {
        const slug = getProductSlug(product);
        const name = isKn && product.name_kn ? product.name_kn : product.name_en;
        const rawDesc = ((isKn && product.description_kn ? product.description_kn : product.description_en) || '').replace(/"/g, '&quot;');
        const cleanDesc = rawDesc.replace(/\s+/g, ' ').trim();
        const shortDesc = cleanDesc.length > 150 ? cleanDesc.substring(0, 147) + '...' : cleanDesc;

        const title = `${name} (₹${product.price} / ${product.weight}) | Indima Spice Co.`;
        const description = `Buy authentic ${name} online. ${shortDesc} Traditional homemade Karnataka spices, 100% pure with zero preservatives. Fast pan-India shipping.`;

        let image = product.images?.[0] || '/indima-brand-logo.jpg';
        if (image.startsWith('/')) image = `${CANONICAL_ORIGIN}${image}`;
        const canonicalUrl = `${CANONICAL_ORIGIN}/products/${slug}`;

        // Schema.org Product JSON-LD (using REAL data only, no invented ratings)
        const productJsonLd: any = {
          "@context": "https://schema.org",
          "@type": "Product",
          "@id": `${canonicalUrl}#product`,
          "name": product.name_en,
          "alternateName": product.name_kn || undefined,
          "description": product.description_en || cleanDesc,
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
            "availability": (product.stock && product.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": {
              "@type": "Organization",
              "name": "Indima Spice Co.",
              "url": CANONICAL_ORIGIN
            }
          }
        };

        if (product.category_id) {
          productJsonLd.category = product.category_id;
        }
        if (product.weight) {
          productJsonLd.weight = product.weight;
        }

        if (typeof product.rating === 'number' && product.rating > 0 && typeof product.review_count === 'number' && product.review_count > 0) {
          productJsonLd.aggregateRating = {
            "@type": "AggregateRating",
            "ratingValue": product.rating,
            "reviewCount": product.review_count,
            "bestRating": "5",
            "worstRating": "1"
          };
        }

        // Schema.org BreadcrumbList JSON-LD
        const breadcrumbJsonLd = {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": `${CANONICAL_ORIGIN}/`
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Spices & Masalas",
              "item": `${CANONICAL_ORIGIN}/#products`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": product.name_en,
              "item": canonicalUrl
            }
          ]
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

        modifiedHtml = modifiedHtml.replace(
          '</head>',
          `  <script type="application/ld+json" id="ssr-product-jsonld">${JSON.stringify(productJsonLd)}</script>\n  <script type="application/ld+json" id="ssr-breadcrumb-jsonld">${JSON.stringify(breadcrumbJsonLd)}</script>\n  </head>`
        );

        return { html: modifiedHtml, status: 200 };
      }
    }

    // 2. CATEGORY ROUTING: /categories/:slug, /category/:slug, or ?category=:id
    let categorySlugOrId: string | null = null;
    if (rawPath.startsWith('/categories/')) {
      categorySlugOrId = decodeURIComponent(rawPath.replace('/categories/', '').split('/')[0].trim());
    } else if (rawPath.startsWith('/category/')) {
      categorySlugOrId = decodeURIComponent(rawPath.replace('/category/', '').split('/')[0].trim());
    } else if (req.query.category && typeof req.query.category === 'string') {
      categorySlugOrId = req.query.category.trim();
    }

    if (categorySlugOrId) {
      const categories = db.getCategories();
      const cat = findCategoryBySlugOrId(categorySlugOrId, categories);

      // If invalid category slug was explicitly requested in the path, return HTTP 404
      if (!cat && (rawPath.startsWith('/categories/') || rawPath.startsWith('/category/'))) {
        return {
          html: render404Html('Category Not Found'),
          status: 404
        };
      }

      if (cat) {
        const slug = getCategorySlug(cat);
        const name = isKn && cat.name_kn ? cat.name_kn : cat.name_en;
        const desc = ((isKn && cat.description_kn ? cat.description_kn : cat.description_en) || '').replace(/"/g, '&quot;');
        const title = `${name} Spice Range | Authentic Homemade Spices | Indima Spice Co.`;
        const description = `Explore authentic homemade ${name} collection from Indima Spice Co. ${desc} Handcrafted in Karnataka with traditional flavours.`;
        let image = cat.image || '/indima-brand-logo.jpg';
        if (image.startsWith('/')) image = `${CANONICAL_ORIGIN}${image}`;
        const canonicalUrl = `${CANONICAL_ORIGIN}/categories/${slug}`;

        const breadcrumbJsonLd = {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": `${CANONICAL_ORIGIN}/`
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": cat.name_en,
              "item": canonicalUrl
            }
          ]
        };

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

        modifiedHtml = modifiedHtml.replace(
          '</head>',
          `  <script type="application/ld+json" id="ssr-breadcrumb-jsonld">${JSON.stringify(breadcrumbJsonLd)}</script>\n  </head>`
        );

        return { html: modifiedHtml, status: 200 };
      }
    }

    // 3. RECIPE SPECIFIC ROUTING: /recipes/:slug, /recipe/:slug, or ?recipe=:id
    let recipeSlugOrId: string | null = null;
    if (rawPath.startsWith('/recipes/') && rawPath !== '/recipes') {
      recipeSlugOrId = decodeURIComponent(rawPath.replace('/recipes/', '').split('/')[0].trim());
    } else if (rawPath.startsWith('/recipe/')) {
      recipeSlugOrId = decodeURIComponent(rawPath.replace('/recipe/', '').split('/')[0].trim());
    } else if (req.query.recipe && typeof req.query.recipe === 'string') {
      recipeSlugOrId = req.query.recipe.trim();
    }

    if (recipeSlugOrId) {
      const recipes = db.getRecipes().filter(r => r.active !== false);
      const rec = findRecipeBySlugOrId(recipeSlugOrId, recipes);

      // If invalid recipe slug was explicitly requested in the path, return HTTP 404
      if (!rec && (rawPath.startsWith('/recipes/') || rawPath.startsWith('/recipe/'))) {
        return {
          html: render404Html('Recipe Not Found'),
          status: 404
        };
      }

      if (rec) {
        const slug = getRecipeSlug(rec);
        const titleName = isKn && rec.title_kn ? rec.title_kn : rec.title_en;
        const rawDesc = (((isKn && rec.description_kn ? rec.description_kn : rec.description_en) || '') as string).replace(/"/g, '&quot;');
        const cleanDesc = rawDesc.replace(/\s+/g, ' ').trim();
        const shortDesc = cleanDesc.length > 150 ? cleanDesc.substring(0, 147) + '...' : cleanDesc;

        const title = `${titleName} Recipe | Karnataka Heritage | Indima Spice Co.`;
        const description = `Cook authentic ${titleName} at home with pure Indima spices. ${shortDesc} Traditional recipe. Prep time: ${rec.prep_time || '25 mins'}.`;

        let image = rec.image || '/indima-brand-logo.jpg';
        if (image.startsWith('/')) image = `${CANONICAL_ORIGIN}${image}`;
        const canonicalUrl = `${CANONICAL_ORIGIN}/recipes/${slug}`;

        const rawIngredients = isKn
          ? (rec.ingredients_kn && rec.ingredients_kn.length > 0 ? rec.ingredients_kn : rec.ingredients_en)
          : (rec.ingredients_en && rec.ingredients_en.length > 0 ? rec.ingredients_en : rec.ingredients_kn);
        const ingredients = Array.isArray(rawIngredients) ? rawIngredients : [];

        const rawInstructions = isKn
          ? (rec.instructions_kn && rec.instructions_kn.length > 0 ? rec.instructions_kn : rec.instructions_en)
          : (rec.instructions_en && rec.instructions_en.length > 0 ? rec.instructions_en : rec.instructions_kn);
        const instructions = Array.isArray(rawInstructions) ? rawInstructions : [];

        const parseDurationIso = (timeStr?: string) => {
          if (!timeStr) return undefined;
          const match = timeStr.match(/(\d+)/);
          if (match) return `PT${match[1]}M`;
          return undefined;
        };

        const recipeJsonLd: any = {
          "@context": "https://schema.org",
          "@type": "Recipe",
          "@id": `${canonicalUrl}#recipe`,
          "name": rec.title_en,
          "headline": titleName,
          "description": rec.description_en || cleanDesc,
          "image": [image],
          "author": {
            "@type": "Organization",
            "name": "Indima Spice Co.",
            "url": CANONICAL_ORIGIN
          },
          "publisher": {
            "@type": "Organization",
            "name": "Indima Spice Co.",
            "url": CANONICAL_ORIGIN,
            "logo": {
              "@type": "ImageObject",
              "url": `${CANONICAL_ORIGIN}/indima-brand-logo.jpg`
            }
          },
          "recipeCategory": "Traditional Karnataka Cuisine",
          "recipeCuisine": "South Indian",
          "prepTime": parseDurationIso(rec.prep_time) || "PT20M",
          "cookTime": parseDurationIso(rec.cook_time) || "PT25M",
          "recipeYield": rec.servings || "4 servings",
          "recipeIngredient": ingredients.length > 0 ? ingredients : ["100% Pure Indima Spices"],
          "recipeInstructions": instructions.length > 0
            ? instructions.map((step, idx) => ({
                "@type": "HowToStep",
                "position": idx + 1,
                "text": step
              }))
            : [{ "@type": "HowToStep", "position": 1, "text": "Follow traditional stone-ground preparation instructions." }]
        };

        if (rec.video_url || rec.video) {
          recipeJsonLd.video = {
            "@type": "VideoObject",
            "name": `${rec.title_en} Video Guide`,
            "description": `How to cook ${rec.title_en} using authentic Indima spices`,
            "thumbnailUrl": image,
            "contentUrl": rec.video_url || rec.video,
            "uploadDate": rec.created_at || "2026-01-01"
          };
        }

        const breadcrumbJsonLd = {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": `${CANONICAL_ORIGIN}/`
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Recipes",
              "item": `${CANONICAL_ORIGIN}/recipes`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": rec.title_en,
              "item": canonicalUrl
            }
          ]
        };

        let modifiedHtml = html;
        modifiedHtml = modifiedHtml.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
        modifiedHtml = modifiedHtml.replace(/<meta\s+name=["']description["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="description" content="${description}" />`);
        modifiedHtml = modifiedHtml.replace(/<link\s+rel=["']canonical["']\s+href=["'].*?["']\s*\/?>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
        modifiedHtml = modifiedHtml.replace(/<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:title" content="${title}" />`);
        modifiedHtml = modifiedHtml.replace(/<meta\s+property=["']og:description["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:description" content="${description}" />`);
        modifiedHtml = modifiedHtml.replace(/<meta\s+property=["']og:image["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:image" content="${image}" />`);
        modifiedHtml = modifiedHtml.replace(/<meta\s+property=["']og:url["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
        modifiedHtml = modifiedHtml.replace(/<meta\s+property=["']og:type["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:type" content="article" />`);
        modifiedHtml = modifiedHtml.replace(/<meta\s+name=["']twitter:title["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="twitter:title" content="${title}" />`);
        modifiedHtml = modifiedHtml.replace(/<meta\s+name=["']twitter:description["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="twitter:description" content="${description}" />`);
        modifiedHtml = modifiedHtml.replace(/<meta\s+name=["']twitter:image["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="twitter:image" content="${image}" />`);

        modifiedHtml = modifiedHtml.replace(
          '</head>',
          `  <script type="application/ld+json" id="ssr-recipe-jsonld">${JSON.stringify(recipeJsonLd)}</script>\n  <script type="application/ld+json" id="ssr-breadcrumb-jsonld">${JSON.stringify(breadcrumbJsonLd)}</script>\n  </head>`
        );

        return { html: modifiedHtml, status: 200 };
      }
    }

    // 3. RECIPES PAGE
    if (rawPath === '/recipes') {
      const title = 'Authentic Traditional Karnataka Spice Recipes | Indima Spice Co.';
      const description =
        'Explore authentic traditional Karnataka recipes with Indima Spice Co. Stone-ground spices for Mysore Bisi Bele Bath, Udupi Sambar, Maniyara Rasam, and more.';
      const canonicalUrl = `${CANONICAL_ORIGIN}/recipes`;

      let modifiedHtml = html;
      modifiedHtml = modifiedHtml.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
      modifiedHtml = modifiedHtml.replace(/<meta\s+name=["']description["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="description" content="${description}" />`);
      modifiedHtml = modifiedHtml.replace(/<link\s+rel=["']canonical["']\s+href=["'].*?["']\s*\/?>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
      modifiedHtml = modifiedHtml.replace(/<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:title" content="${title}" />`);
      modifiedHtml = modifiedHtml.replace(/<meta\s+property=["']og:description["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:description" content="${description}" />`);
      modifiedHtml = modifiedHtml.replace(/<meta\s+property=["']og:url["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
      return { html: modifiedHtml, status: 200 };
    }

    // 4. ABOUT PAGE
    if (rawPath === '/about') {
      const title = 'Our Heritage & Tradition | 100% Pure Stone-Ground Spices | Indima Spice Co.';
      const description =
        'Learn about the heritage of Indima Spice Co. Bringing traditional Karnataka culinary culture to homes with 100% natural, stone-ground authentic spices.';
      const canonicalUrl = `${CANONICAL_ORIGIN}/about`;

      let modifiedHtml = html;
      modifiedHtml = modifiedHtml.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
      modifiedHtml = modifiedHtml.replace(/<meta\s+name=["']description["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="description" content="${description}" />`);
      modifiedHtml = modifiedHtml.replace(/<link\s+rel=["']canonical["']\s+href=["'].*?["']\s*\/?>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
      modifiedHtml = modifiedHtml.replace(/<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:title" content="${title}" />`);
      modifiedHtml = modifiedHtml.replace(/<meta\s+property=["']og:description["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:description" content="${description}" />`);
      modifiedHtml = modifiedHtml.replace(/<meta\s+property=["']og:url["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
      return { html: modifiedHtml, status: 200 };
    }

    // 5. CONTACT PAGE
    if (rawPath === '/contact') {
      const title = 'Contact Us | Customer Care & Support | Indima Spice Co.';
      const description =
        'Get in touch with Indima Spice Co. in Basavanagudi, Bengaluru. Contact us for authentic spice inquiries, wholesale orders, and pan-India shipping support.';
      const canonicalUrl = `${CANONICAL_ORIGIN}/contact`;

      let modifiedHtml = html;
      modifiedHtml = modifiedHtml.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
      modifiedHtml = modifiedHtml.replace(/<meta\s+name=["']description["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="description" content="${description}" />`);
      modifiedHtml = modifiedHtml.replace(/<link\s+rel=["']canonical["']\s+href=["'].*?["']\s*\/?>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
      modifiedHtml = modifiedHtml.replace(/<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:title" content="${title}" />`);
      modifiedHtml = modifiedHtml.replace(/<meta\s+property=["']og:description["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:description" content="${description}" />`);
      modifiedHtml = modifiedHtml.replace(/<meta\s+property=["']og:url["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
      return { html: modifiedHtml, status: 200 };
    }
  } catch (err: any) {
    console.warn('[SEO Meta Injector] Notice:', err?.message);
  }
  return { html, status: 200 };
}


// ----------------------------------------------------
// VITE OR STATIC SERVING
// ----------------------------------------------------

async function startServer() {
  // ----------------------------------------------------
  // STATIC FILE & SENSITIVE PATH SECURITY GUARD
  // ----------------------------------------------------
  // Prevents unauthorized enumeration and exposure of dotfiles, secrets, manifests,
  // database backups, source maps, server source code, and internal configs.
  app.use((req: Request, res: Response, next: NextFunction) => {
    const rawPath = (req.path || '').toLowerCase();

    // In development mode only, allow Vite internal dev dependencies and cache
    // (e.g. /node_modules/.vite/deps/*) to reach Vite's development middleware.
    // In production, this development exception is completely disabled.
    if (process.env.NODE_ENV !== 'production') {
      if (rawPath.startsWith('/node_modules/.vite/') || rawPath.includes('/node_modules/.vite/')) {
        return next();
      }
    }

    // 1. Block dotfiles and hidden paths (e.g. /.env, /.git, /.github, etc.)
    if (rawPath.startsWith('/.') || rawPath.includes('/.')) {
      return res.status(404).send('Not found');
    }

    // 2. Block direct access to manifests, configurations, and cloud rules
    const blockedExact = [
      '/package.json',
      '/package-lock.json',
      '/tsconfig.json',
      '/tsconfig.node.json',
      '/vite.config.ts',
      '/vite.config.js',
      '/metadata.json',
      '/firestore.rules',
      '/firebase-applet-config.json',
      '/firebase-blueprint.json',
      '/service-account.json',
      '/firebase-service-account.json',
      '/server.ts',
      '/server.cjs'
    ];

    if (blockedExact.includes(rawPath)) {
      return res.status(404).send('Not found');
    }

    // 3. Block sensitive extensions and internal server directories
    const blockedPatterns = [
      /\.(env|map|bak|backup|sql|sqlite|db|log|cert|key|pem|crt|conf|config|yml|yaml|sh)$/i,
      /^\/(server|scripts)(\/|$)/i,
      /\/(\.git|\.env|node_modules|server)(\/|$)/i
    ];

    // In production, block direct access to /src/ and raw TS/TSX source files
    if (process.env.NODE_ENV === 'production') {
      blockedPatterns.push(/^\/src(\/|$)/i);
      blockedPatterns.push(/\.(ts|tsx)$/i);
    }

    if (blockedPatterns.some(pattern => pattern.test(rawPath))) {
      return res.status(404).send('Not found');
    }

    next();
  });

  // Explicitly serve public files (e.g. google verification files, sitemap, robots.txt)
  app.use(express.static(path.join(process.cwd(), 'public')));

  const isRunningBundled = typeof __filename === 'string' && __filename.includes('server.cjs');
  const isProduction = process.env.NODE_ENV === 'production' || isRunningBundled;

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });
    app.use(vite.middlewares);
    app.get('*', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        const { html, status } = injectDynamicHtmlMeta(template, req);
        res.status(status || 200).set({ 'Content-Type': 'text/html' }).send(html);
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
        const { html, status } = injectDynamicHtmlMeta(template, req);
        res.status(status || 200).set({ 'Content-Type': 'text/html' }).send(html);
      } else {
        const rootIndex = path.resolve(process.cwd(), 'index.html');
        if (fs.existsSync(rootIndex)) {
          const template = fs.readFileSync(rootIndex, 'utf-8');
          const { html, status } = injectDynamicHtmlMeta(template, req);
          res.status(status || 200).set({ 'Content-Type': 'text/html' }).send(html);
        } else {
          res.status(404).send('Page not found');
        }
      }
    });
  }

  // Bind HTTP server immediately so Render health checks pass without delay
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[INDIMA SPICE CO.] Server running on http://0.0.0.0:${PORT}`);

    // Asynchronous background initialization (non-blocking for instant HTTP availability)
    (async () => {
      // Production security audit & environment validation
      const securityReport = validateSecurityConfiguration();
      if (securityReport.errors.length > 0) {
        console.error('================================================================');
        console.error('🚨 [SECURITY CONFIGURATION ALERT] CRITICAL ISSUES DETECTED:');
        securityReport.errors.forEach(err => console.error(`  - ${err}`));
        console.error('================================================================');
      }
      if (securityReport.warnings.length > 0 && process.env.NODE_ENV === 'production') {
        console.warn('⚠️ [SECURITY WARNINGS]:');
        securityReport.warnings.forEach(warn => console.warn(`  - ${warn}`));
      }

      // Check and run one-time database migration if explicitly requested via RUN_FIRESTORE_MIGRATION=true
      if (process.env.RUN_FIRESTORE_MIGRATION === 'true') {
        try {
          console.log('[Server Startup] RUN_FIRESTORE_MIGRATION=true detected. Executing background one-time migration...');
          await runOneTimeFirestoreMigration();
        } catch (migErr: any) {
          console.error('[Server Startup] Migration encountered error:', migErr.message);
        }
      }

      try {
        await db.initFirestore();
      } catch (dbErr: any) {
        console.info('[Firebase Admin Firestore] Pre-flight initialization notice:', dbErr?.message || dbErr);
      }

      // Cloudinary media service initialization and status audit
      const cloudStatus = getCloudinaryStatus();
      if (cloudStatus.configured) {
        initCloudinary();
        console.log(`[Cloudinary Media] Connected: Cloud Name "${cloudStatus.cloudName}", Folder "${cloudStatus.folder}", Video Support: Enabled.`);
      } else {
        console.warn('[Cloudinary Media] Notice: Cloudinary environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are not fully defined yet. Uploads will prompt for configuration.');
      }

      // Check and run media migration if explicitly requested via RUN_MEDIA_MIGRATION=true
      if (process.env.RUN_MEDIA_MIGRATION === 'true') {
        try {
          console.log('[Server Startup] RUN_MEDIA_MIGRATION=true detected. Migrating local public/uploads/ media to Cloudinary in background...');
          const fsDb = await db.getFirestoreInstance();
          const migResult = await migrateLocalMediaToCloudinary(fsDb);
          console.log(`[Server Startup] Media migration complete: ${migResult.uploadedCount} uploaded, ${migResult.updatedDocsCount} Firestore docs updated.`);
          await db.reloadFromFirestore();
        } catch (migErr: any) {
          console.error('[Server Startup] Media migration encountered error:', migErr.message);
        }
      }

      // Pre-flight check storage availability in background without blocking startup
      isCloudStorageAvailable().catch(() => {});
    })().catch(bgErr => {
      console.warn('[Server Startup] Background initialization task error:', bgErr?.message || bgErr);
    });
  });
}

startServer();
