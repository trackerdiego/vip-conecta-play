import { useState } from 'react';
import { MapPin, Navigation, ExternalLink, Clock, Route, GripHorizontal } from 'lucide-react';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';

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
  const [open, setOpen] = useState(true);
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
    <Drawer
      open={open}
      onOpenChange={setOpen}
      snapPoints={[0.15, 0.45]}
      activeSnapPoint={open ? 0.45 : 0.15}
      onClose={() => setOpen(false)}
      modal={false}
      dismissible={false}
    >
      <DrawerContent className="z-[1000] bg-background border-t border-border rounded-t-3xl shadow-2xl">
        {/* Compact mini-bar always visible */}
        <div className="px-4 pt-1 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${isPickup ? 'bg-brand-orange animate-pulse' : 'bg-brand-green'}`} />
              <span className="font-heading font-bold text-sm">
                {isPickup ? 'Indo para Coleta' : 'Indo para Entrega'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {routeInfo && (
                <span className="text-xs font-semibold text-muted-foreground">
                  {formatDistance(routeInfo.distance)} · {formatDuration(routeInfo.duration)}
                </span>
              )}
              <CurrencyDisplay value={Number(delivery.fare)} size="sm" className="text-brand-green" />
            </div>
          </div>
        </div>

        {/* Expanded content */}
        <div className="px-4 pb-4 space-y-3">
          {/* Address */}
          <div className="rounded-xl p-3 bg-muted/50">
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

          {/* Action buttons */}
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
      </DrawerContent>
    </Drawer>
  );
}
