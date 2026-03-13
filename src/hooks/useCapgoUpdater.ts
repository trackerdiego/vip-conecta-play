import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

/**
 * Capgo OTA updater hook.
 * Uses manual update flow: notifies ready on start, checks for updates,
 * and downloads silently. The update is applied on next app restart.
 *
 * Install locally after export:
 *   npm install @capgo/capacitor-updater
 *   npx cap sync
 */
export function useCapgoUpdater() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const init = async () => {
      try {
        // @ts-ignore - installed locally after export
        const { CapacitorUpdater } = await import('@capgo/capacitor-updater');

        // Notify Capgo that the current bundle loaded successfully
        await CapacitorUpdater.notifyAppReady();

        // Listen for update availability
        CapacitorUpdater.addListener('updateAvailable', async (info: any) => {
          console.log('[Capgo] Update available:', info.version);
          try {
            // Download in background — applied on next restart
            await CapacitorUpdater.download({ url: info.url, version: info.version });
            console.log('[Capgo] Update downloaded, will apply on next restart');
          } catch (e) {
            console.error('[Capgo] Download failed:', e);
          }
        });

        CapacitorUpdater.addListener('downloadComplete', (info: any) => {
          console.log('[Capgo] Download complete:', info.version);
          // Set the downloaded bundle so it's used on next app start
          CapacitorUpdater.set({ id: info.id }).catch((e: any) =>
            console.error('[Capgo] Set failed:', e)
          );
        });

        CapacitorUpdater.addListener('downloadFailed', (info: any) => {
          console.error('[Capgo] Download failed event:', info);
        });

        CapacitorUpdater.addListener('updateFailed', (info: any) => {
          console.error('[Capgo] Update failed, rolling back:', info);
        });
      } catch {
        console.info('[Capgo] Plugin not available, skipping OTA setup');
      }
    };

    init();
  }, []);
}
