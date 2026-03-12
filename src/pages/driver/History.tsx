import { useState } from 'react';
import { BottomNav } from '@/components/shared/BottomNav';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { mockDeliveryHistory, mockDriver } from '@/data/mockData';

const periods = ['Hoje', 'Semana', 'Mês'];

export default function DriverHistory() {
  const [activePeriod, setActivePeriod] = useState('Hoje');

  const total = mockDeliveryHistory
    .filter((d) => d.status === 'delivered')
    .reduce((sum, d) => sum + d.fare, 0);

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
          <p className="text-xs text-muted-foreground mt-1">{mockDeliveryHistory.filter(d => d.status === 'delivered').length} corridas</p>
        </div>

        {/* List */}
        <div className="space-y-2">
          {mockDeliveryHistory.map((d) => (
            <div key={d.id} className="rounded-xl border border-border bg-card p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{d.address}</p>
                <p className="text-xs text-muted-foreground">{d.time}</p>
              </div>
              <div className="text-right">
                <CurrencyDisplay value={d.fare} size="sm" className={d.status === 'cancelled' ? 'text-destructive line-through' : 'text-brand-green'} />
                <span className={`block text-[10px] mt-0.5 ${
                  d.status === 'delivered' ? 'text-brand-green' : 'text-destructive'
                }`}>
                  {d.status === 'delivered' ? 'Entregue' : 'Cancelada'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav variant="driver" />
    </div>
  );
}
