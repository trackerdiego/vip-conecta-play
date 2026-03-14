

# Navegação Guiada para o Driver (estilo Uber Eats / 99 Food)

## Problemas Atuais
1. **Sem marcador de destino** — o driver não vê para onde ir no mapa
2. **Mapa não acompanha o driver** — `MapCenterUpdater` centraliza mas não rotaciona nem ajusta zoom para mostrar a rota
3. **Sem instruções de navegação** — não há barra de próxima curva/instrução
4. **Sem marcador visual de coleta vs entrega** — não diferencia os pontos
5. **Rota só recalcula a cada 30s** — deveria ser mais responsiva ao movimento

## Plano de Implementação

### 1. Marcadores de Destino no Mapa (`DriverMap.tsx`)
- Adicionar `Marker` para o ponto de coleta (ícone 📍 laranja) e ponto de entrega (ícone 🏠 verde)
- Marcador ativo (destino atual) maior e pulsante
- Quando em fase de coleta: destaque no pickup. Quando em entrega: destaque no delivery.

### 2. Componente `NavigationBar` (novo)
- Barra fixa no topo do mapa (abaixo do status pill) mostrando:
  - Ícone da manobra (virar esquerda, direita, seguir em frente)
  - Nome da rua da próxima instrução
  - Distância até a próxima manobra
- Dados extraídos do `routesfound` event do leaflet-routing-machine (array `instructions` da rota)

### 3. Melhorar `RouteDisplay` 
- Extrair instruções de navegação (turn-by-turn) do OSRM e passá-las via callback
- Calcular qual instrução é a "próxima" com base na posição atual do driver
- Recalcular rota a cada 15s (mais responsivo)
- Adicionar `fitSelectedRoutes: true` com padding para enquadrar driver + destino

### 4. Modo Navegação no Mapa (`MapCenterUpdater` → `NavigationFollower`)
- Quando há entrega ativa: mapa segue o driver com zoom mais fechado (17)
- Mapa se ajusta para manter driver e destino visíveis usando `fitBounds` com padding
- Botão "Recentralizar" caso o driver mova o mapa manualmente

### 5. Ajustes no `ActiveDeliverySheet`
- Compactar o sheet quando em navegação ativa (menos altura, mais espaço para o mapa)
- Manter botões de ação e info de distância/tempo atualizando em tempo real

## Arquivos Modificados
- `src/components/driver/RouteDisplay.tsx` — extrair instructions, fitBounds, recalc 15s
- `src/pages/driver/DriverMap.tsx` — marcadores de destino, NavigationFollower, NavigationBar
- `src/components/driver/ActiveDeliverySheet.tsx` — layout mais compacto
- `src/components/driver/NavigationBar.tsx` — **novo** componente com próxima instrução

## Resultado
O driver verá: rota traçada no mapa, marcadores de coleta/entrega, barra com próxima instrução de navegação, mapa seguindo sua posição, distância e tempo atualizando em tempo real.

