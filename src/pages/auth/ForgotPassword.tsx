import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import logoParadaVip from '@/assets/logo-parada-vip.png';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success('E-mail de recuperação enviado!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-heading text-2xl font-bold text-foreground text-center mb-2">Recuperar Senha</h1>
        <p className="text-sm text-muted-foreground text-center mb-8">
          Informe seu e-mail para receber o link de redefinição.
        </p>
        {sent ? (
          <div className="text-center">
            <p className="text-brand-green font-medium mb-4">✅ E-mail enviado com sucesso!</p>
            <p className="text-sm text-muted-foreground mb-4">Verifique sua caixa de entrada.</p>
            <Link to="/auth/login" className="text-brand-purple hover:underline text-sm">Voltar ao login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full bg-brand-purple hover:bg-brand-purple/90 rounded-xl h-12" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar link'}
            </Button>
            <p className="text-center text-sm">
              <Link to="/auth/login" className="text-brand-purple hover:underline">Voltar ao login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
