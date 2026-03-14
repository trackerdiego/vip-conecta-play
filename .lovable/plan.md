

# Bug: Itinerário do Leaflet Routing Machine aparecendo no mapa

## Problema
O screenshot mostra a lista de instruções do Leaflet Routing Machine (o container `.leaflet-routing-container`) sendo renderizada visualmente sobre o mapa. Apesar de `show: false` estar configurado, esse parâmetro nem sempre funciona em todas as versões da lib — o container HTML é criado mesmo assim.

## Solução
Adicionar CSS global para esconder forçadamente o container de itinerário do Leaflet Routing Machine. Isso é uma prática comum e confiável.

### Mudança em `src/index.css`
Adicionar regra CSS:
```css
.leaflet-routing-container {
  display: none !important;
}
```

### Arquivo modificado
- `src/index.css` — 3 linhas adicionadas

