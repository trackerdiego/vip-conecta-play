

# Corrigir: Pedidos não chegam ao driver (DONE nunca recebido)

## Problema
O operador no Multipedidos marca os pedidos como APPROVED → SENT, mas o status DONE nunca é enviado via webhook. O código atual só cria delivery para o driver quando `mpStatus === "DONE"`. Como DONE nunca chega, o driver nunca recebe a oferta.

## Solução
Alterar o trigger de dispatch para aceitar **DONE ou SENT** como gatilho para criar a delivery. SENT indica que o pedido foi "enviado" pelo operador, o que na prática significa que está pronto para o motoboy buscar.

### Mudança em `supabase/functions/multipedidos-sync/index.ts`

1. Alterar a condição de dispatch (linha ~408):
```typescript
// Antes:
if (mpStatus === "DONE") {

// Depois:
if (mpStatus === "DONE" || mpStatus === "SENT") {
```

2. Adicionar log para clareza quando disparado por SENT vs DONE.

### Despacho manual imediato dos 3 pedidos pendentes
Após o deploy, usar o dispatch manual para os pedidos que ficaram presos:
- 198356072
- 198356844
- 198357539

### Arquivo modificado
- `supabase/functions/multipedidos-sync/index.ts` — uma linha alterada

