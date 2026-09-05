# INDIMA SPICES — PRODUCTION SECURITY REMEDIATION GUIDE

This document summarizes all remediations, architectural hardening measures, and configuration guidelines applied to the Indima Spices codebase.

---

## 1. Security Infrastructure Components Added

### `server/security.ts`
Centralized security hub providing:
- **`hashPassword(plainPassword)`**: Computes cryptographically salted scrypt hashes (`crypto.scrypt` with 16-byte random salt and $N=16384, r=8, p=1$).
- **`verifyPassword(plain, hashOrPlain)`**: Performs constant-time verification using `timingSafeEqual`.
- **`signAdminToken(username, durationMs)`**: Signs HMAC-SHA256 bearer tokens with payload encoding, timestamp, and unique `jti`.
- **`verifyAdminToken(token)`**: Validates token integrity, checks expiration, and checks against revoked token cache.
- **`revokeToken(token)`**: Adds token to server-side revocation list upon `/api/admin/logout`.
- **`timingSafeEqual(a, b)`**: Secure constant-time string comparison preventing timing side-channel attacks.
- **`validateSecurityConfiguration()`**: Pre-flight production startup check alerting operators if critical secrets (`SESSION_SECRET`, `ADMIN_PASSWORD`, `RAZORPAY_KEY_SECRET`) are missing or insecure.
- **Zod Validation Schemas**:
  - `AdminLoginSchema`
  - `AdminChangePasswordSchema`
  - `CreateOrderSchema`
  - `SubmitReviewSchema`
  - `SubmitLeadSchema`
  - `CustomerLookupSchema`
  - `TrackOrderSchema`
  - `CreateRazorpayOrderSchema`
  - `VerifyRazorpayPaymentSchema`

---

## 2. Server-Side Protection Hardening

### `server/dataStore.ts`
- **Password Hashing & Auto-Upgrade**:
  - `verifyAdminPassword()` is now asynchronous.
  - Automatically upgrades legacy plaintext passwords to scrypt hashes on first verified login.
  - `setAdminPassword()` hashes new passwords with scrypt and enforces an 8-character minimum.
- **Sensitive Field Stripping**:
  - `getSettings()` strips `admin_password` and secrets from the exposed settings object.
  - `getRawSettingsInternal()` is restricted to internal authorization routines.

### `server.ts`
- **Security Headers Middleware**:
  - Disabled `X-Powered-By: Express`.
  - Added `X-Content-Type-Options: nosniff`.
  - Added `Referrer-Policy: strict-origin-when-cross-origin`.
  - Added `X-Frame-Options: SAMEORIGIN`.
  - Added `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
  - Added `Strict-Transport-Security: max-age=31536000; includeSubDomains` in production.
- **Authentication Routes**:
  - `/api/admin/login`: Protected with `adminLoginLimiter`, validated via `AdminLoginSchema`, eliminated empty username bypass (`cleanUser === ''`), and verifies password using `verifyAdminPassword()`.
  - `/api/admin/change-password`: Validated via `AdminChangePasswordSchema`, verifies existing password, enforces 8+ chars.
  - `/api/admin/logout`: Revokes token on logout using `revokeToken(token)`.
- **Rate Limiting Expansion**:
  - Added `reviewSubmitLimiter` (15 requests/min) on `/api/reviews`.
  - Added `reviewUploadLimiter` (10 requests/min) on `/api/reviews/upload-proof`.
- **Input Sanitization**:
  - Escaped HTML entities (`&lt;`, `&gt;`) in review submissions to prevent stored XSS attacks.
  - Validated allowed MIME types (`image/*`, `video/*`) and enforced 25MB maximum limit on media proof uploads.
- **Payment Verification & Webhooks**:
  - Validated signatures using constant-time comparison (`timingSafeEqual`).
  - Enforced idempotency checking on webhook events through Firestore (`isWebhookEventProcessed`).

---

## 3. Database & Cloud Hardening

### `firestore.rules`
- Deny-all client-side read/write on sensitive internal collections:
  - `orders`
  - `customers`
  - `leads`
  - `settings`
  - `processed_webhook_events`
  - `audit_logs`
  - `system`
- Read-only client access on public storefront catalogs:
  - `products`
  - `categories`
  - `recipes`
  - `banners`
  - `offers`
  - `reviews` (only where `approved == true`)
- All database mutations must route through server APIs powered by Firebase Admin SDK.
- Successfully deployed to live Firestore environment using `deploy_firebase`.

---

## 4. Frontend & Configuration Hardening

### `src/services/api.ts`
- Cleaned hardcoded fallback mock key (`rzp_test_...`) to return unconfigured status cleanly instead of mock values.

### `.env.example`
- Removed default password (`indima@2026`).
- Documented `SESSION_SECRET` (mandatory 32+ character key in production).
- Clearly listed all required production credentials for Render deployment.

---

## 5. Render Deployment Checklist for Operators

Ensure the following variables are set in your **Render Service Environment Variables**:

| Variable | Purpose | Notes |
|:---|:---|:---|
| `SESSION_SECRET` | Admin token HMAC signing | 32+ character random string |
| `ADMIN_PASSWORD` | Admin initial login credential | Change to strong, unique password |
| `FIREBASE_SERVICE_ACCOUNT` | Server Firebase Admin SDK auth | Full service account JSON string |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Required for image/video upload |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Required for image/video upload |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Required for image/video upload |
| `RAZORPAY_KEY_ID` | Razorpay public key ID | `rzp_live_...` or `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay secret | Required for payment verification |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook verification secret | Required if webhook enabled |
