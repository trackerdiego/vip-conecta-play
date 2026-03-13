import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Trophy, User, Map, ClipboardList, DollarSign, Palette, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

const influencerNav: NavItem[] = [
  { path: '/influencer/dashboard', label: 'Início', icon: Home },
  { path: '/influencer/story-creator', label: 'Criar', icon: Palette },
  { path: '/influencer/leaderboard', label: 'Ranking', icon: BarChart3 },
  { path: '/influencer/referrals', label: 'Vendas', icon: Users },
  { path: '/influencer/profile', label: 'Perfil', icon: User },
];

const driverNav: NavItem[] = [
  { path: '/driver/map', label: 'Mapa', icon: Map },
  { path: '/driver/history', label: 'Corridas', icon: ClipboardList },
  { path: '/driver/earnings', label: 'Ganhos', icon: DollarSign },
  { path: '/driver/profile', label: 'Perfil', icon: User },
];

interface BottomNavProps {
  variant: 'influencer' | 'driver';
}

export function BottomNav({ variant }: BottomNavProps) {
  const location = useLocation();
  const items = variant === 'influencer' ? influencerNav : driverNav;
  const isDark = variant === 'influencer';

  return (
    <nav className={cn(
      'fixed bottom-0 left-0 right-0 z-50 pb-safe',
      isDark ? 'glass-dark' : 'bg-background/90 backdrop-blur-lg border-t border-border'
    )}>
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {items.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === '/influencer/dashboard' && location.pathname.startsWith('/influencer')) && location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 transition-colors',
                isActive
                  ? isDark ? 'text-brand-purple-light' : 'text-brand-purple'
                  : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <span className={cn(
                  'h-1 w-1 rounded-full mt-0.5',
                  isDark ? 'bg-brand-purple-light' : 'bg-brand-purple'
                )} />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
