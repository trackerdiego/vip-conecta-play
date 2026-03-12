import { cn } from '@/lib/utils';

interface DriverStatusPillProps {
  isOnline: boolean;
  onToggle: () => void;
}

export function DriverStatusPill({ isOnline, onToggle }: DriverStatusPillProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'flex items-center gap-2 rounded-full px-5 py-2.5 font-heading font-semibold text-sm shadow-lg transition-all active:scale-95',
        isOnline
          ? 'bg-brand-green text-primary-foreground'
          : 'bg-muted text-muted-foreground'
      )}
    >
      <span className={cn(
        'h-2.5 w-2.5 rounded-full',
        isOnline ? 'bg-primary-foreground animate-pulse' : 'bg-muted-foreground'
      )} />
      {isOnline ? 'Online' : 'Offline'}
    </button>
  );
}
