import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedRole = searchParams.get('role') || 'influencer';

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: preselectedRole,
    referralCode: '',
    acceptTerms: false,
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  const formatPhone = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    if (!form.acceptTerms) {
      toast.error('Aceite os termos para continuar');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: form.fullName,
          phone: form.phone.replace(/\D/g, ''),
          role: form.role,
        },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Conta criada! Verifique seu e-mail.');
    navigate('/auth/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="font-heading text-2xl font-bold text-foreground">Criar Conta</h1>
          <p className="text-sm text-muted-foreground mt-1">Junte-se à Parada VIP</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome completo</Label>
            <Input placeholder="Seu nome" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input
              placeholder="(00) 00000-0000"
              value={form.phone}
              onChange={(e) => update('phone', formatPhone(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input type="email" placeholder="seu@email.com" value={form.email} onChange={(e) => update('email', e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Senha</Label>
            <div className="relative">
              <Input
                type={showPw ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                required
                minLength={6}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Confirmar senha</Label>
            <Input
              type="password"
              placeholder="Repita a senha"
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Eu sou:</Label>
            <div className="grid grid-cols-2 gap-2">
              {(['influencer', 'driver'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => update('role', r)}
                  className={`rounded-xl border-2 p-3 text-center transition-all ${
                    form.role === r
                      ? r === 'influencer'
                        ? 'border-brand-purple bg-brand-purple/10 text-brand-purple'
                        : 'border-brand-green bg-brand-green/10 text-brand-green'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  <span className="text-xl block mb-1">{r === 'influencer' ? '📢' : '🛵'}</span>
                  <span className="text-xs font-semibold">{r === 'influencer' ? 'Influenciador' : 'Entregador'}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Código de indicação (opcional)</Label>
            <Input placeholder="Ex: ABC123" value={form.referralCode} onChange={(e) => update('referralCode', e.target.value.toUpperCase())} />
          </div>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.acceptTerms}
              onChange={(e) => update('acceptTerms', e.target.checked)}
              className="mt-1 rounded border-border"
            />
            <span className="text-xs text-muted-foreground">
              Aceito os <Link to="#" className="text-brand-purple underline">termos de uso</Link> e{' '}
              <Link to="#" className="text-brand-purple underline">política de privacidade</Link>
            </span>
          </label>

          <Button type="submit" className="w-full bg-brand-purple hover:bg-brand-purple/90 rounded-xl h-12" disabled={loading}>
            {loading ? 'Criando...' : 'Criar minha conta'}
          </Button>
        </form>

        <p className="text-center text-sm mt-4">
          <Link to="/auth/login" className="text-brand-purple hover:underline">Já tenho conta</Link>
        </p>
      </div>
    </div>
  );
}
