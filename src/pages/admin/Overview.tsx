import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Users, ShoppingBag, Wallet, Target, Gift, Percent } from 'lucide-react';

export default function AdminOverview() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: async () => {
      const [profiles, sales, withdrawals, missions, prizes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('referral_sales').select('id, commission_amount'),
        supabase.from('withdrawal_requests').select('id, amount, status'),
        supabase.from('missions').select('id', { count: 'exact', head: true }),
        supabase.from('prizes').select('id', { count: 'exact', head: true }),
      ]);

      const totalSales = sales.data?.length ?? 0;
      const totalCommissions = sales.data?.reduce((s, r) => s + Number(r.commission_amount), 0) ?? 0;
      const pendingWithdrawals = withdrawals.data?.filter((w) => w.status === 'pending') ?? [];
      const pendingAmount = pendingWithdrawals.reduce((s, w) => s + Number(w.amount), 0);

      return {
        totalUsers: profiles.count ?? 0,
        totalSales,
        totalCommissions,
        pendingWithdrawals: pendingWithdrawals.length,
        pendingAmount,
        totalMissions: missions.count ?? 0,
        totalPrizes: prizes.count ?? 0,
      };
    },
  });

  const cards = [
    { label: 'Usuários', value: stats?.totalUsers, icon: Users, href: null },
    { label: 'Vendas por Indicação', value: stats?.totalSales, icon: ShoppingBag, href: null },
    { label: 'Comissões Pagas', value: stats ? `R$ ${stats.totalCommissions.toFixed(2).replace('.', ',')}` : null, icon: Wallet, href: null },
    { label: 'Saques Pendentes', value: stats ? `${stats.pendingWithdrawals} (R$ ${stats.pendingAmount.toFixed(2).replace('.', ',')})` : null, icon: Wallet, href: null },
    { label: 'Missões Ativas', value: stats?.totalMissions, icon: Target, href: '/admin/missions' },
    { label: 'Prêmios Ativos', value: stats?.totalPrizes, icon: Gift, href: '/admin/prizes' },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
        <p className="text-muted-foreground mb-8">Visão geral do programa VIP</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {cards.map((c) => (
            <Card key={c.label} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
                <c.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <p className="text-2xl font-bold">{c.value}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-4">
          <Link to="/admin/missions" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            Gerenciar Missões
          </Link>
          <Link to="/admin/prizes" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            Gerenciar Prêmios
          </Link>
        </div>
      </div>
    </div>
  );
}
