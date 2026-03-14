

# Correção: Toggle Online reseta ao bloquear/desbloquear tela

## Problema
No `DriverMap.tsx`, existe um `useEffect` que sincroniza `isOnline` a partir de `profile?.is_online`. Quando a tela bloqueia e desbloqueia, o Supabase Auth re-emite o evento `TOKEN_REFRESHED`, que dispara `fetchProfile()`, que lê `is_online` do banco. Se o DB update ainda não completou ou houve delay, o valor volta como `false`, resetando o toggle.

## Correção
1. **Remover o `useEffect` de sync** que sobrescreve `isOnline` com o valor do profile
2. **Inicializar `isOnline`** a partir do `authStore` apenas uma vez (no `useState`)
3. **Garantir que o DB update em `useDriverLocation` use `await`** para confirmar a persistência

## Arquivos
- `src/pages/driver/DriverMap.tsx` — remover useEffect de sync
- `src/hooks/useDriverLocation.ts` — adicionar await no update do profile

## Status do Webhook
O webhook da Multipedidos **está funcionando corretamente**. Existe 1 entrega pendente no banco (pedido 198354385, fare R$4,00). Para testar, basta logar com a conta do driver (`mentecomp`) e ficar online.

