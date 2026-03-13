

## Plano: Integração com API Multipedidos

### Entendimento do fluxo de autenticação

```text
Token de Integração (fixo, por restaurante)
  → POST /integration/auth/login (header x-integration-token)
    → JWT (expira em 60 min)
      → Usado nas rotas autenticadas (header Authorization: Bearer)
```

### O que vamos construir

1. **Salvar 2 secrets**:
   - `MULTIPEDIDOS_INTEGRATION_TOKEN` — token fixo do restaurante
   - `MULTIPEDIDOS_RESTAURANT_ID` — ID do restaurante na API

2. **Edge function `multipedidos-sync`** com as seguintes ações:
   - **`auth`** — chama `POST /integration/auth/login` com o token de integração, retorna o JWT. Cache interno para não regenerar a cada chamada (reutiliza enquanto válido)
   - **`poll_orders`** — usa o JWT para consultar `GET /restaurant/{id}/order/query/paginate/0/100` com filtro de `createdAt` (últimos 60 min ou desde última sincronização). Para cada pedido novo, cria um registro na tabela `deliveries`
   - **`webhook`** (endpoint público) — alternativa para receber pedidos via webhook do Multipedidos, caso você ative lá

3. **Migração no banco** — adicionar coluna `multipedidos_order_data` (jsonb) na tabela `deliveries` para guardar o payload completo do pedido, e uma policy INSERT para service_role

4. **Lógica de mapeamento** — extrair do payload Multipedidos:
   - `external_order_id` ← `id` do pedido
   - `pickup_address` ← endereço do restaurante (configurável)
   - `delivery_address` ← endereço do cliente (do payload)
   - `fare` ← valor calculado ou fixo por entrega
   - `status` ← `pending` (para oferecer ao entregador)

### Secrets necessários

Precisarei que você forneça:
- O **token de integração** do seu restaurante
- O **ID do restaurante** na plataforma Multipedidos

### Próximos passos após aprovação

1. Solicitar os secrets
2. Criar a edge function com autenticação JWT automática
3. Adicionar coluna jsonb na tabela deliveries
4. Testar a conexão com a API

