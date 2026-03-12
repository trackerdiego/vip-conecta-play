import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export function useWallet() {
  const user = useAuthStore((s) => s.user);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['wallet', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  return {
    balance: data?.balance ?? 0,
    totalEarned: data?.total_earned ?? 0,
    totalWithdrawn: data?.total_withdrawn ?? 0,
    walletId: data?.id ?? null,
    loading: isLoading,
    refetch,
  };
}
