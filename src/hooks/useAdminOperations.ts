import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const STORE_LAT = -3.7373;
export const STORE_LNG = -38.6531;
export const STORE_ADDRESS = 'Rua 100, 202 - Planalto Caucaia';

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface DriverInfo {
  id: string;
  full_name: string;
  is_online: boolean;
  avatar_url: string | null;
  lat: number | null;
  lng: number | null;
  heading: number | null;
  distance_km: number | null;
  location_updated_at: string | null;
  active_delivery: {
    id: string;
    external_order_id: string | null;
    status: string | null;
    delivery_address: string;
    fare: number;
    accepted_at: string | null;
    pickup_address: string;
    delivery_lat: number | null;
    delivery_lng: number | null;
  } | null;
}

type StatusFilter = 'all' | 'online' | 'em_rota' | 'alerta';

export function useAdminOperations() {
  const [drivers, setDrivers] = useState<DriverInfo[]>([]);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const driversRef = useRef<DriverInfo[]>([]);

  const fetchData = useCallback(async () => {
    // Get all drivers (users with driver role)
    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'driver');

    if (!roles?.length) {
      setDrivers([]);
      setLoading(false);
      return;
    }

    const driverIds = roles.map((r) => r.user_id);

    const [profilesRes, locationsRes, deliveriesRes] = await Promise.all([
      supabase.from('profiles').select('id, full_name, is_online, avatar_url').in('id', driverIds),
      supabase.from('driver_locations').select('*').in('driver_id', driverIds),
      supabase
        .from('deliveries')
        .select('*')
        .in('driver_id', driverIds)
        .in('status', ['pending', 'accepted', 'picked_up']),
    ]);

    const profiles = profilesRes.data ?? [];
    const locations = locationsRes.data ?? [];
    const deliveries = deliveriesRes.data ?? [];

    const locMap = new Map(locations.map((l) => [l.driver_id, l]));
    const delMap = new Map(deliveries.map((d) => [d.driver_id!, d]));

    const result: DriverInfo[] = profiles.map((p) => {
      const loc = locMap.get(p.id);
      const del = delMap.get(p.id);
      const lat = loc?.lat ? Number(loc.lat) : null;
      const lng = loc?.lng ? Number(loc.lng) : null;
      const dist = lat != null && lng != null ? haversineKm(lat, lng, STORE_LAT, STORE_LNG) : null;

      return {
        id: p.id,
        full_name: p.full_name,
        is_online: p.is_online ?? false,
        avatar_url: p.avatar_url,
        lat,
        lng,
        heading: loc?.heading ? Number(loc.heading) : null,
        distance_km: dist,
        location_updated_at: loc?.updated_at ?? null,
        active_delivery: del
          ? {
              id: del.id,
              external_order_id: del.external_order_id,
              status: del.status,
              delivery_address: del.delivery_address,
              fare: Number(del.fare),
              accepted_at: del.accepted_at,
              pickup_address: del.pickup_address,
              delivery_lat: del.delivery_lat ? Number(del.delivery_lat) : null,
              delivery_lng: del.delivery_lng ? Number(del.delivery_lng) : null,
            }
          : null,
      };
    });

    driversRef.current = result;
    setDrivers(result);
    setLoading(false);
  }, []);

  // Realtime subscriptions
  useEffect(() => {
    fetchData();

    const locChannel = supabase
      .channel('admin-driver-locations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'driver_locations' }, (payload) => {
        const updated = payload.new as { driver_id: string; lat: number; lng: number; heading: number; updated_at: string };
        setDrivers((prev) =>
          prev.map((d) => {
            if (d.id !== updated.driver_id) return d;
            const lat = Number(updated.lat);
            const lng = Number(updated.lng);
            return {
              ...d,
              lat,
              lng,
              heading: Number(updated.heading),
              distance_km: haversineKm(lat, lng, STORE_LAT, STORE_LNG),
              location_updated_at: updated.updated_at,
            };
          })
        );
      })
      .subscribe();

    const delChannel = supabase
      .channel('admin-deliveries')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deliveries' }, () => {
        fetchData();
      })
      .subscribe();

    const interval = setInterval(fetchData, 15000);

    return () => {
      supabase.removeChannel(locChannel);
      supabase.removeChannel(delChannel);
      clearInterval(interval);
    };
  }, [fetchData]);

  const filtered = drivers.filter((d) => {
    if (filter === 'online') return d.is_online;
    if (filter === 'em_rota') return d.active_delivery && ['accepted', 'picked_up'].includes(d.active_delivery.status ?? '');
    if (filter === 'alerta') {
      if (!d.active_delivery?.accepted_at) return false;
      const elapsed = Date.now() - new Date(d.active_delivery.accepted_at).getTime();
      return elapsed > 30 * 60 * 1000; // >30min
    }
    return true;
  });

  const counts = {
    all: drivers.length,
    online: drivers.filter((d) => d.is_online).length,
    em_rota: drivers.filter((d) => d.active_delivery && ['accepted', 'picked_up'].includes(d.active_delivery.status ?? '')).length,
    alerta: drivers.filter((d) => {
      if (!d.active_delivery?.accepted_at) return false;
      return Date.now() - new Date(d.active_delivery.accepted_at).getTime() > 30 * 60 * 1000;
    }).length,
  };

  return { drivers: filtered, allDrivers: drivers, filter, setFilter, counts, loading, refetch: fetchData };
}
