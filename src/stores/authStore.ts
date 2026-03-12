import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

type AppRole = 'influencer' | 'driver' | 'admin';

interface AuthState {
  user: User | null;
  role: AppRole | null;
  profile: {
    full_name: string;
    phone: string | null;
    avatar_url: string | null;
    referral_code: string | null;
    level: number;
    xp_points: number;
    is_online: boolean;
  } | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setRole: (role: AppRole | null) => void;
  setProfile: (profile: AuthState['profile']) => void;
  setLoading: (loading: boolean) => void;
  fetchProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  role: null,
  profile: null,
  loading: true,
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;

    const [profileRes, roleRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('user_roles').select('role').eq('user_id', user.id).single(),
    ]);

    if (profileRes.data) {
      set({
        profile: {
          full_name: profileRes.data.full_name,
          phone: profileRes.data.phone,
          avatar_url: profileRes.data.avatar_url,
          referral_code: profileRes.data.referral_code,
          level: profileRes.data.level ?? 1,
          xp_points: profileRes.data.xp_points ?? 0,
          is_online: profileRes.data.is_online ?? false,
        },
      });
    }

    if (roleRes.data) {
      set({ role: roleRes.data.role as AppRole });
    }
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, role: null, profile: null });
  },
}));
