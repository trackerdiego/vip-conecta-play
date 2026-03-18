import { cn } from '@/lib/utils';
import { Loader2, Radio } from 'lucide-react';
import { DeliveryCard } from './DeliveryCard';
import type { DriverInfo } from '@/hooks/useAdminOperations';

type StatusFilter = 'all' | 'online' | 'em_rota' | 'alerta';

interface OperationsSidebarProps {
  drivers: DriverInfo[];
  filter: StatusFilter;
  setFilter: (f: StatusFilter) => void;
  counts: Record<StatusFilter, number>;
  loading: boolean;
  selectedId: string | null;
  onSelectDriver: (id: string) => void;
}

const FILTERS: { key: StatusFilter; label: string; color: string }[] = [
  { key: 'all', label: 'Todos', color: 'bg-muted text-foreground' },
  { key: 'online', label: 'Online', color: 'bg-green-500/20 text-green-400' },
  { key: 'em_rota', label: 'Em Rota', color: 'bg-blue-500/20 text-blue-400' },
  { key: 'alerta', label: 'Alerta', color: 'bg-red-500/20 text-red-400' },
];

export function OperationsSidebar({
  drivers,
  filter,
  setFilter,
  counts,
  loading,
  selectedId,
  onSelectDriver,
}: OperationsSidebarProps) {
  return (
    <div className="h-full flex flex-col bg-background border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <Radio className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground text-lg">Central de Operações</h2>
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'px-2.5 py-1 rounded-full text-xs font-medium transition-all',
                filter === f.key ? `${f.color} ring-1 ring-primary/30` : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              )}
            >
              {f.label} ({counts[f.key]})
            </button>
          ))}
        </div>
      </div>

      {/* Driver list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : drivers.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-12">Nenhum entregador encontrado</p>
        ) : (
          drivers.map((d) => (
            <DeliveryCard key={d.id} driver={d} selected={selectedId === d.id} onSelect={onSelectDriver} />
          ))
        )}
      </div>
    </div>
  );
}
