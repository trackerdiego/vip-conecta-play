import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BottomNav } from '@/components/shared/BottomNav';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { mockInfluencer } from '@/data/mockData';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

const pixTypes = ['CPF', 'E-mail', 'Telefone', 'Chave aleatória'];

export default function InfluencerWithdraw() {
  const [amount, setAmount] = useState('');
  const [pixType, setPixType] = useState('CPF');
  const [pixKey, setPixKey] = useState('');
  const balance = mockInfluencer.balance;
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
    toast.success('Saque solicitado! Processamento em até 2 dias úteis.');
  };

  return (
    <div className="min-h-screen bg-brand-dark text-primary-foreground pb-24 dark">
      <div className="max-w-md mx-auto px-4 pt-6">
        <h1 className="font-heading text-2xl font-bold mb-6">💸 Solicitar Saque</h1>

        <div className="glass-dark rounded-2xl p-5 mb-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Saldo Disponível</p>
          <CurrencyDisplay value={balance} size="lg" glow className="text-primary-foreground" />
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
            disabled={numAmount < 20 || numAmount > balance}
            className="w-full bg-brand-purple hover:bg-brand-purple/90 rounded-xl h-12 disabled:opacity-50"
          >
            Solicitar Saque
          </Button>
        </form>

        <h2 className="font-heading font-bold mt-8 mb-3">Saques Anteriores</h2>
        <div className="glass-dark rounded-2xl p-4 text-center text-muted-foreground">
          <p className="text-sm">Nenhum saque realizado</p>
        </div>
      </div>
      <BottomNav variant="influencer" />
    </div>
  );
}
