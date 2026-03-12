import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export interface MissionWithProgress {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  target: number;
  progress: number;
  rewardLabel: string;
  completed: boolean;
  claimed: boolean;
  rewardType: string | null;
  rewardValue: number | null;
}

export function useMissions() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: missions = [], isLoading } = useQuery({
    queryKey: ['missions', user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Fetch active missions
      const { data: missionsData, error: mErr } = await supabase
        .from('missions')
        .select('*')
        .eq('is_active', true);
      if (mErr) throw mErr;

      // Fetch user progress
      const { data: userMissions, error: umErr } = await supabase
        .from('user_missions')
        .select('*')
        .eq('user_id', user!.id);
      if (umErr) throw umErr;

      const umMap = new Map(userMissions?.map((um) => [um.mission_id, um]));

      return (missionsData ?? []).map((m): MissionWithProgress => {
        const um = umMap.get(m.id);
        const progress = um?.progress ?? 0;
        const completed = progress >= m.target_value;
        const claimed = !!um?.claimed_at;

        let rewardLabel = m.reward_description ?? '';
        if (!rewardLabel && m.reward_type === 'cash' && m.reward_value) {
          rewardLabel = `R$ ${m.reward_value.toFixed(2).replace('.', ',')}`;
        }
        if (!rewardLabel) rewardLabel = '🎁 Prêmio';

        return {
          id: m.id,
          title: m.title,
          description: m.description,
          icon: m.icon,
          target: m.target_value,
          progress,
          rewardLabel,
          completed,
          claimed,
          rewardType: m.reward_type,
          rewardValue: m.reward_value,
        };
      });
    },
  });

  const claimMission = useMutation({
    mutationFn: async (missionId: string) => {
      // Upsert user_mission with claimed_at
      const { error } = await supabase
        .from('user_missions')
        .update({ claimed_at: new Date().toISOString() })
        .eq('mission_id', missionId)
        .eq('user_id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
  });

  return { missions, loading: isLoading, claimMission };
}
