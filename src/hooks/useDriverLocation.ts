import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useTraccar } from './useTraccar';
import { useNativeGeolocation } from './useNativeGeolocation';
import { useBackgroundGeolocation } from './useBackgroundGeolocation';

export function useDriverLocation(isOnline: boolean) {
  const user = useAuthStore((s) => s.user);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { ensureDevice, syncPosition } = useTraccar();
  const traccarReady = useRef(false);

  // Native/browser geolocation
  const position = useNativeGeolocation(isOnline);
  const latestPos = useRef(position);

  // Keep ref in sync
  useEffect(() => {
    latestPos.current = position;
  }, [position]);

  // Background geolocation callback (native only, updates the same ref)
  const handleBackgroundPosition = useCallback(
    (lat: number, lng: number, heading: number | null, speed: number | null) => {
      latestPos.current = { lat, lng, heading, speed };
    },
    []
  );

  useBackgroundGeolocation({
    enabled: isOnline,
    onPosition: handleBackgroundPosition,
  });

  useEffect(() => {
    if (!user || !isOnline) return;

    // Ensure Traccar device exists when going online
    ensureDevice()
      .then(() => {
        traccarReady.current = true;
      })
      .catch(console.error);

    // Upsert every 10s to local DB + Traccar
    const sync = async () => {
      const { lat, lng, heading } = latestPos.current;
      if (lat === 0 && lng === 0) return;

      // Local DB sync
      await supabase.from('driver_locations').upsert({
        driver_id: user.id,
        lat,
        lng,
        heading,
        updated_at: new Date().toISOString(),
      });

      // Traccar sync
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

  // Toggle online status
  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').update({ is_online: isOnline }).eq('id', user.id);
  }, [user, isOnline]);
}
