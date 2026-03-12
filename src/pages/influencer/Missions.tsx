import { BottomNav } from '@/components/shared/BottomNav';
import { MissionCard } from '@/components/shared/MissionCard';
import { useMissions } from '@/hooks/useMissions';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function InfluencerMissions() {
  const { missions, loading, claimMission } = useMissions();

  return (
    <div className="min-h-screen bg-brand-dark text-primary-foreground pb-24 dark">
      <div className="max-w-md mx-auto px-4 pt-6">
        <h1 className="font-heading text-2xl font-bold mb-6">🎯 Todas as Missões</h1>
        <div className="space-y-3">
          {loading && (
            <>
              <Skeleton className="h-20 w-full rounded-2xl bg-muted/10" />
              <Skeleton className="h-20 w-full rounded-2xl bg-muted/10" />
              <Skeleton className="h-20 w-full rounded-2xl bg-muted/10" />
            </>
          )}
          {!loading && missions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma missão disponível no momento</p>
          )}
          {missions.map((m) => (
            <MissionCard
              key={m.id}
              mission={m}
              onClaim={(id) => {
                claimMission.mutate(id);
                toast.success('Recompensa resgatada! 🎉');
              }}
            />
          ))}
        </div>
      </div>
      <BottomNav variant="influencer" />
    </div>
  );
}
