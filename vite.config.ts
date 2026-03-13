import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react-leaflet", "@react-leaflet/core"],
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      external: [
        '@capacitor/geolocation',
        '@capacitor/push-notifications',
        '@capacitor-community/background-geolocation',
        '@capgo/capacitor-updater',
      ],
    },
  },
}));
