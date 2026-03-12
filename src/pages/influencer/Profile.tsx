import { BottomNav } from '@/components/shared/BottomNav';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, ChevronRight } from 'lucide-react';
import { mockInfluencer } from '@/data/mockData';
import { LevelBadge } from '@/components/shared/LevelBadge';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';

export default function InfluencerProfile() {
  const navigate = useNavigate();
  const signOut = useAuthStore((s) => s.signOut);
  const data = mockInfluencer;

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth/login', { replace: true });
  };

  const menuItems = [
    { label: 'Dados pessoais', icon: '👤' },
    { label: 'Configurações', icon: '⚙️' },
    { label: 'Ajuda e suporte', icon: '❓' },
    { label: 'Termos de uso', icon: '📄' },
  ];

  return (
    <div className="min-h-screen bg-brand-dark text-primary-foreground pb-24 dark">
      <div className="max-w-md mx-auto px-4 pt-6">
        <h1 className="font-heading text-2xl font-bold mb-6">Meu Perfil</h1>

        <div className="glass-dark rounded-2xl p-5 mb-6 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-brand-purple to-brand-orange flex items-center justify-center text-2xl font-bold ring-2 ring-brand-purple-light/50">
            {data.name.charAt(0)}
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg">{data.name}</h2>
            <LevelBadge level={data.level} name={data.levelName} />
            <p className="text-xs text-muted-foreground mt-1">Código: {data.referralCode}</p>
          </div>
        </div>

        <div className="space-y-1 mb-6">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className="w-full glass-dark rounded-xl p-4 flex items-center justify-between hover:bg-muted/10 transition-colors"
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
