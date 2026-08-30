import fs from 'fs';
import path from 'path';
import { getApps as getAdminApps, initializeApp as initializeAdminApp, cert, App as AdminApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, Firestore as AdminFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

export interface FirebaseAdminConfig {
  app: AdminApp;
  firestore: AdminFirestore;
  projectId: string;
  databaseId: string;
  source: string;
}

let cachedConfig: FirebaseAdminConfig | null = null;

/**
 * Robustly parses FIREBASE_SERVICE_ACCOUNT from environment.
 * Supports:
 * - Direct JSON string
 * - Surrounding quotes (single or double) from Render env input
 * - Base64 encoded JSON
 * - Escaped newlines in private_key (\n vs \\n)
 */
export function parseServiceAccountCredentials(): { parsed: any; error?: string } {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw || !raw.trim()) {
    return { parsed: null };
  }

  let str = raw.trim();

  // Strip leading/trailing quotes if user pasted with quotes in Render
  if ((str.startsWith("'") && str.endsWith("'")) || (str.startsWith('"') && str.endsWith('"'))) {
    str = str.substring(1, str.length - 1).trim();
  }

  try {
    let json: any;
    if (str.startsWith('{')) {
      json = JSON.parse(str);
    } else {
      // Try base64 decoding
      const decoded = Buffer.from(str, 'base64').toString('utf-8');
      json = JSON.parse(decoded);
    }

    if (json && typeof json === 'object') {
      // Ensure private_key has correct literal newlines
      if (json.private_key && typeof json.private_key === 'string') {
        json.private_key = json.private_key.replace(/\\n/g, '\n');
      }
      return { parsed: json };
    }
  } catch (err: any) {
    return { parsed: null, error: `Failed to parse FIREBASE_SERVICE_ACCOUNT: ${err.message}` };
  }

  return { parsed: null, error: 'FIREBASE_SERVICE_ACCOUNT is not a valid JSON object' };
}

/**
 * Initializes and returns the authoritative Firebase Admin SDK instances.
 * Target: Firebase Project "indimaspicea", Firestore Database "(default)"
 */
export function getFirebaseAdmin(): FirebaseAdminConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const { parsed: serviceAccount, error: parseError } = parseServiceAccountCredentials();
  if (parseError) {
    console.error(`[Firebase Admin] ⚠️ ${parseError}`);
  }

  // Determine Project ID:
  // Priority: 1. service_account.project_id, 2. FIREBASE_PROJECT_ID, 3. 'indimaspicea' (production default)
  const projectId =
    serviceAccount?.project_id ||
    process.env.FIREBASE_PROJECT_ID ||
    'indimaspicea';

  // Determine Database ID:
  // Standard default Firestore database is "(default)".
  const rawDbId = process.env.FIRESTORE_DATABASE_ID || process.env.FIREBASE_DATABASE_ID || '';
  const isDefaultDb = !rawDbId || rawDbId === '(default)';
  const databaseId = isDefaultDb ? '(default)' : rawDbId;

  const storageBucket =
    process.env.FIREBASE_STORAGE_BUCKET ||
    `${projectId}.firebasestorage.app`;

  let app: AdminApp;
  let source = 'unknown';

  const existingApps = getAdminApps();
  if (existingApps.length > 0) {
    app = existingApps[0] as AdminApp;
    source = 'existing_instance';
  } else if (serviceAccount && serviceAccount.private_key && serviceAccount.client_email) {
    try {
      app = initializeAdminApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id || projectId,
        storageBucket
      });
      source = 'FIREBASE_SERVICE_ACCOUNT';
      console.log(`[Firebase Admin] ✅ Initialized with service account for project: "${projectId}"`);
    } catch (e: any) {
      console.error(`[Firebase Admin] ❌ Error initializing with FIREBASE_SERVICE_ACCOUNT: ${e.message}`);
      throw new Error(`Failed to initialize Firebase Admin with service account: ${e.message}`);
    }
  } else if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      app = initializeAdminApp({
        credential: cert({
          projectId,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey
        }),
        projectId,
        storageBucket
      });
      source = 'FIREBASE_CLIENT_EMAIL_KEY';
      console.log(`[Firebase Admin] ✅ Initialized with FIREBASE_CLIENT_EMAIL for project: "${projectId}"`);
    } catch (e: any) {
      console.error(`[Firebase Admin] ❌ Error initializing with CLIENT_EMAIL: ${e.message}`);
      throw new Error(`Failed to initialize Firebase Admin with client email: ${e.message}`);
    }
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    try {
      app = initializeAdminApp({
        credential: applicationDefault(),
        projectId,
        storageBucket
      });
      source = 'GOOGLE_APPLICATION_CREDENTIALS';
      console.log(`[Firebase Admin] ✅ Initialized with GOOGLE_APPLICATION_CREDENTIALS for project: "${projectId}"`);
    } catch (e: any) {
      console.error(`[Firebase Admin] ❌ Error initializing with GOOGLE_APPLICATION_CREDENTIALS: ${e.message}`);
      throw new Error(`Failed to initialize Firebase Admin with GOOGLE_APPLICATION_CREDENTIALS: ${e.message}`);
    }
  } else {
    // Attempt applicationDefault() for GCP environments, or basic fallback with explicit project ID
    try {
      app = initializeAdminApp({
        credential: applicationDefault(),
        projectId,
        storageBucket
      });
      source = 'applicationDefault';
      console.log(`[Firebase Admin] Initialized with applicationDefault() for project: "${projectId}"`);
    } catch {
      app = initializeAdminApp({
        projectId,
        storageBucket
      });
      source = 'projectId_fallback';
      console.log(`[Firebase Admin] Initialized with explicit project: "${projectId}"`);
    }
  }

  // Get Firestore instance:
  // For the default database, getFirestore(app) connects directly to "(default)".
  // For named custom databases, getFirestore(app, databaseId) is passed.
  let firestore: AdminFirestore;
  if (isDefaultDb) {
    firestore = getFirestore(app);
  } else {
    firestore = getFirestore(app, databaseId);
  }

  cachedConfig = {
    app,
    firestore,
    projectId,
    databaseId,
    source
  };

  return cachedConfig;
}

export function getAdminFirestoreInstance(): AdminFirestore {
  return getFirebaseAdmin().firestore;
}

export function getAdminStorageBucketInstance() {
  const { app } = getFirebaseAdmin();
  try {
    return getStorage(app).bucket();
  } catch {
    return null;
  }
}
