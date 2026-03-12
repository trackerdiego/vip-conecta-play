import { BottomNav } from '@/components/shared/BottomNav';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { Button } from '@/components/ui/button';
import { mockDriver, mockWeeklyEarnings } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';

export default function DriverEarnings() {
  const navigate = useNavigate();
  const data = mockDriver;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 pt-6">
        <h1 className="font-heading text-2xl font-bold text-foreground mb-4">💰 Meus Ganhos</h1>

        {/* Balance card */}
        <div className="rounded-2xl bg-gradient-to-br from-brand-purple to-brand-purple-light p-5 mb-6 text-primary-foreground">
          <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Saldo Disponível</p>
          <CurrencyDisplay value={data.earningsToday} size="xl" className="text-primary-foreground block mb-3" />
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
              <BarChart data={mockWeeklyEarnings}>
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
            <p className="font-heading text-2xl font-bold text-foreground">{data.deliveriesToday}</p>
            <p className="text-xs text-muted-foreground">Corridas</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            <p className="font-heading text-2xl font-bold text-foreground">{data.totalDistance} km</p>
            <p className="text-xs text-muted-foreground">Distância</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-center col-span-2">
            <p className="font-heading text-2xl font-bold text-brand-green">
              R$ {data.avgPerDelivery.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">Média por corrida</p>
          </div>
        </div>
      </div>
      <BottomNav variant="driver" />
    </div>
  );
}
