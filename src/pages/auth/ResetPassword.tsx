import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import logoParadaVip from '@/assets/logo-parada-vip.png';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (!hash.includes('type=recovery')) {
      toast.error('Link inválido ou expirado');
      navigate('/auth/login', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('As senhas não coincidem');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Senha atualizada!');
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-accent/60 to-background px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(263_70%_90%/0.4),transparent_60%)]" />
      <div className="relative z-10 w-full max-w-sm">
        <img src={logoParadaVip} alt="Parada do Açaí VIP" className="h-20 w-auto mx-auto mb-6 drop-shadow-lg" />
        <h1 className="font-heading text-2xl font-bold text-center mb-8">Nova Senha</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nova senha</Label>
            <Input type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <div className="space-y-2">
            <Label>Confirmar nova senha</Label>
            <Input type="password" placeholder="Repita a senha" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full bg-brand-purple hover:bg-brand-purple/90 rounded-xl h-12" disabled={loading}>
            {loading ? 'Salvando...' : 'Redefinir senha'}
          </Button>
        </form>
      </div>
    </div>
  );
}
