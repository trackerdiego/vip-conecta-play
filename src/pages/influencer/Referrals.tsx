import { BottomNav } from '@/components/shared/BottomNav';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { useReferralSales } from '@/hooks/useReferralSales';
import { useReferralStats } from '@/hooks/useReferralStats';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export default function InfluencerReferrals() {
  const { sales, totalSales, totalCommission, loading: salesLoading } = useReferralSales();
  const { totalReferrals, loading: referralsLoading } = useReferralStats();

  const isLoading = salesLoading || referralsLoading;

  return (
    <div className="min-h-screen bg-brand-dark text-primary-foreground pb-24 dark">
      <div className="max-w-md mx-auto px-4 pt-6">
        <h1 className="font-heading text-2xl font-bold mb-6">💰 Minhas Vendas</h1>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="glass-dark rounded-2xl p-3 text-center">
            <p className="font-heading text-2xl font-bold text-brand-green">{totalSales}</p>
            <p className="text-[10px] text-muted-foreground">Vendas</p>
          </div>
          <div className="glass-dark rounded-2xl p-3 text-center">
            <CurrencyDisplay value={totalCommission} size="sm" className="text-brand-purple-light" />
            <p className="text-[10px] text-muted-foreground">Comissões</p>
          </div>
          <div className="glass-dark rounded-2xl p-3 text-center">
            <p className="font-heading text-2xl font-bold text-brand-orange">{totalReferrals}</p>
            <p className="text-[10px] text-muted-foreground">Indicações</p>
          </div>
        </div>

        <h2 className="font-heading font-bold mb-3">Vendas Recentes</h2>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl bg-muted/10" />
            ))}
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma venda registrada</p>
            <p className="text-sm text-muted-foreground mt-1">Compartilhe seu link nos stories!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sales.map((sale, i) => (
              <motion.div
                key={sale.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="glass-dark rounded-xl p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-brand-green/20 flex items-center justify-center text-sm">
                    🛒
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Pedido #{sale.external_order_id?.slice(-6)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(sale.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <CurrencyDisplay
                  value={Number(sale.commission_amount)}
                  size="sm"
                  className="text-brand-green"
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <BottomNav variant="influencer" />
    </div>
  );
}
