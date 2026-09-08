import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { Order } from '../types';

export interface DeliveryMapProps {
  order?: Order | null;
  latitude?: number | null;
  longitude?: number | null;
  locationName?: string;
  lastUpdated?: string;
  statusText?: string;
  isLiveTracking?: boolean;
  destinationCity?: string;
  destinationState?: string;
  destinationLat?: number | null;
  destinationLng?: number | null;
  isAdminPicker?: boolean;
  onLocationSelect?: (coords: { latitude: number; longitude: number; locationName?: string }) => void;
  className?: string;
}

// Karnataka & Regional Logistics Hub Presets for quick admin selection
export const KARNATAKA_LOGISTICS_HUBS = [
  { name: 'Hubballi Main Hub', lat: 15.3647, lng: 75.1240 },
  { name: 'Nelamangala Sorting Center (BLR)', lat: 13.0995, lng: 77.3917 },
  { name: 'Bengaluru Central Distribution', lat: 12.9716, lng: 77.5946 },
  { name: 'Mysuru Transit Hub', lat: 12.2958, lng: 76.6394 },
  { name: 'Mangaluru Coastal Node', lat: 12.9141, lng: 74.8560 },
  { name: 'Belagavi Northern Hub', lat: 15.8497, lng: 74.4977 },
  { name: 'Davanagere Mid-State Center', lat: 14.4644, lng: 75.9218 },
  { name: 'Shivamogga Malnad Node', lat: 13.9299, lng: 75.5681 },
  { name: 'Chennai Regional Gateway', lat: 13.0827, lng: 80.2707 },
  { name: 'Mumbai Western Gateway', lat: 19.0760, lng: 72.8777 }
];

