import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  Video as VideoIcon,
  Upload,
  RefreshCw,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Save,
  ArrowRight,
  ShieldCheck,
  Flame,
  Activity,
  Layers
} from 'lucide-react';
import { Banner } from '../../../types';
import { api } from '../../../services/api';

interface HeroBannerManagerProps {
  token: string;
  heroBanner?: Banner;
  banners?: Banner[];
  onBannerSaved?: (banner: Banner) => void;
  onBannerUpdated?: (banner: Banner) => void;
  onShowSuccess: (msg: string) => void;
}

export const HeroBannerManager: React.FC<HeroBannerManagerProps> = ({
  token,
  heroBanner,
  banners = [],
  onBannerSaved,
  onBannerUpdated,
  onShowSuccess
}) => {
  const currentBanner = heroBanner || banners.find(b => b.type === 'hero') || banners[0];

  // Media Type: image or video
  const [mediaType, setMediaType] = useState<'image' | 'video'>(
    currentBanner?.media_type === 'video' ? 'video' : 'image'
  );

  // URLs & inputs
  const [mediaUrl, setMediaUrl] = useState(
    currentBanner?.media_url || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1600&auto=format&fit=crop&q=80'
  );
  const [fallbackImage, setFallbackImage] = useState(
    currentBanner?.fallback_image || currentBanner?.media_url || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1600&auto=format&fit=crop&q=80'
  );

  // Text details
  const [titleEn, setTitleEn] = useState(currentBanner?.title_en || 'From Nature to Your Kitchen — With Purity, Care & Tradition');
  const [titleKn, setTitleKn] = useState(currentBanner?.title_kn || 'ಪ್ರಕೃತಿಯಿಂದ ನಿಮ್ಮ ಅಡುಗೆಮನೆಗೆ — ಪರಿಶುದ್ಧತೆ, ಪ್ರೀತಿ ಮತ್ತು ಸಂಪ್ರದಾಯ');
  const [subtitleEn, setSubtitleEn] = useState(currentBanner?.subtitle_en || 'Handcrafted Karnataka spice blends, stone-ground with motherly love and authentic traditional recipes.');
  const [subtitleKn, setSubtitleKn] = useState(currentBanner?.subtitle_kn || 'ತಾಯಿಯ ಕೈರುಚಿಯಂತೆ, ಸಾಂಪ್ರದಾಯಿಕ ಕಲ್ಲಿನ ಬೀಸುವ ಪದ್ಧತಿಯಲ್ಲಿ ತಯಾರಿಸಲಾದ ಕರ್ನಾಟಕದ ಅಪ್ಪಟ ಮಸಾಲೆಗಳು.');
  const [badgeEn, setBadgeEn] = useState(currentBanner?.badge_en || 'Festival of Flavours • ಹಬ್ಬದ ಸಂಭ್ರಮ');
  const [badgeKn, setBadgeKn] = useState(currentBanner?.badge_kn || 'ಸುವಾಸನೆಗಳ ಹಬ್ಬ • ಪಾರಂಪರಿಕ ಮಸಾಲೆ');
  const [offerTextEn, setOfferTextEn] = useState(currentBanner?.offer_text_en || 'Festive Special: FREE Delivery on orders above ₹499 + Up to 25% OFF');
  const [offerTextKn, setOfferTextKn] = useState(currentBanner?.offer_text_kn || 'ವಿಶೇಷ ಹಬ್ಬದ ಕೊಡುಗೆ: ₹೪೯೯ ಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ಆರ್ಡರ್‌ಗಳಿಗೆ ಉಚಿತ ಡೆಲಿವರಿ + ೨೫% ವರೆಗೆ ರಿಯಾಯಿತಿ');
  const [primaryBtnEn, setPrimaryBtnEn] = useState(currentBanner?.primary_btn_text_en || 'Shop Pure Spices');
  const [secondaryBtnEn, setSecondaryBtnEn] = useState(currentBanner?.secondary_btn_text_en || 'View Combos & Offers');

  // Preview & Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [showLivePreviewModal, setShowLivePreviewModal] = useState(false);

  useEffect(() => {
    if (currentBanner) {
      setMediaType(currentBanner.media_type === 'video' ? 'video' : 'image');
      setMediaUrl(currentBanner.media_url || '');
      setFallbackImage(currentBanner.fallback_image || currentBanner.media_url || '');
      setTitleEn(currentBanner.title_en || '');
      setTitleKn(currentBanner.title_kn || '');
      setSubtitleEn(currentBanner.subtitle_en || '');
      setSubtitleKn(currentBanner.subtitle_kn || '');
      setBadgeEn(currentBanner.badge_en || '');
      setBadgeKn(currentBanner.badge_kn || '');
      setOfferTextEn(currentBanner.offer_text_en || '');
      setOfferTextKn(currentBanner.offer_text_kn || '');
      setPrimaryBtnEn(currentBanner.primary_btn_text_en || 'Shop Pure Spices');
      setSecondaryBtnEn(currentBanner.secondary_btn_text_en || 'View Combos & Offers');
    }
  }, [currentBanner?.id, currentBanner?.media_url, currentBanner?.title_en]);

  // Handle local file upload
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'media' | 'fallback') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await api.uploadMedia(token, file);
      if (res.success && res.url) {
        if (targetField === 'media') {
          setMediaUrl(res.url);
          setPreviewError(false);
          // If video file, set mediaType to video
          if (file.type.startsWith('video/')) {
            setMediaType('video');
          } else if (file.type.startsWith('image/')) {
            setMediaType('image');
            if (!fallbackImage) setFallbackImage(res.url);
          }
        } else {
          setFallbackImage(res.url);
        }
        onShowSuccess('File uploaded successfully!');
      } else {
        alert('Upload failed: ' + (res.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Upload error: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Save
  const handleSaveHeroBanner = async () => {
    if (!mediaUrl.trim()) {
      alert('Please provide a valid Image or Video URL or upload a file.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<Banner> = {
        id: heroBanner?.id || 'ban-hero-main',
        type: 'hero',
        media_type: mediaType,
        media_url: mediaUrl.trim(),
        fallback_image: (fallbackImage || mediaUrl).trim(),
        title_en: titleEn.trim(),
        title_kn: titleKn.trim(),
        subtitle_en: subtitleEn.trim(),
        subtitle_kn: subtitleKn.trim(),
        badge_en: badgeEn.trim(),
        badge_kn: badgeKn.trim(),
        offer_text_en: offerTextEn.trim(),
        offer_text_kn: offerTextKn.trim(),
        primary_btn_text_en: primaryBtnEn.trim(),
        primary_btn_text_kn: heroBanner?.primary_btn_text_kn || 'ಮಸಾಲೆಗಳನ್ನು ಖರೀದಿಸಿ',
        primary_btn_action: '#products-section',
        secondary_btn_text_en: secondaryBtnEn.trim(),
        secondary_btn_text_kn: heroBanner?.secondary_btn_text_kn || 'ಕೊಡುಗೆಗಳನ್ನು ನೋಡಿ',
        secondary_btn_action: '#offers-section',
        enabled: true
      };

      const res = await api.saveBanner(token, payload, !!currentBanner?.id);
      if (res.success && res.banner) {
        if (onBannerSaved) onBannerSaved(res.banner);
        if (onBannerUpdated) onBannerUpdated(res.banner);
        onShowSuccess('Hero Banner background & settings saved successfully! Homepage updated.');
      } else {
        alert('Failed to save banner: ' + (res.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Error saving banner: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveMedia = () => {
    if (confirm('Reset to default spice background image?')) {
      const defaultImg = 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1600&auto=format&fit=crop&q=80';
      setMediaUrl(defaultImg);
      setFallbackImage(defaultImg);
      setMediaType('image');
      setPreviewError(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner Control */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-zinc-100">
                  Hero Banner Background Management
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Control the visual background media (Image or Video) shown on the homepage "Festival of Flavours" hero section.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Active Status Badge */}
            <div className="px-3.5 py-1.5 rounded-full bg-zinc-950 border border-zinc-700/80 flex items-center space-x-2 text-xs">
              <span className="text-zinc-400 font-medium">Active Type:</span>
              <span className="font-bold text-amber-400 uppercase tracking-wider">
                {mediaType}
              </span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <button
              onClick={() => setShowLivePreviewModal(true)}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Full Preview</span>
            </button>

            <button
              onClick={handleSaveHeroBanner}
              disabled={isSaving || isUploading}
              id="hero-banner-save-btn"
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold text-xs shadow-md shadow-amber-950/40 flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save & Publish'}</span>
            </button>
          </div>
        </div>

        {/* 1. Background Type Switcher */}
        <div className="mt-6">
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
            1. Select Background Type
          </label>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <button
              type="button"
              onClick={() => {
                setMediaType('image');
                setPreviewError(false);
              }}
              className={`p-3.5 rounded-2xl border flex items-center space-x-3 transition-all cursor-pointer ${
                mediaType === 'image'
                  ? 'bg-amber-500/10 border-amber-500 text-amber-300 ring-1 ring-amber-500'
                  : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <ImageIcon className={`w-5 h-5 ${mediaType === 'image' ? 'text-amber-400' : 'text-zinc-500'}`} />
              <div className="text-left">
                <p className="text-xs font-bold">Image Background</p>
                <p className="text-[10px] text-zinc-500">High-res photos (JPG, PNG, WebP)</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setMediaType('video');
                setPreviewError(false);
              }}
              className={`p-3.5 rounded-2xl border flex items-center space-x-3 transition-all cursor-pointer ${
                mediaType === 'video'
                  ? 'bg-amber-500/10 border-amber-500 text-amber-300 ring-1 ring-amber-500'
                  : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <VideoIcon className={`w-5 h-5 ${mediaType === 'video' ? 'text-amber-400' : 'text-zinc-500'}`} />
              <div className="text-left">
                <p className="text-xs font-bold">Video Background</p>
                <p className="text-[10px] text-zinc-500">Autoplay looping muted MP4/WebM</p>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Media Upload & URL Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 pt-6 border-t border-zinc-800/80">
          {/* Left Column: Media Inputs & Upload */}
          <div className="lg:col-span-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                {mediaType === 'video' ? 'Hero Background Video' : 'Hero Background Image'}
              </label>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={mediaUrl}
                  onChange={e => {
                    setMediaUrl(e.target.value);
                    setPreviewError(false);
                  }}
                  placeholder={
                    mediaType === 'video'
                      ? 'https://example.com/spices-loop.mp4 or upload below'
                      : 'https://images.unsplash.com/... or upload below'
                  }
                  className="flex-1 px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-amber-500 font-mono"
                />

                <label className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center space-x-1.5 cursor-pointer shrink-0 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
                  <input
                    type="file"
                    accept={mediaType === 'video' ? 'video/mp4,video/webm,video/quicktime,image/*,.heic,.heif' : 'image/*,.heic,.heif,.jpg,.jpeg,.png,.webp,.svg'}
                    onChange={e => handleMediaUpload(e, 'media')}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                {mediaType === 'video'
                  ? 'Supports desktop & mobile friendly MP4 video clips. Video will autoplay on loop muted.'
                  : 'Supports high-resolution desktop and mobile-friendly photography.'}
              </p>
            </div>

            {/* Video Fallback Image Option (Shown if Video is selected) */}
            {mediaType === 'video' && (
              <div className="p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-300">
                    Fallback Poster Image (Required for mobile/slow networks)
                  </label>
                  <span className="text-[10px] text-amber-400 font-semibold">Recommended</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={fallbackImage}
                    onChange={e => setFallbackImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-amber-500 font-mono"
                  />
                  <label className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center space-x-1 cursor-pointer shrink-0">
                    <Upload className="w-3 h-3 text-amber-400" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*,.heic,.heif,.jpg,.jpeg,.png,.webp,.svg"
                      onChange={e => handleMediaUpload(e, 'fallback')}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
                <p className="text-[10px] text-zinc-500">
                  Displayed while the video is buffering or if the user's browser disables video autoplay.
                </p>
              </div>
            )}

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleRemoveMedia}
                className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-rose-900/50 hover:bg-rose-950/30 text-rose-400 text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset to Default Image</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMediaUrl('https://assets.mixkit.co/videos/preview/mixkit-curry-and-spices-cooking-in-a-pan-43405-large.mp4');
                  setMediaType('video');
                }}
                className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 text-zinc-400 text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Use Sample Video</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Media Preview */}
          <div className="lg:col-span-6">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Live Media Preview
              </label>
              <span className="text-[11px] text-zinc-500">
                Overlay simulation with text readability
              </span>
            </div>

            <div className="relative w-full h-64 rounded-2xl overflow-hidden border-2 border-zinc-800 bg-zinc-950 group">
              {mediaType === 'video' && !previewError ? (
                <video
                  key={mediaUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  onError={() => setPreviewError(true)}
                  poster={fallbackImage}
                  className="w-full h-full object-cover opacity-40 scale-105"
                >
                  <source src={mediaUrl} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={mediaUrl || fallbackImage}
                  alt="Hero Background Preview"
                  onError={() => setPreviewError(true)}
                  className="w-full h-full object-cover opacity-35 scale-105 transition-transform duration-700 group-hover:scale-110"
                />
              )}

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-zinc-950/70 to-zinc-900/40" />

              {/* Content Overlay */}
              <div className="absolute inset-0 p-5 flex flex-col justify-between z-10 pointer-events-none">
                <div className="inline-flex items-center space-x-1.5 bg-zinc-900/90 border border-amber-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-300 w-fit backdrop-blur-xs">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{badgeEn || 'Festival of Flavours'}</span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white leading-tight drop-shadow-sm">
                    {titleEn || 'Pure Karnataka Spices'}
                  </h3>
                  <p className="text-xs text-zinc-300 line-clamp-2 max-w-sm">
                    {subtitleEn}
                  </p>
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t border-zinc-800/60">
                  <span className="px-3 py-1.5 rounded-full bg-amber-600 text-white font-bold text-[10px] shadow-sm">
                    {primaryBtnEn} →
                  </span>
                  <span className="px-2.5 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-700 text-zinc-300 text-[10px]">
                    {secondaryBtnEn}
                  </span>
                </div>
              </div>

              {previewError && (
                <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center p-4 text-center z-20">
                  <AlertCircle className="w-6 h-6 text-amber-400 mb-2" />
                  <p className="text-xs text-zinc-200 font-bold">Could not load preview</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    Check if the URL is accessible or upload a local file directly.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Hero Text Customization Fields */}
        <div className="mt-8 pt-6 border-t border-zinc-800/80">
          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-4 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>3. Hero Headline & Action Copy (Bilingual English / Kannada)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Headline (English)</label>
              <input
                type="text"
                value={titleEn}
                onChange={e => setTitleEn(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Headline (Kannada)</label>
              <input
                type="text"
                value={titleKn}
                onChange={e => setTitleKn(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Subtitle (English)</label>
              <textarea
                rows={2}
                value={subtitleEn}
                onChange={e => setSubtitleEn(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-hidden focus:border-amber-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Subtitle (Kannada)</label>
              <textarea
                rows={2}
                value={subtitleKn}
                onChange={e => setSubtitleKn(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-hidden focus:border-amber-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Top Badge / Pill (English)</label>
              <input
                type="text"
                value={badgeEn}
                onChange={e => setBadgeEn(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Festive Offer Bento Strip (English)</label>
              <input
                type="text"
                value={offerTextEn}
                onChange={e => setOfferTextEn(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveHeroBanner}
              disabled={isSaving || isUploading}
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-950/50 flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save & Publish Hero Banner'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full Live Preview Modal */}
      {showLivePreviewModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowLivePreviewModal(false)}
        >
          <div
            className="relative bg-zinc-900 border border-zinc-800 rounded-3xl max-w-5xl w-full p-6 sm:p-8 overflow-hidden shadow-2xl space-y-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif text-lg font-bold text-white">
                  Homepage Hero Banner Live Preview
                </h3>
              </div>
              <button
                onClick={() => setShowLivePreviewModal(false)}
                className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold cursor-pointer"
              >
                Close Preview
              </button>
            </div>

            {/* Simulated Hero Bento Box */}
            <div className="bg-zinc-900/50 border border-zinc-800/90 rounded-3xl p-6 sm:p-10 relative overflow-hidden flex flex-col justify-between min-h-[460px] backdrop-blur-md">
              <div className="absolute inset-0 z-0 overflow-hidden">
                {mediaType === 'video' ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster={fallbackImage}
                    className="w-full h-full object-cover opacity-30 scale-105"
                  >
                    <source src={mediaUrl} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={mediaUrl}
                    alt="Hero Background"
                    className="w-full h-full object-cover opacity-25 scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-zinc-950/70 to-zinc-900/40" />
              </div>

              {/* Pill */}
              <div className="relative z-10 inline-flex items-center space-x-2 bg-zinc-900/90 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-300 w-fit">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>{badgeEn}</span>
              </div>

              {/* Title & Offer */}
              <div className="relative z-10 space-y-4 my-6">
                <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                  {titleEn}
                </h1>
                <p className="text-sm text-zinc-300 max-w-xl font-light">
                  {subtitleEn}
                </p>

                <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-3 max-w-md flex items-center space-x-3 shadow-inner">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <Flame className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-100">{offerTextEn}</p>
                    <p className="text-[10px] text-zinc-400">Use code INDIMA10 for extra 10% off at checkout</p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="relative z-10 pt-2 flex items-center justify-between border-t border-zinc-800/80">
                <div className="flex items-center space-x-3">
                  <button className="px-6 py-2.5 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center space-x-2">
                    <span>{primaryBtnEn}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button className="px-5 py-2.5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-200 font-semibold text-xs">
                    <span>{secondaryBtnEn}</span>
                  </button>
                </div>

                <div className="flex items-center space-x-3 text-[11px] text-zinc-400">
                  <span className="text-emerald-400 font-medium">✓ 100% Cold-Ground</span>
                  <span className="text-amber-400 font-medium">✓ Ancient Vedic Proof</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
