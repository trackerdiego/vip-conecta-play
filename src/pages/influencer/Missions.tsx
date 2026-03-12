import { BottomNav } from '@/components/shared/BottomNav';
import { MissionCard } from '@/components/shared/MissionCard';
import { mockMissions } from '@/data/mockData';
import { toast } from 'sonner';

export default function InfluencerMissions() {
  return (
    <div className="min-h-screen bg-brand-dark text-primary-foreground pb-24 dark">
      <div className="max-w-md mx-auto px-4 pt-6">
        <h1 className="font-heading text-2xl font-bold mb-6">🎯 Todas as Missões</h1>
        <div className="space-y-3">
          {mockMissions.map((m) => (
            <MissionCard
              key={m.id}
              mission={m}
              onClaim={() => toast.success('Recompensa resgatada! 🎉')}
            />
          ))}
        </div>
      </div>
      <BottomNav variant="influencer" />
    </div>
  );
}
