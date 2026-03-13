import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export interface PrizeWithProgress {
  id: string;
  name: string;
  emoji: string;
  category: string;
  description: string | null;
  target: number;
  progress: number;
  claimed: boolean;
}

export function usePrizes() {
  const user = useAuthStore((s) => s.user);

  const { data: prizes = [], isLoading } = useQuery({
    queryKey: ['prizes', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: prizesData, error: pErr } = await supabase
        .from('prizes')
        .select('*')
        .eq('is_active', true);
      if (pErr) throw pErr;

      const { data: userPrizes, error: upErr } = await supabase
        .from('user_prizes')
        .select('*')
        .eq('user_id', user!.id);
      if (upErr) throw upErr;

      const upMap = new Map(userPrizes?.map((up) => [up.prize_id, up]));

      return (prizesData ?? []).map((p): PrizeWithProgress => {
        const up = upMap.get(p.id);
        return {
          id: p.id,
          name: p.name,
          emoji: p.emoji,
          category: p.category,
          description: p.description,
          target: p.target,
          progress: up?.progress ?? 0,
          claimed: !!up?.claimed_at,
        };
      });
    },
  });

  return { prizes, loading: isLoading };
}
