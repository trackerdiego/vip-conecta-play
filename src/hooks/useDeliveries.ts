import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export function useDeliveries() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [pendingOffer, setPendingOffer] = useState<any>(null);

  // Active delivery assigned to this driver
  const { data: activeDelivery, isLoading } = useQuery({
    queryKey: ['active-delivery', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .eq('driver_id', user!.id)
        .in('status', ['accepted', 'picked_up'])
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Fetch existing pending deliveries on mount
  const { data: existingPending } = useQuery({
    queryKey: ['pending-deliveries', user?.id],
    enabled: !!user,
    refetchInterval: 15000, // Poll every 15s
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .eq('status', 'pending')
        .is('driver_id', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Show existing pending delivery as offer
  useEffect(() => {
    if (existingPending && !pendingOffer && !activeDelivery) {
      setPendingOffer(existingPending);
    }
  }, [existingPending, activeDelivery]);

  // Realtime subscription for NEW pending deliveries
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('pending-deliveries')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'deliveries', filter: `status=eq.pending` },
        (payload) => {
          setPendingOffer(payload.new);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const dismissOffer = useCallback(() => setPendingOffer(null), []);

  const acceptDelivery = useMutation({
    mutationFn: async (deliveryId: string) => {
      const { error } = await supabase
        .from('deliveries')
        .update({ driver_id: user!.id, status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('id', deliveryId)
        .eq('status', 'pending');
      if (error) throw error;
    },
    onSuccess: () => {
      setPendingOffer(null);
      queryClient.invalidateQueries({ queryKey: ['active-delivery'] });
    },
  });

  const updateDeliveryStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      if (status === 'delivered') {
        // Use atomic RPC to mark delivered + credit wallet in one transaction
        const { data, error } = await supabase.rpc('credit_driver_delivery', {
          _delivery_id: id,
          _driver_id: user!.id,
        });
        if (error) throw error;
        return data;
      }
      // For other status changes (e.g. picked_up), simple update
      const { error } = await supabase.from('deliveries').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-delivery'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['driver-deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['driver-history'] });
    },
  });

  return { activeDelivery, pendingOffer, dismissOffer, acceptDelivery, updateDeliveryStatus, loading: isLoading };
}
