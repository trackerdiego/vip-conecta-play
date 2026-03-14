import { motion } from 'framer-motion';
import { ArrowUp, ArrowLeft, ArrowRight, CornerUpLeft, CornerUpRight, Navigation, MapPin } from 'lucide-react';

export interface NavInstruction {
  text: string;
  distance: number;
  type: string; // e.g. 'Left', 'Right', 'Straight', 'Head', etc.
  road?: string;
}

interface NavigationBarProps {
  instruction: NavInstruction | null;
  isPickup: boolean;
  destinationLabel: string;
}

function getManeuverIcon(type: string) {
  const t = type.toLowerCase();
  if (t.includes('left') && t.includes('sharp')) return <CornerUpLeft className="h-7 w-7 text-primary-foreground" />;
  if (t.includes('right') && t.includes('sharp')) return <CornerUpRight className="h-7 w-7 text-primary-foreground" />;
  if (t.includes('left')) return <ArrowLeft className="h-7 w-7 text-primary-foreground" />;
  if (t.includes('right')) return <ArrowRight className="h-7 w-7 text-primary-foreground" />;
  if (t.includes('straight') || t.includes('head') || t.includes('continue') || t.includes('depart'))
    return <ArrowUp className="h-7 w-7 text-primary-foreground" />;
  return <Navigation className="h-7 w-7 text-primary-foreground" />;
}

function formatInstructionDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
}

export function NavigationBar({ instruction, isPickup, destinationLabel }: NavigationBarProps) {
  if (!instruction) {
    return (
      <motion.div
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        className="absolute top-16 left-4 right-4 z-[1001]"
      >
        <div className="bg-brand-purple rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center shrink-0">
            <MapPin className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-primary-foreground/70 font-medium">
              {isPickup ? 'Indo para coleta' : 'Indo para entrega'}
            </p>
            <p className="text-sm font-bold text-primary-foreground truncate">{destinationLabel}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      className="absolute top-16 left-4 right-4 z-[1001]"
    >
      <div className="bg-brand-purple rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center shrink-0">
          {getManeuverIcon(instruction.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold text-primary-foreground leading-tight truncate">
            {instruction.road || instruction.text}
          </p>
          <p className="text-sm text-primary-foreground/70 font-medium">
            em {formatInstructionDistance(instruction.distance)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
