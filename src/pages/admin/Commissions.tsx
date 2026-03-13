import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

const LEVEL_NAMES: Record<number, string> = {
  1: 'Bronze',
  2: 'Prata',
  3: 'Ouro',
  4: 'Diamante',
};

const LEVEL_XP: Record<number, string> = {
  1: '0–500 XP',
  2: '500–2.000 XP',
  3: '2.000–5.000 XP',
  4: '5.000+ XP',
};

export default function AdminCommissions() {
  const queryClient = useQueryClient();
  const [rates, setRates] = useState<Record<number, number>>({});

  const { data: dbRates = [], isLoading } = useQuery({
    queryKey: ['admin-commission-rates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('commission_rates' as any)
        .select('*')
        .order('level');
      if (error) throw error;
      return data as any[];
    },
  });

  useEffect(() => {
    if (dbRates.length > 0) {
      const map: Record<number, number> = {};
      dbRates.forEach((r: any) => { map[r.level] = r.rate * 100; });
      setRates(map);
    }
  }, [dbRates]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      for (const [level, pct] of Object.entries(rates)) {
        const { error } = await supabase
          .from('commission_rates' as any)
          .update({ rate: pct / 100, updated_at: new Date().toISOString() } as any)
          .eq('level', Number(level));
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-commission-rates'] });
      toast.success('Taxas atualizadas com sucesso!');
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/admin" className="p-2 rounded-lg hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Comissões por Nível</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Taxas de Comissão</CardTitle>
            <p className="text-sm text-muted-foreground">
              Defina a porcentagem de comissão que cada nível de influenciador recebe por venda.
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Carregando...</p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nível</TableHead>
                      <TableHead>Faixa de XP</TableHead>
                      <TableHead className="w-32">Comissão (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[1, 2, 3, 4].map((level) => (
                      <TableRow key={level}>
                        <TableCell className="font-medium">{LEVEL_NAMES[level]}</TableCell>
                        <TableCell className="text-muted-foreground">{LEVEL_XP[level]}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              value={rates[level] ?? 0}
                              onChange={(e) => setRates({ ...rates, [level]: Number(e.target.value) })}
                              className="w-20 h-8 text-center"
                            />
                            <span className="text-sm text-muted-foreground">%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                  className="mt-4 w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
