import { BottomNav } from '@/components/shared/BottomNav';
import { mockInfluencer } from '@/data/mockData';

export default function InfluencerReferrals() {
  const data = mockInfluencer;

  return (
    <div className="min-h-screen bg-brand-dark text-primary-foreground pb-24 dark">
      <div className="max-w-md mx-auto px-4 pt-6">
        <h1 className="font-heading text-2xl font-bold mb-6">👥 Minhas Indicações</h1>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="glass-dark rounded-2xl p-3 text-center">
            <p className="font-heading text-2xl font-bold text-brand-green">{data.totalReferrals}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </div>
          <div className="glass-dark rounded-2xl p-3 text-center">
            <p className="font-heading text-2xl font-bold text-brand-purple-light">{data.referralsThisWeek}</p>
            <p className="text-[10px] text-muted-foreground">Semana</p>
          </div>
          <div className="glass-dark rounded-2xl p-3 text-center">
            <p className="font-heading text-2xl font-bold text-brand-orange">{data.referralsToday}</p>
            <p className="text-[10px] text-muted-foreground">Hoje</p>
          </div>
        </div>

        <h2 className="font-heading font-bold mb-3">Histórico Recente</h2>
        <div className="space-y-2">
          {['Maria S.', 'Pedro L.', 'Ana C.', 'Lucas M.', 'Julia R.'].map((name, i) => (
            <div key={i} className="glass-dark rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-brand-purple/30 flex items-center justify-center text-xs font-bold">
                  {name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-[10px] text-muted-foreground">{i === 0 ? 'Hoje' : `${i + 1} dias atrás`}</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-brand-green">+R$ 5,00</span>
            </div>
          ))}
        </div>
      </div>
      <BottomNav variant="influencer" />
    </div>
  );
}
