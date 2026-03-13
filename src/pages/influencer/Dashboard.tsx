import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Share2, Crown, Zap, Copy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { LevelBadge } from '@/components/shared/LevelBadge';
import { MissionCard } from '@/components/shared/MissionCard';
import { ParticlesBackground } from '@/components/shared/ParticlesBackground';
import { BottomNav } from '@/components/shared/BottomNav';
import { useAuthStore } from '@/stores/authStore';
import { useWallet } from '@/hooks/useWallet';
import { useMissions } from '@/hooks/useMissions';
import { useReferralStats } from '@/hooks/useReferralStats';
import { getLevelInfo } from '@/lib/levels';
import { usePrizes } from '@/hooks/usePrizes';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function InfluencerDashboard() {
  const navigate = useNavigate();
  const [showShareSheet, setShowShareSheet] = useState(false);
  const profile = useAuthStore((s) => s.profile);
  const { balance, loading: walletLoading } = useWallet();
  const { missions, loading: missionsLoading, claimMission } = useMissions();
  const { totalReferrals, loading: referralsLoading } = useReferralStats();
  const { prizes } = usePrizes();

  const level = profile?.level ?? 1;
  const xp = profile?.xp_points ?? 0;
  const { levelName, xpMax } = getLevelInfo(level);
  const name = profile?.full_name ?? 'Usuário';
  const referralCode = profile?.referral_code ?? '';
  const nextPrize = prizes.length > 0 ? prizes[0] : null;

  const shareLink = `https://app.paradadoacai.online/r/${referralCode}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Parada do Açaí — Link VIP',
          text: 'Use meu link e ganhe desconto! 🍇',
          url: shareLink,
        });
      } catch {}
    } else {
      setShowShareSheet(true);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareLink);
    toast.success('Link copiado!');
  };

  const completedCount = missions.filter((m) => m.completed).length;
  const isLoading = walletLoading || missionsLoading || referralsLoading;

  if (isLoading && !profile) {
    return (
      <div className="min-h-screen bg-brand-dark text-primary-foreground pb-24 dark">
        <div className="max-w-md mx-auto px-4 pt-6 space-y-4">
          <Skeleton className="h-20 w-full rounded-2xl bg-muted/10" />
          <Skeleton className="h-40 w-full rounded-3xl bg-muted/10" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-28 rounded-2xl bg-muted/10" />
            <Skeleton className="h-28 rounded-2xl bg-muted/10" />
          </div>
        </div>
        <BottomNav variant="influencer" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark text-primary-foreground pb-24 dark">
      <ParticlesBackground />
      <div className="relative z-10 max-w-md mx-auto px-4 pt-6">
        {/* Header */}
        <div className="glass-dark rounded-2xl p-4 flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-purple to-brand-orange flex items-center justify-center ring-2 ring-brand-purple-light/50 text-lg font-bold">
            {name.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="font-heading font-bold text-lg">Olá, {name.split(' ')[0]} 👋</h2>
            <LevelBadge level={level} name={levelName} />
          </div>
          <button className="p-2 rounded-full hover:bg-muted/10 transition-colors">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Balance Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative rounded-3xl bg-gradient-to-br from-brand-purple/80 to-brand-dark-surface p-6 glow-purple mb-6 overflow-hidden"
        >
          <ParticlesBackground />
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Saldo Disponível</p>
            <CurrencyDisplay value={balance} size="xl" glow className="text-primary-foreground block mb-4" />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/influencer/withdraw')}
                className="rounded-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 flex-1"
              >
                Sacar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full text-primary-foreground/70 hover:bg-primary-foreground/10 flex-1"
              >
                Ver Extrato
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="glass-dark rounded-2xl p-4">
            <Crown className="h-5 w-5 text-brand-purple-light mb-2" />
            <p className="text-xs text-muted-foreground">Nível Atual</p>
            <p className="font-heading font-bold text-lg">{levelName}</p>
            <Progress value={(xp / xpMax) * 100} className="h-1.5 mt-2 bg-muted/20" />
            <p className="text-[10px] text-muted-foreground mt-1">{xp}/{xpMax} XP</p>
          </div>
          <div className="glass-dark rounded-2xl p-4">
            <Zap className="h-5 w-5 text-brand-green mb-2" />
            <p className="text-xs text-muted-foreground">Indicações</p>
            <p className="font-heading font-bold text-lg">{totalReferrals} vendas</p>
          </div>
        </div>

        {/* Share Button */}
        <Button
          onClick={handleShare}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-brand-purple to-brand-purple-light text-primary-foreground font-heading text-lg font-bold shadow-xl glow-purple mb-6"
        >
          <Share2 className="h-5 w-5 mr-2" />
          Compartilhar meu Link 🔗
        </Button>

        {/* Missions */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-bold text-lg">🎯 Missões de Hoje</h3>
            <span className="text-xs text-muted-foreground">{completedCount}/{missions.length} completas</span>
          </div>
          <div className="space-y-3">
            {missions.length === 0 && !missionsLoading && (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma missão disponível</p>
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

        {/* Next Prize */}
        {nextPrize && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-3xl bg-gradient-to-br from-brand-purple/40 to-brand-orange/20 p-5 mb-6 border border-brand-purple/20"
          >
            <span className="text-3xl mb-2 block">{nextPrize.emoji}</span>
            <h3 className="font-heading font-bold text-lg">{nextPrize.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {nextPrize.progress} de {nextPrize.target} indicações
            </p>
            <Progress value={(nextPrize.progress / nextPrize.target) * 100} className="h-2 mt-3 bg-muted/20" />
            <button
              onClick={() => navigate('/influencer/rewards')}
              className="text-brand-purple-light text-sm mt-3 hover:underline"
            >
              Ver todos os prêmios →
            </button>
          </motion.div>
        )}
      </div>

      {/* Share Bottom Sheet */}
      {showShareSheet && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/60 flex items-end"
          onClick={() => setShowShareSheet(false)}
        >
          <motion.div
            initial={{ y: 300 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md mx-auto bg-brand-dark-surface rounded-t-3xl p-6 border-t border-brand-purple/20"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-lg">Seu Link VIP</h3>
              <button onClick={() => setShowShareSheet(false)}>
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="glass-dark rounded-xl p-3 flex items-center gap-2 mb-4">
              <p className="text-sm flex-1 truncate text-muted-foreground">{shareLink}</p>
              <Button size="sm" variant="ghost" onClick={copyLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={copyLink} className="w-full bg-brand-purple hover:bg-brand-purple/90 rounded-xl h-12">
              Copiar Link
            </Button>
          </motion.div>
        </motion.div>
      )}

      <BottomNav variant="influencer" />
    </div>
  );
}
