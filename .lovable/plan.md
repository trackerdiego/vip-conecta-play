
# Creditar Ganhos do Driver ao Concluir Entrega

## Problema
Quando o driver marca uma entrega como "delivered", o código apenas atualiza o status na tabela `deliveries`. Nenhum valor é creditado na `wallets` do motorista, nem é registrada uma `transaction`.

## Solução

### 1. Criar função de banco `credit_driver_delivery` (migration)
Função `SECURITY DEFINER` que:
- Recebe `_delivery_id` e `_driver_id`
- Verifica que a entrega pertence ao driver e está em status válido (`accepted` ou `picked_up`)
- Atualiza status para `delivered` e `delivered_at`
- Credita o `fare` na wallet do driver (`balance += fare`, `total_earned += fare`)
- Insere uma `transaction` com tipo `delivery_earning`
- Retorna o valor creditado
- Tudo numa única transação atômica (evita crédito duplo)

### 2. Atualizar `useDeliveries.ts`
Substituir o `updateDeliveryStatus` para quando `status === 'delivered'`, chamar `supabase.rpc('credit_driver_delivery')` em vez de um simples update.

### 3. Creditar retroativamente as 3 entregas já concluídas
Usar o insert tool para creditar R$ 12 (3 × R$ 4) na wallet do driver `bfc66421-...` e criar as transactions correspondentes.

## Arquivos
- Migration: criar função `credit_driver_delivery`
- `src/hooks/useDeliveries.ts` — usar RPC no fluxo de "delivered"
