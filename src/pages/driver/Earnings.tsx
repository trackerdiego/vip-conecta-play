import { BottomNav } from '@/components/shared/BottomNav';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useWallet } from '@/hooks/useWallet';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';

export default function DriverEarnings() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { balance, totalEarned, loading: walletLoading } = useWallet();

  // Fetch completed deliveries for stats
  const { data: deliveries = [] } = useQuery({
    queryKey: ['driver-deliveries', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .eq('driver_id', user!.id)
        .eq('status', 'delivered')
        .order('delivered_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const totalDeliveries = deliveries.length;
  const totalDistance = deliveries.reduce((sum, d) => sum + (Number(d.distance_km) || 0), 0);
  const totalFare = deliveries.reduce((sum, d) => sum + Number(d.fare), 0);
  const avgPerDelivery = totalDeliveries > 0 ? totalFare / totalDeliveries : 0;

  // Build weekly chart from deliveries
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const weeklyData = dayNames.map((day, i) => {
    const dayDeliveries = deliveries.filter((d) => {
      if (!d.delivered_at) return false;
      return new Date(d.delivered_at).getDay() === i;
    });
    return { day, value: dayDeliveries.reduce((s, d) => s + Number(d.fare), 0) };
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 pt-6">
        <h1 className="font-heading text-2xl font-bold text-foreground mb-4">💰 Meus Ganhos</h1>

        {/* Balance card */}
        <div className="rounded-2xl bg-gradient-to-br from-brand-purple to-brand-purple-light p-5 mb-6 text-primary-foreground">
          <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Saldo Disponível</p>
          {walletLoading ? (
            <Skeleton className="h-10 w-40 bg-white/20 mb-3" />
          ) : (
            <CurrencyDisplay value={balance} size="xl" className="text-primary-foreground block mb-3" />
          )}
          <Button
            variant="outline"
            className="rounded-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
          >
            Solicitar PIX
          </Button>
        </div>

        {/* Chart */}
        <div className="rounded-2xl border border-border bg-card p-4 mb-6">
          <h3 className="font-heading font-bold text-sm mb-3">Últimos 7 dias</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Ganho']}
                  contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }}
                />
                <Bar dataKey="value" fill="hsl(263, 70%, 50%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            <p className="font-heading text-2xl font-bold text-foreground">{totalDeliveries}</p>
            <p className="text-xs text-muted-foreground">Corridas</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            <p className="font-heading text-2xl font-bold text-foreground">{totalDistance.toFixed(1)} km</p>
            <p className="text-xs text-muted-foreground">Distância</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-center col-span-2">
            <p className="font-heading text-2xl font-bold text-brand-green">
              R$ {avgPerDelivery.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">Média por corrida</p>
          </div>
        </div>
      </div>
      <BottomNav variant="driver" />
    </div>
  );
}
