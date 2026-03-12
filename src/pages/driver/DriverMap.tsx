import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { DriverStatusPill } from '@/components/shared/DriverStatusPill';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { BottomNav } from '@/components/shared/BottomNav';
import { Button } from '@/components/ui/button';
import { mockDriver, mockDeliveryOffer } from '@/data/mockData';
import { toast } from 'sonner';
import { MapPin, Navigation, X, Check } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon
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

export default function DriverMap() {
  const [isOnline, setIsOnline] = useState(mockDriver.isOnline);
  const [position, setPosition] = useState<[number, number]>([-3.7319, -38.5267]); // Fortaleza default
  const [showOffer, setShowOffer] = useState(false);
  const [activeDelivery, setActiveDelivery] = useState<'none' | 'to_pickup' | 'to_delivery'>('none');
  const [countdown, setCountdown] = useState(30);

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

  // Simulate delivery offer after going online
  useEffect(() => {
    if (!isOnline || activeDelivery !== 'none') return;
    const timer = setTimeout(() => setShowOffer(true), 3000);
    return () => clearTimeout(timer);
  }, [isOnline, activeDelivery]);

  // Countdown timer
  useEffect(() => {
    if (!showOffer) { setCountdown(30); return; }
    if (countdown <= 0) {
      setShowOffer(false);
      toast.error('Corrida expirada');
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [showOffer, countdown]);

  const handleAccept = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(100);
    setShowOffer(false);
    setActiveDelivery('to_pickup');
    toast.success('Corrida aceita! Vá até o local de coleta.');
  }, []);

  const handleReject = useCallback(() => {
    setShowOffer(false);
    toast('Corrida recusada');
  }, []);

  const handlePickup = () => {
    setActiveDelivery('to_delivery');
    toast.success('Coleta confirmada! Siga para a entrega.');
  };

  const handleDelivered = () => {
    setActiveDelivery('none');
    toast.success(`R$ ${mockDeliveryOffer.fare.toFixed(2)} creditados! 🎉`);
  };

  const toggleOnline = () => {
    setIsOnline(!isOnline);
    toast(isOnline ? 'Você está offline' : 'Você está online! Aguardando corridas...');
  };

  const offer = mockDeliveryOffer;
  const circumference = 2 * Math.PI * 30;
  const strokeDashoffset = circumference * (1 - countdown / 30);

  return (
    <div className="fixed inset-0 bg-background">
      {/* Map Layer */}
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position} icon={driverIcon} />
        <MapCenterUpdater center={position} />
      </MapContainer>

      {/* Top Bar */}
      <div className="absolute top-4 left-0 right-0 z-[1000] flex justify-center px-4">
        <DriverStatusPill isOnline={isOnline} onToggle={toggleOnline} />
      </div>

      {/* Avatar top right */}
      <div className="absolute top-4 right-4 z-[1000]">
        <div className="h-10 w-10 rounded-full bg-brand-purple flex items-center justify-center text-sm font-bold text-primary-foreground shadow-lg">
          {mockDriver.name.charAt(0)}
        </div>
      </div>

      {/* Earnings mini card */}
      {isOnline && activeDelivery === 'none' && !showOffer && (
        <div className="absolute bottom-24 left-4 z-[1000]">
          <div className="bg-background rounded-2xl shadow-xl px-4 py-3 border border-border">
            <p className="text-xs text-muted-foreground">Hoje</p>
            <CurrencyDisplay value={mockDriver.earningsToday} size="sm" className="text-brand-green" />
          </div>
        </div>
      )}

      {/* Delivery Offer Bottom Sheet */}
      <AnimatePresence>
        {showOffer && (
          <motion.div
            initial={{ y: 500 }}
            animate={{ y: 0 }}
            exit={{ y: 500 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-20 left-0 right-0 z-[1000] px-4"
          >
            <div className="bg-background rounded-3xl shadow-2xl border border-border p-5 max-w-md mx-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading font-bold text-lg">🛵 Nova Corrida!</h3>
                <div className="relative h-14 w-14">
                  <svg className="h-14 w-14 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="30" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
                    <circle
                      cx="32" cy="32" r="30"
                      fill="none"
                      stroke="hsl(var(--brand-purple))"
                      strokeWidth="3"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold font-heading">
                    {countdown}s
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-brand-purple mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-muted-foreground">Coleta</p>
                    <p className="text-sm font-medium">{offer.pickupAddress}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Navigation className="h-4 w-4 text-brand-green mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-muted-foreground">Entrega</p>
                    <p className="text-sm font-medium">{offer.deliveryAddress}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3 mb-4">
                <span className="text-sm">📏 {offer.distanceKm} km</span>
                <CurrencyDisplay value={offer.fare} size="md" className="text-brand-green" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={handleReject} className="rounded-xl h-12">
                  <X className="h-4 w-4 mr-1" /> Recusar
                </Button>
                <Button onClick={handleAccept} className="rounded-xl h-12 bg-brand-green hover:bg-brand-green/90 text-primary-foreground">
                  <Check className="h-4 w-4 mr-1" /> Aceitar
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Delivery Sheet */}
      <AnimatePresence>
        {activeDelivery !== 'none' && (
          <motion.div
            initial={{ y: 300 }}
            animate={{ y: 0 }}
            exit={{ y: 300 }}
            transition={{ type: 'spring', damping: 25 }}
            className="absolute bottom-20 left-0 right-0 z-[1000] px-4"
          >
            <div className="bg-background rounded-3xl shadow-2xl border border-border p-5 max-w-md mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <div className={`h-2 w-2 rounded-full ${activeDelivery === 'to_pickup' ? 'bg-brand-orange animate-pulse' : 'bg-brand-green'}`} />
                <h3 className="font-heading font-bold">
                  {activeDelivery === 'to_pickup' ? 'A Caminho da Coleta' : 'Em Rota de Entrega'}
                </h3>
              </div>

              <div className="rounded-xl bg-muted/50 p-3 mb-4 text-sm">
                <p className="text-muted-foreground text-xs">
                  {activeDelivery === 'to_pickup' ? 'Coleta' : 'Entrega'}
                </p>
                <p className="font-medium">
                  {activeDelivery === 'to_pickup' ? offer.pickupAddress : offer.deliveryAddress}
                </p>
              </div>

              <Button
                onClick={activeDelivery === 'to_pickup' ? handlePickup : handleDelivered}
                className="w-full h-14 rounded-2xl bg-brand-green hover:bg-brand-green/90 text-primary-foreground font-heading text-base font-bold"
              >
                {activeDelivery === 'to_pickup' ? '📍 Cheguei na Coleta' : '✅ Entrega Concluída'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav variant="driver" />
    </div>
  );
}
