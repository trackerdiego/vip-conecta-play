

# Corrigir URL do cardápio e lógica do webhook

Dois problemas identificados:

## 1. URL do cardápio errada
O redirect atual aponta para `pedir.delivery/paradadoacai`, mas o correto é `pedir.delivery/app/apresentacaopizzas/menu`.

**Arquivo:** `src/pages/ReferralRedirect.tsx`
- Trocar `MENU_URL` para `https://pedir.delivery/app/apresentacaopizzas/menu`

## 2. Lógica do webhook invertida
Hoje o webhook recebe TODOS os pedidos e tenta adivinhar qual influenciador indicou. Isso não faz sentido — o Multipedidos só dispara o webhook para vendas feitas via link de divulgação, então **todo pedido que chega pelo webhook já é uma venda de referral**.

**Arquivo:** `supabase/functions/multipedidos-sync/index.ts`
- O webhook deve extrair o código de referral do pedido (UTM/metadata) e **sempre** creditar a comissão
- Adicionar log detalhado do payload recebido para debug (crucial no ambiente de testes)
- Manter a criação do delivery para o entregador
- O polling continua útil para pedidos gerais (entregas), mas separado da lógica de referral

### Detalhes técnicos
- No webhook, logar o body completo (`console.log("webhook payload:", JSON.stringify(body))`) para entender a estrutura exata que o Multipedidos envia
- Se o refCode não vier no payload, logar aviso mas ainda processar o delivery
- Atualizar `StoryCreator.tsx` para usar a nova URL do cardápio também

