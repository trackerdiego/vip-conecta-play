

# Corrigir Dispatch Bloqueado por Delivery Antiga

## Problema
O `dispatchOrder` usa `upsert` com `ignoreDuplicates: true` na tabela `deliveries`. Quando já existe uma delivery antiga (status `delivered`) com o mesmo `external_order_id`, o upsert silenciosamente não cria nada. O driver nunca recebe a oferta.

## Correções em `supabase/functions/multipedidos-sync/index.ts`

### 1. Trigger apenas em DONE (não SENT)
Alterar a condição de dispatch de `mpStatus === "DONE" || mpStatus === "SENT"` para apenas `mpStatus === "DONE"`.

O mapeamento `SENT` no `MP_STATUS_TO_ORDER` continua mapeando para `dispatched` na tabela orders, mas sem criar delivery.

### 2. Corrigir lógica de criação de delivery
Antes do upsert em `deliveries`, verificar se já existe uma delivery com esse `external_order_id`:
- Se existir com status `delivered` ou `canceled`: deletar a antiga e criar nova
- Se existir com status `pending`/`accepted`/`picked_up`: não fazer nada (já está ativa)
- Se não existir: criar normalmente

### Arquivo
- `supabase/functions/multipedidos-sync/index.ts`

