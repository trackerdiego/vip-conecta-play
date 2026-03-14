import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { BottomNav } from '@/components/shared/BottomNav';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { Skeleton } from '@/components/ui/skeleton';

const periods = ['Hoje', 'Semana', 'Mês'] as const;

function getDateFilter(period: string): string {
  const now = new Date();
  if (period === 'Hoje') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  }
  if (period === 'Semana') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.getFullYear(), now.getMonth(), diff).toISOString();
  }
  // Mês
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export default function DriverHistory() {
  const user = useAuthStore((s) => s.user);
  const [activePeriod, setActivePeriod] = useState<string>('Hoje');

  const { data: deliveries, isLoading } = useQuery({
    queryKey: ['driver-history', user?.id, activePeriod],
    enabled: !!user,
    queryFn: async () => {
      const from = getDateFilter(activePeriod);
      const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .eq('driver_id', user!.id)
        .in('status', ['delivered', 'cancelled'])
        .gte('created_at', from)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const completed = deliveries?.filter((d) => d.status === 'delivered') ?? [];
  const total = completed.reduce((sum, d) => sum + Number(d.fare), 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 pt-6">
        <h1 className="font-heading text-2xl font-bold text-foreground mb-4">📋 Histórico de Corridas</h1>

        {/* Period filter */}
        <div className="flex gap-2 mb-4">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setActivePeriod(p)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                activePeriod === p
                  ? 'bg-brand-purple text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Total */}
        <div className="rounded-2xl bg-brand-green/10 border border-brand-green/20 p-4 mb-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Total do período</p>
          <CurrencyDisplay value={total} size="lg" className="text-brand-green" />
          <p className="text-xs text-muted-foreground mt-1">{completed.length} corridas</p>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : deliveries && deliveries.length > 0 ? (
          <div className="space-y-2">
            {deliveries.map((d) => (
              <div key={d.id} className="rounded-xl border border-border bg-card p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{d.delivery_address}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(d.created_at!).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right">
                  <CurrencyDisplay
                    value={Number(d.fare)}
                    size="sm"
                    className={d.status === 'cancelled' ? 'text-destructive line-through' : 'text-brand-green'}
                  />
                  <span className={`block text-[10px] mt-0.5 ${
                    d.status === 'delivered' ? 'text-brand-green' : 'text-destructive'
                  }`}>
                    {d.status === 'delivered' ? 'Entregue' : 'Cancelada'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground text-sm py-8">Nenhuma corrida neste período</p>
        )}
      </div>
      <BottomNav variant="driver" />
    </div>
  );
}
