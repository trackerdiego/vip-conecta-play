

# Evolução do Dashboard — Funcionalidades do Concorrente

## Análise: O que falta vs. o que o concorrente tem

| Funcionalidade | Temos? | Ação |
|---|---|---|
| Filtro "Pronto" (pedidos prontos para coleta) | Não | Adicionar filtro |
| Níveis de alerta (amarelo/vermelho) | Parcial (só vermelho) | Dois níveis: amarelo >15min, vermelho >30min |
| Horário previsto de entrega + janela de tempo | Não | Calcular ETA baseado em distância |
| Bateria do dispositivo | Não | Placeholder (Traccar free não fornece) |
| Múltiplos pedidos por entregador | Não (só 1) | Suportar array de deliveries |
| Tempo médio de entrega por KM | Não | Calcular de histórico de entregas concluídas |
| Painel expandido do entregador | Não | Ao clicar, expandir card com detalhes completos |
| Botões "Abrir Chamado" / "Falar com Entregador" | Não | Botões placeholder (estrutura para futuro) |
| Escala de trabalho | Não | Indicador placeholder |
| Ordenação por tempo | Não | Ordenar cards por tempo decorrido |
| Rastro de deslocamento no mapa | Não | Polyline via Traccar route report |

## Mudanças por arquivo

### `src/hooks/useAdminOperations.ts`
- Suportar **múltiplas entregas por driver** (array em vez de single)
- Adicionar query de **entregas concluídas** do driver para calcular tempo médio por KM
- Adicionar filtro `"pronto"` (delivery accepted, driver a caminho da loja)
- Calcular **ETA** estimado: `distance_km / velocidade_media * 60` minutos
- Dois níveis de alerta: `warning` (15-30min) e `critical` (>30min)

### `src/components/admin/DeliveryCard.tsx`
- Redesenhar card mais denso com:
  - Header: nome + badge status + ícone bateria (N/D)
  - Distância até loja com barra visual
  - Lista de pedidos que o entregador está levando (múltiplos)
  - ETA previsto + janela de tempo restante
  - Tempo médio por KM (indicador de produtividade)
  - Valor total sendo pago
  - Botões de ação: "Chamado", "Chat", "Escala" (placeholders)
- Dois níveis de alerta visual (borda amarela vs vermelha)
- Card expandível ao clicar para ver detalhes completos

### `src/components/admin/OperationsSidebar.tsx`
- Adicionar filtro `"Pronto"` (pedidos prontos, entregador a caminho)
- Ordenar cards por tempo decorrido (mais antigo primeiro)
- Contador atualizado com novo filtro

### `src/components/admin/OperationsMap.tsx`
- Desenhar **polyline de rastro** quando entregador está em rota (via Traccar `getRouteReport`)
- Mostrar pin do **destino da entrega** conectado ao pin do entregador
- Popup mais rico com info de pedidos e ETA

### `src/pages/admin/Operations.tsx`
- Passar dados de Traccar route para o mapa
- Estado para controlar card expandido vs selecionado

## Nota sobre bateria
O Traccar gratuito e a Browser Geolocation API não fornecem bateria do dispositivo. O campo será exibido como "N/D" com tooltip explicando. Se no futuro integrarmos o app Traccar Client nativo, esse dado ficará disponível.

## Nenhuma alteração de banco necessária
Todas as queries usam tabelas existentes (`deliveries`, `driver_locations`, `profiles`). O cálculo de tempo médio usa entregas com `status = 'delivered'`.

