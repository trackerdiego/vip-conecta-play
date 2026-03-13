import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, ArrowLeft, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PrizeForm {
  name: string;
  emoji: string;
  category: string;
  description: string;
  target: number;
  is_active: boolean;
}

const emptyForm: PrizeForm = {
  name: '', emoji: '🎁', category: 'coupons', description: '', target: 10, is_active: true,
};

export default function AdminPrizes() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<PrizeForm>(emptyForm);

  const { data: prizes = [], isLoading } = useQuery({
    queryKey: ['admin-prizes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('prizes').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editId) {
        const { error } = await supabase.from('prizes').update(form).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('prizes').insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-prizes'] });
      toast.success(editId ? 'Prêmio atualizado!' : 'Prêmio criado!');
      setOpen(false);
      setEditId(null);
      setForm(emptyForm);
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from('prizes').update({ is_active: active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-prizes'] }),
  });

  const openEdit = (p: any) => {
    setEditId(p.id);
    setForm({ name: p.name, emoji: p.emoji, category: p.category, description: p.description ?? '', target: p.target, is_active: p.is_active });
    setOpen(true);
  };

  const openNew = () => { setEditId(null); setForm(emptyForm); setOpen(true); };

  const categoryLabel: Record<string, string> = { excursions: 'Excursões', coupons: 'Cupons', cashback: 'Cashback' };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/admin" className="p-2 rounded-lg hover:bg-muted"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="text-2xl font-bold">Gerenciar Prêmios</h1>
        </div>

        <div className="flex justify-end mb-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Novo Prêmio</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editId ? 'Editar Prêmio' : 'Novo Prêmio'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div><Label>Emoji</Label><Input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} /></div>
                <div><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Descrição</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Categoria</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      <option value="excursions">Excursões</option>
                      <option value="coupons">Cupons</option>
                      <option value="cashback">Cashback</option>
                    </select>
                  </div>
                  <div><Label>Meta (indicações)</Label><Input type="number" value={form.target} onChange={(e) => setForm({ ...form, target: Number(e.target.value) })} /></div>
                </div>
                <Button onClick={() => saveMutation.mutate()} disabled={!form.name || saveMutation.isPending} className="w-full">
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
                  <TableHead>Prêmio</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Meta</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>}
                {!isLoading && prizes.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum prêmio cadastrado</TableCell></TableRow>}
                {prizes.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.emoji} {p.name}</TableCell>
                    <TableCell>{categoryLabel[p.category] ?? p.category}</TableCell>
                    <TableCell>{p.target} indicações</TableCell>
                    <TableCell>
                      <Switch checked={p.is_active} onCheckedChange={(v) => toggleActive.mutate({ id: p.id, active: v })} />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
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
