import { Order, BusinessSettings } from '../types';

export function normalizeWhatsAppNumber(rawNumber?: string): string {
  if (!rawNumber) return '919845012345';
  let cleaned = rawNumber.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `91${cleaned.slice(1)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return cleaned;
  }
  return cleaned.length >= 10 ? cleaned : '919845012345';
}

export function generateAdminWhatsAppMessage(order: Order, settings: BusinessSettings): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://indimaspice.com';
  const trackUrl = `${origin}/#track?id=${encodeURIComponent(order.id)}&phone=${encodeURIComponent(order.customer_phone)}`;
  
  const itemsText = (order.items || [])
    .map((it, idx) => {
      const w = it.weight || 'Standard';
      const itemTot = it.subtotal ?? it.total_price ?? (it.unit_price * it.quantity);
      return `${idx + 1}. *${it.name_en}* (${w}) × ${it.quantity} = ₹${itemTot}`;
    })
    .join('\n');

  return `🌿 *NEW ORDER RECEIVED — INDIMA SPICE CO.* 🌿

*Order ID for Tracking:* ${order.id}
*Amount Paid:* ₹${order.total_amount}
*Payment Status:* ${order.payment_status?.toUpperCase() || 'SUCCESSFUL'}
*Payment Method:* ${order.payment_method || 'UPI / Online'}
*Order Date:* ${new Date(order.created_at || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

👤 *Customer Details:*
• *Name:* ${order.customer_name}
• *Mobile:* +91 ${order.customer_phone}
• *Email:* ${order.customer_email || 'N/A'}

📍 *Pan-India Delivery Address:*
${order.address_snapshot?.houseFlat || ''}, ${order.address_snapshot?.street || ''}
${order.address_snapshot?.area || ''}${order.address_snapshot?.landmark ? ', Near ' + order.address_snapshot.landmark : ''}
${order.address_snapshot?.city || ''}, ${order.address_snapshot?.district || ''}, ${order.address_snapshot?.state || ''} - ${order.address_snapshot?.pincode || ''}

📦 *Ordered Spice Items (${order.items?.length || 0}):*
${itemsText}

💰 *Payment Breakdown:*
• *Subtotal:* ₹${order.subtotal || order.total_amount}
${order.discount_amount ? `• *Discount:* -₹${order.discount_amount}\n` : ''}• *Shipping:* ₹${order.shipping_fee || 0}
• *TOTAL PAID:* ₹${order.total_amount}

🚚 *Expected Delivery:* ${order.expected_delivery || '3-5 Business Days'}
🔗 *Track Order Online:* ${trackUrl}

_This automated notification was generated from the Indima Spice Co. Storefront._`;
}

export function generateCustomerWhatsAppMessage(order: Order, settings: BusinessSettings): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://indimaspice.com';
  const trackUrl = `${origin}/#track?id=${encodeURIComponent(order.id)}&phone=${encodeURIComponent(order.customer_phone)}`;

  const itemsList = (order.items || [])
    .map(it => {
      const w = it.weight || 'Standard';
      const itemTot = it.subtotal ?? it.total_price ?? (it.unit_price * it.quantity);
      return `• ${it.name_en} (${w}) × ${it.quantity} - ₹${itemTot}`;
    })
    .join('\n');

  return `Namaskara ${order.customer_name}! 🙏🌿

Thank you for your order with *${settings.business_name || 'Indima Spice Co.'}*! Your authentic Karnataka spices are being lovingly hand-packed.

📋 *YOUR ORDER SUMMARY & TRACKING ID:*
• *Order ID:* *${order.id}*
• *Total Paid:* ₹${order.total_amount}
• *Payment Status:* ${order.payment_status?.toUpperCase() || 'VERIFIED'}
• *Delivery Address:* ${order.address_snapshot?.houseFlat}, ${order.address_snapshot?.street}, ${order.address_snapshot?.city} - ${order.address_snapshot?.pincode}

📦 *Items Ordered:*
${itemsList}

🚚 *Expected Delivery:* ${order.expected_delivery || '3-5 Days'}
🔍 *Track Your Live Order Status anytime here:*
${trackUrl}

For any assistance, reply to this message or call us at ${settings.phone || '+91 98450 12345'}.
_Pure as mother's love • Indima Spice Co._`;
}

