

# Sincronizar Status de Volta ao Multipedidos

## Problema
Quando um entregador aceita/coleta/entrega um pedido no app, o Multipedidos não sabe disso. O operador pode acabar mandando outro entregador para o mesmo pedido.

## Solução

### 1. Adicionar action `update_status` na Edge Function `multipedidos-sync`
- Nova action que autentica na API Multipedidos (usando `MULTIPEDIDOS_INTEGRATION_TOKEN` para obter JWT via `/integration/auth/login`)
- Chama o endpoint de status do Multipedidos para atualizar o pedido
- Mapeamento de status: `accepted` → "Em rota de coleta", `picked_up` → "Saiu para entrega", `delivered` → "Entregue"

### 2. Chamar a Edge Function quando o driver muda o status
- No `useDeliveries.ts`, após cada mudança de status (`acceptDelivery`, `updateDeliveryStatus`), fazer uma chamada fire-and-forget à edge function para notificar o Multipedidos
- Usa o `external_order_id` da delivery para identificar o pedido no Multipedidos

### 3. Mapeamento de status

```text
App Status       →  Multipedidos Status
─────────────────────────────────────────
accepted         →  "dispatched" / "A caminho"
picked_up        →  "collected" / "Saiu para entrega"  
delivered        →  "delivered" / "Entregue"
```

**Nota**: Os nomes exatos dos status no Multipedidos precisam ser confirmados. A estrutura será construída de forma que basta ajustar o mapeamento quando tivermos a documentação exata da API deles. Se a API do Multipedidos não tiver um endpoint de update de status, uma alternativa é usar o webhook de status que eles já enviam — mas nesse caso precisaríamos confirmar se é bidirecional.

## Arquivos modificados
- `supabase/functions/multipedidos-sync/index.ts` — adicionar auth + update status
- `src/hooks/useDeliveries.ts` — chamar edge function após mudança de status

