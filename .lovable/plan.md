

# Corrigir Endpoint e Status do Multipedidos

## Problema
O endpoint e os status usados estão incorretos. A documentação oficial mostra:
- Endpoint: `POST /restaurant/{restaurantId}/order/{orderId}/status`
- Status válidos: `APPROVED`, `SENT`, `DONE`, `OVER`, `CANCELED`

## Alterações

### 1. Edge Function `supabase/functions/multipedidos-sync/index.ts`

**Corrigir `STATUS_MAP`:**
```text
App Status    →  Multipedidos
──────────────────────────────
accepted      →  "APPROVED"    (pedido aceito pelo entregador = aprovado)
picked_up     →  "SENT"        (saiu para entrega)
delivered     →  "OVER"        (pedido finalizado)
```

**Corrigir endpoint:**
- De: `PUT ${MULTIPEDIDOS_API}/orders/${orderId}/status`
- Para: `POST https://api.multipedidos.com.br/restaurant/${RESTAURANT_ID}/order/${orderId}/status`
- Usar o secret `MULTIPEDIDOS_RESTAURANT_ID` (já configurado) para compor a URL

**Corrigir API base URL:**
- O endpoint de status não usa `/v2`, é direto em `api.multipedidos.com.br/restaurant/...`

### Arquivos modificados
- `supabase/functions/multipedidos-sync/index.ts` — corrigir STATUS_MAP, endpoint URL e método HTTP