export function getAdminWhatsAppUrl(order: Order, settings: BusinessSettings): string {
  const rawAdminNumber = settings.whatsapp_number || '919845012345';
  const cleanNumber = normalizeWhatsAppNumber(rawAdminNumber);
  const msg = generateAdminWhatsAppMessage(order, settings);
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
}

export function getCustomerWhatsAppUrl(order: Order, settings: BusinessSettings): string {
  const cleanPhone = normalizeWhatsAppNumber(order.customer_phone);
  const msg = generateCustomerWhatsAppMessage(order, settings);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
}

export function getReceiptLogoSvg(): string {
  return `<svg viewBox="0 0 500 580" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="display: block;">
    <defs>
      <linearGradient id="rcptGoldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FDE047" />
        <stop offset="35%" stop-color="#D97706" />
        <stop offset="70%" stop-color="#92400E" />
        <stop offset="100%" stop-color="#FEF08A" />
      </linearGradient>
      <linearGradient id="rcptGoldText" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#F59E0B" />
        <stop offset="100%" stop-color="#B45309" />
      </linearGradient>
      <linearGradient id="rcptSaffron" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#FF9933" />
        <stop offset="50%" stop-color="#FF6600" />
        <stop offset="100%" stop-color="#E65100" />
      </linearGradient>
      <linearGradient id="rcptEmerald" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#138808" />
        <stop offset="50%" stop-color="#059669" />
        <stop offset="100%" stop-color="#064E3B" />
      </linearGradient>
      <linearGradient id="rcptRoyalBlue" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1D4ED8" />
        <stop offset="50%" stop-color="#1E3A8A" />
        <stop offset="100%" stop-color="#0F172A" />
      </linearGradient>
    </defs>

    <!-- Top Diamond 'ki Spices' Logo -->
    <g transform="translate(250, 100)">
      <rect x="-70" y="-70" width="140" height="140" rx="16" transform="rotate(45)" fill="#FFFFFF" stroke="url(#rcptGoldBorder)" stroke-width="6" />
      <text x="-10" y="12" font-family="'Arial Black', 'Trebuchet MS', sans-serif" font-size="56" font-weight="900" fill="#111827" text-anchor="middle">k</text>
      <g transform="translate(18, -12)">
        <circle cx="0" cy="-10" r="7.5" fill="#111827" />
        <rect x="-4.5" y="0" width="9" height="28" rx="4.5" fill="#111827" />
      </g>
      <text x="0" y="40" font-family="'Georgia', serif" font-size="22" font-weight="bold" fill="#1F2937" text-anchor="middle">Spices</text>
      <path d="M -32 48 Q 0 56 32 48 Q 5 52 -32 48" fill="url(#rcptGoldText)" />
    </g>

    <!-- Saffron Upper Ribbon Band -->
    <g transform="translate(40, 220)">
      <path d="M 0 35 Q 210 -15 420 20 L 420 52 Q 210 12 0 57 Z" fill="url(#rcptSaffron)" />
      <path d="M 0 45 Q 210 5 420 30 L 420 42 Q 210 15 0 52 Z" fill="#FEF08A" opacity="0.6" />
    </g>

    <!-- Main 'indimā' Hindi-English Fusion Typography -->
    <g transform="translate(250, 335)" text-anchor="middle">
      <rect x="-175" y="-42" width="350" height="11" rx="5" fill="url(#rcptRoyalBlue)" stroke="url(#rcptGoldBorder)" stroke-width="1.5" />
      <path d="M -152 -42 L -137 -66 L -122 -42 Z" fill="url(#rcptRoyalBlue)" stroke="url(#rcptGoldBorder)" stroke-width="1.5" />
      <path d="M 12 -42 L 27 -66 L 42 -42 Z" fill="url(#rcptRoyalBlue)" stroke="url(#rcptGoldBorder)" stroke-width="1.5" />
      <circle cx="132" cy="-62" r="6.5" fill="url(#rcptRoyalBlue)" stroke="url(#rcptGoldBorder)" stroke-width="1.5" />
      <path d="M 112 -52 Q 132 -36 152 -52 Q 132 -44 112 -52" fill="url(#rcptRoyalBlue)" stroke="url(#rcptGoldBorder)" stroke-width="1.5" />
      <text x="0" y="26" font-family="'Arial Rounded MT Bold', 'Trebuchet MS', sans-serif" font-size="84" font-weight="900" fill="url(#rcptRoyalBlue)" stroke="url(#rcptGoldBorder)" stroke-width="2.5" letter-spacing="2">indimā</text>
    </g>

    <!-- Subtitle Tagline -->
    <g transform="translate(250, 396)" text-anchor="middle">
      <line x1="-190" y1="0" x2="-130" y2="0" stroke="url(#rcptGoldText)" stroke-width="2.5" />
      <text x="0" y="5" font-family="'Brush Script MT', 'Lucida Calligraphy', cursive, Georgia, serif" font-size="30" font-style="italic" font-weight="bold" fill="#1E3A8A">Pure as mother's love</text>
      <line x1="130" y1="0" x2="190" y2="0" stroke="url(#rcptGoldText)" stroke-width="2.5" />
    </g>

    <!-- Emerald Green Lower Ribbon Band -->
    <g transform="translate(40, 425)">
      <path d="M 0 20 Q 210 65 420 25 L 420 57 Q 210 97 0 47 Z" fill="url(#rcptEmerald)" />
      <path d="M 0 30 Q 210 75 420 35 L 420 44 Q 210 82 0 40 Z" fill="#A7F3D0" opacity="0.6" />
    </g>
  </svg>`;
}

