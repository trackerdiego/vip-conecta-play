import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export function useReferralStats() {
  const user = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ['referral-stats', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('referred_by', user!.id);
      if (error) throw error;
      return { totalReferrals: count ?? 0 };
    },
  });

  return { totalReferrals: data?.totalReferrals ?? 0, loading: isLoading };
}
