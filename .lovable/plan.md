

# Navegação Integrada no Mapa do Motoboy

## Situação Atual
O botão "Navegar" abre o Google Maps externamente. O Traccar é usado apenas para rastreamento (registrar posições), não para navegação.

## Proposta
Mostrar a rota diretamente no mapa Leaflet do app usando **Leaflet Routing Machine + OSRM** (gratuito, sem API key). O motoboy vê a linha da rota no próprio mapa sem sair do app. O botão externo (Google Maps/Waze) fica como opção secundária.

## O que será feito

### 1. Instalar `leaflet-routing-machine`
Adicionar a dependência para cálculo e exibição de rotas no mapa Leaflet.

### 2. Criar componente `RouteDisplay`
Componente que recebe posição atual e destino (coleta ou entrega), desenha a rota no mapa com distância e tempo estimado.

### 3. Atualizar `DriverMap.tsx`
Quando há entrega ativa, renderizar `RouteDisplay` com:
- Origem: posição GPS atual do motoboy
- Destino: endereço de coleta (status `accepted`) ou entrega (status `picked_up`)
- Atualizar rota quando posição muda (com debounce para não sobrecarregar)

### 4. Atualizar `ActiveDeliverySheet.tsx`
- Mostrar distância e tempo estimado vindos do routing
- Manter botão externo (Google Maps) como ícone secundário para quem preferir navegação turn-by-turn com voz

### Detalhes Técnicos

```text
Motoboy online → Aceita corrida
  → RouteDisplay calcula rota (OSRM gratuito)
  → Linha azul no mapa + distância/tempo
  → Status muda para picked_up → rota recalcula para destino final
  → Botão Google Maps/Waze disponível como alternativa
```

- OSRM demo server: `https://router.project-osrm.org/route/v1/driving/`
- Rota recalculada a cada 30s ou mudança significativa de posição
- Sem custo de API, sem chave necessária