export const DeliveryMap: React.FC<DeliveryMapProps> = ({
  order,
  latitude,
  longitude,
  locationName,
  lastUpdated,
  statusText,
  isLiveTracking,
  destinationCity,
  destinationState,
  destinationLat,
  destinationLng,
  isAdminPicker = false,
  onLocationSelect,
  className = ''
}) => {
  // Resolve effective props (prioritizing direct props over order properties)
  const resolvedLat = latitude !== undefined ? latitude : (order?.tracking?.latitude ?? null);
  const resolvedLng = longitude !== undefined ? longitude : (order?.tracking?.longitude ?? null);
  const resolvedLocName = locationName !== undefined ? locationName : (order?.tracking?.location_name || '');
  const resolvedLastUpdated = lastUpdated !== undefined ? lastUpdated : (order?.tracking?.location_updated_at || '');
  const resolvedStatusText = statusText !== undefined ? statusText : (order?.tracking?.status || order?.order_status || order?.status || 'In Transit');
  const resolvedIsLive = isLiveTracking !== undefined ? isLiveTracking : (order?.tracking?.live_tracking_available || false);
  const resolvedDestCity = destinationCity !== undefined ? destinationCity : (order?.address_snapshot?.city || '');
  const resolvedDestState = destinationState !== undefined ? destinationState : (order?.address_snapshot?.state || '');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  const [mapError, setMapError] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(() => {
    if (
      typeof resolvedLat === 'number' &&
      typeof resolvedLng === 'number' &&
      !isNaN(resolvedLat) &&
      !isNaN(resolvedLng) &&
      resolvedLat >= -90 &&
      resolvedLat <= 90 &&
      resolvedLng >= -180 &&
      resolvedLng <= 180
    ) {
      return { lat: resolvedLat, lng: resolvedLng };
    }
    return null;
  });

  // Sync state if props change
  useEffect(() => {
    if (
      typeof resolvedLat === 'number' &&
      typeof resolvedLng === 'number' &&
      !isNaN(resolvedLat) &&
      !isNaN(resolvedLng) &&
      resolvedLat >= -90 &&
      resolvedLat <= 90 &&
      resolvedLng >= -180 &&
      resolvedLng <= 180
    ) {
      setCurrentCoords({ lat: resolvedLat, lng: resolvedLng });
    } else if (!isAdminPicker) {
      setCurrentCoords(null);
    }
  }, [resolvedLat, resolvedLng, isAdminPicker]);

  const hasValidCoords = Boolean(currentCoords);

  // SVG-based Leaflet custom DivIcons (eliminates broken default png image paths in bundler)
  const createDeliveryIcon = () => {
    return L.divIcon({
      className: 'custom-delivery-pin',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(153, 51, 0, 0.2); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 32px; height: 32px; border-radius: 50%; background: #993300; border: 2.5px solid #FFFFFF; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18]
    });
  };

  const createDestIcon = () => {
    return L.divIcon({
      className: 'custom-dest-pin',
      html: `
        <div style="width: 28px; height: 28px; border-radius: 50%; background: #047857; border: 2.5px solid #FFFFFF; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14]
    });
  };

  // Initialize and update map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!hasValidCoords && !isAdminPicker) return;

    try {
      const initialLat = currentCoords?.lat ?? (destinationLat || 12.9716);
      const initialLng = currentCoords?.lng ?? (destinationLng || 77.5946);

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [initialLat, initialLng],
          zoom: currentCoords ? 11 : 7,
          zoomControl: true,
          attributionControl: true
        });

        // OpenStreetMap free, reliable, production-grade tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Click handler for Admin Picker mode
        if (isAdminPicker && onLocationSelect) {
          map.on('click', (e: L.LeafletMouseEvent) => {
            const { lat, lng } = e.latlng;
            const fixedLat = parseFloat(lat.toFixed(5));
            const fixedLng = parseFloat(lng.toFixed(5));
            setCurrentCoords({ lat: fixedLat, lng: fixedLng });
            onLocationSelect({
              latitude: fixedLat,
              longitude: fixedLng,
              locationName: locationName || `Coordinate Point (${fixedLat}, ${fixedLng})`
            });
          });
        }

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;

      // Update package delivery marker
      if (currentCoords) {
        if (!markerRef.current) {
          markerRef.current = L.marker([currentCoords.lat, currentCoords.lng], {
            icon: createDeliveryIcon(),
            draggable: isAdminPicker
          }).addTo(map);

          if (isAdminPicker && onLocationSelect) {
            markerRef.current.on('dragend', (ev: any) => {
              const pos = ev.target.getLatLng();
              const fixedLat = parseFloat(pos.lat.toFixed(5));
              const fixedLng = parseFloat(pos.lng.toFixed(5));
              setCurrentCoords({ lat: fixedLat, lng: fixedLng });
              onLocationSelect({
                latitude: fixedLat,
                longitude: fixedLng,
                locationName: locationName || `Pin (${fixedLat}, ${fixedLng})`
              });
            });
          }
        } else {
          markerRef.current.setLatLng([currentCoords.lat, currentCoords.lng]);
        }

        const popupContent = `
          <div style="font-family: sans-serif; font-size: 11px; padding: 2px;">
            <strong style="color: #993300; font-size: 12px; display: block; margin-bottom: 2px;">
              📍 ${locationName || 'Current Shipment Location'}
            </strong>
            <span style="color: #4B5563; display: block;">Status: <b>${statusText}</b></span>
            ${lastUpdated ? `<span style="color: #6B7280; font-size: 10px; display: block; margin-top: 2px;">Updated: ${lastUpdated}</span>` : ''}
          </div>
        `;
        markerRef.current.bindPopup(popupContent);
      } else if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }

      // Add destination marker if destination coordinates exist
      const hasDestCoords =
        typeof destinationLat === 'number' &&
        typeof destinationLng === 'number' &&
        !isNaN(destinationLat) &&
        !isNaN(destinationLng);

      if (hasDestCoords && destinationLat && destinationLng) {
        if (!destMarkerRef.current) {
          destMarkerRef.current = L.marker([destinationLat, destinationLng], {
            icon: createDestIcon()
          }).addTo(map);
        } else {
          destMarkerRef.current.setLatLng([destinationLat, destinationLng]);
        }

        const destPopup = `
          <div style="font-family: sans-serif; font-size: 11px; padding: 2px;">
            <strong style="color: #047857; font-size: 12px; display: block; margin-bottom: 2px;">
              🏁 Delivery Destination
            </strong>
            <span style="color: #374151;">${destinationCity ? `${destinationCity}, ` : ''}${destinationState || 'India'}</span>
          </div>
        `;
        destMarkerRef.current.bindPopup(destPopup);

        // Connect with route line if both package and destination exist
        if (currentCoords) {
          const latlngs: [number, number][] = [
            [currentCoords.lat, currentCoords.lng],
            [destinationLat, destinationLng]
          ];
          if (!polylineRef.current) {
            polylineRef.current = L.polyline(latlngs, {
              color: '#993300',
              weight: 3,
              dashArray: '6, 8',
              opacity: 0.7
            }).addTo(map);
          } else {
            polylineRef.current.setLatLngs(latlngs);
          }

          // Fit bounds so user sees both
          const bounds = L.latLngBounds(latlngs);
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
        } else {
          map.setView([destinationLat, destinationLng], 11);
        }
      } else if (currentCoords) {
        map.setView([currentCoords.lat, currentCoords.lng], 12);
      }

      // ResizeObserver to ensure tiles render immediately when modal transitions
      const resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);

      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 200);

      return () => {
        resizeObserver.disconnect();
        clearTimeout(timer);
      };
    } catch (err: any) {
      console.error('Error rendering Leaflet map:', err);
      setMapError('Interactive map view could not be rendered.');
    }
  }, [hasValidCoords, currentCoords, isAdminPicker, destinationLat, destinationLng, locationName, lastUpdated, statusText]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Format last updated time for display (e.g., 4:32 PM)
  const formattedTime = (() => {
    if (!resolvedLastUpdated) return null;
    try {
      const d = new Date(resolvedLastUpdated);
      if (isNaN(d.getTime())) return resolvedLastUpdated;
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return resolvedLastUpdated;
    }
  })();

  // If no coordinates and not admin picker: display clean requirement-compliant message
  if (!hasValidCoords && !isAdminPicker) {
    return (
      <div className={`p-4 bg-[#FAF6EE] rounded-xl border border-[#EADBCA] text-xs text-neutral-700 space-y-2 ${className}`}>
        <div className="flex items-center space-x-2 text-[#993300] font-bold">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="font-serif text-sm">📍 Delivery Location</span>
        </div>
        <div className="bg-white/80 p-3.5 rounded-lg border border-[#DFC7A2] flex items-start space-x-3">
          <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
            <Navigation className="w-4 h-4 opacity-70" />
          </div>
          <div>
            <p className="font-bold text-neutral-900">
              Live delivery location is not available yet.
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Location will appear after your order is dispatched.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#FAF6EE] p-4 rounded-xl border border-[#EADBCA] space-y-3 ${className}`}>
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-[#993300] font-bold">
            <MapPin className="w-4 h-4" />
            <span className="font-serif text-sm">📍 Delivery Location</span>
          </div>
          {resolvedLocName && (
            <p className="text-xs font-semibold text-neutral-900 mt-0.5">
              {resolvedLocName}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2 text-[11px]">
          {formattedTime && (
            <span className="text-neutral-500 flex items-center space-x-1 bg-white px-2 py-0.5 rounded-md border border-[#EADBCA]">
              <Clock className="w-3 h-3 text-neutral-400" />
              <span>Last updated: {formattedTime}</span>
            </span>
          )}

          <span
            className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[10px] flex items-center space-x-1 ${
              resolvedIsLive
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${resolvedIsLive ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'}`} />
            <span>{resolvedIsLive ? 'Live Tracking: Active' : 'Status: ' + resolvedStatusText}</span>
          </span>
        </div>
      </div>

      {/* Map Element */}
      <div className="relative rounded-lg overflow-hidden border border-[#D9C4A2] bg-neutral-100 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-56 sm:h-64 z-0" />

        {mapError && (
          <div className="absolute inset-0 bg-[#FAF6EE]/95 flex flex-col items-center justify-center p-4 text-center">
            <AlertCircle className="w-8 h-8 text-amber-600 mb-1" />
            <p className="text-xs font-bold text-neutral-800">{mapError}</p>
            {currentCoords && (
              <p className="text-[11px] font-mono text-neutral-600 mt-1">
                Lat: {currentCoords.lat}, Lng: {currentCoords.lng}
              </p>
            )}
          </div>
        )}

        {isAdminPicker && (
          <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-xs text-white p-2 rounded text-[10px] z-1000 flex items-center justify-between pointer-events-auto">
            <span>💡 Click or drag pin to update package location</span>
            {currentCoords && (
              <span className="font-mono text-amber-300 font-bold">
                {currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Admin Quick Hub Presets */}
      {isAdminPicker && (
        <div className="space-y-1.5 pt-1">
          <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wide">
            Quick Karnataka & Regional Hub Presets:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {KARNATAKA_LOGISTICS_HUBS.map(hub => (
              <button
                key={hub.name}
                type="button"
                onClick={() => {
                  setCurrentCoords({ lat: hub.lat, lng: hub.lng });
                  if (onLocationSelect) {
                    onLocationSelect({
                      latitude: hub.lat,
                      longitude: hub.lng,
                      locationName: hub.name
                    });
                  }
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView([hub.lat, hub.lng], 12);
                  }
                }}
                className="px-2.5 py-1 bg-white hover:bg-[#FAF6EE] text-neutral-800 hover:text-[#993300] border border-[#D9C4A2] rounded text-[10px] font-semibold transition-colors cursor-pointer"
              >
                {hub.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Destination Reference */}
      {resolvedDestCity && (
        <div className="text-[11px] text-neutral-600 flex items-center justify-between border-t border-[#EADBCA] pt-2">
          <span>Destination City: <strong className="text-neutral-900">{resolvedDestCity}{resolvedDestState ? `, ${resolvedDestState}` : ''}</strong></span>
          <span className="text-[10px] text-neutral-500 font-mono">Carrier: {resolvedStatusText}</span>
        </div>
      )}
    </div>
  );
};
