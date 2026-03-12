import { BottomNav } from '@/components/shared/BottomNav';
import { Button } from '@/components/ui/button';
import { LogOut, ChevronRight } from 'lucide-react';
import { mockDriver } from '@/data/mockData';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';

export default function DriverProfile() {
  const navigate = useNavigate();
  const signOut = useAuthStore((s) => s.signOut);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth/login', { replace: true });
  };

  const menuItems = [
    { label: 'Dados pessoais', icon: '👤' },
    { label: 'Documentos', icon: '📄' },
    { label: 'Veículo', icon: '🛵' },
    { label: 'Configurações', icon: '⚙️' },
    { label: 'Ajuda e suporte', icon: '❓' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 pt-6">
        <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Meu Perfil</h1>

        <div className="rounded-2xl border border-border bg-card p-5 mb-6 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-brand-purple flex items-center justify-center text-2xl font-bold text-primary-foreground">
            {mockDriver.name.charAt(0)}
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg text-foreground">{mockDriver.name}</h2>
            <p className="text-sm text-muted-foreground">Entregador</p>
          </div>
        </div>

        <div className="space-y-1 mb-6">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className="w-full rounded-xl border border-border bg-card p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <span className="flex items-center gap-3">
                <span>{item.icon}</span>
                <span className="text-sm font-medium text-foreground">{item.label}</span>
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
      <BottomNav variant="driver" />
    </div>
  );
}
