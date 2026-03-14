

# Fix: Rota piscando no mapa

## Problema
Cada atualização de GPS do driver (a cada ~5s) muda `origin`, o que recria o `calcRoute` callback, dispara o useEffect, e após 500ms **remove o controle de rota inteiro e cria um novo**. Durante essa remoção/recriação, a linha desaparece por um instante — causando o piscar.

## Solução
Em vez de destruir e recriar o controle de rota a cada atualização de posição, **atualizar os waypoints do controle existente** usando `setWaypoints()`. Isso mantém a linha visível no mapa e apenas recalcula a rota internamente, sem piscar.

### Mudanças em `src/components/driver/RouteDisplay.tsx`

1. **Reutilizar o controle existente**: Se já existe um `routingRef.current`, chamar `.setWaypoints([newOrigin, newDest])` em vez de `removeControl` + criar novo
2. **Reduzir sensibilidade GPS**: Usar `toFixed(3)` (~110m) em vez de `toFixed(4)` (~11m) para evitar recálculos desnecessários em micro-movimentos
3. **Aumentar debounce**: De 500ms para 2000ms para dar mais estabilidade visual
4. **Recálculo periódico**: Manter o intervalo de 15s mas usando `setWaypoints()` em vez de recriar o controle

### Arquivo modificado
- `src/components/driver/RouteDisplay.tsx`

