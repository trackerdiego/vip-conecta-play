

# Usar `campaign` em vez de `utm_campaign` no link de referral

## Contexto
O dev do Multipedidos confirmou que o parâmetro correto é `campaign` (não `utm_campaign`). O Multipedidos captura esse parâmetro e o inclui no payload do webhook.

## Alterações

### 1. `src/pages/ReferralRedirect.tsx`
Trocar `utm_campaign=${code}` por `campaign=${code}` na URL de redirecionamento.

### 2. `supabase/functions/multipedidos-sync/index.ts`
Adicionar `order.campaign` na função `extractReferralCode()` para capturar o campo que o Multipedidos vai enviar no webhook.

### Arquivos
- `src/pages/ReferralRedirect.tsx` — alterar parâmetro da URL
- `supabase/functions/multipedidos-sync/index.ts` — adicionar `order.campaign` ao extrator

