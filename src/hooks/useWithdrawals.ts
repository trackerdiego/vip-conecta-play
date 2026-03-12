import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export function useWithdrawals() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: withdrawals = [], isLoading } = useQuery({
    queryKey: ['withdrawals', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const createWithdrawal = useMutation({
    mutationFn: async ({ amount, pixKey }: { amount: number; pixKey: string }) => {
      const { error } = await supabase
        .from('withdrawal_requests')
        .insert({ user_id: user!.id, amount, pix_key: pixKey });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });

  return { withdrawals, loading: isLoading, createWithdrawal };
}
