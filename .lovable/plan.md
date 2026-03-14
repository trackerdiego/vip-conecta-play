

# Marcadores numerados com círculos pulsantes

## O que muda
Substituir os emojis 📍 e 🏠 por círculos coloridos numerados no mapa. Cada entrega ativa terá seu número (1, 2, 3...) visível no marcador. O marcador da entrega selecionada pulsa e fica maior; os demais ficam menores e sem animação.

## Design visual

```text
  Inativo (não selecionado)         Ativo (selecionado)
  ┌─────────────────────┐      ┌─────────────────────────┐
  │   ╭───╮              │      │   ╭─────╮  ← pulsante   │
  │   │ 2 │  28px        │      │   │  1  │  36px          │
  │   ╰───╯  opacity 0.7 │      │   ╰─────╯  glow + pulse  │
  └─────────────────────┘      └─────────────────────────┘

  Coleta: laranja (#f97316)    Entrega: verde (#22c55e)
```

## Mudanças em `src/pages/driver/DriverMap.tsx`

1. **Remover** os 4 ícones estáticos (`pickupIcon`, `deliveryIcon`, `pickupIconActive`, `deliveryIconActive`)
2. **Criar função** `createNumberedIcon(num, color, isActive)` que retorna um `L.divIcon` com:
   - Círculo com cor de fundo (laranja para coleta, verde para entrega)
   - Número centralizado em branco e bold
   - Se ativo: tamanho 36px, box-shadow com glow, animação `pulse 2s infinite`
   - Se inativo: tamanho 28px, opacidade 0.7, sem animação
3. **No loop de markers** (`activeDeliveries.map`): usar `createNumberedIcon(i + 1, ...)` passando o índice como número e `isCurrent` para o estado ativo
4. **Adicionar CSS** em `src/index.css` para a animação `@keyframes marker-pulse` (scale + glow)

### Arquivo modificado
- `src/pages/driver/DriverMap.tsx` — ícones numerados dinâmicos
- `src/index.css` — keyframes para pulse dos marcadores

