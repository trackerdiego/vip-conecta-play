import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link } from 'react-router-dom';
import { ArrowLeft, Package, Truck, Clock, Ban, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type OrderStatus = 'received' | 'preparing' | 'ready' | 'dispatched' | 'canceled';

interface Order {
  id: string;
  external_order_id: string;
  status: string;
  order_data: any;
  order_total: number;
  referral_code: string | null;
  delivery_address: string | null;
  customer_name: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  received: { label: 'Recebido', icon: <Package className="h-4 w-4" />, variant: 'secondary' },
  preparing: { label: 'Preparando', icon: <Clock className="h-4 w-4" />, variant: 'default' },
  ready: { label: 'Pronto', icon: <CheckCircle2 className="h-4 w-4" />, variant: 'outline' },
  dispatched: { label: 'Despachado', icon: <Truck className="h-4 w-4" />, variant: 'secondary' },
  canceled: { label: 'Cancelado', icon: <Ban className="h-4 w-4" />, variant: 'destructive' },
};

export default function AdminOrders() {
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .in('status', ['received', 'preparing', 'ready'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
    refetchInterval: 10000,
  });

  const dispatchMutation = useMutation({
    mutationFn: async (externalOrderId: string) => {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/multipedidos-sync?action=dispatch`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ external_order_id: externalOrderId }),
        },
      );

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Falha ao despachar pedido');
      }

      return res.json();
    },
    onSuccess: (data, externalOrderId) => {
      if (data.dispatched) {
        toast.success(`Pedido ${externalOrderId} despachado para entregadores!`);
      } else {
        toast.info('Pedido já foi despachado anteriormente.');
      }
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (err: Error) => {
      toast.error(`Erro: ${err.message}`);
    },
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatTime = (date: string) =>
    formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pedidos em Preparação</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie pedidos recebidos e despache para entregadores quando prontos
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(['received', 'preparing', 'ready', 'dispatched'] as OrderStatus[]).map((status) => {
          const config = STATUS_CONFIG[status];
          const count = orders?.filter((o) => o.status === status).length ?? 0;
          return (
            <Card key={status}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="text-muted-foreground">{config.icon}</div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{count}</p>
                  <p className="text-xs text-muted-foreground">{config.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pedidos Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !orders?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum pedido em preparação no momento</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Recebido</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const config = STATUS_CONFIG[order.status as OrderStatus] || STATUS_CONFIG.received;
                    const canDispatch = ['received', 'preparing', 'ready'].includes(order.status);

                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm font-medium">
                          #{order.external_order_id}
                        </TableCell>
                        <TableCell>{order.customer_name || '—'}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                          {order.delivery_address || '—'}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(order.order_total)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={config.variant} className="gap-1">
                            {config.icon}
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatTime(order.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          {canDispatch && (
                            <Button
                              size="sm"
                              onClick={() => dispatchMutation.mutate(order.external_order_id)}
                              disabled={dispatchMutation.isPending}
                            >
                              <Truck className="h-4 w-4 mr-1" />
                              Despachar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
