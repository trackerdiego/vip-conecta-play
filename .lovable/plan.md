

# Usar `?src=CODE` para rastreamento de indicação

## Problema
O Multipedidos não repassa `campaign` nem `utm_campaign`. O campo correto é `?src=CODE` na URL, que chega como `external_source` no payload do webhook.

## Alterações

### 1. `src/pages/ReferralRedirect.tsx`
Trocar o parâmetro da URL de `campaign=${code}` para `src=${code}`.

### 2. `supabase/functions/multipedidos-sync/index.ts`
Na função `extractReferralCode`, priorizar `order.external_source` como primeira opção de extração do código de indicação.

Duas linhas alteradas no total. Após deploy, o próximo pedido via link de indicação deve chegar com `external_source` preenchido.

