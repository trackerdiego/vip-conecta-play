

# Separar Fluxo: Pedido Entra → Preparação → Despacho para Driver

## Problema Atual
Quando o webhook do Multipedidos envia um pedido, ele é imediatamente criado na tabela `deliveries` com status `pending`, fazendo o driver receber a oferta antes do pedido estar pronto para retirada.

## Solução

### 1. Nova tabela `orders` para pedidos em preparação
Criar uma tabela intermediária que armazena pedidos recebidos do Multipedidos enquanto estão sendo preparados. Só quando o atendimento marcar como "pronto", o pedido vira uma delivery para o driver.

Colunas:
- `id` (uuid, PK)
- `external_order_id` (text, unique) 
- `status` (text: `received`, `preparing`, `ready`, `dispatched`, `canceled`)
- `order_data` (jsonb — payload completo do Multipedidos)
- `order_total` (numeric)
- `referral_code` (text, nullable)
- `created_at`, `updated_at`

RLS: apenas admins podem ver/gerenciar pedidos.

### 2. Alterar webhook para salvar em `orders` em vez de `deliveries`
- Quando o webhook recebe um pedido novo (`CREATED`/`APPROVED`), salvar na tabela `orders` com status `received`
- Quando recebe um webhook de status `DONE` (pronto para retirada pelo motoboy), aí sim criar a delivery na tabela `deliveries` com status `pending`
- Manter a lógica de referral no momento do recebimento do pedido (não precisa esperar o DONE)

### 3. Webhook de status do Multipedidos
O Multipedidos já pode enviar webhooks de mudança de status. Tratar os eventos:
- `CREATED` → salvar em `orders` com status `received`
- `APPROVED` → atualizar `orders` status para `preparing`  
- `DONE` → criar delivery em `deliveries`, atualizar `orders` status para `dispatched`
- `CANCELED` → atualizar `orders` status para `canceled`

### 4. Tela admin para marcar pedido como pronto (fallback manual)
Caso o webhook de status não chegue automaticamente, o atendimento precisa de um botão para marcar pedidos como prontos e despachar para o driver.

- Nova página admin `/admin/orders` com lista de pedidos em preparação
- Botão "Pronto para entrega" que cria a delivery e notifica drivers

## Arquivos modificados
- Migration: criar tabela `orders`
- `supabase/functions/multipedidos-sync/index.ts` — separar lógica webhook vs despacho
- Nova página `src/pages/admin/Orders.tsx` — gestão de pedidos em preparação
- `src/App.tsx` — rota admin para pedidos

