import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/shared/BottomNav';
import { mockPrizes } from '@/data/mockData';

const categories = ['Todos', 'Excursões', 'Cupons', 'Cashback'];
const categoryMap: Record<string, string> = {
  Excursões: 'excursions',
  Cupons: 'coupons',
  Cashback: 'cashback',
};

export default function InfluencerRewards() {
  const [activeFilter, setActiveFilter] = useState('Todos');

  const filtered = activeFilter === 'Todos'
    ? mockPrizes
    : mockPrizes.filter((p) => p.category === categoryMap[activeFilter]);

  return (
    <div className="min-h-screen bg-brand-dark text-primary-foreground pb-24 dark">
      <div className="max-w-md mx-auto px-4 pt-6">
        <h1 className="font-heading text-2xl font-bold mb-4">🏆 Prêmios e Resgates</h1>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === cat
                  ? 'bg-brand-purple text-primary-foreground'
                  : 'bg-muted/10 text-muted-foreground hover:bg-muted/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Prize Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {filtered.map((prize) => (
            <div key={prize.id} className="glass-dark rounded-2xl p-4 flex flex-col">
              <div className="h-20 rounded-xl bg-gradient-to-br from-brand-purple/30 to-brand-orange/20 flex items-center justify-center text-4xl mb-3">
                {prize.emoji}
              </div>
              <h3 className="font-heading font-semibold text-sm leading-tight mb-2">{prize.name}</h3>
              <Progress value={(prize.progress / prize.target) * 100} className="h-1.5 bg-muted/20 mb-1" />
              <p className="text-[10px] text-muted-foreground">{prize.progress}/{prize.target}</p>
              <Button
                size="sm"
                variant="ghost"
                className="mt-auto text-xs text-brand-purple-light hover:bg-brand-purple/10 rounded-full"
              >
                Quero esse
              </Button>
            </div>
          ))}
        </div>

        {/* Coupons section */}
        <h2 className="font-heading font-bold text-lg mb-3">🎫 Cupons Disponíveis</h2>
        <div className="glass-dark rounded-2xl p-4 text-center text-muted-foreground">
          <p className="text-sm">Nenhum cupom resgatado ainda</p>
          <p className="text-xs mt-1">Complete missões para ganhar cupons!</p>
        </div>
      </div>

      <BottomNav variant="influencer" />
    </div>
  );
}
