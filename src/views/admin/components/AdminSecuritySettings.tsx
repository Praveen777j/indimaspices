import React, { useState, useEffect } from 'react';
import {
  Lock,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Save,
  Sparkles,
  QrCode,
  Upload,
  Trash2,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import { BusinessSettings } from '../../../types';
import { api } from '../../../services/api';

interface AdminSecuritySettingsProps {
  token: string;
  settings?: BusinessSettings | null;
  onSettingsUpdated?: (updated: BusinessSettings) => void;
  onShowSuccess?: (msg: string) => void;
}

export const AdminSecuritySettings: React.FC<AdminSecuritySettingsProps> = ({
  token,
  settings,
  onSettingsUpdated,
  onShowSuccess
}) => {
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Business & Contact Settings State
  const [businessName, setBusinessName] = useState(settings?.business_name || 'Indima Spice Co.');
  const [logoUrl, setLogoUrl] = useState(settings?.logo_url || '/indima-logo.svg');
  const [phone, setPhone] = useState(settings?.phone || '+91 98450 12345');
  const [whatsappNumber, setWhatsappNumber] = useState(settings?.whatsapp_number || '919845012345');
  const [email, setEmail] = useState(settings?.email || 'care@indimaspice.com');
  const [address, setAddress] = useState(settings?.address || '#42, Traditional Kitchen Heritage Lane, Bull Temple Road, Basavanagudi, Bengaluru, Karnataka - 560004');
  
  // Payment & QR Code State
  const [upiId, setUpiId] = useState(settings?.upi_id || 'indimaspice@okaxis');
  const [upiMerchantName, setUpiMerchantName] = useState(settings?.upi_merchant_name || 'Indima Spice Co.');
  const [upiQrCodeUrl, setUpiQrCodeUrl] = useState(settings?.upi_qr_code_url || '');
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(settings?.free_delivery_threshold || 499);
  const [shippingFee, setShippingFee] = useState(settings?.standard_shipping_fee || 49);

  // Social Media State
  const [instagramUrl, setInstagramUrl] = useState(settings?.instagram_url || 'https://instagram.com/indimaspiceco');
  const [facebookUrl, setFacebookUrl] = useState(settings?.facebook_url || 'https://facebook.com/indimaspiceco');
  const [youtubeUrl, setYoutubeUrl] = useState(settings?.youtube_url || 'https://youtube.com/@indimaspiceco');
  const [twitterUrl, setTwitterUrl] = useState(settings?.twitter_url || 'https://twitter.com/indimaspiceco');

  // Taglines & Spiritual Identity
  const [taglineSa, setTaglineSa] = useState(
    settings?.tagline_sa || 'आयुर्वेदोऽमृतानाम् • शुद्धं सात्त्वಿಕಂ दिव्यम्'
  );
  const [taglineEn, setTaglineEn] = useState(settings?.tagline_en || "Pure as mother's love");
  const [taglineKn, setTaglineKn] = useState(settings?.tagline_kn || 'ತಾಯಿಯ ಪ್ರೀತಿಯಷ್ಟೇ ಪರಿಶುದ್ಧ');
  
  // Policies & Messaging
  const [defaultWhatsappMsgEn, setDefaultWhatsappMsgEn] = useState(settings?.default_whatsapp_msg_en || 'Namaskara Indima Spice Co! I would like to inquire about your traditional pure spices.');
  const [defaultWhatsappMsgKn, setDefaultWhatsappMsgKn] = useState(settings?.default_whatsapp_msg_kn || 'ನಮಸ್ಕಾರ ಇಂದಿಮಾ ಸ್ಪೈಸ್ ಕಂ! ನಿಮ್ಮ ಸಾಂಪ್ರದಾಯಿಕ ಮಸಾಲೆಗಳ ಬಗ್ಗೆ ವಿಚಾರಿಸಬೇಕಾಗಿದೆ.');
  const [policyShippingEn, setPolicyShippingEn] = useState(settings?.policy_shipping_en || '');
  const [policyRefundEn, setPolicyRefundEn] = useState(settings?.policy_refund_en || '');

  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  const [isUploadingQr, setIsUploadingQr] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Synchronize when settings object is loaded / updated
  useEffect(() => {
    if (settings) {
      if (settings.business_name !== undefined) setBusinessName(settings.business_name);
      if (settings.logo_url !== undefined) setLogoUrl(settings.logo_url);
      if (settings.phone !== undefined) setPhone(settings.phone);
      if (settings.whatsapp_number !== undefined) setWhatsappNumber(settings.whatsapp_number);
      if (settings.email !== undefined) setEmail(settings.email);
      if (settings.address !== undefined) setAddress(settings.address);
      if (settings.upi_id !== undefined) setUpiId(settings.upi_id);
      if (settings.upi_merchant_name !== undefined) setUpiMerchantName(settings.upi_merchant_name);
      if (settings.upi_qr_code_url !== undefined) setUpiQrCodeUrl(settings.upi_qr_code_url);
      if (settings.free_delivery_threshold !== undefined) setFreeDeliveryThreshold(settings.free_delivery_threshold);
      if (settings.standard_shipping_fee !== undefined) setShippingFee(settings.standard_shipping_fee);
      if (settings.instagram_url !== undefined) setInstagramUrl(settings.instagram_url);
      if (settings.facebook_url !== undefined) setFacebookUrl(settings.facebook_url);
      if (settings.youtube_url !== undefined) setYoutubeUrl(settings.youtube_url);
      if (settings.twitter_url !== undefined) setTwitterUrl(settings.twitter_url);
      if (settings.tagline_sa !== undefined) setTaglineSa(settings.tagline_sa);
      if (settings.tagline_en !== undefined) setTaglineEn(settings.tagline_en);
      if (settings.tagline_kn !== undefined) setTaglineKn(settings.tagline_kn);
      if (settings.default_whatsapp_msg_en !== undefined) setDefaultWhatsappMsgEn(settings.default_whatsapp_msg_en);
      if (settings.default_whatsapp_msg_kn !== undefined) setDefaultWhatsappMsgKn(settings.default_whatsapp_msg_kn);
      if (settings.policy_shipping_en !== undefined) setPolicyShippingEn(settings.policy_shipping_en);
      if (settings.policy_refund_en !== undefined) setPolicyRefundEn(settings.policy_refund_en);
    }
  }, [settings]);

  // Handle password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword.trim()) {
      setPasswordError('Please enter your current admin password');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match');
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await api.changeAdminPassword(token, {
        current_password: currentPassword.trim(),
        new_password: newPassword.trim()
      });

      if (res.success) {
        setPasswordSuccess('Admin master password successfully updated!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        if (onShowSuccess) {
          onShowSuccess('Admin master password updated securely!');
        }
      } else {
        setPasswordError(res.error || 'Failed to change password. Please check your current password.');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Error communicating with server');
    } finally {
      setIsChangingPass(false);
    }
  };

  // Upload QR Code
  const handleQrUpload = async (file: File) => {
    setIsUploadingQr(true);
    try {
      const res = await api.uploadMedia(token, file);
      if (res.success && res.url) {
        setUpiQrCodeUrl(res.url);
        // Persist immediately to db.json
        const updateRes = await api.updateSettings(token, { upi_qr_code_url: res.url });
        if (updateRes.success && updateRes.settings && onSettingsUpdated) {
          onSettingsUpdated(updateRes.settings);
        }
        if (onShowSuccess) {
          onShowSuccess('Payment QR code uploaded and permanently saved!');
        }
      } else {
        alert('Failed to upload QR code: ' + (res.error || 'Upload error'));
      }
    } catch (err: any) {
      alert('Error uploading file: ' + err.message);
    } finally {
      setIsUploadingQr(false);
    }
  };

  // Upload Logo
  const handleLogoUpload = async (file: File) => {
    setIsUploadingLogo(true);
    try {
      const res = await api.uploadMedia(token, file);
      if (res.success && res.url) {
        setLogoUrl(res.url);
        // Persist immediately to db.json
        const updateRes = await api.updateSettings(token, { logo_url: res.url });
        if (updateRes.success && updateRes.settings && onSettingsUpdated) {
          onSettingsUpdated(updateRes.settings);
        }
        if (onShowSuccess) {
          onShowSuccess('Brand logo image uploaded and permanently saved!');
        }
      } else {
        alert('Failed to upload logo: ' + (res.error || 'Upload error'));
      }
    } catch (err: any) {
      alert('Error uploading logo: ' + err.message);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Remove QR Code with persistence
  const handleRemoveQrCode = async () => {
    setUpiQrCodeUrl('');
    try {
      const updateRes = await api.updateSettings(token, { upi_qr_code_url: '' });
      if (updateRes.success && updateRes.settings && onSettingsUpdated) {
        onSettingsUpdated(updateRes.settings);
      }
      if (onShowSuccess) {
        onShowSuccess('Custom QR code removed; store will use auto dynamic QR.');
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  // Handle general settings save
  const handleSaveGeneralSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGeneral(true);
    try {
      const updates: Partial<BusinessSettings> = {
        business_name: businessName.trim(),
        logo_url: logoUrl.trim(),
        phone: phone.trim(),
        whatsapp_number: whatsappNumber.trim(),
        email: email.trim(),
        address: address.trim(),
        upi_id: upiId.trim(),
        upi_merchant_name: upiMerchantName.trim(),
        upi_qr_code_url: upiQrCodeUrl.trim(),
        free_delivery_threshold: Number(freeDeliveryThreshold),
        standard_shipping_fee: Number(shippingFee),
        instagram_url: instagramUrl.trim(),
        facebook_url: facebookUrl.trim(),
        youtube_url: youtubeUrl.trim(),
        twitter_url: twitterUrl.trim(),
        tagline_sa: taglineSa.trim(),
        tagline_en: taglineEn.trim(),
        tagline_kn: taglineKn.trim(),
        default_whatsapp_msg_en: defaultWhatsappMsgEn.trim(),
        default_whatsapp_msg_kn: defaultWhatsappMsgKn.trim(),
        policy_shipping_en: policyShippingEn.trim(),
        policy_refund_en: policyRefundEn.trim()
      };

      const res = await api.updateSettings(token, updates);
      if (res.success && res.settings) {
        if (onSettingsUpdated) {
          onSettingsUpdated(res.settings);
        }
        if (onShowSuccess) {
          onShowSuccess('Store settings, payment QR code, contact & social links updated successfully!');
        }
      } else {
        alert('Failed to update settings: ' + (res.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Error updating settings: ' + err.message);
    } finally {
      setIsSavingGeneral(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* 1. Admin Password & Security Section */}
      <div className="bg-white border border-[#DFC7A2] rounded-3xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 pb-5 border-b border-[#F0E6D2]">
          <div className="p-2.5 rounded-2xl bg-[#FAF3E0] border border-[#DFC7A2] text-[#993300]">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-[#2C1810]">
              Admin Master Password & Access Security
            </h3>
            <p className="text-xs text-[#5C4535] mt-0.5">
              Change the master password required to access this admin panel. Persisted securely in encrypted storage.
            </p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="mt-6 max-w-xl space-y-4">
          {passwordError && (
            <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-[#B91C1C] shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2C1810] mb-1">
                Admin Username
              </label>
              <input
                type="text"
                disabled
                value="admin"
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF6EE] border border-[#DFC7A2] rounded-xl text-[#5C4535] font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2C1810] mb-1">
                Current Password *
              </label>
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-[#FAF6EE] border border-[#DFC7A2] rounded-xl text-[#2C1810] placeholder-[#8C6D53]/60 focus:outline-hidden focus:border-[#993300] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C6D53] hover:text-[#2C1810] cursor-pointer"
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2C1810] mb-1">
                New Master Password * (Min 6 chars)
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-[#FAF6EE] border border-[#DFC7A2] rounded-xl text-[#2C1810] placeholder-[#8C6D53]/60 focus:outline-hidden focus:border-[#993300] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C6D53] hover:text-[#2C1810] cursor-pointer"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2C1810] mb-1">
                Confirm New Password *
              </label>
              <input
                type={showNewPass ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF6EE] border border-[#DFC7A2] rounded-xl text-[#2C1810] placeholder-[#8C6D53]/60 focus:outline-hidden focus:border-[#993300] font-mono"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isChangingPass}
              id="change-admin-password-btn"
              className="px-5 py-2.5 rounded-xl bg-[#993300] hover:bg-[#7A1F1D] text-white font-bold text-xs shadow-sm flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isChangingPass ? 'Updating Password...' : 'Update Admin Password'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveGeneralSettings} className="space-y-8">
        {/* 2. UPI Payment & Custom QR Code Section */}
        <div className="bg-white border border-[#DFC7A2] rounded-3xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 pb-5 border-b border-[#F0E6D2]">
            <div className="p-2.5 rounded-2xl bg-[#FAF3E0] border border-[#DFC7A2] text-[#993300]">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#2C1810]">
                UPI Payment Gateway & Merchant QR Code
              </h3>
              <p className="text-xs text-[#5C4535] mt-0.5">
                Configure your receiver UPI ID, Merchant name, and upload your official merchant QR code (PhonePe, Google Pay, Paytm, or BHIM standee).
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Left 2 Cols: UPI ID & Merchant details */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2C1810] mb-1">
                    Receiver UPI ID (VPA) *
                  </label>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    placeholder="e.g. indimaspice@okaxis"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF6EE] border border-[#DFC7A2] rounded-xl text-[#2C1810] font-mono font-bold focus:outline-hidden focus:border-[#993300]"
                  />
                  <p className="text-[10px] text-[#5C4535] mt-1">
                    Customers can transfer to this UPI ID or scan QR.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C1810] mb-1">
                    Merchant / Payee Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={upiMerchantName}
                    onChange={e => setUpiMerchantName(e.target.value)}
                    placeholder="e.g. Indima Spice Co."
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF6EE] border border-[#DFC7A2] rounded-xl text-[#2C1810] focus:outline-hidden focus:border-[#993300]"
                  />
                  <p className="text-[10px] text-[#5C4535] mt-1">
                    Name displayed on UPI apps (GPay / PhonePe / Paytm).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2C1810] mb-1">
                    Free Delivery Minimum Order (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={freeDeliveryThreshold}
                    onChange={e => setFreeDeliveryThreshold(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF6EE] border border-[#DFC7A2] rounded-xl text-[#2C1810] font-mono focus:outline-hidden focus:border-[#993300]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C1810] mb-1">
                    Standard Shipping Fee (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={shippingFee}
                    onChange={e => setShippingFee(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF6EE] border border-[#DFC7A2] rounded-xl text-[#2C1810] font-mono focus:outline-hidden focus:border-[#993300]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C1810] mb-1">
                  Custom Merchant QR Code URL (Optional)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={upiQrCodeUrl}
                    onChange={e => setUpiQrCodeUrl(e.target.value)}
                    placeholder="Upload image or paste direct image URL"
                    className="flex-1 px-3.5 py-2.5 text-xs bg-[#FAF6EE] border border-[#DFC7A2] rounded-xl text-[#2C1810] focus:outline-hidden focus:border-[#993300]"
                  />
                  <label className="px-4 py-2.5 bg-[#993300] hover:bg-[#802B00] text-white text-xs font-bold rounded-xl cursor-pointer flex items-center space-x-1.5 transition-colors shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingQr ? 'Uploading...' : 'Upload QR Image'}</span>
                    <input
                      type="file"
                      accept="image/*,.heic,.heif,.jpg,.jpeg,.png,.webp,.svg"
                      className="hidden"
                      onChange={e => {
                        if (e.target.files?.[0]) {
                          handleQrUpload(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Right Col: QR Code Preview Card */}
            <div className="bg-[#FAF6EE] border border-[#DFC7A2] rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-3">
              <span className="text-xs font-bold text-[#993300] uppercase tracking-wider">
                Storefront Payment QR Preview
              </span>

              {upiQrCodeUrl ? (
                <div className="relative group">
                  <img
                    src={upiQrCodeUrl}
                    alt="Merchant UPI QR Code"
                    className="w-44 h-44 object-contain rounded-xl border border-[#D9C4A2] bg-white p-2 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveQrCode}
                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg shadow-sm cursor-pointer transition-transform hover:scale-105"
                    title="Remove custom QR"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="w-44 h-44 border-2 border-dashed border-[#DFC7A2] rounded-xl bg-white flex flex-col items-center justify-center p-4 text-neutral-400">
                  <QrCode className="w-10 h-10 text-neutral-300 mb-1" />
                  <p className="text-[11px] font-medium text-neutral-500">Auto Dynamic QR</p>
                  <p className="text-[9px] text-neutral-400">Generated dynamically from UPI ID: {upiId}</p>
                </div>
              )}

              <p className="text-[11px] text-[#5C4535]">
                {upiQrCodeUrl
                  ? 'Custom standee QR is active. Customers will see your official QR in checkout.'
                  : 'No custom QR uploaded. Store will auto-generate dynamic QR with exact order amount.'}
              </p>
            </div>
          </div>
        </div>

        {/* 3. Contact Numbers & WhatsApp Communication */}
        <div className="bg-white border border-[#DFC7A2] rounded-3xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 pb-5 border-b border-[#F0E6D2]">
            <div className="p-2.5 rounded-2xl bg-[#FAF3E0] border border-[#DFC7A2] text-[#993300]">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#2C1810]">
                Contact Numbers, WhatsApp & Physical Address
              </h3>
              <p className="text-xs text-[#5C4535] mt-0.5">
                All numbers and addresses immediately update live across the storefront header, footer, checkout, and WhatsApp floating widget.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2C1810] mb-1">
                  Customer Support Calling Phone *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98450 12345"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#FAF6EE] border border-[#DFC7A2] rounded-xl text-[#2C1810] font-mono focus:outline-hidden focus:border-[#993300]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C1810] mb-1">
                  WhatsApp Support & Order Number *
                </label>
                <div className="relative">
                  <MessageCircle className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={whatsappNumber}
                    onChange={e => setWhatsappNumber(e.target.value)}
                    placeholder="919845012345"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#FAF6EE] border border-[#DFC7A2] rounded-xl text-[#2C1810] font-mono font-bold focus:outline-hidden focus:border-[#993300]"
                  />
                </div>
                <p className="text-[10px] text-[#5C4535] mt-1">
                  Country code + 10 digits (e.g. 919845012345)
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C1810] mb-1">
                  Official Support Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="care@indimaspice.com"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#FAF6EE] border border-[#DFC7A2] rounded-xl text-[#2C1810] focus:outline-hidden focus:border-[#993300]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2C1810] mb-1">
                Store Registered Physical Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#993300] absolute left-3 top-3" />
                <textarea
                  rows={2}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Street, Landmark, City, State, Pincode"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#FAF6EE] border border-[#DFC7A2] rounded-xl text-[#2C1810] focus:outline-hidden focus:border-[#993300]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#2C1810] mb-1">
                  Default WhatsApp Message (English)
                </label>
                <input
                  type="text"
                  value={defaultWhatsappMsgEn}
                  onChange={e => setDefaultWhatsappMsgEn(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF6EE] border border-[#DFC7A2] rounded-xl text-[#2C1810] focus:outline-hidden focus:border-[#993300]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#2C1810] mb-1">
                  Default WhatsApp Message (Kannada)
                </label>
                <input
                  type="text"
                  value={defaultWhatsappMsgKn}
                  onChange={e => setDefaultWhatsappMsgKn(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF6EE] border border-[#DFC7A2] rounded-xl text-[#2C1810] font-serif focus:outline-hidden focus:border-[#993300]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Social Media Links */}
        <div className="bg-white border border-[#DFC7A2] rounded-3xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 pb-5 border-b border-[#F0E6D2]">
            <div className="p-2.5 rounded-2xl bg-[#FAF3E0] border border-[#DFC7A2] text-[#993300]">
              <Instagram className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#2C1810]">
                Social Media Channels & Handles
              </h3>
              <p className="text-xs text-[#5C4535] mt-0.5">
                Connected social icons appear in the storefront footer and contact sections.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2C1810] mb-1 flex items-center space-x-1.5">
                <Instagram className="w-3.5 h-3.5 text-pink-600" />
                <span>Instagram Profile URL</span>
              </label>
              <input
                type="url"
                value={instagramUrl}
                onChange={e => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/yourhandle"
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF6EE] border border-[#DFC7A2] rounded-xl text-[#2C1810] focus:outline-hidden focus:border-[#993300]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2C1810] mb-1 flex items-center space-x-1.5">
                <Facebook className="w-3.5 h-3.5 text-blue-600" />
                <span>Facebook Page URL</span>
              </label>
              <input
                type="url"
                value={facebookUrl}
                onChange={e => setFacebookUrl(e.target.value)}
                placeholder="https://facebook.com/yourpage"
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF6EE] border border-[#DFC7A2] rounded-xl text-[#2C1810] focus:outline-hidden focus:border-[#993300]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2C1810] mb-1 flex items-center space-x-1.5">
                <Youtube className="w-3.5 h-3.5 text-red-600" />
                <span>YouTube Channel URL</span>
              </label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={e => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/@yourchannel"
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF6EE] border border-[#DFC7A2] rounded-xl text-[#2C1810] focus:outline-hidden focus:border-[#993300]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2C1810] mb-1 flex items-center space-x-1.5">
                <Twitter className="w-3.5 h-3.5 text-sky-500" />
                <span>Twitter / X Profile URL</span>
              </label>
              <input
                type="url"
                value={twitterUrl}
                onChange={e => setTwitterUrl(e.target.value)}
                placeholder="https://twitter.com/yourhandle"
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF6EE] border border-[#DFC7A2] rounded-xl text-[#2C1810] focus:outline-hidden focus:border-[#993300]"
              />
            </div>
          </div>
        </div>

        {/* 5. Brand Identity & Vedic Heritage Taglines */}
        <div className="bg-white border border-[#DFC7A2] rounded-3xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 pb-5 border-b border-[#F0E6D2]">
            <div className="p-2.5 rounded-2xl bg-[#FAF3E0] border border-[#DFC7A2] text-[#993300]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#2C1810]">
                Brand Identity, Logo & Spiritual Taglines
              </h3>
              <p className="text-xs text-[#5C4535] mt-0.5">
                Configure brand name, logo, Sanskrit shlokas, and bilingual mottos.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2C1810] mb-1">
                  Business / Store Name
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF6EE] border border-[#DFC7A2] rounded-xl text-[#2C1810] font-bold focus:outline-hidden focus:border-[#993300]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C1810] mb-1">
                  Brand Logo URL / Upload
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={e => setLogoUrl(e.target.value)}
                    placeholder="/indima-logo.svg or image URL"
                    className="flex-1 px-3.5 py-2.5 text-xs bg-[#FAF6EE] border border-[#DFC7A2] rounded-xl text-[#2C1810] focus:outline-hidden focus:border-[#993300]"
                  />
                  <label className="px-4 py-2.5 bg-[#993300] hover:bg-[#802B00] text-white text-xs font-bold rounded-xl cursor-pointer flex items-center space-x-1.5 transition-colors shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingLogo ? 'Uploading...' : 'Upload Logo'}</span>
                    <input
                      type="file"
                      accept="image/*,.heic,.heif,.jpg,.jpeg,.png,.webp,.svg"
                      className="hidden"
                      onChange={e => {
                        if (e.target.files?.[0]) {
                          handleLogoUpload(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Logo Live Preview */}
                <div className="mt-2.5 flex items-center space-x-3 p-2 bg-[#FAF6EE] rounded-xl border border-[#DFC7A2]">
                  <div className="w-16 h-12 bg-white rounded-lg border border-[#DFC7A2] flex items-center justify-center p-1 overflow-hidden shrink-0">
                    <img
                      src={logoUrl || '/indima-logo.svg'}
                      alt="Brand Logo Preview"
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes('indima-logo.svg')) {
                          target.src = '/indima-logo.svg';
                        }
                      }}
                    />
                  </div>
                  <div className="text-[11px] text-[#5C4535]">
                    <span className="font-bold text-[#2C1810] block">Active Storefront Logo</span>
                    <span>Displays in header, checkout & invoice footer</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#993300] mb-1">
                Sanskrit Vedic Shloka / Proof Tagline (संस्कृत मन्त्र)
              </label>
              <input
                type="text"
                value={taglineSa}
                onChange={e => setTaglineSa(e.target.value)}
                placeholder="आयुर्वेदोऽमृतानाम् • शुद्धं सात्त्विकं दिव्यम्"
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF6EE] border border-[#DFC7A2] rounded-xl text-[#2C1810] font-serif focus:outline-hidden focus:border-[#993300]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2C1810] mb-1">
                  Tagline (English)
                </label>
                <input
                  type="text"
                  value={taglineEn}
                  onChange={e => setTaglineEn(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF6EE] border border-[#DFC7A2] rounded-xl text-[#2C1810] focus:outline-hidden focus:border-[#993300]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C1810] mb-1">
                  Tagline (Kannada)
                </label>
                <input
                  type="text"
                  value={taglineKn}
                  onChange={e => setTaglineKn(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF6EE] border border-[#DFC7A2] rounded-xl text-[#2C1810] font-serif focus:outline-hidden focus:border-[#993300]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 6. Store Policies */}
        <div className="bg-white border border-[#DFC7A2] rounded-3xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 pb-5 border-b border-[#F0E6D2]">
            <div className="p-2.5 rounded-2xl bg-[#FAF3E0] border border-[#DFC7A2] text-[#993300]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#2C1810]">
                Store Policies & Shipping Rules
              </h3>
              <p className="text-xs text-[#5C4535] mt-0.5">
                Customers can review these in the storefront footer and checkout.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2C1810] mb-1">
                Shipping Policy (English)
              </label>
              <textarea
                rows={3}
                value={policyShippingEn}
                onChange={e => setPolicyShippingEn(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF6EE] border border-[#DFC7A2] rounded-xl text-[#2C1810] focus:outline-hidden focus:border-[#993300]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2C1810] mb-1">
                Refund Policy (English)
              </label>
              <textarea
                rows={3}
                value={policyRefundEn}
                onChange={e => setPolicyRefundEn(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF6EE] border border-[#DFC7A2] rounded-xl text-[#2C1810] focus:outline-hidden focus:border-[#993300]"
              />
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-4 z-30 bg-[#2C1810] border border-[#4A2E20] rounded-2xl p-4 shadow-xl flex items-center justify-between">
          <div className="text-xs text-amber-100/90 hidden sm:block">
            All edits update live across the entire website instantly.
          </div>
          <button
            type="submit"
            disabled={isSavingGeneral}
            id="save-all-settings-btn"
            className="px-8 py-3 bg-[#D97706] hover:bg-[#B45309] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSavingGeneral ? 'Saving Settings...' : 'Save All Business Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
