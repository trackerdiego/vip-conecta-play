import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BottomNav } from '@/components/shared/BottomNav';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { useWallet } from '@/hooks/useWallet';
import { useWithdrawals } from '@/hooks/useWithdrawals';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const pixTypes = ['CPF', 'E-mail', 'Telefone', 'Chave aleatória'];

export default function InfluencerWithdraw() {
  const [amount, setAmount] = useState('');
  const [pixType, setPixType] = useState('CPF');
  const [pixKey, setPixKey] = useState('');
  const { balance, loading: walletLoading } = useWallet();
  const { withdrawals, loading: withdrawalsLoading, createWithdrawal } = useWithdrawals();
  const numAmount = parseFloat(amount) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount < 20) {
      toast.error('Valor mínimo: R$ 20,00');
      return;
    }
    if (numAmount > balance) {
      toast.error('Saldo insuficiente');
      return;
    }
    createWithdrawal.mutate(
      { amount: numAmount, pixKey: `${pixType}: ${pixKey}` },
      {
        onSuccess: () => {
          toast.success('Saque solicitado! Processamento em até 2 dias úteis.');
          setAmount('');
          setPixKey('');
        },
        onError: () => toast.error('Erro ao solicitar saque'),
      }
    );
  };

  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendente', color: 'text-brand-orange' },
    approved: { label: 'Aprovado', color: 'text-brand-green' },
    rejected: { label: 'Rejeitado', color: 'text-destructive' },
  };

  return (
    <div className="min-h-screen bg-brand-dark text-primary-foreground pb-24 dark">
      <div className="max-w-md mx-auto px-4 pt-6">
        <h1 className="font-heading text-2xl font-bold mb-6">💸 Solicitar Saque</h1>

        <div className="glass-dark rounded-2xl p-5 mb-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Saldo Disponível</p>
          {walletLoading ? (
            <Skeleton className="h-8 w-32 mx-auto bg-muted/10" />
          ) : (
            <CurrencyDisplay value={balance} size="lg" glow className="text-primary-foreground" />
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-primary-foreground">Valor do saque</Label>
            <Input
              type="number"
              min="20"
              step="0.01"
              placeholder="R$ 0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-muted/10 border-muted/20 text-primary-foreground h-12 rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-primary-foreground">Tipo de chave PIX</Label>
            <div className="grid grid-cols-2 gap-2">
              {pixTypes.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setPixType(t)}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                    pixType === t
                      ? 'border-brand-purple bg-brand-purple/20 text-brand-purple-light'
                      : 'border-muted/20 text-muted-foreground'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-primary-foreground">Chave PIX</Label>
            <Input
              placeholder={`Sua chave ${pixType}`}
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              className="bg-muted/10 border-muted/20 text-primary-foreground h-12 rounded-xl"
              required
            />
          </div>

          <div className="rounded-xl bg-brand-orange/10 border border-brand-orange/30 p-3 flex gap-2">
            <AlertTriangle className="h-4 w-4 text-brand-orange shrink-0 mt-0.5" />
            <p className="text-xs text-brand-orange">
              Saques são processados em até 2 dias úteis. Valor mínimo: R$ 20,00.
            </p>
          </div>

          <Button
            type="submit"
            disabled={numAmount < 20 || numAmount > balance || createWithdrawal.isPending}
            className="w-full bg-brand-purple hover:bg-brand-purple/90 rounded-xl h-12 disabled:opacity-50"
          >
            {createWithdrawal.isPending ? 'Processando...' : 'Solicitar Saque'}
          </Button>
        </form>

        <h2 className="font-heading font-bold mt-8 mb-3">Saques Anteriores</h2>
        {withdrawalsLoading ? (
          <Skeleton className="h-20 w-full rounded-2xl bg-muted/10" />
        ) : withdrawals.length === 0 ? (
          <div className="glass-dark rounded-2xl p-4 text-center text-muted-foreground">
            <p className="text-sm">Nenhum saque realizado</p>
          </div>
        ) : (
          <div className="space-y-2">
            {withdrawals.map((w) => {
              const st = statusMap[w.status ?? 'pending'] ?? statusMap.pending;
              return (
                <div key={w.id} className="glass-dark rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <CurrencyDisplay value={w.amount} size="sm" className="text-primary-foreground" />
                    <p className="text-[10px] text-muted-foreground">
                      {w.created_at ? format(new Date(w.created_at), 'dd/MM/yyyy HH:mm') : ''}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold ${st.color}`}>{st.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav variant="influencer" />
    </div>
  );
}
