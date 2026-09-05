import crypto from 'crypto';
import { z } from 'zod';

// ============================================================================
// ENVIRONMENT & SECRETS CONFIGURATION
// ============================================================================

const IS_PROD = process.env.NODE_ENV === 'production';

let _ephemeralProdSecret: string | null = null;

// Production safety check: Session secret
export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.ADMIN_SECRET;
  if (!secret) {
    if (IS_PROD) {
      if (!_ephemeralProdSecret) {
        _ephemeralProdSecret = crypto.randomBytes(32).toString('hex');
        console.warn(
          '[SECURITY] No SESSION_SECRET set in production. Generated an unpredictable ephemeral 256-bit secret for this process lifetime. To persist sessions across restarts, set SESSION_SECRET in Render environment variables.'
        );
      }
      return _ephemeralProdSecret;
    }
    // Safe dev fallback only
    return 'indima-spice-dev-session-key-must-override-in-prod-2026';
  }
  return secret;
}

// Validate production security configuration on startup
export function validateSecurityConfiguration(): { valid: boolean; warnings: string[]; errors: string[] } {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check SESSION_SECRET
  const sessionSecret = process.env.SESSION_SECRET || process.env.ADMIN_SECRET;
  if (!sessionSecret) {
    if (IS_PROD) {
      errors.push('SESSION_SECRET is not defined. Mandatory for admin token signing in production.');
    } else {
      warnings.push('SESSION_SECRET is using default development fallback.');
    }
  } else if (sessionSecret.length < 32) {
    warnings.push('SESSION_SECRET is shorter than 32 characters. Consider using a 256-bit cryptographically random key.');
  }

  // Check ADMIN_PASSWORD
  const adminPass = process.env.ADMIN_PASSWORD;
  if (!adminPass || adminPass === 'indima@2026') {
    if (IS_PROD) {
      errors.push('ADMIN_PASSWORD is missing or set to the insecure default ("indima@2026"). You MUST set a unique ADMIN_PASSWORD in Render environment variables.');
    } else {
      warnings.push('ADMIN_PASSWORD is using default fallback ("indima@2026"). Change this before deploying to production.');
    }
  }

  // Check Razorpay keys
  if (IS_PROD) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      warnings.push('RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not set. Razorpay online payments will not function.');
    }
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      warnings.push('RAZORPAY_WEBHOOK_SECRET is not set. Webhook payloads will reject signatures.');
    }
  }

  // Check Cloudinary
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    warnings.push('Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are not fully configured.');
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors
  };
}

// ============================================================================
// TIMING-SAFE CRYPTOGRAPHIC UTILITIES
// ============================================================================

/**
 * Timing-safe string comparison to prevent timing attacks against passwords and HMAC signatures.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');

  // If buffer lengths differ, perform dummy comparison to preserve constant-time execution
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

// ============================================================================
// PASSWORD HASHING (SCRYPT + SALT)
// ============================================================================

const SCRYPT_PREFIX = 'scrypt$';

/**
 * Hashes a plaintext password using crypto.scrypt with a cryptographically random 16-byte salt.
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(plainPassword, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${SCRYPT_PREFIX}${salt}$${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * Verifies a plaintext password against either a scrypt hash or legacy plaintext string.
 * Uses timingSafeEqual for both cases.
 */
export async function verifyPassword(plainPassword: string, storedHashOrPlain: string): Promise<boolean> {
  if (!plainPassword || !storedHashOrPlain) return false;

  const trimmedPlain = plainPassword.trim();
  const trimmedStored = storedHashOrPlain.trim();

  // If stored password starts with scrypt$, verify using scrypt
  if (trimmedStored.startsWith(SCRYPT_PREFIX)) {
    const parts = trimmedStored.slice(SCRYPT_PREFIX.length).split('$');
    if (parts.length !== 2) return false;
    const [salt, expectedHex] = parts;

    return new Promise((resolve) => {
      crypto.scrypt(trimmedPlain, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
        if (err) return resolve(false);
        const derivedHex = derivedKey.toString('hex');
        resolve(timingSafeEqual(derivedHex, expectedHex));
      });
    });
  }

  // Legacy plaintext fallback: use timing-safe comparison
  return timingSafeEqual(trimmedPlain, trimmedStored);
}

// ============================================================================
// ADMIN SESSION MANAGEMENT & TOKEN SIGNING
// ============================================================================

const revokedTokens = new Set<string>();

// Auto-cleanup revoked tokens set every hour
setInterval(() => {
  if (revokedTokens.size > 5000) {
    revokedTokens.clear();
  }
}, 60 * 60 * 1000);

export function revokeToken(token: string): void {
  if (token) {
    revokedTokens.add(token);
  }
}

export function isTokenRevoked(token: string): boolean {
  return revokedTokens.has(token);
}

export interface AdminTokenPayload {
  username: string;
  role: string;
  issuedAt: number;
  expiresAt: number;
  jti: string;
}

