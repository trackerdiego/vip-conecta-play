import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers } from 'lucide-react';
import { LOCATIONIQ_KEY } from '@/hooks/useReverseGeocode';

export type MapStyle = 'streets' | 'dark' | 'light' | 'ocean' | 'satellite';

interface MapStyleOption {
  id: MapStyle;
  label: string;
  emoji: string;
}

const MAP_STYLES: MapStyleOption[] = [
  { id: 'streets', label: 'Ruas', emoji: '🗺️' },
  { id: 'dark', label: 'Escuro', emoji: '🌙' },
  { id: 'light', label: 'Claro', emoji: '☀️' },
  { id: 'ocean', label: 'Terreno', emoji: '🌊' },
  { id: 'satellite', label: 'Satélite', emoji: '🛰️' },
];

const STORAGE_KEY = 'map-style';

export function getTileUrl(style: MapStyle): string {
  return `https://tiles.locationiq.com/v3/${style}/r/{z}/{x}/{y}.png?key=${LOCATIONIQ_KEY}`;
}

export function useMapStyle() {
  const [style, setStyle] = useState<MapStyle>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEY) as MapStyle) || 'streets';
    } catch {
      return 'streets';
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, style);
  }, [style]);

  return { style, setStyle, tileUrl: getTileUrl(style) };
}

interface MapStyleSelectorProps {
  current: MapStyle;
  onChange: (style: MapStyle) => void;
}

export function MapStyleSelector({ current, onChange }: MapStyleSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute bottom-24 right-4 z-[1000]">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="mb-2 bg-background rounded-2xl shadow-xl border border-border p-2 space-y-1"
          >
            {MAP_STYLES.map((s) => (
              <button
                key={s.id}
                onClick={() => { onChange(s.id); setOpen(false); }}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  current === s.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                <span>{s.emoji}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen(!open)}
        className="h-11 w-11 rounded-full bg-background shadow-xl border border-border flex items-center justify-center hover:bg-muted transition-colors"
      >
        <Layers className="h-5 w-5 text-foreground" />
      </button>
    </div>
  );
}
