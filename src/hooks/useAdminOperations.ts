import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const STORE_LAT = -3.7424;
export const STORE_LNG = -38.6635;
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

export type AlertLevel = 'none' | 'warning' | 'critical';

export interface ActiveDelivery {
  id: string;
  external_order_id: string | null;
  status: string | null;
  delivery_address: string;
  fare: number;
  accepted_at: string | null;
  pickup_address: string;
  delivery_lat: number | null;
  delivery_lng: number | null;
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
  active_deliveries: ActiveDelivery[];
  /** Kept for backward compat — first active delivery or null */
  active_delivery: ActiveDelivery | null;
  alert_level: AlertLevel;
  oldest_accepted_at: string | null;
  total_fare: number;
  avg_min_per_km: number | null;
  eta_minutes: number | null;
}

export type StatusFilter = 'all' | 'online' | 'pronto' | 'em_rota' | 'alerta';

function getAlertLevel(acceptedAt: string | null): AlertLevel {
  if (!acceptedAt) return 'none';
  const elapsed = Date.now() - new Date(acceptedAt).getTime();
  if (elapsed > 30 * 60 * 1000) return 'critical';
  if (elapsed > 15 * 60 * 1000) return 'warning';
  return 'none';
}

export function useAdminOperations() {
  const [drivers, setDrivers] = useState<DriverInfo[]>([]);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const avgCacheRef = useRef<Map<string, number>>(new Map());

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

    const [profilesRes, locationsRes, activeDeliveriesRes, completedRes] = await Promise.all([
      supabase.from('profiles').select('id, full_name, is_online, avatar_url').in('id', driverIds),
      supabase.from('driver_locations').select('*').in('driver_id', driverIds),
      supabase
        .from('deliveries')
        .select('*')
        .in('driver_id', driverIds)
        .in('status', ['pending', 'accepted', 'picked_up']),
      // Last 50 completed deliveries for avg calculation
      supabase
        .from('deliveries')
        .select('driver_id, distance_km, accepted_at, delivered_at')
        .in('driver_id', driverIds)
        .eq('status', 'delivered')
        .not('accepted_at', 'is', null)
        .not('delivered_at', 'is', null)
        .not('distance_km', 'is', null)
        .order('delivered_at', { ascending: false })
        .limit(200),
    ]);

    const profiles = profilesRes.data ?? [];
    const locations = locationsRes.data ?? [];
    const activeDeliveries = activeDeliveriesRes.data ?? [];
    const completed = completedRes.data ?? [];

    // Compute avg min/km per driver from completed deliveries
    const avgMap = new Map<string, number>();
    const driverCompleted = new Map<string, { totalMin: number; totalKm: number }>();
    for (const d of completed) {
      if (!d.driver_id || !d.distance_km || !d.accepted_at || !d.delivered_at) continue;
      const mins = (new Date(d.delivered_at).getTime() - new Date(d.accepted_at).getTime()) / 60000;
      const km = Number(d.distance_km);
      if (km <= 0 || mins <= 0) continue;
      const acc = driverCompleted.get(d.driver_id) ?? { totalMin: 0, totalKm: 0 };
      acc.totalMin += mins;
      acc.totalKm += km;
      driverCompleted.set(d.driver_id, acc);
    }
    driverCompleted.forEach((v, k) => {
      avgMap.set(k, v.totalMin / v.totalKm);
    });
    avgCacheRef.current = avgMap;

    const locMap = new Map(locations.map((l) => [l.driver_id, l]));

    // Group deliveries by driver (multiple)
    const delMap = new Map<string, ActiveDelivery[]>();
    for (const d of activeDeliveries) {
      if (!d.driver_id) continue;
      const arr = delMap.get(d.driver_id) ?? [];
      arr.push({
        id: d.id,
        external_order_id: d.external_order_id,
        status: d.status,
        delivery_address: d.delivery_address,
        fare: Number(d.fare),
        accepted_at: d.accepted_at,
        pickup_address: d.pickup_address,
        delivery_lat: d.delivery_lat ? Number(d.delivery_lat) : null,
        delivery_lng: d.delivery_lng ? Number(d.delivery_lng) : null,
      });
      delMap.set(d.driver_id, arr);
    }

    const result: DriverInfo[] = profiles.map((p) => {
      const loc = locMap.get(p.id);
      const dels = delMap.get(p.id) ?? [];
      const lat = loc?.lat ? Number(loc.lat) : null;
      const lng = loc?.lng ? Number(loc.lng) : null;
      const dist = lat != null && lng != null ? haversineKm(lat, lng, STORE_LAT, STORE_LNG) : null;

      // Oldest accepted_at across all active deliveries
      const acceptedTimes = dels
        .filter((d) => d.accepted_at)
        .map((d) => new Date(d.accepted_at!).getTime());
      const oldestAccepted = acceptedTimes.length > 0 ? new Date(Math.min(...acceptedTimes)).toISOString() : null;

      const totalFare = dels.reduce((sum, d) => sum + d.fare, 0);
      const avgMinKm = avgMap.get(p.id) ?? null;

      // ETA: distance to store / avg speed
      let eta: number | null = null;
      if (dist != null && avgMinKm != null && avgMinKm > 0) {
        eta = Math.round(dist * avgMinKm);
      }

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
        active_deliveries: dels,
        active_delivery: dels[0] ?? null,
        alert_level: getAlertLevel(oldestAccepted),
        oldest_accepted_at: oldestAccepted,
        total_fare: totalFare,
        avg_min_per_km: avgMinKm,
        eta_minutes: eta,
      };
    });

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
            const dist = haversineKm(lat, lng, STORE_LAT, STORE_LNG);
            const avgMinKm = avgCacheRef.current.get(d.id) ?? null;
            return {
              ...d,
              lat,
              lng,
              heading: Number(updated.heading),
              distance_km: dist,
              location_updated_at: updated.updated_at,
              eta_minutes: avgMinKm && avgMinKm > 0 ? Math.round(dist * avgMinKm) : d.eta_minutes,
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
    if (filter === 'pronto') {
      // "Pronto" = has accepted delivery, heading TO the store (not yet picked up)
      return d.active_deliveries.some((del) => del.status === 'accepted');
    }
    if (filter === 'em_rota') {
      return d.active_deliveries.some((del) => del.status === 'picked_up');
    }
    if (filter === 'alerta') {
      return d.alert_level !== 'none';
    }
    return true;
  });

  // Sort by oldest active delivery time (most urgent first)
  const sorted = [...filtered].sort((a, b) => {
    if (!a.oldest_accepted_at && !b.oldest_accepted_at) return 0;
    if (!a.oldest_accepted_at) return 1;
    if (!b.oldest_accepted_at) return -1;
    return new Date(a.oldest_accepted_at).getTime() - new Date(b.oldest_accepted_at).getTime();
  });

  const counts: Record<StatusFilter, number> = {
    all: drivers.length,
    online: drivers.filter((d) => d.is_online).length,
    pronto: drivers.filter((d) => d.active_deliveries.some((del) => del.status === 'accepted')).length,
    em_rota: drivers.filter((d) => d.active_deliveries.some((del) => del.status === 'picked_up')).length,
    alerta: drivers.filter((d) => d.alert_level !== 'none').length,
  };

  return { drivers: sorted, allDrivers: drivers, filter, setFilter, counts, loading, refetch: fetchData };
}
