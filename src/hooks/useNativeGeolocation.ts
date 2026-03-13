import { useEffect, useRef, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

interface Position {
  lat: number;
  lng: number;
  heading: number | null;
  speed: number | null;
}

export function useNativeGeolocation(enabled: boolean) {
  const [position, setPosition] = useState<Position>({ lat: 0, lng: 0, heading: null, speed: null });
  const watchIdRef = useRef<string | number | null>(null);
  const isNative = Capacitor.isNativePlatform();

  const startWatching = useCallback(async () => {
    if (isNative) {
      try {
        // @ts-ignore - installed locally after export
        const { Geolocation } = await import('@capacitor/geolocation');
        const perm = await Geolocation.requestPermissions();
        if (perm.location !== 'granted') {
          console.warn('Geolocation permission denied');
          return;
        }
        const id = await Geolocation.watchPosition(
          { enableHighAccuracy: true },
          (pos, err) => {
            if (err || !pos) return;
            setPosition({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              heading: pos.coords.heading,
              speed: pos.coords.speed,
            });
          }
        );
        watchIdRef.current = id;
      } catch {
        console.info('[Geo] Native plugin not available, using browser fallback');
        startBrowserWatch();
      }
    } else {
      startBrowserWatch();
    }
  }, [isNative]);

  const startBrowserWatch = () => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
        });
      },
      null,
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    watchIdRef.current = id;
  };

  const stopWatching = useCallback(async () => {
    if (watchIdRef.current === null) return;
    if (isNative) {
      try {
        const { Geolocation } = await import('@capacitor/geolocation');
        await Geolocation.clearWatch({ id: watchIdRef.current as string });
      } catch {
        // fallback already using browser
        navigator.geolocation.clearWatch(watchIdRef.current as number);
      }
    } else {
      navigator.geolocation.clearWatch(watchIdRef.current as number);
    }
    watchIdRef.current = null;
  }, [isNative]);

  useEffect(() => {
    if (enabled) {
      startWatching();
    } else {
      stopWatching();
    }
    return () => { stopWatching(); };
  }, [enabled, startWatching, stopWatching]);

  return position;
}
