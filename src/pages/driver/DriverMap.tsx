import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Crosshair } from 'lucide-react';
import { DriverStatusPill } from '@/components/shared/DriverStatusPill';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { BottomNav } from '@/components/shared/BottomNav';
import { MapStyleSelector, useMapStyle } from '@/components/shared/MapStyleSelector';
import { DeliveryOfferSheet } from '@/components/driver/DeliveryOfferSheet';
import { ActiveDeliverySheet } from '@/components/driver/ActiveDeliverySheet';
import { RouteDisplay } from '@/components/driver/RouteDisplay';
import { NavigationBar, type NavInstruction } from '@/components/driver/NavigationBar';
import { useAuthStore } from '@/stores/authStore';
import { useDeliveries } from '@/hooks/useDeliveries';
import { useDriverLocation } from '@/hooks/useDriverLocation';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import 'leaflet/dist/leaflet.css';

// Icons
const driverIcon = L.divIcon({
  html: '<div style="font-size:28px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">🛵</div>',
  className: 'bg-transparent',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const pickupIcon = L.divIcon({
  html: '<div style="font-size:24px;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.4))">📍</div>',
  className: 'bg-transparent',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const deliveryIcon = L.divIcon({
  html: '<div style="font-size:24px;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.4))">🏠</div>',
  className: 'bg-transparent',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const pickupIconActive = L.divIcon({
  html: '<div style="font-size:32px;filter:drop-shadow(0 2px 8px rgba(249,115,22,0.6));animation:pulse 2s infinite">📍</div>',
  className: 'bg-transparent',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

const deliveryIconActive = L.divIcon({
  html: '<div style="font-size:32px;filter:drop-shadow(0 2px 8px rgba(34,197,94,0.6));animation:pulse 2s infinite">🏠</div>',
  className: 'bg-transparent',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

function NavigationFollower({ driverPos, destPos, enabled }: { driverPos: [number, number]; destPos: [number, number] | null; enabled: boolean }) {
  const map = useMap();
  const userInteractedRef = useRef(false);
  const lastFitRef = useRef('');

  useEffect(() => {
    if (!enabled) return;
    const onMove = () => { userInteractedRef.current = true; };
    map.on('dragstart', onMove);
    return () => { map.off('dragstart', onMove); };
  }, [map, enabled]);

  const recenter = useCallback(() => {
    userInteractedRef.current = false;
  }, []);

  useEffect(() => {
    if (!enabled || userInteractedRef.current) return;
    if (driverPos[0] === 0) return;

    const key = `${driverPos[0].toFixed(3)},${driverPos[1].toFixed(3)}`;
    if (key === lastFitRef.current) return;
    lastFitRef.current = key;

    if (destPos) {
      const bounds = L.latLngBounds(
        L.latLng(driverPos[0], driverPos[1]),
        L.latLng(destPos[0], destPos[1])
      );
      map.fitBounds(bounds, { padding: [100, 80], maxZoom: 17, animate: true });
    } else {
      map.setView(driverPos, 16, { animate: true });
    }
  }, [map, driverPos, destPos, enabled]);

  useEffect(() => {
    (map as any).__recenterNav = recenter;
  }, [map, recenter]);

  return null;
}

function playNotificationBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = 880;
    oscillator.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.value = 1100;
    osc2.type = 'sine';
    gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.6);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.1);
    osc2.start(ctx.currentTime + 0.6);
    osc2.stop(ctx.currentTime + 1.1);
  } catch { /* Audio not available */ }
}

export default function DriverMap() {
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const [isOnline, setIsOnline] = useState(profile?.is_online ?? false);
  const [position, setPosition] = useState<[number, number]>([-3.7319, -38.5267]);
  const [countdown, setCountdown] = useState(30);
  const [showOffer, setShowOffer] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);
  const [navInstructions, setNavInstructions] = useState<NavInstruction[]>([]);
  const { style, setStyle, tileUrl } = useMapStyle();
  const prevOfferRef = useRef<string | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  const {
    activeDeliveries,
    currentDelivery,
    currentIndex,
    setDeliveryIndex,
    phase,
    canAcceptMore,
    pendingOffer,
    dismissOffer,
    acceptDelivery,
    updateDeliveryStatus,
  } = useDeliveries();
  const { balance } = useWallet();
  useDriverLocation(isOnline);

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
      null,
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  // Show offer when pending arrives (allow even with active deliveries if under limit)
  useEffect(() => {
    if (pendingOffer && isOnline && canAcceptMore) {
      setShowOffer(true);
      setCountdown(30);
      if (prevOfferRef.current !== pendingOffer.id) {
        prevOfferRef.current = pendingOffer.id;
        playNotificationBeep();
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      }
    }
  }, [pendingOffer, isOnline, canAcceptMore]);

  // Countdown timer
  useEffect(() => {
    if (!showOffer) return;
    if (countdown <= 0) {
      setShowOffer(false);
      dismissOffer();
      toast.error('Corrida expirada');
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [showOffer, countdown, dismissOffer]);

  const handleAccept = useCallback(() => {
    if (!pendingOffer) return;
    acceptDelivery.mutate(pendingOffer.id);
    setShowOffer(false);
    toast.success('Corrida aceita! Vá até o local de coleta.');
  }, [pendingOffer, acceptDelivery]);

  const handleReject = useCallback(() => {
    setShowOffer(false);
    dismissOffer();
    toast('Corrida recusada');
  }, [dismissOffer]);

  const handlePickup = (delivery: any) => {
    updateDeliveryStatus.mutate({
      id: delivery.id,
      status: 'picked_up',
      externalOrderId: delivery.external_order_id ?? undefined,
    });
    setNavInstructions([]);
    setRouteInfo(null);
    toast.success('Coleta confirmada!');
  };

  const handleDelivered = (delivery: any) => {
    updateDeliveryStatus.mutate({
      id: delivery.id,
      status: 'delivered',
      externalOrderId: delivery.external_order_id ?? undefined,
    });
    setNavInstructions([]);
    setRouteInfo(null);
    toast.success(`R$ ${Number(delivery.fare).toFixed(2)} creditados! 🎉`);
  };

  const toggleOnline = () => {
    const newState = !isOnline;
    setIsOnline(newState);
    if (profile) {
      setProfile({ ...profile, is_online: newState });
    }
    toast(newState ? 'Você está online! Aguardando corridas...' : 'Você está offline');
  };

  const handleRecenter = () => {
    if (mapRef.current && (mapRef.current as any).__recenterNav) {
      (mapRef.current as any).__recenterNav();
    }
  };

  // Current destination for route/navigation
  const isPickup = currentDelivery?.status === 'accepted';
  const destLat = currentDelivery ? (isPickup ? currentDelivery.pickup_lat : currentDelivery.delivery_lat) : null;
  const destLng = currentDelivery ? (isPickup ? currentDelivery.pickup_lng : currentDelivery.delivery_lng) : null;
  const destPos: [number, number] | null = destLat && destLng ? [destLat, destLng] : null;

  const hasActiveDeliveries = activeDeliveries.length > 0;

  return (
    <div className="fixed inset-0 bg-background">
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
        ref={mapRef}
      >
        <TileLayer url={tileUrl} attribution='&copy; <a href="https://locationiq.com">LocationIQ</a>' />
        <Marker position={position} icon={driverIcon} />

        {/* Markers for ALL active deliveries */}
        {activeDeliveries.map((d: any, i: number) => {
          const isCurrent = i === currentIndex;
          return (
            <span key={d.id}>
              {d.pickup_lat && d.pickup_lng && (
                <Marker
                  position={[d.pickup_lat, d.pickup_lng]}
                  icon={isCurrent && d.status === 'accepted' ? pickupIconActive : pickupIcon}
                />
              )}
              {d.delivery_lat && d.delivery_lng && (
                <Marker
                  position={[d.delivery_lat, d.delivery_lng]}
                  icon={isCurrent && d.status === 'picked_up' ? deliveryIconActive : deliveryIcon}
                />
              )}
            </span>
          );
        })}

        {/* Navigation follower or idle center */}
        {hasActiveDeliveries ? (
          <NavigationFollower driverPos={position} destPos={destPos} enabled={true} />
        ) : (
          <MapCenterUpdater center={position} />
        )}

        {/* Route display for current delivery only */}
        {currentDelivery && destPos && (
          <RouteDisplay
            origin={position}
            destination={destPos}
            onRouteFound={(distance, duration) => setRouteInfo({ distance, duration })}
            onInstructionsFound={setNavInstructions}
            followDriver={true}
          />
        )}
      </MapContainer>

      {/* Navigation Bar */}
      {currentDelivery && (
        <NavigationBar
          instruction={navInstructions[0] || null}
          isPickup={!!isPickup}
          destinationLabel={isPickup ? currentDelivery.pickup_address : currentDelivery.delivery_address}
        />
      )}

      {/* Top Bar */}
      <div className="absolute top-4 left-0 right-0 z-[1000] flex justify-center px-4">
        <DriverStatusPill isOnline={isOnline} onToggle={toggleOnline} />
      </div>

      {/* Avatar top right */}
      <div className="absolute top-4 right-4 z-[1000]">
        <div className="h-10 w-10 rounded-full bg-brand-purple flex items-center justify-center text-sm font-bold text-primary-foreground shadow-lg">
          {profile?.full_name?.charAt(0) ?? 'D'}
        </div>
      </div>

      {/* Map Style Selector */}
      <MapStyleSelector current={style} onChange={setStyle} />

      {/* Recenter button */}
      {hasActiveDeliveries && (
        <div className="absolute bottom-44 right-4 z-[1000]">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRecenter}
            className="h-10 w-10 rounded-full bg-background shadow-lg"
            title="Recentralizar"
          >
            <Crosshair className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Earnings mini card */}
      {isOnline && !hasActiveDeliveries && !showOffer && (
        <div className="absolute bottom-24 left-4 z-[1000]">
          <div className="bg-background rounded-2xl shadow-xl px-4 py-3 border border-border">
            <p className="text-xs text-muted-foreground">Saldo</p>
            <CurrencyDisplay value={balance} size="sm" className="text-brand-green" />
          </div>
        </div>
      )}

      {/* Delivery Offer */}
      <AnimatePresence>
        {showOffer && pendingOffer && (
          <DeliveryOfferSheet
            offer={pendingOffer}
            countdown={countdown}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        )}
      </AnimatePresence>

      {/* Active Deliveries - Batch UI */}
      {hasActiveDeliveries && (
        <ActiveDeliverySheet
          deliveries={activeDeliveries}
          currentIndex={currentIndex}
          onSelectIndex={setDeliveryIndex}
          phase={phase}
          onPickup={handlePickup}
          onDelivered={handleDelivered}
          routeInfo={routeInfo}
        />
      )}

      <BottomNav variant="driver" />
    </div>
  );
}
