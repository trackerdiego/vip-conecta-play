

# Central de Operações — Dashboard Admin em Tempo Real

## Contexto

O endereço fixo da loja "Parada do Açaí Caucaia" é **Rua 100, nº 202, Planalto Caucaia** (coordenadas já conhecidas: `-3.7373, -38.6531`). O pedido é mostrar no dashboard admin a **distância em tempo real** de cada motoboy até a loja, indicando se ele está se aproximando para coletar, junto com toda a interface de central de operações já planejada anteriormente.

## O que será construído

Uma nova página `/admin/operations` com layout split-screen (sidebar + mapa) que funciona como torre de controle logística.

### Arquivos novos:
- **`src/pages/admin/Operations.tsx`** — Layout principal: sidebar 35% + mapa 65%, altura total da viewport
- **`src/components/admin/OperationsSidebar.tsx`** — Filtros de status + lista de cards dos entregadores/entregas
- **`src/components/admin/OperationsMap.tsx`** — Mapa Leaflet com pins dos motoboys online e destinos
- **`src/components/admin/DeliveryCard.tsx`** — Card compacto por entregador/entrega
- **`src/hooks/useAdminOperations.ts`** — Hook que combina dados de `driver_locations`, `deliveries`, `profiles` com Supabase Realtime

### Arquivos modificados:
- **`src/App.tsx`** — Adicionar rota `/admin/operations`
- **`src/pages/admin/Overview.tsx`** — Adicionar link/card "Central de Operações"

## Funcionalidades principais

### 1. Distância em tempo real até a loja
- Coordenadas fixas da loja: `-3.7373, -38.6531`
- Para cada motoboy online, calcular a distância Haversine entre sua posição atual (da tabela `driver_locations`) e a loja
- Exibir no card: "**1.2 km da loja**" com indicador visual (verde <1km, amarelo 1-3km, vermelho >3km)
- Atualizar automaticamente via Realtime subscription em `driver_locations`

### 2. Sidebar com cards de entregadores
- Filtros: "Todos", "Online", "Em Rota", "Alerta"
- Cada card mostra:
  - Nome do motoboy, status badge (cores semafóricas)
  - Distância até a loja em tempo real
  - Se tem entrega ativa: ID do pedido, endereço destino, valor (fare)
  - Tempo desde aceitação da entrega
  - Botão "Ver no mapa" → fly-to na posição

### 3. Mapa interativo
- Pin fixo 🏪 da loja na posição `-3.7373, -38.6531`
- Pins 🛵 para cada motoboy com `is_online=true` (dados de `driver_locations`)
- Pins coloridos dos destinos de entregas ativas
- Fly-to ao clicar em card na sidebar
- Tiles do LocationIQ (reutilizando `useMapStyle`)

### 4. Atualização em tempo real (sem refresh)
- Realtime subscription em `driver_locations` → atualiza pins e distâncias automaticamente
- Realtime subscription em `deliveries` → atualiza status dos cards
- Fallback: refetch a cada 15s

## Dados utilizados (já existem)
- `driver_locations` (lat, lng, heading, driver_id) — admin já tem RLS de leitura
- `profiles` (full_name, is_online) — leitura para authenticated
- `deliveries` (status, pickup/delivery addresses, fare, driver_id) — filtrar por status ativo
- Traccar `getPositions()` para dados adicionais de velocidade quando disponível

## Cálculo de distância
Função Haversine pura no frontend (sem API calls):
```
distance_km = haversine(driver_lat, driver_lng, STORE_LAT, STORE_LNG)
```
Constantes da loja definidas no hook: `STORE_LAT = -3.7373`, `STORE_LNG = -38.6531`, `STORE_ADDRESS = "Rua 100, 202 - Planalto Caucaia"`

## Nenhuma alteração de banco necessária
Todas as tabelas e RLS policies já existem e suportam as queries necessárias para o admin.

