import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DriverStatusPillProps {
  isOnline: boolean;
  onToggle: () => void;
}

export function DriverStatusPill({ isOnline, onToggle }: DriverStatusPillProps) {
  const handleToggle = () => {
    if (navigator.vibrate) navigator.vibrate(50);
    onToggle();
  };

  return (
    <button
      onClick={handleToggle}
      className={cn(
        'relative flex items-center gap-3 rounded-full pl-2 pr-5 py-1.5 font-heading font-semibold text-sm shadow-xl transition-colors duration-300',
        isOnline
          ? 'bg-brand-green'
          : 'bg-muted'
      )}
      style={{ minWidth: 140, height: 48 }}
    >
      {/* Track with sliding thumb */}
      <div className="relative h-9 w-16 rounded-full bg-background/20 shrink-0">
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={cn(
            'absolute top-1 h-7 w-7 rounded-full shadow-md',
            isOnline ? 'bg-primary-foreground' : 'bg-muted-foreground'
          )}
          style={{ left: isOnline ? 'calc(100% - 32px)' : 4 }}
        />
      </div>

      <span className={cn(
        'text-sm font-bold tracking-wide',
        isOnline ? 'text-primary-foreground' : 'text-muted-foreground'
      )}>
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </button>
  );
}
