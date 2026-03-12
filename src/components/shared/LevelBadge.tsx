import { cn } from '@/lib/utils';

interface LevelBadgeProps {
  level: number;
  name: string;
  className?: string;
}

const levelColors: Record<string, string> = {
  Bronze: 'bg-amber-700/20 text-amber-400 border-amber-600/30',
  Prata: 'bg-slate-400/20 text-slate-300 border-slate-400/30',
  Ouro: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  Diamante: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/30',
};

export function LevelBadge({ level, name, className }: LevelBadgeProps) {
  const colorClass = levelColors[name] || levelColors.Bronze;

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold font-heading',
      colorClass,
      className
    )}>
      <span className="text-sm">⭐</span>
      Nível {level} — {name}
    </span>
  );
}
