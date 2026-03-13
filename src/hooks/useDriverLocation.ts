import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useTraccar } from './useTraccar';

export function useDriverLocation(isOnline: boolean) {
  const user = useAuthStore((s) => s.user);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestPos = useRef<{ lat: number; lng: number; heading: number | null }>({ lat: 0, lng: 0, heading: null });
  const { ensureDevice, syncPosition } = useTraccar();
  const traccarReady = useRef(false);

  useEffect(() => {
    if (!user || !isOnline || !navigator.geolocation) return;

    // Ensure Traccar device exists when going online
    ensureDevice().then(() => {
      traccarReady.current = true;
    }).catch(console.error);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        latestPos.current = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          heading: pos.coords.heading,
        };
      },
      null,
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

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
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
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
