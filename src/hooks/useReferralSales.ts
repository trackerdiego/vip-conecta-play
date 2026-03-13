import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useEffect } from 'react';

export function useReferralSales() {
  const user = useAuthStore((s) => s.user);

  const query = useQuery({
    queryKey: ['referral-sales', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referral_sales')
        .select('*')
        .eq('influencer_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Realtime subscription for new sales
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('referral-sales-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'referral_sales',
          filter: `influencer_id=eq.${user.id}`,
        },
        () => {
          query.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const totalSales = query.data?.length ?? 0;
  const totalCommission = query.data?.reduce((sum, s) => sum + Number(s.commission_amount), 0) ?? 0;

  return {
    sales: query.data ?? [],
    totalSales,
    totalCommission,
    loading: query.isLoading,
    refetch: query.refetch,
  };
}
