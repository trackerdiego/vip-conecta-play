import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { DriverStatusPill } from '@/components/shared/DriverStatusPill';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { BottomNav } from '@/components/shared/BottomNav';
import { MapStyleSelector, useMapStyle } from '@/components/shared/MapStyleSelector';
import { DeliveryOfferSheet } from '@/components/driver/DeliveryOfferSheet';
import { ActiveDeliverySheet } from '@/components/driver/ActiveDeliverySheet';
import { RouteDisplay } from '@/components/driver/RouteDisplay';
import { useAuthStore } from '@/stores/authStore';
import { useDeliveries } from '@/hooks/useDeliveries';
import { useDriverLocation } from '@/hooks/useDriverLocation';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner';
import 'leaflet/dist/leaflet.css';

const driverIcon = L.divIcon({
  html: '<div style="font-size:24px">🛵</div>',
  className: 'bg-transparent',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

// Notification beep using Web Audio API
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
    // Play a second beep
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
  } catch {
    // Audio not available
  }
}

export default function DriverMap() {
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const [isOnline, setIsOnline] = useState(profile?.is_online ?? false);
  const [position, setPosition] = useState<[number, number]>([-3.7319, -38.5267]);
  const [countdown, setCountdown] = useState(30);
  const [showOffer, setShowOffer] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);
  const { style, setStyle, tileUrl } = useMapStyle();
  const prevOfferRef = useRef<string | null>(null);

  const { activeDelivery, pendingOffer, dismissOffer, acceptDelivery, updateDeliveryStatus } = useDeliveries();
  const { balance } = useWallet();
  useDriverLocation(isOnline);

  // isOnline is initialized from profile and managed locally — no re-sync from profile

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
      null,
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  // Show offer + alert when pending arrives
  useEffect(() => {
    if (pendingOffer && isOnline && !activeDelivery) {
      setShowOffer(true);
      setCountdown(30);
      // Play sound only for new offers
      if (prevOfferRef.current !== pendingOffer.id) {
        prevOfferRef.current = pendingOffer.id;
        playNotificationBeep();
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      }
    }
  }, [pendingOffer, isOnline, activeDelivery]);

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

  const handlePickup = () => {
    if (!activeDelivery) return;
    updateDeliveryStatus.mutate({ id: activeDelivery.id, status: 'picked_up' });
    toast.success('Coleta confirmada! Siga para a entrega.');
  };

  const handleDelivered = () => {
    if (!activeDelivery) return;
    updateDeliveryStatus.mutate({ id: activeDelivery.id, status: 'delivered' });
    toast.success(`R$ ${Number(activeDelivery.fare).toFixed(2)} creditados! 🎉`);
  };

  const toggleOnline = () => {
    const newState = !isOnline;
    setIsOnline(newState);
    if (profile) {
      setProfile({ ...profile, is_online: newState });
    }
    toast(newState ? 'Você está online! Aguardando corridas...' : 'Você está offline');
  };

  return (
    <div className="fixed inset-0 bg-background">
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url={tileUrl} attribution='&copy; <a href="https://locationiq.com">LocationIQ</a>' />
        <Marker position={position} icon={driverIcon} />
        <MapCenterUpdater center={position} />
        {activeDelivery && (() => {
          const isPickup = activeDelivery.status === 'accepted';
          const destLat = isPickup ? activeDelivery.pickup_lat : activeDelivery.delivery_lat;
          const destLng = isPickup ? activeDelivery.pickup_lng : activeDelivery.delivery_lng;
          if (destLat && destLng) {
            return (
              <RouteDisplay
                origin={position}
                destination={[destLat, destLng]}
                onRouteFound={(distance, duration) => setRouteInfo({ distance, duration })}
              />
            );
          }
          return null;
        })()}
      </MapContainer>

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

      {/* Earnings mini card */}
      {isOnline && !activeDelivery && !showOffer && (
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

      {/* Active Delivery */}
      <AnimatePresence>
        {activeDelivery && (
          <ActiveDeliverySheet
            delivery={activeDelivery}
            onPickup={handlePickup}
            onDelivered={handleDelivered}
            routeInfo={routeInfo}
          />
        )}
      </AnimatePresence>

      <BottomNav variant="driver" />
    </div>
  );
}
