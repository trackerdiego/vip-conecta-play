import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BottomNav } from '@/components/shared/BottomNav';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function DriverPersonalData() {
  const navigate = useNavigate();
  const { user, profile, setProfile } = useAuthStore();
  const [name, setName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('O nome não pode ficar vazio');
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: trimmedName, phone: phone.trim() || null })
      .eq('id', user.id);

    if (error) {
      toast.error('Erro ao salvar dados');
    } else {
      setProfile({ ...profile!, full_name: trimmedName, phone: phone.trim() || null });
      toast.success('Dados atualizados com sucesso!');
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-heading text-2xl font-bold text-foreground">Dados Pessoais</h1>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" value={user?.email ?? ''} disabled className="opacity-60" />
            <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" maxLength={20} />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl mt-4">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>
      </div>
      <BottomNav variant="driver" />
    </div>
  );
}
