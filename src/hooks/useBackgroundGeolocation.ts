import { useEffect, useRef, useCallback } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';

interface BackgroundGeoConfig {
  enabled: boolean;
  onPosition: (lat: number, lng: number, heading: number | null, speed: number | null) => void;
}

/**
 * Background geolocation for native platforms.
 * Uses @capacitor-community/background-geolocation when available,
 * otherwise falls back to regular watchPosition (browser).
 *
 * The community plugin must be installed separately:
 *   npm install @capacitor-community/background-geolocation
 *   npx cap sync
 *
 * This hook gracefully degrades if the plugin is not present.
 */
export function useBackgroundGeolocation({ enabled, onPosition }: BackgroundGeoConfig) {
  const watcherIdRef = useRef<string | null>(null);
  const isNative = Capacitor.isNativePlatform();

  const start = useCallback(async () => {
    if (!isNative) return; // Browser uses regular watchPosition via useNativeGeolocation

    try {
      // Dynamic import so it doesn't break if plugin isn't installed
      // Access plugin from Capacitor's plugin registry if installed
      const { registerPlugin } = await import('@capacitor/core');
      const bgGeo = registerPlugin<any>('BackgroundGeolocation');
      if (!bgGeo) {
        console.info('[BackgroundGeo] Plugin not found, using foreground geolocation only');
        return;
      }

      const id = await bgGeo.addWatcher(
        {
          backgroundMessage: 'VIP Conecta está rastreando sua localização',
          backgroundTitle: 'Rastreamento ativo',
          requestPermissions: true,
          stale: false,
          distanceFilter: 10,
        },
        (location: any, error: any) => {
          if (error) {
            console.error('[BackgroundGeo] Error:', error);
            return;
          }
          if (location) {
            onPosition(location.latitude, location.longitude, location.bearing ?? null, location.speed ?? null);
          }
        }
      );
      watcherIdRef.current = id;
    } catch (err) {
      console.info('[BackgroundGeo] Not available, using foreground tracking:', err);
    }
  }, [isNative, onPosition]);

  const stop = useCallback(async () => {
    if (watcherIdRef.current === null) return;
    try {
      const bgGeo = (globalThis as any).__capacitor_background_geolocation;
      if (bgGeo) {
        await bgGeo.removeWatcher({ id: watcherIdRef.current });
      }
    } catch {
      // ignore
    }
    watcherIdRef.current = null;
  }, []);

  useEffect(() => {
    if (enabled) {
      start();
    } else {
      stop();
    }
    return () => {
      stop();
    };
  }, [enabled, start, stop]);
}
