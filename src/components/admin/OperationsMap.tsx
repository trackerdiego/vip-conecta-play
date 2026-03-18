import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapStyle, MapStyleSelector, getTileUrl } from '@/components/shared/MapStyleSelector';
import { STORE_LAT, STORE_LNG, STORE_ADDRESS } from '@/hooks/useAdminOperations';
import type { DriverInfo } from '@/hooks/useAdminOperations';

interface OperationsMapProps {
  drivers: DriverInfo[];
  selectedId: string | null;
}

function driverIcon(online: boolean, hasDelivery: boolean) {
  const color = !online ? '#6b7280' : hasDelivery ? '#3b82f6' : '#22c55e';
  return L.divIcon({
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    html: `<div style="
      width:32px;height:32px;border-radius:50%;
      background:${color};border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
      font-size:16px;
    ">🛵</div>`,
  });
}

const storeIcon = L.divIcon({
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  html: `<div style="
    width:40px;height:40px;border-radius:50%;
    background:hsl(263 70% 50%);border:3px solid white;
    box-shadow:0 2px 12px rgba(0,0,0,0.4);
    display:flex;align-items:center;justify-content:center;
    font-size:20px;
  ">🏪</div>`,
});

export function OperationsMap({ drivers, selectedId }: OperationsMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const storeMarkerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { style, setStyle, tileUrl } = useMapStyle();

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [STORE_LAT, STORE_LNG],
      zoom: 14,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    const tile = L.tileLayer(tileUrl, {
      attribution: '© LocationIQ',
      maxZoom: 18,
    }).addTo(map);

    const marker = L.marker([STORE_LAT, STORE_LNG], { icon: storeIcon })
      .addTo(map)
      .bindPopup(`<strong>Parada do Açaí</strong><br/>${STORE_ADDRESS}`);

    mapRef.current = map;
    tileRef.current = tile;
    storeMarkerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update tiles on style change
  useEffect(() => {
    if (!tileRef.current) return;
    tileRef.current.setUrl(getTileUrl(style));
  }, [style]);

  // Update driver markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentIds = new Set(drivers.map((d) => d.id));

    // Remove old markers
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add/update markers
    drivers.forEach((d) => {
      if (d.lat == null || d.lng == null) return;

      const existing = markersRef.current.get(d.id);
      const icon = driverIcon(d.is_online, !!d.active_delivery);
      const popup = `<strong>${d.full_name}</strong><br/>${
        d.distance_km != null ? `${d.distance_km.toFixed(1)} km da loja` : 'Sem posição'
      }${d.active_delivery ? `<br/>Entrega: ${d.active_delivery.delivery_address}` : ''}`;

      if (existing) {
        existing.setLatLng([d.lat, d.lng]);
        existing.setIcon(icon);
        existing.setPopupContent(popup);
      } else {
        const marker = L.marker([d.lat, d.lng], { icon })
          .addTo(map)
          .bindPopup(popup);
        markersRef.current.set(d.id, marker);
      }
    });
  }, [drivers]);

  // Fly to selected
  useEffect(() => {
    if (!selectedId || !mapRef.current) return;
    const driver = drivers.find((d) => d.id === selectedId);
    if (driver?.lat != null && driver?.lng != null) {
      mapRef.current.flyTo([driver.lat, driver.lng], 16, { duration: 1 });
      const marker = markersRef.current.get(selectedId);
      if (marker) marker.openPopup();
    }
  }, [selectedId, drivers]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      <MapStyleSelector current={style} onChange={setStyle} />
    </div>
  );
}
