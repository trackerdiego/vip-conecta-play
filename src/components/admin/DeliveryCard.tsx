import { useState } from 'react';
import { MapPin, Navigation, Clock, DollarSign, AlertTriangle, ChevronDown, ChevronUp, Battery, MessageCircle, FileText, Calendar, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { DriverInfo, ActiveDelivery, AlertLevel } from '@/hooks/useAdminOperations';

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

function distanceProgress(km: number | null) {
  if (km == null) return 0;
  // 0km = 100%, 5km+ = 0%
  return Math.max(0, Math.min(100, (1 - km / 5) * 100));
}

function statusBadge(driver: DriverInfo) {
  if (!driver.is_online) return { label: 'Offline', cls: 'bg-muted text-muted-foreground' };
  if (!driver.active_deliveries.length) return { label: 'Disponível', cls: 'bg-green-500/20 text-green-400 border-green-500/30' };
  const hasPickedUp = driver.active_deliveries.some((d) => d.status === 'picked_up');
  if (hasPickedUp) return { label: 'Em Rota', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
  const hasAccepted = driver.active_deliveries.some((d) => d.status === 'accepted');
  if (hasAccepted) return { label: 'Coletando', cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
  return { label: 'Aguardando', cls: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
}

function elapsedTime(iso: string | null) {
  if (!iso) return null;
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min`;
  return `${Math.floor(mins / 60)}h${mins % 60}m`;
}

function alertBorderClass(level: AlertLevel) {
  if (level === 'critical') return 'border-red-500/60 bg-red-500/5';
  if (level === 'warning') return 'border-yellow-500/60 bg-yellow-500/5';
  return '';
}

function DeliveryItem({ delivery }: { delivery: ActiveDelivery }) {
  const elapsed = elapsedTime(delivery.accepted_at);
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-border/30 last:border-0">
      <Navigation className="h-3 w-3 shrink-0 mt-0.5 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="text-xs truncate text-foreground">{delivery.delivery_address}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge variant="outline" className="text-[9px] px-1 py-0">
            {delivery.status === 'picked_up' ? 'Em rota' : delivery.status === 'accepted' ? 'Coletando' : 'Pendente'}
          </Badge>
          {elapsed && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <Clock className="h-2.5 w-2.5" /> {elapsed}
            </span>
          )}
          <span className="text-[10px] font-medium text-foreground ml-auto">
            R$ {delivery.fare.toFixed(2).replace('.', ',')}
          </span>
          {delivery.external_order_id && (
            <span className="text-[9px] text-muted-foreground">#{delivery.external_order_id.slice(-6)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export function DeliveryCard({ driver, selected, onSelect }: DeliveryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const badge = statusBadge(driver);
  const elapsed = elapsedTime(driver.oldest_accepted_at);

  return (
    <div
      onClick={() => onSelect(driver.id)}
      className={cn(
        'p-3 rounded-xl border cursor-pointer transition-all',
        'hover:border-primary/40 hover:bg-accent/50',
        selected ? 'border-primary bg-accent' : 'border-border bg-card',
        alertBorderClass(driver.alert_level)
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn('w-2 h-2 rounded-full shrink-0', driver.is_online ? 'bg-green-500' : 'bg-muted-foreground')} />
          <span className="font-medium text-sm truncate text-foreground">{driver.full_name}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {driver.alert_level !== 'none' && (
            <AlertTriangle className={cn('h-3.5 w-3.5', driver.alert_level === 'critical' ? 'text-red-500' : 'text-yellow-500')} />
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Battery className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent><p className="text-xs">Bateria: N/D (requer app Traccar nativo)</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Badge className={cn('text-[10px]', badge.cls)}>{badge.label}</Badge>
        </div>
      </div>

      {/* Distance bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <MapPin className={cn('h-3.5 w-3.5 shrink-0', distanceColor(driver.distance_km))} />
            <span className={cn('text-xs font-medium', distanceColor(driver.distance_km))}>
              {driver.distance_km != null ? `${driver.distance_km.toFixed(1)} km` : 'Sem loc.'}
            </span>
          </div>
          {driver.eta_minutes != null && (
            <span className="text-[10px] text-muted-foreground">ETA ~{driver.eta_minutes}min</span>
          )}
        </div>
        <Progress value={distanceProgress(driver.distance_km)} className="h-1" />
      </div>

      {/* Summary row */}
      {driver.active_deliveries.length > 0 && (
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-3">
            {elapsed && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" /> {elapsed}
              </span>
            )}
            <span className="flex items-center gap-1 font-medium text-foreground">
              <DollarSign className="h-3 w-3" />
              R$ {driver.total_fare.toFixed(2).replace('.', ',')}
            </span>
            {driver.active_deliveries.length > 1 && (
              <Badge variant="secondary" className="text-[9px] px-1 py-0">
                {driver.active_deliveries.length} pedidos
              </Badge>
            )}
          </div>
          {driver.avg_min_per_km != null && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                    <TrendingUp className="h-3 w-3" /> {driver.avg_min_per_km.toFixed(1)} min/km
                  </span>
                </TooltipTrigger>
                <TooltipContent><p className="text-xs">Tempo médio de entrega por KM (histórico)</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}

      {/* Expandable deliveries list */}
      {driver.active_deliveries.length > 0 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="w-full flex items-center justify-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {expanded ? 'Recolher' : `Ver ${driver.active_deliveries.length} pedido(s)`}
          </button>
          {expanded && (
            <div className="pt-1 border-t border-border/50">
              {driver.active_deliveries.map((del) => (
                <DeliveryItem key={del.id} delivery={del} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Action buttons */}
      <div className="flex gap-1.5 mt-2">
        {driver.lat != null && (
          <Button
            size="sm"
            variant="ghost"
            className="flex-1 h-7 text-xs text-primary hover:text-primary"
            onClick={(e) => { e.stopPropagation(); onSelect(driver.id); }}
          >
            <MapPin className="h-3 w-3 mr-1" /> Mapa
          </Button>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={(e) => e.stopPropagation()}>
                <MessageCircle className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p className="text-xs">Chat (em breve)</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={(e) => e.stopPropagation()}>
                <FileText className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p className="text-xs">Abrir chamado (em breve)</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={(e) => e.stopPropagation()}>
                <Calendar className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p className="text-xs">Escala: Sem escala hoje</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
