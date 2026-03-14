import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

const MAX_ACTIVE_DELIVERIES = 5;

/**
 * Fire-and-forget: notify Multipedidos about a status change.
 */
function syncStatusToMultipedidos(externalOrderId: string, status: string) {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  if (!projectId || !externalOrderId) return;

  fetch(
    `https://${projectId}.supabase.co/functions/v1/multipedidos-sync?action=update_status`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ external_order_id: externalOrderId, status }),
    },
  ).catch((err) => console.warn('Multipedidos sync failed (non-blocking):', err));
}

export type DeliveryPhase = 'collecting' | 'delivering';

export function useDeliveries() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [pendingOffer, setPendingOffer] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Active deliveries assigned to this driver (array)
  const { data: activeDeliveries = [], isLoading } = useQuery({
    queryKey: ['active-delivery', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .eq('driver_id', user!.id)
        .in('status', ['accepted', 'picked_up'])
        .order('accepted_at', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Determine phase
  const phase: DeliveryPhase = activeDeliveries.some((d: any) => d.status === 'accepted')
    ? 'collecting'
    : 'delivering';

  // Keep index in bounds
  const safeIndex = Math.min(currentIndex, Math.max(0, activeDeliveries.length - 1));
  const currentDelivery = activeDeliveries[safeIndex] ?? null;

  const nextDelivery = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, activeDeliveries.length - 1));
  }, [activeDeliveries.length]);

  const setDeliveryIndex = useCallback((i: number) => {
    setCurrentIndex(i);
  }, []);

  // Can accept more?
  const canAcceptMore = activeDeliveries.length < MAX_ACTIVE_DELIVERIES;

  // Fetch existing pending deliveries on mount
  const { data: existingPending } = useQuery({
    queryKey: ['pending-deliveries', user?.id],
    enabled: !!user,
    refetchInterval: 15000,
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

  // Show existing pending delivery as offer (even with active deliveries, if under limit)
  useEffect(() => {
    if (existingPending && !pendingOffer && canAcceptMore) {
      setPendingOffer(existingPending);
    }
  }, [existingPending, canAcceptMore]);

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
      const { data: delivery } = await supabase
        .from('deliveries')
        .select('external_order_id')
        .eq('id', deliveryId)
        .single();

      const { error } = await supabase
        .from('deliveries')
        .update({ driver_id: user!.id, status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('id', deliveryId)
        .eq('status', 'pending');
      if (error) throw error;

      if (delivery?.external_order_id) {
        syncStatusToMultipedidos(delivery.external_order_id, 'accepted');
      }
    },
    onSuccess: () => {
      setPendingOffer(null);
      queryClient.invalidateQueries({ queryKey: ['active-delivery'] });
    },
  });

  const updateDeliveryStatus = useMutation({
    mutationFn: async ({ id, status, externalOrderId }: { id: string; status: string; externalOrderId?: string }) => {
      if (status === 'delivered') {
        const { data, error } = await supabase.rpc('credit_driver_delivery', {
          _delivery_id: id,
          _driver_id: user!.id,
        });
        if (error) throw error;

        if (externalOrderId) {
          syncStatusToMultipedidos(externalOrderId, 'delivered');
        }
        return data;
      }

      const { error } = await supabase.from('deliveries').update({ status }).eq('id', id);
      if (error) throw error;

      if (externalOrderId) {
        syncStatusToMultipedidos(externalOrderId, status);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-delivery'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['driver-deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['driver-history'] });
    },
  });

  return {
    activeDeliveries,
    currentDelivery,
    currentIndex: safeIndex,
    setDeliveryIndex,
    nextDelivery,
    phase,
    canAcceptMore,
    pendingOffer,
    dismissOffer,
    acceptDelivery,
    updateDeliveryStatus,
    loading: isLoading,
  };
}
