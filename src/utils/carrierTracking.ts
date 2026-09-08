export interface CarrierOption {
  id: string;
  name: string;
  trackingUrlPattern?: (trackingNumber: string) => string;
  portalUrl: string;
  notes?: string;
}

export const SUPPORTED_CARRIERS: CarrierOption[] = [
  {
    id: 'delhivery',
    name: 'Delhivery',
    portalUrl: 'https://www.delhivery.com',
    trackingUrlPattern: (num) => `https://www.delhivery.com/track/package/${encodeURIComponent(num.trim())}`,
    notes: 'Pan-India Express & Surface'
  },
  {
    id: 'ekart',
    name: 'Ekart Logistics',
    portalUrl: 'https://ekartlogistics.com',
    trackingUrlPattern: (num) => `https://ekartlogistics.com/shipmenttrack/${encodeURIComponent(num.trim())}`,
    notes: 'Pan-India E-Commerce Express'
  },
  {
    id: 'dtdc',
    name: 'DTDC Express',
    portalUrl: 'https://www.dtdc.in/tracking.asp',
    trackingUrlPattern: () => 'https://www.dtdc.in/tracking.asp',
    notes: 'South India & Karnataka Network'
  },
  {
    id: 'indiapost',
    name: 'India Post (Speed Post)',
    portalUrl: 'https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx',
    trackingUrlPattern: () => 'https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx',
    notes: 'Deep rural & pan-India reach'
  },
  {
    id: 'bluedart',
    name: 'Blue Dart',
    portalUrl: 'https://www.bluedart.com/tracking',
    trackingUrlPattern: () => 'https://www.bluedart.com/tracking',
    notes: 'Priority Air & Express'
  },
  {
    id: 'xpressbees',
    name: 'Xpressbees',
    portalUrl: 'https://www.xpressbees.com',
    trackingUrlPattern: (num) => `https://www.xpressbees.com/track?isawb=Yes&trackid=${encodeURIComponent(num.trim())}`,
    notes: 'Express Courier'
  },
  {
    id: 'shadowfax',
    name: 'Shadowfax',
    portalUrl: 'https://tracker.shadowfax.in/',
    trackingUrlPattern: () => 'https://tracker.shadowfax.in/',
    notes: 'Intra-city & Regional'
  },
  {
    id: 'professional',
    name: 'The Professional Couriers',
    portalUrl: 'https://www.tpcindia.com',
    trackingUrlPattern: () => 'https://www.tpcindia.com',
    notes: 'Karnataka & South Network'
  },
  {
    id: 'other',
    name: 'Other / Direct Delivery',
    portalUrl: '',
    notes: 'Custom or local fleet'
  }
];

/**
 * Returns verified direct tracking URL for known courier services.
 * Only generates verified URLs; does not invent unverified formats.
 */
export function getVerifiedTrackingUrl(carrier?: string, trackingNumber?: string): string | null {
  if (!trackingNumber) return null;
  const cleanTrack = trackingNumber.trim();
  if (!cleanTrack) return null;

  const cleanCarrier = (carrier || '').trim().toLowerCase();
  if (!cleanCarrier) return null;

  if (cleanCarrier.includes('delhivery')) {
    return `https://www.delhivery.com/track/package/${encodeURIComponent(cleanTrack)}`;
  }
  if (cleanCarrier.includes('ekart')) {
    return `https://ekartlogistics.com/shipmenttrack/${encodeURIComponent(cleanTrack)}`;
  }
  if (cleanCarrier.includes('xpressbees')) {
    return `https://www.xpressbees.com/track?isawb=Yes&trackid=${encodeURIComponent(cleanTrack)}`;
  }
  if (cleanCarrier.includes('dtdc')) {
    return 'https://www.dtdc.in/tracking.asp';
  }
  if (cleanCarrier.includes('india post') || cleanCarrier.includes('speed post') || cleanCarrier.includes('indiapost')) {
    return 'https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx';
  }
  if (cleanCarrier.includes('blue dart') || cleanCarrier.includes('bluedart')) {
    return 'https://www.bluedart.com/tracking';
  }
  if (cleanCarrier.includes('shadowfax')) {
    return 'https://tracker.shadowfax.in/';
  }
  if (cleanCarrier.includes('professional') || cleanCarrier.includes('tpc')) {
    return 'https://www.tpcindia.com';
  }

  return null;
}

export function getCarrierDisplayName(carrierIdOrName?: string): string {
  if (!carrierIdOrName) return 'Standard Courier';
  const found = SUPPORTED_CARRIERS.find(
    c => c.id.toLowerCase() === carrierIdOrName.toLowerCase() || c.name.toLowerCase() === carrierIdOrName.toLowerCase()
  );
  return found ? found.name : carrierIdOrName;
}
