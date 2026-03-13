import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useAuthStore } from '@/stores/authStore';

export function usePushNotifications() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !user) return;

    const setup = async () => {
      try {
        // @ts-ignore - installed locally after export
        const { PushNotifications } = await import('@capacitor/push-notifications');

        const perm = await PushNotifications.requestPermissions();
        if (perm.receive !== 'granted') {
          console.warn('[Push] Permission denied');
          return;
        }

        await PushNotifications.register();

        PushNotifications.addListener('registration', async (token) => {
          console.log('[Push] Token:', token.value);
        });

        PushNotifications.addListener('registrationError', (err) => {
          console.error('[Push] Registration error:', err);
        });

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('[Push] Received:', notification);
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          console.log('[Push] Action:', action);
        });
      } catch {
        console.info('[Push] Plugin not available, skipping push setup');
      }
    };

    setup();

    return () => {
      import('@capacitor/push-notifications')
        .then(({ PushNotifications }) => PushNotifications.removeAllListeners())
        .catch(() => {});
    };
  }, [user]);
}
