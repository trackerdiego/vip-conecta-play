import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BottomNav } from '@/components/shared/BottomNav';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { useAuthStore } from '@/stores/authStore';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  influencer_id: string;
  full_name: string;
  avatar_url: string | null;
  total_sales: number;
  total_commission: number;
}

export default function Leaderboard() {
  const user = useAuthStore((s) => s.user);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      // Get top influencers by referral sales
      const { data, error } = await supabase
        .from('referral_sales')
        .select('influencer_id, commission_amount, order_total');

      if (error) throw error;

      // Aggregate by influencer
      const map = new Map<string, { total_sales: number; total_commission: number }>();
      for (const row of data || []) {
        const existing = map.get(row.influencer_id) || { total_sales: 0, total_commission: 0 };
        existing.total_sales += 1;
        existing.total_commission += Number(row.commission_amount);
        map.set(row.influencer_id, existing);
      }

      // Get profiles for these influencers
      const ids = Array.from(map.keys());
      if (ids.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', ids);

      const result: LeaderboardEntry[] = (profiles || []).map((p) => ({
        influencer_id: p.id,
        full_name: p.full_name,
        avatar_url: p.avatar_url,
        total_sales: map.get(p.id)?.total_sales ?? 0,
        total_commission: map.get(p.id)?.total_commission ?? 0,
      }));

      return result.sort((a, b) => b.total_sales - a.total_sales).slice(0, 20);
    },
  });

  const myRank = entries.findIndex((e) => e.influencer_id === user?.id) + 1;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-300" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground w-6 text-center">{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-brand-dark text-primary-foreground pb-24 dark">
      <div className="max-w-md mx-auto px-4 pt-6">
        <h1 className="font-heading text-2xl font-bold mb-2">🏆 Ranking</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Os influenciadores que mais venderam
        </p>

        {/* My position */}
        {myRank > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-dark rounded-2xl p-4 mb-6 border border-brand-purple/30"
          >
            <p className="text-xs text-muted-foreground mb-1">Sua posição</p>
            <p className="font-heading text-3xl font-bold text-brand-purple-light">#{myRank}</p>
          </motion.div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl bg-muted/10" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma venda registrada ainda</p>
            <p className="text-sm text-muted-foreground mt-1">Compartilhe seu link para começar!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, i) => {
              const rank = i + 1;
              const isMe = entry.influencer_id === user?.id;
              return (
                <motion.div
                  key={entry.influencer_id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    'glass-dark rounded-2xl p-4 flex items-center gap-3',
                    isMe && 'border border-brand-purple/40 bg-brand-purple/10',
                    rank <= 3 && 'border border-brand-orange/20'
                  )}
                >
                  {getRankIcon(rank)}
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-purple to-brand-orange flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {entry.full_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {entry.full_name}
                      {isMe && <span className="text-brand-purple-light ml-1">(você)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{entry.total_sales} vendas</p>
                  </div>
                  <CurrencyDisplay
                    value={entry.total_commission}
                    size="sm"
                    className="text-brand-green"
                  />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav variant="influencer" />
    </div>
  );
}
