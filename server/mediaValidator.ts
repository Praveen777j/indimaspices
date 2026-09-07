import fs from 'fs';
import path from 'path';

export interface DetectedMedia {
  format: 'jpeg' | 'png' | 'webp' | 'heic' | 'gif' | 'svg' | 'bmp' | 'tiff' | 'mp4' | 'mov' | 'webm' | 'mkv' | 'unknown';
  mime: string | null;
  category: 'image' | 'video' | 'unknown';
}

export interface ValidationResult {
  valid: boolean;
  detected: DetectedMedia;
  error?: string;
}

/**
 * Inspects binary magic bytes and container box structures from a buffer (or first chunk of file).
 */
export function detectMediaFromBuffer(buffer: Buffer): DetectedMedia {
  if (!buffer || buffer.length < 4) {
    return { format: 'unknown', mime: null, category: 'unknown' };
  }

  // 1. JPEG: FF D8 FF
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { format: 'jpeg', mime: 'image/jpeg', category: 'image' };
  }

  // 2. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { format: 'png', mime: 'image/png', category: 'image' };
  }

  // 3. WebP: RIFF (bytes 0..3) + WEBP (bytes 8..11)
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { format: 'webp', mime: 'image/webp', category: 'image' };
  }

  // 4. GIF: GIF87a or GIF89a
  if (
    buffer.length >= 6 &&
    (buffer.subarray(0, 6).toString('ascii') === 'GIF87a' ||
      buffer.subarray(0, 6).toString('ascii') === 'GIF89a')
  ) {
    return { format: 'gif', mime: 'image/gif', category: 'image' };
  }

  // 5. BMP: 42 4D ("BM")
  if (buffer.length >= 2 && buffer[0] === 0x42 && buffer[1] === 0x4d) {
    return { format: 'bmp', mime: 'image/bmp', category: 'image' };
  }

  // 6. TIFF: 49 49 2A 00 (little endian) or 4D 4D 00 2A (big endian)
  if (
    buffer.length >= 4 &&
    ((buffer[0] === 0x49 && buffer[1] === 0x49 && buffer[2] === 0x2a && buffer[3] === 0x00) ||
      (buffer[0] === 0x4d && buffer[1] === 0x4d && buffer[2] === 0x00 && buffer[3] === 0x2a))
  ) {
    return { format: 'tiff', mime: 'image/tiff', category: 'image' };
  }

  // 7. ISOBMFF Containers: MP4, QuickTime MOV, HEIC/HEIF
  // Format: 4-byte box size, 4-byte box type 'ftyp'
  if (buffer.length >= 12 && buffer.subarray(4, 8).toString('ascii') === 'ftyp') {
    const majorBrand = buffer.subarray(8, 12).toString('ascii');
    // Check up to the first 64 bytes for compatible brands list
    const ftypSlice = buffer.subarray(8, Math.min(buffer.length, 64)).toString('ascii');

    // HEIC/HEIF brands: heic, heix, hevc, hevx, heim, heis, mif1, msf1
    if (/heic|heix|hevc|hevx|heim|heis|mif1|msf1/i.test(ftypSlice)) {
      return { format: 'heic', mime: 'image/heic', category: 'image' };
    }

    // QuickTime MOV brand: qt
    if (majorBrand === 'qt  ' || /qt\s\s/i.test(ftypSlice)) {
      return { format: 'mov', mime: 'video/quicktime', category: 'video' };
    }

    // MP4 brands: isom, iso2, mp41, mp42, M4V, dash, avc1, mp71, iso6, etc.
    if (/isom|iso2|mp41|mp42|m4v|dash|avc1|mp71|iso6/i.test(ftypSlice)) {
      return { format: 'mp4', mime: 'video/mp4', category: 'video' };
    }

    // Default ISOBMFF container fallback is MP4 video
    return { format: 'mp4', mime: 'video/mp4', category: 'video' };
  }

  // QuickTime MOV without leading ftyp box (atom header moov, mdat, wide, free, skip)
  if (buffer.length >= 8) {
    const atomType = buffer.subarray(4, 8).toString('ascii');
    if (['moov', 'mdat', 'wide', 'free', 'skip'].includes(atomType)) {
      return { format: 'mov', mime: 'video/quicktime', category: 'video' };
    }
  }

  // 8. EBML Container: WebM or Matroska (MKV)
  // Starts with 0x1A 0x45 0xDF 0xA3
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x1a &&
    buffer[1] === 0x45 &&
    buffer[2] === 0xdf &&
    buffer[3] === 0xa3
  ) {
    // Check EBML DocType in the header slice (up to 256 bytes)
    const headerSample = buffer.subarray(0, Math.min(buffer.length, 256)).toString('ascii');
    if (headerSample.includes('webm')) {
      return { format: 'webm', mime: 'video/webm', category: 'video' };
    }
    if (headerSample.includes('matroska')) {
      return { format: 'mkv', mime: 'video/x-matroska', category: 'video' };
    }
    return { format: 'webm', mime: 'video/webm', category: 'video' };
  }

  // 9. SVG Inspection: text-based XML
  const textSample = buffer.subarray(0, Math.min(buffer.length, 1024)).toString('utf8');
  if (/<svg[\s>]/i.test(textSample)) {
    return { format: 'svg', mime: 'image/svg+xml', category: 'image' };
  }

  return { format: 'unknown', mime: null, category: 'unknown' };
}

