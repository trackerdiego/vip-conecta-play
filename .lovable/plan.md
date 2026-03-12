

# Fase 2: Dados Reais + Proteção de Rotas

## Escopo

Substituir todos os dados mock por queries reais ao banco de dados e adicionar proteção de rotas por role (influencer/driver).

---

## 1. Componente ProtectedRoute

Criar `src/components/shared/ProtectedRoute.tsx` que:
- Lê `user`, `role`, `loading` do authStore
- Se `loading`: mostra skeleton/spinner
- Se `!user`: redireciona para `/auth/login`
- Se `requiredRole` definido e `role !== requiredRole`: redireciona para a dashboard correta do role
- Caso contrário: renderiza `<Outlet />`

Atualizar `App.tsx` para envolver rotas `/influencer/*` com `<ProtectedRoute requiredRole="influencer">` e `/driver/*` com `<ProtectedRoute requiredRole="driver">`.

## 2. Hooks de dados reais (React Query)

Criar `src/hooks/useWallet.ts`:
- Query `wallets` onde `user_id = auth.uid()` usando `.maybeSingle()`
- Retorna `{ balance, totalEarned, totalWithdrawn, loading }`

Criar `src/hooks/useMissions.ts`:
- Query `missions` (ativas) com LEFT JOIN em `user_missions` para o user logado
- Combina mission + user_missions.progress para montar o objeto de missão
- Função `claimMission(missionId)` que atualiza `user_missions.claimed_at`

Criar `src/hooks/useWithdrawals.ts`:
- Query `withdrawal_requests` do user logado, ordenado por `created_at desc`
- Mutation `createWithdrawal({ amount, pixKey })` que insere em `withdrawal_requests`

Criar `src/hooks/useDeliveries.ts`:
- Query `deliveries` pendentes (para ofertas) e atribuídas ao driver
- Realtime subscription para novas deliveries pendentes
- Mutations: `acceptDelivery`, `updateDeliveryStatus`

Criar `src/hooks/useDriverLocation.ts`:
- Upsert `driver_locations` com posição GPS a cada 10s quando online
- Toggle `profiles.is_online`

Criar `src/hooks/useReferralStats.ts`:
- Query `profiles` onde `referred_by = user.id` para contar indicações

## 3. Atualizar páginas

**Influencer Dashboard**: Substituir `mockInfluencer` por dados do `authStore.profile` + `useWallet` + `useMissions` + `useReferralStats`. Manter fallback de skeleton enquanto carrega.

**Influencer Missions**: Usar `useMissions` em vez de `mockMissions`. Implementar `claimMission` real.

**Influencer Withdraw**: Usar `useWallet` para saldo real. Usar `useWithdrawals` para criar saque e listar histórico.

**Influencer Rewards**: Manter mock por enquanto (prizes não tem tabela dedicada ainda -- usa missions com reward_type='prize').

**Driver Map**: Usar `useDeliveries` para ouvir corridas reais via Realtime. Usar `useDriverLocation` para enviar posição GPS. Toggle online/offline atualiza `profiles.is_online`.

**Driver Earnings**: Usar `useWallet` + query de deliveries concluídas para stats reais.

## 4. Nomes de nível por XP

Criar helper `getLevelInfo(level, xp)` que retorna `{ levelName, xpMax }` baseado em thresholds:
- Level 1: Bronze (0-500 XP)
- Level 2: Prata (500-2000 XP)
- Level 3: Ouro (2000-5000 XP)
- Level 4: Diamante (5000+ XP)

## 5. Login redirect inteligente

Após login bem-sucedido, redirecionar para `/influencer/dashboard` ou `/driver/map` baseado no role do user (em vez de `/`).

## Arquivos a criar/modificar

| Ação | Arquivo |
|------|---------|
| Criar | `src/components/shared/ProtectedRoute.tsx` |
| Criar | `src/hooks/useWallet.ts` |
| Criar | `src/hooks/useMissions.ts` |
| Criar | `src/hooks/useWithdrawals.ts` |
| Criar | `src/hooks/useDeliveries.ts` |
| Criar | `src/hooks/useDriverLocation.ts` |
| Criar | `src/hooks/useReferralStats.ts` |
| Criar | `src/lib/levels.ts` |
| Modificar | `src/App.tsx` (rotas protegidas) |
| Modificar | `src/pages/influencer/Dashboard.tsx` |
| Modificar | `src/pages/influencer/Missions.tsx` |
| Modificar | `src/pages/influencer/Withdraw.tsx` |
| Modificar | `src/pages/driver/DriverMap.tsx` |
| Modificar | `src/pages/driver/Earnings.tsx` |
| Modificar | `src/pages/auth/Login.tsx` (redirect por role) |
| Modificar | `src/stores/authStore.ts` (adicionar wallet ao profile fetch) |