export function getReceiptLogoHtml(settings: BusinessSettings): string {
  const customUrl = settings.logo_url;
  const svg = getReceiptLogoSvg();
  if (customUrl && (customUrl.startsWith('http') || customUrl.startsWith('data:'))) {
    return `<img src="${customUrl}" alt="Logo" class="brand-logo-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
    <div style="display:none; width: 100%; height: 100%;">${svg}</div>`;
  }
  return svg;
}

export function generateInvoiceHtml(order: Order, settings: BusinessSettings): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://indimaspice.com';
  const trackUrl = `${origin}/#track?id=${encodeURIComponent(order.id)}&phone=${encodeURIComponent(order.customer_phone)}`;
  const dateFormatted = new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const itemsRows = (order.items || [])
    .map(
      (item, idx) => {
        const itemTot = item.subtotal ?? item.total_price ?? (item.unit_price * item.quantity);
        const unitP = item.unit_price || (item.quantity > 0 ? Math.round(itemTot / item.quantity) : itemTot);
        return `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 14px; text-align: center; color: #6b7280; font-size: 13px;">${idx + 1}</td>
        <td style="padding: 12px 14px; font-weight: 600; color: #1f2937; font-size: 14px;">
          ${item.name_en}
          <div style="font-size: 11px; color: #78350f; font-style: italic;">${item.name_kn || ''}</div>
        </td>
        <td style="padding: 12px 14px; text-align: center; color: #4b5563; font-size: 13px;">${item.weight || 'Standard'}</td>
        <td style="padding: 12px 14px; text-align: center; font-weight: 600; color: #1f2937; font-size: 13px;">${item.quantity}</td>
        <td style="padding: 12px 14px; text-align: right; color: #4b5563; font-size: 13px;">₹${unitP}</td>
        <td style="padding: 12px 14px; text-align: right; font-weight: 700; color: #111827; font-size: 14px;">₹${itemTot}</td>
      </tr>
    `;
      }
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Indima Spice Co. - Order Receipt ${order.id}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    body { background-color: #f9fafb; color: #1f2937; padding: 24px 16px; }
    .receipt-container { max-width: 720px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f3f4f6; padding-bottom: 20px; margin-bottom: 24px; gap: 16px; }
    .brand-left { display: flex; align-items: center; gap: 16px; }
    .brand-logo-container { width: 72px; height: 82px; flex-shrink: 0; background: #ffffff; border: 1.5px solid #eadbca; border-radius: 12px; padding: 4px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.04); }
    .brand-logo-img { width: 100%; height: 100%; object-fit: contain; }
    .brand-details { display: flex; flex-direction: column; }
    .brand-title { font-family: 'Georgia', serif; font-size: 24px; font-weight: bold; color: #993300; line-height: 1.2; }
    .brand-tagline { font-size: 12px; color: #78350f; font-style: italic; margin-top: 3px; }
    .brand-meta { font-size: 11px; color: #6b7280; margin-top: 5px; line-height: 1.4; }
    .badge { display: inline-block; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; }
    .header-right { text-align: right; flex-shrink: 0; min-width: 140px; }
    .order-id-card { background: #faf6ee; border: 1.5px dashed #d9c4a2; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .order-id-title { font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; color: #993300; }
    .order-id-val { font-family: 'Courier New', monospace; font-size: 22px; font-weight: 800; color: #993300; margin-top: 2px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .info-card { background: #fdfbf7; border: 1px solid #f0e6d2; border-radius: 10px; padding: 14px 16px; }
    .info-title { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #6b7280; margin-bottom: 8px; }
    .info-body { font-size: 13px; line-height: 1.5; color: #374151; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #faf6ee; padding: 10px 14px; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #78350f; border-bottom: 2px solid #eadbca; }
    .totals-area { display: flex; justify-content: flex-end; margin-bottom: 24px; }
    .totals-table { width: 280px; }
    .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #4b5563; }
    .totals-row.grand { border-top: 2px solid #993300; margin-top: 6px; padding-top: 10px; font-size: 17px; font-weight: 800; color: #993300; }
    .tracking-box { background: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 10px; padding: 16px; margin-bottom: 24px; text-align: center; }
    .tracking-title { font-size: 14px; font-weight: bold; color: #065f46; margin-bottom: 4px; }
    .tracking-desc { font-size: 12px; color: #047857; margin-bottom: 8px; }
    .tracking-link { display: inline-block; background: #047857; color: #ffffff; text-decoration: none; padding: 8px 18px; border-radius: 8px; font-size: 12px; font-weight: bold; }
    .footer { text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 12px; color: #9ca3af; }
    .print-btn-bar { display: flex; justify-content: center; gap: 12px; margin-bottom: 20px; }
    .action-btn { padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; }
    .btn-print { background: #993300; color: #ffffff; }
    .btn-close { background: #e5e7eb; color: #374151; }
    @media print {
      body { background: #ffffff; padding: 0; }
      .receipt-container { box-shadow: none; border: none; padding: 0; max-width: 100%; }
      .print-btn-bar { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="print-btn-bar">
    <button class="action-btn btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>

  <div class="receipt-container">
    <div class="header">
      <div class="brand-left">
        <div class="brand-logo-container">
          ${getReceiptLogoHtml(settings)}
        </div>
        <div class="brand-details">
          <div class="brand-title">${settings.business_name || 'Indima Spice Co.'}</div>
          <div class="brand-tagline">${settings.tagline_en || "Pure as mother's love • Traditional Karnataka Blends"}</div>
          <div class="brand-meta">
            ${settings.address || '#42, Traditional Kitchen Heritage Lane, Bull Temple Road, Basavanagudi, Bengaluru, Karnataka - 560004'}<br>
            Phone: ${settings.phone || '+91 9663852435'} | WhatsApp: +${normalizeWhatsAppNumber(settings.whatsapp_number)}
          </div>
        </div>
      </div>
      <div class="header-right">
        <span class="badge">Official Receipt</span>
        <div style="font-size: 12px; color: #6b7280; margin-top: 8px;">Date: <strong>${dateFormatted}</strong></div>
        <div style="font-size: 12px; color: #047857; font-weight: 700; margin-top: 4px;">Payment: ${order.payment_status?.toUpperCase() || 'PAID'}</div>
      </div>
    </div>

    <!-- Prominent Order ID For Tracking -->
    <div class="order-id-card">
      <div>
        <div class="order-id-title">Official Order ID for Tracking</div>
        <div class="order-id-val">${order.id}</div>
        <div style="font-size: 11px; color: #78350f; margin-top: 2px;">
          Use this Order ID or your Phone (+91 ${order.customer_phone}) to track live progress anytime.
        </div>
      </div>
      <div style="text-align: right;">
        <span style="display: inline-block; background: #993300; color: #ffffff; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: bold;">
          Verified Order
        </span>
      </div>
    </div>

    <div class="grid-2">
      <div class="info-card">
        <div class="info-title">👤 Customer Information</div>
        <div class="info-body">
          <strong>${order.customer_name}</strong><br>
          Phone: +91 ${order.customer_phone}<br>
          Email: ${order.customer_email || 'N/A'}<br>
          Payment: ${order.payment_method || 'UPI / Razorpay'}
        </div>
      </div>

      <div class="info-card">
        <div class="info-title">📍 Delivery Address</div>
        <div class="info-body">
          ${order.address_snapshot?.houseFlat || ''}, ${order.address_snapshot?.street || ''}<br>
          ${order.address_snapshot?.area || ''}${order.address_snapshot?.landmark ? ', ' + order.address_snapshot.landmark : ''}<br>
          <strong>${order.address_snapshot?.city || ''}, ${order.address_snapshot?.state || ''} - ${order.address_snapshot?.pincode || ''}</strong>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <table>
      <thead>
        <tr>
          <th style="text-align: center; width: 40px;">#</th>
          <th style="text-align: left;">Product / Spice Blend</th>
          <th style="text-align: center;">Pack Size</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div class="totals-area">
      <div class="totals-table">
        <div class="totals-row">
          <span>Items Subtotal:</span>
          <span>₹${order.subtotal || order.total_amount}</span>
        </div>
        ${
          order.discount_amount
            ? `<div class="totals-row" style="color: #047857;">
                 <span>Festive Discount (${order.coupon_code || 'Applied'}):</span>
                 <span>-₹${order.discount_amount}</span>
               </div>`
            : ''
        }
        <div class="totals-row">
          <span>Delivery Fee:</span>
          <span>${order.shipping_fee === 0 ? 'FREE' : `₹${order.shipping_fee}`}</span>
        </div>
        <div class="totals-row grand">
          <span>Total Paid:</span>
          <span>₹${order.total_amount}</span>
        </div>
      </div>
    </div>

    <!-- Tracking Section -->
    <div class="tracking-box">
      <div class="tracking-title">🚚 Live Order Tracking & Support</div>
      <div class="tracking-desc">
        Track your spice grinding, batch packing, and courier shipment progress anytime.
      </div>
      <a href="${trackUrl}" target="_blank" class="tracking-link">
        Click Here to Track Order ${order.id}
      </a>
    </div>

    <div class="footer">
      <p>Thank you for supporting pure, authentic Karnataka spices and traditional heritage milling.</p>
      <p style="margin-top: 4px;">Indima Spice Co. • Support: ${settings.email || 'care@indimaspice.com'} | WhatsApp: +${normalizeWhatsAppNumber(settings.whatsapp_number)}</p>
    </div>
  </div>
</body>
</html>`;
}

export function downloadReceiptFile(order: Order, settings: BusinessSettings): void {
  try {
    const htmlContent = generateInvoiceHtml(order, settings);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Indima-Receipt-${order.id}.html`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  } catch (err) {
    console.error('Error downloading receipt:', err);
  }
}

export function printReceiptDirectly(order: Order, settings: BusinessSettings): void {
  try {
    const htmlContent = generateInvoiceHtml(order, settings);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => {
        try {
          printWindow.focus();
          printWindow.print();
        } catch (pErr) {
          console.error('Print window error:', pErr);
        }
      }, 400);
    } else {
      // Fallback if pop-up blocked: download file directly
      downloadReceiptFile(order, settings);
    }
  } catch (err) {
    console.error('Error printing receipt:', err);
    downloadReceiptFile(order, settings);
  }
}
