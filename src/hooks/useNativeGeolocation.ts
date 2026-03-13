import { useEffect, useRef, useState, useCallback } from 'react';

interface Position {
  lat: number;
  lng: number;
  heading: number | null;
  speed: number | null;
}

export function useNativeGeolocation(enabled: boolean) {
  const [position, setPosition] = useState<Position>({ lat: 0, lng: 0, heading: null, speed: null });
  const watchIdRef = useRef<number | null>(null);

  const startWatching = useCallback(() => {
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
      (err) => console.warn('[Geo] Error:', err.message),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    watchIdRef.current = id;
  }, []);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      startWatching();
    } else {
      stopWatching();
    }
    return () => stopWatching();
  }, [enabled, startWatching, stopWatching]);

  return position;
}
