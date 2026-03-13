import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

async function invokeTraccar(action: string, body?: unknown, params?: Record<string, string>) {
  const searchParams = new URLSearchParams({ action, ...params });
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;
  if (!token) throw new Error('Not authenticated');

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const url = `https://${projectId}.supabase.co/functions/v1/traccar-proxy?${searchParams.toString()}`;

  const res = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Traccar request failed');
  }

  return res.json();
}

export function useTraccar() {
  const user = useAuthStore((s) => s.user);
  const deviceRef = useRef<{ traccar_device_id: number; unique_id: string } | null>(null);

  const ensureDevice = useCallback(async () => {
    if (!user) return null;
    if (deviceRef.current) return deviceRef.current;

    // Check DB first
    const { data: existing } = await supabase
      .from('traccar_devices')
      .select('*')
      .eq('driver_id', user.id)
      .maybeSingle();

    if (existing) {
      deviceRef.current = {
        traccar_device_id: existing.traccar_device_id,
        unique_id: existing.unique_id,
      };
      return deviceRef.current;
    }

    // Create device in Traccar
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const uniqueId = `driver_${user.id.slice(0, 8)}`;
    const device = await invokeTraccar('create_device', {
      name: profile?.full_name || 'Entregador',
      uniqueId,
    });

    deviceRef.current = {
      traccar_device_id: device.id,
      unique_id: uniqueId,
    };
    return deviceRef.current;
  }, [user]);

  const syncPosition = useCallback(async (lat: number, lng: number, heading: number | null, speed?: number) => {
    const device = deviceRef.current;
    if (!device) return;

    await invokeTraccar('update_position', {
      lat,
      lng,
      heading: heading ?? 0,
      speed: speed ?? 0,
      uniqueId: device.unique_id,
    });
  }, []);

  const getRouteReport = useCallback(async (from: string, to: string) => {
    const device = deviceRef.current;
    if (!device) return [];
    return invokeTraccar('route_report', undefined, {
      deviceId: String(device.traccar_device_id),
      from,
      to,
    });
  }, []);

  const listDevices = useCallback(async () => {
    return invokeTraccar('list_devices');
  }, []);

  const getPositions = useCallback(async (deviceId?: number) => {
    return invokeTraccar('get_positions', undefined, deviceId ? { deviceId: String(deviceId) } : undefined);
  }, []);

  return { ensureDevice, syncPosition, getRouteReport, listDevices, getPositions };
}