/**
 * Validates that an uploaded file or buffer matches allowed formats, extension, and MIME type.
 * Ensures the file's binary magic bytes match the claimed extension and MIME.
 */
export function validateMediaContent(
  bufferOrPath: Buffer | string,
  declaredMime: string,
  declaredOriginalName: string,
  options: {
    allowedCategories?: Array<'image' | 'video'>;
    allowedFormats?: string[];
    allowSvg?: boolean;
    requireMatchMimeAndExt?: boolean;
  } = {}
): ValidationResult {
  const ext = (path.extname(declaredOriginalName || '') || '').toLowerCase();
  const mime = (declaredMime || '').toLowerCase();

  let headerBuffer: Buffer;
  let fullBuffer: Buffer | null = null;

  if (Buffer.isBuffer(bufferOrPath)) {
    headerBuffer = bufferOrPath.subarray(0, Math.min(bufferOrPath.length, 4096));
    fullBuffer = bufferOrPath;
  } else {
    if (!fs.existsSync(bufferOrPath)) {
      return {
        valid: false,
        detected: { format: 'unknown', mime: null, category: 'unknown' },
        error: 'Uploaded media file does not exist on disk'
      };
    }
    const fd = fs.openSync(bufferOrPath, 'r');
    try {
      const tempBuf = Buffer.alloc(4096);
      const bytesRead = fs.readSync(fd, tempBuf, 0, 4096, 0);
      headerBuffer = tempBuf.subarray(0, bytesRead);
    } finally {
      fs.closeSync(fd);
    }
  }

  // Detect signature from the header bytes
  const detected = detectMediaFromBuffer(headerBuffer);

  if (detected.format === 'unknown') {
    return {
      valid: false,
      detected,
      error: `Invalid file content: The uploaded file has no recognized image or video signature (detected raw or corrupt content).`
    };
  }

  // Check allowed categories (image, video)
  const allowedCategories = options.allowedCategories || ['image', 'video'];
  if (detected.category === 'unknown' || !allowedCategories.includes(detected.category)) {
    return {
      valid: false,
      detected,
      error: `Unauthorized media category: Uploads of type ${detected.category} are not permitted.`
    };
  }

  // Check SVG policy
  if (detected.format === 'svg') {
    if (!options.allowSvg) {
      return {
        valid: false,
        detected,
        error: 'SVG uploads are not permitted for this endpoint.'
      };
    }

    // Read full content if SVG to perform strict security sanitizer check
    const fullText = fullBuffer
      ? fullBuffer.toString('utf8')
      : fs.readFileSync(bufferOrPath as string, 'utf8');

    // Strict SVG anti-XSS check
    if (
      /<script|onload\s*=|onerror\s*=|onclick\s*=|onmouseover\s*=|javascript:|<foreignObject|<iframe|<embed|<object/i.test(
        fullText
      )
    ) {
      return {
        valid: false,
        detected,
        error: 'SVG contains potentially executable script content or dangerous embedded objects and was rejected.'
      };
    }
  }

  // Check allowed formats list if specified
  if (options.allowedFormats && options.allowedFormats.length > 0) {
    if (!options.allowedFormats.includes(detected.format)) {
      return {
        valid: false,
        detected,
        error: `File format ${detected.format.toUpperCase()} is not allowed. Allowed formats: ${options.allowedFormats.join(', ')}.`
      };
    }
  }

  // Verify consistency between extension and detected format
  const formatExtMap: Record<string, string[]> = {
    jpeg: ['.jpg', '.jpeg'],
    png: ['.png'],
    webp: ['.webp'],
    gif: ['.gif'],
    heic: ['.heic', '.heif'],
    mp4: ['.mp4', '.m4v'],
    mov: ['.mov', '.mp4'], // QuickTime containers can be .mov or .mp4
    webm: ['.webm'],
    mkv: ['.mkv'],
    svg: ['.svg'],
    bmp: ['.bmp'],
    tiff: ['.tif', '.tiff']
  };

  const expectedExts = formatExtMap[detected.format];
  if (expectedExts && !expectedExts.includes(ext)) {
    return {
      valid: false,
      detected,
      error: `File extension mismatch: The file content is a ${detected.format.toUpperCase()} file, but the extension is "${ext}".`
    };
  }

  // Verify consistency between MIME and detected format
  const formatMimeMap: Record<string, string[]> = {
    jpeg: ['image/jpeg', 'image/pjpeg', 'image/jpg'],
    png: ['image/png'],
    webp: ['image/webp'],
    gif: ['image/gif'],
    heic: ['image/heic', 'image/heif'],
    mp4: ['video/mp4'],
    mov: ['video/quicktime', 'video/mp4'],
    webm: ['video/webm'],
    mkv: ['video/x-matroska', 'video/mkv'],
    svg: ['image/svg+xml', 'image/svg'],
    bmp: ['image/bmp'],
    tiff: ['image/tiff']
  };

  const expectedMimes = formatMimeMap[detected.format];
  if (expectedMimes && mime && !expectedMimes.includes(mime)) {
    return {
      valid: false,
      detected,
      error: `MIME type mismatch: Declared MIME type "${mime}" does not match the actual file signature (${detected.mime}).`
    };
  }

  return {
    valid: true,
    detected
  };
}
