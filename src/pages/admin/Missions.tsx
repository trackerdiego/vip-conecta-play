import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, ArrowLeft, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MissionForm {
  title: string;
  description: string;
  icon: string;
  type: string;
  target_value: number;
  reward_type: string;
  reward_value: number;
  reward_description: string;
  is_active: boolean;
}

const emptyForm: MissionForm = {
  title: '', description: '', icon: '🎯', type: 'referral',
  target_value: 1, reward_type: 'cash', reward_value: 5,
  reward_description: '', is_active: true,
};

export default function AdminMissions() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<MissionForm>(emptyForm);

  const { data: missions = [], isLoading } = useQuery({
    queryKey: ['admin-missions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('missions').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editId) {
        const { error } = await supabase.from('missions').update(form).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('missions').insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-missions'] });
      toast.success(editId ? 'Missão atualizada!' : 'Missão criada!');
      setOpen(false);
      setEditId(null);
      setForm(emptyForm);
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from('missions').update({ is_active: active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-missions'] }),
  });

  const openEdit = (m: any) => {
    setEditId(m.id);
    setForm({
      title: m.title, description: m.description ?? '', icon: m.icon ?? '🎯',
      type: m.type, target_value: m.target_value, reward_type: m.reward_type ?? 'cash',
      reward_value: m.reward_value ?? 0, reward_description: m.reward_description ?? '',
      is_active: m.is_active ?? true,
    });
    setOpen(true);
  };

  const openNew = () => { setEditId(null); setForm(emptyForm); setOpen(true); };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/admin" className="p-2 rounded-lg hover:bg-muted"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="text-2xl font-bold">Gerenciar Missões</h1>
        </div>

        <div className="flex justify-end mb-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Nova Missão</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editId ? 'Editar Missão' : 'Nova Missão'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div><Label>Ícone (emoji)</Label><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></div>
                <div><Label>Título</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div><Label>Descrição</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Tipo</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                      <option value="referral">Indicação</option>
                      <option value="share">Compartilhamento</option>
                      <option value="daily">Diária</option>
                    </select>
                  </div>
                  <div><Label>Meta</Label><Input type="number" value={form.target_value} onChange={(e) => setForm({ ...form, target_value: Number(e.target.value) })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Tipo Recompensa</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.reward_type} onChange={(e) => setForm({ ...form, reward_type: e.target.value })}>
                      <option value="cash">Dinheiro</option>
                      <option value="xp">XP</option>
                      <option value="coupon">Cupom</option>
                    </select>
                  </div>
                  <div><Label>Valor Recompensa</Label><Input type="number" value={form.reward_value} onChange={(e) => setForm({ ...form, reward_value: Number(e.target.value) })} /></div>
                </div>
                <div><Label>Descrição da Recompensa</Label><Input value={form.reward_description} placeholder="Ex: R$ 5,00 ou 100 XP" onChange={(e) => setForm({ ...form, reward_description: e.target.value })} /></div>
                <Button onClick={() => saveMutation.mutate()} disabled={!form.title || saveMutation.isPending} className="w-full">
                  {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Missão</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Meta</TableHead>
                  <TableHead>Recompensa</TableHead>
                  <TableHead>Ativa</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>}
                {!isLoading && missions.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhuma missão cadastrada</TableCell></TableRow>}
                {missions.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.icon} {m.title}</TableCell>
                    <TableCell>{m.type}</TableCell>
                    <TableCell>{m.target_value}</TableCell>
                    <TableCell>{m.reward_description || (m.reward_type === 'cash' ? `R$ ${(m.reward_value ?? 0).toFixed(2)}` : `${m.reward_value} XP`)}</TableCell>
                    <TableCell>
                      <Switch checked={m.is_active ?? true} onCheckedChange={(v) => toggleActive.mutate({ id: m.id, active: v })} />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(m)}><Pencil className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
