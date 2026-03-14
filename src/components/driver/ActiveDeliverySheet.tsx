import { useState } from 'react';
import { MapPin, Navigation, ExternalLink, Package } from 'lucide-react';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import type { DeliveryPhase } from '@/hooks/useDeliveries';

interface ActiveDeliverySheetProps {
  deliveries: any[];
  currentIndex: number;
  onSelectIndex: (i: number) => void;
  phase: DeliveryPhase;
  onPickup: (delivery: any) => void;
  onDelivered: (delivery: any) => void;
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

export function ActiveDeliverySheet({
  deliveries,
  currentIndex,
  onSelectIndex,
  phase,
  onPickup,
  onDelivered,
  routeInfo,
}: ActiveDeliverySheetProps) {
  const [open, setOpen] = useState(true);
  const current = deliveries[currentIndex];
  if (!current) return null;

  const isPickup = current.status === 'accepted';
  const totalFare = deliveries.reduce((sum: number, d: any) => sum + Number(d.fare), 0);

  const handleNavigate = () => {
    if (isPickup) {
      openNavigation(current.pickup_lat, current.pickup_lng, current.pickup_address);
    } else {
      openNavigation(current.delivery_lat, current.delivery_lng, current.delivery_address);
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      snapPoints={[0.18, 0.55]}
      activeSnapPoint={open ? 0.55 : 0.18}
      onClose={() => setOpen(false)}
      modal={false}
      dismissible={false}
    >
      <DrawerContent className="z-[1000] bg-background border-t border-border rounded-t-3xl shadow-2xl">
        {/* Mini bar */}
        <div className="px-4 pt-1 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${phase === 'collecting' ? 'bg-brand-orange animate-pulse' : 'bg-brand-green animate-pulse'}`} />
              <span className="font-heading font-bold text-sm">
                {phase === 'collecting' ? 'Fase de Coleta' : 'Fase de Entrega'}
              </span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                <Package className="h-3 w-3 mr-0.5" />
                {deliveries.length}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {routeInfo && (
                <span className="text-xs font-semibold text-muted-foreground">
                  {formatDistance(routeInfo.distance)} · {formatDuration(routeInfo.duration)}
                </span>
              )}
              <CurrencyDisplay value={totalFare} size="sm" className="text-brand-green" />
            </div>
          </div>
        </div>

        {/* Delivery chips */}
        {deliveries.length > 1 && (
          <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
            {deliveries.map((d: any, i: number) => {
              const isActive = i === currentIndex;
              const collected = d.status === 'picked_up';
              return (
                <button
                  key={d.id}
                  onClick={() => onSelectIndex(i)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-brand-purple text-primary-foreground shadow-md'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {collected ? '✅' : '📦'} #{i + 1}
                </button>
              );
            })}
          </div>
        )}

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
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                  {isPickup ? 'Coleta' : 'Entrega'} — Pedido #{currentIndex + 1}
                </p>
                <p className="text-sm font-medium truncate">
                  {isPickup ? current.pickup_address : current.delivery_address}
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Button
              onClick={() => isPickup ? onPickup(current) : onDelivered(current)}
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
