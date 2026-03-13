import { useCallback, useRef } from 'react';

const LOCATIONIQ_KEY = 'pk.758ed6f5832744f943f6ecb296a0e2d2';
const CACHE_PRECISION = 4; // ~11m accuracy
const MIN_INTERVAL_MS = 500; // max 2 req/s

const geocodeCache = new Map<string, string>();
let lastRequestTime = 0;

function roundCoord(val: number): string {
  return val.toFixed(CACHE_PRECISION);
}

export function useReverseGeocode() {
  const pendingRef = useRef<Map<string, Promise<string>>>(new Map());

  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
    const key = `${roundCoord(lat)},${roundCoord(lng)}`;

    if (geocodeCache.has(key)) {
      return geocodeCache.get(key)!;
    }

    // Deduplicate in-flight requests
    if (pendingRef.current.has(key)) {
      return pendingRef.current.get(key)!;
    }

    const promise = (async () => {
      // Rate limiting
      const now = Date.now();
      const wait = MIN_INTERVAL_MS - (now - lastRequestTime);
      if (wait > 0) {
        await new Promise((r) => setTimeout(r, wait));
      }
      lastRequestTime = Date.now();

      try {
        const res = await fetch(
          `https://us1.locationiq.com/v1/reverse?key=${LOCATIONIQ_KEY}&lat=${lat}&lon=${lng}&format=json&accept-language=pt-BR`
        );
        if (!res.ok) throw new Error(`Geocode failed: ${res.status}`);
        const data = await res.json();
        const address = data.display_name ?? 'Endereço desconhecido';
        geocodeCache.set(key, address);
        return address;
      } catch {
        return 'Endereço indisponível';
      } finally {
        pendingRef.current.delete(key);
      }
    })();

    pendingRef.current.set(key, promise);
    return promise;
  }, []);

  return { reverseGeocode };
}

export { LOCATIONIQ_KEY };
