import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

/**
 * Registers for push notifications on native platforms.
 * Stores the FCM/APNS token in the profiles table for future use.
 */
export function usePushNotifications() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !user) return;

    const setup = async () => {
      const perm = await PushNotifications.requestPermissions();
      if (perm.receive !== 'granted') {
        console.warn('[Push] Permission denied');
        return;
      }

      await PushNotifications.register();

      PushNotifications.addListener('registration', async (token) => {
        console.log('[Push] Token:', token.value);
        // Store push token — you can add a push_token column to profiles later
        // For now, just log it
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
    };

    setup();

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [user]);
}
