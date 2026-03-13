import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useTraccar } from './useTraccar';
import { useNativeGeolocation } from './useNativeGeolocation';

export function useDriverLocation(isOnline: boolean) {
  const user = useAuthStore((s) => s.user);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { ensureDevice, syncPosition } = useTraccar();
  const traccarReady = useRef(false);

  const position = useNativeGeolocation(isOnline);
  const latestPos = useRef(position);

  useEffect(() => {
    latestPos.current = position;
  }, [position]);

  useEffect(() => {
    if (!user || !isOnline) return;

    ensureDevice()
      .then(() => { traccarReady.current = true; })
      .catch(console.error);

    const sync = async () => {
      const { lat, lng, heading } = latestPos.current;
      if (lat === 0 && lng === 0) return;

      await supabase.from('driver_locations').upsert({
        driver_id: user.id,
        lat,
        lng,
        heading,
        updated_at: new Date().toISOString(),
      });

      if (traccarReady.current) {
        syncPosition(lat, lng, heading).catch(console.error);
      }
    };

    intervalRef.current = setInterval(sync, 10000);
    sync();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      traccarReady.current = false;
    };
  }, [user, isOnline, ensureDevice, syncPosition]);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').update({ is_online: isOnline }).eq('id', user.id);
  }, [user, isOnline]);
}
