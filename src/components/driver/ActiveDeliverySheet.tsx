import { motion } from 'framer-motion';
import { MapPin, Navigation, ExternalLink, Clock, Route } from 'lucide-react';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { Button } from '@/components/ui/button';

interface ActiveDeliverySheetProps {
  delivery: any;
  onPickup: () => void;
  onDelivered: () => void;
  routeInfo?: { distance: number; duration: number } | null;
}

function openNavigation(lat: number | null, lng: number | null, address: string) {
  if (lat && lng) {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  } else {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  }
}

function formatDistance(meters: number): string {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
}

function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h${mins % 60}min`;
}

export function ActiveDeliverySheet({ delivery, onPickup, onDelivered, routeInfo }: ActiveDeliverySheetProps) {
  const status = delivery.status;
  const isPickup = status === 'accepted';

  const handleNavigate = () => {
    if (isPickup) {
      openNavigation(delivery.pickup_lat, delivery.pickup_lng, delivery.pickup_address);
    } else {
      openNavigation(delivery.delivery_lat, delivery.delivery_lng, delivery.delivery_address);
    }
  };

  return (
    <motion.div
      initial={{ y: 300 }}
      animate={{ y: 0 }}
      exit={{ y: 300 }}
      transition={{ type: 'spring', damping: 25 }}
      className="absolute bottom-20 left-0 right-0 z-[1000] px-4"
    >
      <div className="bg-background rounded-3xl shadow-2xl border border-border p-4 max-w-md mx-auto">
        {/* Compact header with status + fare + route info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isPickup ? 'bg-brand-orange animate-pulse' : 'bg-brand-green'}`} />
            <h3 className="font-heading font-bold text-sm">
              {isPickup ? 'Coleta' : 'Entrega'}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {routeInfo && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Route className="h-3 w-3" />
                  <span className="font-semibold text-foreground">{formatDistance(routeInfo.distance)}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span className="font-semibold text-foreground">{formatDuration(routeInfo.duration)}</span>
                </span>
              </div>
            )}
            <CurrencyDisplay value={Number(delivery.fare)} size="sm" className="text-brand-green" />
          </div>
        </div>

        {/* Compact address */}
        <div className="rounded-xl p-2.5 mb-3 bg-muted/50">
          <div className="flex items-center gap-2">
            {isPickup ? (
              <MapPin className="h-4 w-4 shrink-0 text-brand-purple" />
            ) : (
              <Navigation className="h-4 w-4 shrink-0 text-brand-green" />
            )}
            <p className="text-sm font-medium truncate">
              {isPickup ? delivery.pickup_address : delivery.delivery_address}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Button
            onClick={isPickup ? onPickup : onDelivered}
            className="h-12 rounded-2xl bg-brand-green hover:bg-brand-green/90 text-primary-foreground font-heading text-sm font-bold"
          >
            {isPickup ? '📍 Cheguei na Coleta' : '✅ Entrega Concluída'}
          </Button>
          <Button
            variant="outline"
            onClick={handleNavigate}
            className="h-12 w-12 rounded-2xl p-0"
            title="Abrir no Google Maps"
          >
            <ExternalLink className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
