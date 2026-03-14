

# Coleta em Lote — Entregas Múltiplas Simultâneas

## Conceito
O driver pode aceitar múltiplas corridas. O fluxo funciona em duas fases:
1. **Fase de coleta**: navega até cada ponto de coleta e confirma "Cheguei na Coleta" para cada pedido
2. **Fase de entrega**: após coletar todos, entrega um a um na ordem otimizada

O driver continua recebendo ofertas de novas corridas mesmo com entregas ativas (até um limite configurável, ex: 5).

## Mudanças

### 1. `useDeliveries` hook — de singular para plural
- Query `active-delivery` retorna **array** em vez de `.maybeSingle()` → usar `.select('*')` sem limit
- Novo estado `activeDeliveryIndex` para controlar qual entrega está sendo navegada
- Continuar mostrando ofertas de pending deliveries mesmo quando já tem entregas ativas (remover a condição `!activeDelivery`)
- Adicionar lógica para determinar fase atual: se alguma entrega está `accepted` → fase coleta; se todas estão `picked_up` → fase entrega
- Expor `activeDeliveries` (array), `currentDelivery` (a da vez), `nextDelivery()`, `phase` (`collecting` | `delivering`)

### 2. `ActiveDeliverySheet` — lista de entregas com navegação
- Recebe `deliveries: any[]` em vez de `delivery: any`
- Mini-tabs ou chips no topo mostrando cada entrega (ex: "Pedido 1", "Pedido 2") com indicador de status
- Fase coleta: botão "Cheguei na Coleta" para cada entrega individualmente
- Fase entrega: botão "Entrega Concluída" para a entrega atual, depois avança para próxima
- Badge mostrando quantidade de pedidos ativos (ex: "3 pedidos")

### 3. `DriverMap` — múltiplos markers e rota da vez
- Mostrar markers de coleta/entrega para **todas** entregas ativas (não apenas uma)
- Rota exibida apenas para o destino atual (currentDelivery)
- NavigationBar aponta para o destino atual
- Contador de pedidos visível no mapa

### 4. `DeliveryOfferSheet` — continuar recebendo ofertas
- Remover bloqueio que impede ofertas quando já tem entrega ativa
- Manter o mesmo comportamento de countdown e aceitar/recusar

### 5. Sem mudança de schema
A tabela `deliveries` já suporta múltiplas entregas por driver (cada uma com seu `driver_id`). Não precisa de migration.

## Arquivos modificados
- `src/hooks/useDeliveries.ts` — array de entregas, fase, navegação entre entregas
- `src/components/driver/ActiveDeliverySheet.tsx` — UI multi-entrega com tabs/chips
- `src/pages/driver/DriverMap.tsx` — múltiplos markers, rota do destino atual, ofertas sempre visíveis
- `src/components/driver/DeliveryOfferSheet.tsx` — ajustes menores de texto