export function signAdminToken(username: string, durationMs = 24 * 60 * 60 * 1000): string {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + durationMs;
  const jti = crypto.randomBytes(16).toString('hex');

  const payloadData = `${username}:${issuedAt}:${expiresAt}:${jti}`;
  const hmac = crypto.createHmac('sha256', getSessionSecret()).update(payloadData).digest('hex');
  const basePayload = Buffer.from(payloadData, 'utf-8').toString('base64url');

  return `indima_${basePayload}.${hmac}`;
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  if (!token || typeof token !== 'string' || !token.startsWith('indima_')) {
    return null;
  }

  if (isTokenRevoked(token)) {
    return null;
  }

  const parts = token.slice('indima_'.length).split('.');
  if (parts.length !== 2) {
    return null;
  }

  const [encodedPayload, receivedHmac] = parts;

  try {
    const payloadData = Buffer.from(encodedPayload, 'base64url').toString('utf-8');
    const expectedHmac = crypto.createHmac('sha256', getSessionSecret()).update(payloadData).digest('hex');

    if (!timingSafeEqual(receivedHmac, expectedHmac)) {
      return null;
    }

    const [username, issuedAtStr, expiresAtStr, jti] = payloadData.split(':');
    const issuedAt = Number(issuedAtStr);
    const expiresAt = Number(expiresAtStr);

    if (Date.now() > expiresAt) {
      return null; // Expired
    }

    return {
      username: username || 'admin',
      role: 'Super Admin',
      issuedAt,
      expiresAt,
      jti
    };
  } catch {
    return null;
  }
}

// ============================================================================
// RAZORPAY CRYPTOGRAPHIC SIGNATURE VERIFICATION
// ============================================================================

export function verifyRazorpayPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    console.error('[Razorpay Security Error] RAZORPAY_KEY_SECRET is not configured on the server.');
    return false;
  }
  if (!orderId || !paymentId || !signature) {
    return false;
  }

  const payload = `${orderId}|${paymentId}`;
  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  return timingSafeEqual(signature.trim(), expectedSignature);
}

export function verifyRazorpayWebhookSignature(rawBody: string | Buffer, receivedSignature: string): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn('[Razorpay Webhook Notice] RAZORPAY_WEBHOOK_SECRET is not configured on this server.');
    return false;
  }
  if (!rawBody || !receivedSignature) {
    return false;
  }

  const bodyBuffer = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody, 'utf-8');
  const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(bodyBuffer).digest('hex');

  return timingSafeEqual(receivedSignature.trim(), expectedSignature);
}

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

export const AdminLoginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required').max(100),
  password: z.string().min(1, 'Password is required').max(200)
});

export const AdminChangePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'New password must be at least 8 characters long').max(200)
});

export const CreateOrderSchema = z.object({
  customer_name: z.string().trim().min(2, 'Customer name must be at least 2 characters').max(100),
  customer_phone: z.string().trim().regex(/^[0-9+() -]{10,15}$/, 'Invalid phone number format'),
  customer_email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
  payment_method: z.enum(['Razorpay', 'UPI', 'COD']),
  items: z.array(
    z.object({
      product_id: z.string().min(1),
      quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100),
      price: z.number().positive(),
      weight: z.string().optional(),
      name_en: z.string().optional()
    })
  ).min(1, 'Order must contain at least one item'),
  shipping_address: z.object({
    full_name: z.string().trim().min(2).max(100),
    phone: z.string().trim().min(10).max(15),
    address_line1: z.string().trim().min(3).max(200),
    address_line2: z.string().trim().max(200).optional(),
    landmark: z.string().trim().max(100).optional(),
    city: z.string().trim().min(2).max(100),
    state: z.string().trim().min(2).max(100),
    pincode: z.string().trim().regex(/^[1-9][0-9]{5}$/, 'Invalid 6-digit Indian PIN code')
  }),
  coupon_code: z.string().trim().max(30).optional(),
  customer_notes: z.string().trim().max(500).optional(),
  language: z.enum(['en', 'kn']).optional()
});

export const SubmitReviewSchema = z.object({
  product_id: z.string().min(1).max(100),
  customer_name: z.string().trim().min(2).max(100),
  customer_city: z.string().trim().max(100).optional(),
  rating: z.number().int().min(1).max(5),
  comment_en: z.string().trim().min(3).max(2000),
  comment_kn: z.string().trim().max(2000).optional()
});

export const SubmitLeadSchema = z.object({
  phone: z.string().trim().min(10).max(15),
  source: z.string().trim().max(100).optional()
});

export const CustomerLookupSchema = z.object({
  phone: z.string().trim().min(10).max(15)
});

export const TrackOrderSchema = z.object({
  phone: z.string().trim().min(10).max(15),
  order_id: z.string().trim().max(100).optional()
});

export const CreateRazorpayOrderSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.literal('INR').default('INR'),
  receipt: z.string().max(100).optional(),
  customer_name: z.string().trim().max(100).optional(),
  customer_phone: z.string().trim().max(20).optional(),
  customer_email: z.string().trim().max(100).optional()
});

export const VerifyRazorpayPaymentSchema = z.object({
  order_id: z.string().trim().optional(),
  internal_order_id: z.string().trim().optional(),
  razorpay_order_id: z.string().trim().min(1, 'razorpay_order_id is required'),
  razorpay_payment_id: z.string().trim().min(1, 'razorpay_payment_id is required'),
  razorpay_signature: z.string().trim().min(1, 'razorpay_signature is required')
});
