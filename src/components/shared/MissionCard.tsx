import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface Mission {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  rewardLabel: string;
  completed: boolean;
  claimed: boolean;
}

interface MissionCardProps {
  mission: Mission;
  onClaim?: (id: string) => void;
  onGo?: (id: string) => void;
}

export function MissionCard({ mission, onClaim, onGo }: MissionCardProps) {
  const percent = Math.min((mission.progress / mission.target) * 100, 100);

  return (
    <div className={cn(
      'glass-dark rounded-2xl p-4 flex items-start gap-3 transition-all',
      mission.completed && !mission.claimed && 'ring-1 ring-brand-green/50'
    )}>
      <span className="text-2xl mt-0.5">{mission.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-heading font-semibold text-sm leading-tight">{mission.title}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">{mission.description}</p>
          </div>
          <span className="shrink-0 rounded-full bg-brand-purple/20 border border-brand-purple/30 px-2 py-0.5 text-xs font-semibold text-brand-purple-light">
            {mission.rewardLabel}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <Progress
            value={percent}
            className="h-2 flex-1 bg-muted/30"
          />
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {mission.progress}/{mission.target}
          </span>
        </div>
        {mission.completed && !mission.claimed && (
          <Button
            size="sm"
            onClick={() => onClaim?.(mission.id)}
            className="mt-2 w-full bg-brand-green hover:bg-brand-green/90 text-primary-foreground rounded-full animate-pulse"
          >
            Resgatar 🎉
          </Button>
        )}
        {!mission.completed && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onGo?.(mission.id)}
            className="mt-2 w-full text-brand-purple-light hover:bg-brand-purple/10 rounded-full"
          >
            Ir →
          </Button>
        )}
      </div>
    </div>
  );
}
