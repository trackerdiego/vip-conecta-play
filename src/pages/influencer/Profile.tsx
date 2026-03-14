import { BottomNav } from '@/components/shared/BottomNav';
import { Button } from '@/components/ui/button';
import { LogOut, ChevronRight } from 'lucide-react';
import { LevelBadge } from '@/components/shared/LevelBadge';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { getLevelName } from '@/lib/levels';

export default function InfluencerProfile() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth/login', { replace: true });
  };

  const level = profile?.level ?? 1;
  const levelName = getLevelName(level);

  const menuItems = [
    { label: 'Dados pessoais', icon: '👤', action: () => navigate('/influencer/personal-data') },
    { label: 'Configurações', icon: '⚙️', action: undefined },
    { label: 'Ajuda e suporte', icon: '❓', action: () => window.open('https://wa.me/5500000000000', '_blank') },
    { label: 'Termos de uso', icon: '📄', action: () => navigate('/terms') },
  ];

  return (
    <div className="min-h-screen bg-brand-dark text-primary-foreground pb-24 dark">
      <div className="max-w-md mx-auto px-4 pt-6">
        <h1 className="font-heading text-2xl font-bold mb-6">Meu Perfil</h1>

        <div className="glass-dark rounded-2xl p-5 mb-6 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-brand-purple to-brand-orange flex items-center justify-center text-2xl font-bold ring-2 ring-brand-purple-light/50">
            {profile?.full_name?.charAt(0) ?? '?'}
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg">{profile?.full_name ?? 'Usuário'}</h2>
            <LevelBadge level={level} name={levelName} />
            {profile?.referral_code && (
              <p className="text-xs text-muted-foreground mt-1">Código: {profile.referral_code}</p>
            )}
          </div>
        </div>

        <div className="space-y-1 mb-6">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              disabled={!item.action}
              className="w-full glass-dark rounded-xl p-4 flex items-center justify-between hover:bg-muted/10 transition-colors disabled:opacity-50"
            >
              <span className="flex items-center gap-3">
                <span>{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full text-destructive hover:bg-destructive/10 rounded-xl"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair da conta
        </Button>
      </div>
      <BottomNav variant="influencer" />
    </div>
  );
}
