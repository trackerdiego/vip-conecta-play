

# Correções: Toggle Online e Valor da Entrega

## Problemas Identificados

### 1. Toggle reseta para Offline ao navegar
O `isOnline` no `DriverMap.tsx` é inicializado com `useState(profile?.is_online ?? false)`. Quando o componente remonta (ao voltar da tela de corridas/ganhos), o `profile?.is_online` no store pode estar desatualizado (false), resetando o toggle. O `useDriverLocation` atualiza o banco mas o store local não é re-sincronizado.

**Correção**: Adicionar `useEffect` que sincroniza `isOnline` quando `profile` muda, e garantir que `toggleOnline` também atualize o store local (`setProfile`).

### 2. Valor da entrega (fare) incorreto
Os dados mostram que o `fare` está sendo salvo como o valor total do pedido (`order.total = 10`) em vez do `delivery_fee` (4). O código corrigido usa `order.delivery_fee || order.motoboy_remuneration || 5`, mas a versão deployada provavelmente ainda está com o código antigo. Precisa redesplegar a edge function.

Além disso, a lógica de fallback deve priorizar: `motoboy_remuneration` (se > 0) > `delivery_fee` (se > 0) > fallback 5.

## Mudanças

### DriverMap.tsx
- Adicionar `useEffect` para sincronizar `isOnline` com `profile?.is_online` quando o componente monta
- No `toggleOnline`, atualizar o `profile` no authStore para manter estado consistente

### authStore.ts
- Nenhuma mudança necessária, já tem `setProfile`

### multipedidos-sync (Edge Function)
- Corrigir lógica do fare: `motoboy_remuneration > 0 ? motoboy_remuneration : (delivery_fee > 0 ? delivery_fee : 5)`
- Redesplegar a função

