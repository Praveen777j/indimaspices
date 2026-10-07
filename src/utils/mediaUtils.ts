import { Banner } from '../types';

/**
 * Normalizes any media URL (Cloudinary, relative local upload, or external CDN)
 * ensuring it is safely consumable by <img> and <video> elements.
 */
export function normalizeMediaUrl(url?: string | null, fallback: string = ''): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return fallback;
  }
  const clean = url.trim();

  // Already a full HTTP/HTTPS URL or Data URI
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:')) {
    return clean;
  }

  // Root-relative path like /uploads/...
  if (clean.startsWith('/')) {
    return clean;
  }

  // Bare filename without leading slash
  return `/uploads/${clean}`;
}

/**
 * Robustly detects whether a media item is a video based on type or file signature.
 */
export function isVideoMedia(mediaType?: string | null, mediaUrl?: string | null): boolean {
  if (mediaType === 'video') return true;
  if (!mediaUrl || typeof mediaUrl !== 'string') return false;

  const clean = mediaUrl.toLowerCase().split('?')[0];
  return (
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.mov') ||
    clean.endsWith('.mkv') ||
    clean.endsWith('.m4v') ||
    clean.includes('/video/upload/') ||
    clean.includes('res.cloudinary.com/') && clean.includes('/video/')
  );
}

export interface NormalizedBannerContent {
  mediaUrl: string;
  isVideo: boolean;
  posterUrl: string;
  fallbackUrl: string;
  titleEn: string;
  titleKn: string;
  subtitleEn: string;
  subtitleKn: string;
  badgeEn: string;
  badgeKn: string;
  primaryBtnTextEn: string;
  primaryBtnTextKn: string;
  primaryBtnAction: string;
  secondaryBtnTextEn: string;
  secondaryBtnTextKn: string;
  secondaryBtnAction: string;
  offerTextEn: string;
  offerTextKn: string;
  enabled: boolean;
}

/**
 * Normalizes all legacy and modern Admin banner payload formats in ONE single location.
 */
export function normalizeBannerContent(banner?: Banner | null): NormalizedBannerContent {
  const defaultSpiceImage =
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1600&auto=format&fit=crop&q=80';

  if (!banner) {
    return {
      mediaUrl: defaultSpiceImage,
      isVideo: false,
      posterUrl: defaultSpiceImage,
      fallbackUrl: defaultSpiceImage,
      titleEn: 'Pure Homemade Spices, Stone-Ground with Love in Bengaluru',
      titleKn: 'ಕರ್ನಾಟಕದ ಮನೆ ಮನೆಗಳ ಸಾಂಪ್ರದಾಯಿಕ ಪರಿಶುದ್ಧ ಮಸಾಲೆಗಳು',
      subtitleEn: 'Hand-roasted spices with zero preservatives, colorants, or synthetic flavour enhancers. Freshly packed in Basavanagudi.',
      subtitleKn: 'ಯಾವುದೇ ರಾಸಾಯನಿಕ ಅಥವಾ ಕೃತಕ ಬಣ್ಣಗಳಿಲ್ಲದ, ಅಜ್ಜಿ ಮನೆಯ ಕೈರುಚಿಯ ಅಪ್ಪಟ ಸುವಾಸನೆ.',
      badgeEn: 'Three Decades of Experience',
      badgeKn: 'ಮೂರು ದಶಕಗಳ ಸುವಾಸನೆ',
      primaryBtnTextEn: 'Explore Pure Spices',
      primaryBtnTextKn: 'ಮಸಾಲೆಗಳನ್ನು ಖರೀದಿಸಿ',
      primaryBtnAction: '#products-section',
      secondaryBtnTextEn: 'View Festive Offers',
      secondaryBtnTextKn: 'ಕೊಡುಗೆಗಳನ್ನು ನೋಡಿ',
      secondaryBtnAction: '#offers-section',
      offerTextEn: 'Special Festive Offer: Flat 10% OFF • Code: INDIMA10',
      offerTextKn: 'ಹಬ್ಬದ ವಿಶೇಷ ರಿಯಾಯಿತಿ: 10% ರಿಯಾಯಿತಿ • ಕೋಡ್: INDIMA10',
      enabled: true
    };
  }

  // Support all legacy field names (media_url, url, imageUrl, image_url, etc.)
  const rawMediaUrl =
    banner.media_url ||
    (banner as any).url ||
    (banner as any).imageUrl ||
    (banner as any).image_url ||
    (banner as any).video_url ||
    '';

  const rawFallback =
    banner.fallback_image ||
    (banner as any).fallbackImage ||
    rawMediaUrl ||
    defaultSpiceImage;

  const normalizedMedia = normalizeMediaUrl(rawMediaUrl, defaultSpiceImage);
  const normalizedFallback = normalizeMediaUrl(rawFallback, defaultSpiceImage);
  const isVideo = isVideoMedia(banner.media_type, normalizedMedia);

  return {
    mediaUrl: normalizedMedia,
    isVideo,
    posterUrl: normalizedFallback,
    fallbackUrl: normalizedFallback,
    titleEn:
      banner.title_en ||
      (banner as any).title ||
      'Pure Homemade Spices, Stone-Ground with Love in Bengaluru',
    titleKn:
      banner.title_kn ||
      'ಕರ್ನಾಟಕದ ಮನೆ ಮನೆಗಳ ಸಾಂಪ್ರದಾಯಿಕ ಪರಿಶುದ್ಧ ಮಸಾಲೆಗಳು',
    subtitleEn:
      banner.subtitle_en ||
      (banner as any).subtitle ||
      'Hand-roasted spices with zero preservatives, colorants, or synthetic flavour enhancers. Freshly packed in Basavanagudi.',
    subtitleKn:
      banner.subtitle_kn ||
      'ಯಾವುದೇ ರಾಸಾಯನಿಕ ಅಥವಾ ಕೃತಕ ಬಣ್ಣಗಳಿಲ್ಲದ, ಅಜ್ಜಿ ಮನೆಯ ಕೈರುಚಿಯ ಅಪ್ಪಟ ಸುವಾಸನೆ.',
    badgeEn:
      banner.badge_en ||
      (banner as any).badge ||
      'Three Decades of Experience',
    badgeKn:
      banner.badge_kn ||
      'ಮೂರು ದಶಕಗಳ ಸುವಾಸನೆ',
    primaryBtnTextEn:
      banner.primary_btn_text_en ||
      'Explore Pure Spices',
    primaryBtnTextKn:
      banner.primary_btn_text_kn ||
      'ಮಸಾಲೆಗಳನ್ನು ಖರೀದಿಸಿ',
    primaryBtnAction:
      banner.primary_btn_action ||
      '#products-section',
    secondaryBtnTextEn:
      banner.secondary_btn_text_en ||
      'View Festive Offers',
    secondaryBtnTextKn:
      banner.secondary_btn_text_kn ||
      'ಕೊಡುಗೆಗಳನ್ನು ನೋಡಿ',
    secondaryBtnAction:
      banner.secondary_btn_action ||
      '#offers-section',
    offerTextEn:
      banner.offer_text_en ||
      '',
    offerTextKn:
      banner.offer_text_kn ||
      '',
    enabled: banner.enabled !== false && (banner as any).active !== false
  };
}
