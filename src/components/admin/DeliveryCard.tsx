import { MapPin, Navigation, Clock, DollarSign, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DriverInfo } from '@/hooks/useAdminOperations';

interface DeliveryCardProps {
  driver: DriverInfo;
  selected: boolean;
  onSelect: (id: string) => void;
}

function distanceColor(km: number | null) {
  if (km == null) return 'text-muted-foreground';
  if (km < 1) return 'text-green-500';
  if (km < 3) return 'text-yellow-500';
  return 'text-red-500';
}

function statusBadge(driver: DriverInfo) {
  if (!driver.is_online) return { label: 'Offline', cls: 'bg-muted text-muted-foreground' };
  if (!driver.active_delivery) return { label: 'Disponível', cls: 'bg-green-500/20 text-green-400 border-green-500/30' };
  const s = driver.active_delivery.status;
  if (s === 'picked_up') return { label: 'Em Rota', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
  if (s === 'accepted') return { label: 'Coletando', cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
  return { label: 'Aguardando', cls: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
}

function elapsedTime(iso: string | null) {
  if (!iso) return null;
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min`;
  return `${Math.floor(mins / 60)}h${mins % 60}m`;
}

export function DeliveryCard({ driver, selected, onSelect }: DeliveryCardProps) {
  const badge = statusBadge(driver);
  const elapsed = driver.active_delivery ? elapsedTime(driver.active_delivery.accepted_at) : null;
  const isAlert = driver.active_delivery?.accepted_at
    ? Date.now() - new Date(driver.active_delivery.accepted_at).getTime() > 30 * 60 * 1000
    : false;

  return (
    <div
      onClick={() => onSelect(driver.id)}
      className={cn(
        'p-3 rounded-xl border cursor-pointer transition-all',
        'hover:border-primary/40 hover:bg-accent/50',
        selected ? 'border-primary bg-accent' : 'border-border bg-card',
        isAlert && 'border-red-500/50 bg-red-500/5'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn('w-2 h-2 rounded-full shrink-0', driver.is_online ? 'bg-green-500' : 'bg-muted-foreground')} />
          <span className="font-medium text-sm truncate text-foreground">{driver.full_name}</span>
        </div>
        <Badge className={cn('text-[10px] shrink-0', badge.cls)}>{badge.label}</Badge>
      </div>

      {/* Distance to store */}
      <div className="flex items-center gap-1.5 mb-2">
        <MapPin className={cn('h-3.5 w-3.5 shrink-0', distanceColor(driver.distance_km))} />
        <span className={cn('text-xs font-medium', distanceColor(driver.distance_km))}>
          {driver.distance_km != null ? `${driver.distance_km.toFixed(1)} km da loja` : 'Sem localização'}
        </span>
        {isAlert && <AlertTriangle className="h-3.5 w-3.5 text-red-500 ml-auto" />}
      </div>

      {/* Active delivery info */}
      {driver.active_delivery && (
        <div className="space-y-1.5 pt-2 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Navigation className="h-3 w-3 shrink-0" />
            <span className="truncate">{driver.active_delivery.delivery_address}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {elapsed && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {elapsed}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs font-medium text-foreground">
                <DollarSign className="h-3 w-3" />
                R$ {driver.active_delivery.fare.toFixed(2).replace('.', ',')}
              </span>
            </div>
            {driver.active_delivery.external_order_id && (
              <span className="text-[10px] text-muted-foreground">#{driver.active_delivery.external_order_id.slice(-6)}</span>
            )}
          </div>
        </div>
      )}

      {/* Fly-to button */}
      {driver.lat != null && (
        <Button
          size="sm"
          variant="ghost"
          className="w-full mt-2 h-7 text-xs text-primary hover:text-primary"
          onClick={(e) => { e.stopPropagation(); onSelect(driver.id); }}
        >
          <MapPin className="h-3 w-3 mr-1" />
          Ver no mapa
        </Button>
      )}
    </div>
  );
}
