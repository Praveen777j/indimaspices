import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import os from 'os';

export interface CloudinaryStatus {
  configured: boolean;
  cloudName: string | null;
  source: 'env_vars' | 'cloudinary_url' | 'none';
  folder: string;
  supportsVideo: boolean;
}

export interface CloudinaryUploadOptions {
  filePath?: string;
  buffer?: Buffer;
  originalName?: string;
  mimeType?: string;
  folder?: string;
  resourceType?: 'auto' | 'image' | 'video' | 'raw';
  cleanupTempFile?: boolean;
}

export interface CloudinaryUploadResult {
  success: boolean;
  url: string;
  secure_url: string;
  public_id: string;
  resource_type: 'image' | 'video' | 'raw';
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  duration?: number;
}

let isInitialized = false;

export function sanitizeCloudinaryError(message: string): string {
  if (!message) return 'Unknown Cloudinary error';
  return String(message)
    .replace(/api_secret[:=][^\s&"']+/gi, 'api_secret=[REDACTED]')
    .replace(/api_key[:=][^\s&"']+/gi, 'api_key=[REDACTED]')
    .replace(/cloudinary:\/\/[^@]+@/gi, 'cloudinary://[REDACTED]@')
    .replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED]');
}

export function getCloudinaryStatus(): CloudinaryStatus {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  const cloudinaryUrl = process.env.CLOUDINARY_URL?.trim();

  const isConfiguredFromVars = Boolean(
    cloudName &&
    apiKey &&
    apiSecret &&
    !cloudName.startsWith('your_') &&
    !apiKey.startsWith('your_') &&
    !apiSecret.startsWith('your_')
  );

  const isConfiguredFromUrl = Boolean(
    cloudinaryUrl &&
    cloudinaryUrl.startsWith('cloudinary://') &&
    !cloudinaryUrl.includes('your_')
  );

  let detectedCloudName: string | null = null;
  if (isConfiguredFromVars) {
    detectedCloudName = cloudName!;
  } else if (isConfiguredFromUrl) {
    const match = cloudinaryUrl!.match(/@([^/?#]+)/);
    detectedCloudName = match ? match[1] : 'from_url';
  }

  const configured = isConfiguredFromVars || isConfiguredFromUrl;

  return {
    configured,
    cloudName: detectedCloudName,
    source: isConfiguredFromVars ? 'env_vars' : (isConfiguredFromUrl ? 'cloudinary_url' : 'none'),
    folder: process.env.CLOUDINARY_FOLDER?.trim() || 'indima-spices',
    supportsVideo: configured
  };
}

export function isCloudinaryConfigured(): boolean {
  return getCloudinaryStatus().configured;
}

export function initCloudinary(): boolean {
  const status = getCloudinaryStatus();
  if (!status.configured) {
    return false;
  }
  if (isInitialized) {
    return true;
  }

  try {
    if (status.source === 'cloudinary_url') {
      cloudinary.config({
        cloudinary_url: process.env.CLOUDINARY_URL?.trim(),
        secure: true
      });
    } else {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
        api_key: process.env.CLOUDINARY_API_KEY?.trim(),
        api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
        secure: true
      });
    }
    isInitialized = true;
    return true;
  } catch (err: any) {
    console.error('[Cloudinary Init Error]:', sanitizeCloudinaryError(err?.message || err));
    return false;
  }
}

/**
 * Safely saves media locally to `public/uploads/` as a reliable offline/development fallback.
 */
export function saveMediaLocally(options: CloudinaryUploadOptions): CloudinaryUploadResult {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const origName = options.originalName || (options.filePath ? path.basename(options.filePath) : 'upload');
  const ext = (path.extname(origName) || (options.resourceType === 'video' ? '.mp4' : '.jpg')).toLowerCase();
  const rawBase = path.basename(origName, ext).replace(/[^a-zA-Z0-9_-]/g, '_') || 'media';
  const uniqueName = `${rawBase}-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
  const destPath = path.join(uploadsDir, uniqueName);

  let bytes = 0;
  if (options.buffer) {
    fs.writeFileSync(destPath, options.buffer);
    bytes = options.buffer.length;
  } else if (options.filePath && fs.existsSync(options.filePath)) {
    fs.copyFileSync(options.filePath, destPath);
    bytes = fs.statSync(destPath).size;
  } else {
    throw new Error('No valid file or buffer provided for local media storage');
  }

  const isVideo =
    options.resourceType === 'video' ||
    /^\.(mp4|webm|mov|mkv|avi|m4v|3gp|flv)$/i.test(ext) ||
    Boolean(options.mimeType && options.mimeType.toLowerCase().startsWith('video/'));

  const relativeUrl = `/uploads/${uniqueName}`;

  return {
    success: true,
    url: relativeUrl,
    secure_url: relativeUrl,
    public_id: `local_${uniqueName}`,
    resource_type: isVideo ? 'video' : 'image',
    format: ext.replace('.', ''),
    bytes
  };
}

/**
 * Uploads an image or video directly to Cloudinary.
 * Safely manages temporary files: cleans them up immediately upon completion or failure.
 * When Cloudinary is not configured or if upload fails, seamlessly falls back to local storage (/uploads/).
 */
export async function uploadMediaToCloudinary(
  options: CloudinaryUploadOptions
): Promise<CloudinaryUploadResult> {
  const status = getCloudinaryStatus();
  if (!status.configured || !initCloudinary()) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'Cloudinary is not configured on this server. Insecure local media storage fallback is strictly disabled in production. Please configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment.'
      );
    }
    console.warn(
      '[Media Storage] Notice: Cloudinary credentials not configured. Saving uploaded media to local storage (/uploads/)...'
    );
    return saveMediaLocally(options);
  }

  const {
    filePath,
    buffer,
    originalName = '',
    mimeType = '',
    folder = status.folder,
    resourceType = 'auto',
    cleanupTempFile = true
  } = options;

  let tempCreated = false;
  let fileToUpload = filePath;

  const originalExt = (path.extname(originalName || filePath || '') || '').toLowerCase();
  const mimeLower = (mimeType || '').toLowerCase();

  const isVideo =
    resourceType === 'video' ||
    mimeLower.startsWith('video/') ||
    /^\.(mp4|webm|mov|mkv|avi|m4v|3gp|flv)$/i.test(originalExt);

  const determinedResourceType: 'image' | 'video' | 'raw' = isVideo
    ? 'video'
    : resourceType === 'raw'
    ? 'raw'
    : 'image';

  try {
    // If a Buffer was passed instead of a file path, write temporarily to os.tmpdir()
    if (!fileToUpload && buffer) {
      const ext = originalExt || (isVideo ? '.mp4' : '.jpg');
      fileToUpload = path.join(
        os.tmpdir(),
        `indima-up-${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`
      );
      fs.writeFileSync(fileToUpload, buffer);
      tempCreated = true;
    }

    if (!fileToUpload || !fs.existsSync(fileToUpload)) {
      throw new Error('No valid file or buffer provided for Cloudinary upload');
    }

    const uploadOptions: Record<string, any> = {
      folder,
      resource_type: determinedResourceType,
      use_filename: false,
      unique_filename: true,
      overwrite: true
    };

    let result: UploadApiResponse;

    if (determinedResourceType === 'video') {
      // Use upload_large for videos with Promise callback to ensure chunked support for high reliability
      result = await new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader.upload_large(
          fileToUpload,
          {
            ...uploadOptions,
            chunk_size: 6000000 // 6MB chunks
          },
          (error, res) => {
            if (error) return reject(error);
            if (!res || !res.secure_url) {
              return reject(new Error('Cloudinary returned invalid video response without secure_url'));
            }
            resolve(res as UploadApiResponse);
          }
        );
      });
    } else {
      result = await cloudinary.uploader.upload(fileToUpload, uploadOptions);
    }

    if (!result || !result.secure_url) {
      throw new Error('Cloudinary response did not contain a valid secure_url');
    }

    return {
      success: true,
      url: result.secure_url,
      secure_url: result.secure_url,
      public_id: result.public_id,
      resource_type: (result.resource_type as any) || determinedResourceType,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      duration: result.duration
    };
  } catch (err: any) {
    const cleanMsg = sanitizeCloudinaryError(err?.message || err);
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Cloudinary media upload failed: ${cleanMsg}. Local storage fallback is disabled in production.`);
    }
    console.warn(`[Cloudinary Upload Notice (${determinedResourceType})]: ${cleanMsg}. Falling back to local storage (/uploads/)...`);
    try {
      return saveMediaLocally({
        ...options,
        filePath: fileToUpload && fs.existsSync(fileToUpload) ? fileToUpload : options.filePath,
        resourceType: determinedResourceType
      });
    } catch (fallbackErr: any) {
      console.error(`[Local Storage Fallback Error]:`, fallbackErr);
      throw new Error(`Media upload failed: ${cleanMsg}`);
    }
  } finally {
    // Clean up temporary file created for buffer or multer
    if (fileToUpload && (tempCreated || cleanupTempFile) && fs.existsSync(fileToUpload)) {
      try {
        fs.unlinkSync(fileToUpload);
      } catch (unlinkErr) {
        // Ignore non-fatal unlink error
      }
    }
  }
}

/**
 * Migration helper:
 * Safely discovers local media stored in `public/uploads/`,
 * uploads each file to Cloudinary with the correct resource type,
 * verifies the upload, and updates all matching references in Firestore.
 * Does NOT delete the original local file until verified.
 */
export async function migrateLocalMediaToCloudinary(
  firestoreInstance: FirebaseFirestore.Firestore | null
): Promise<{
  totalDiscovered: number;
  uploadedCount: number;
  failedCount: number;
  skippedCount: number;
  updatedDocsCount: number;
  fileMap: Record<string, string>;
  errors: string[];
}> {
  const status = getCloudinaryStatus();
  if (!status.configured || !initCloudinary()) {
    throw new Error(
      'Cannot run Cloudinary media migration: Cloudinary is not configured. Please supply CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
    );
  }

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    return {
      totalDiscovered: 0,
      uploadedCount: 0,
      failedCount: 0,
      skippedCount: 0,
      updatedDocsCount: 0,
      fileMap: {},
      errors: []
    };
  }

  const files = fs.readdirSync(uploadsDir);
  const mediaFiles = files.filter(f => !f.startsWith('.') && fs.statSync(path.join(uploadsDir, f)).isFile());

  const fileMap: Record<string, string> = {}; // localRef e.g. "/uploads/xyz.jpg" -> cloudinary secure_url
  const errors: string[] = [];
  let uploadedCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  console.log(`[Media Migration] Starting Cloudinary media migration for ${mediaFiles.length} files in public/uploads/...`);

  for (const filename of mediaFiles) {
    const localRelPath = `/uploads/${filename}`;
    const fullPath = path.join(uploadsDir, filename);
    const ext = path.extname(filename).toLowerCase();
    const isVideo = /^\.(mp4|webm|mov|mkv|avi)$/i.test(ext);
    const subfolder = isVideo ? `${status.folder}/videos` : `${status.folder}/migrated`;

    try {
      console.log(`[Media Migration] Uploading ${filename} (${isVideo ? 'video' : 'image'}) to Cloudinary...`);
      const uploadRes = await uploadMediaToCloudinary({
        filePath: fullPath,
        originalName: filename,
        folder: subfolder,
        resourceType: isVideo ? 'video' : 'image',
        cleanupTempFile: false // Keep original local file safe during migration!
      });

      if (uploadRes.success && uploadRes.secure_url) {
        fileMap[localRelPath] = uploadRes.secure_url;
        fileMap[filename] = uploadRes.secure_url; // Map by raw filename too
        uploadedCount++;
        console.log(`[Media Migration] ✅ Migrated ${filename} -> ${uploadRes.secure_url}`);
      } else {
        failedCount++;
        errors.push(`Upload returned invalid response for ${filename}`);
      }
    } catch (migErr: any) {
      failedCount++;
      const cleanErr = sanitizeCloudinaryError(migErr?.message || migErr);
      errors.push(`${filename}: ${cleanErr}`);
      console.error(`[Media Migration] ❌ Error uploading ${filename}:`, cleanErr);
    }
  }

  let updatedDocsCount = 0;

  // Now update references in Firestore documents if Firestore is provided
  if (firestoreInstance && Object.keys(fileMap).length > 0) {
    console.log(`[Media Migration] Updating Firestore collections with ${Object.keys(fileMap).length} migrated media URLs...`);

    const collectionsToUpdate = ['products', 'banners', 'recipes', 'settings', 'reviews'];

    for (const col of collectionsToUpdate) {
      try {
        const snap = await firestoreInstance.collection(col).get();
        if (snap.empty) continue;

        for (const doc of snap.docs) {
          let dataStr = JSON.stringify(doc.data());
          let modified = false;

          for (const [localPath, cloudUrl] of Object.entries(fileMap)) {
            if (dataStr.includes(localPath)) {
              dataStr = dataStr.split(localPath).join(cloudUrl);
              modified = true;
            }
          }

          if (modified) {
            const updatedData = JSON.parse(dataStr);
            await firestoreInstance.collection(col).doc(doc.id).set(updatedData, { merge: true });
            updatedDocsCount++;
            console.log(`[Media Migration] Updated references in ${col}/${doc.id}`);
          }
        }
      } catch (colErr: any) {
        console.warn(`[Media Migration] Notice updating collection ${col}:`, colErr?.message);
      }
    }
  }

  console.log(
    `[Media Migration] Completed: ${uploadedCount} uploaded, ${failedCount} failed, ${updatedDocsCount} Firestore docs updated.`
  );

  return {
    totalDiscovered: mediaFiles.length,
    uploadedCount,
    failedCount,
    skippedCount,
    updatedDocsCount,
    fileMap,
    errors
  };
}
