import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.4105f98637054ccaa4cf91a3f7ab4187',
  appName: 'vip-conecta-play',
  webDir: 'dist',
  server: {
    url: 'https://4105f986-3705-4cca-a4cf-91a3f7ab4187.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
