

# Fix: ActiveDeliverySheet não aparece no mapa

## Problema
O componente `ActiveDeliverySheet` usa o `Drawer` do vaul com snap points, mas o `DrawerContent` do shadcn/ui sempre renderiza um `DrawerOverlay` com `bg-black/80` — mesmo quando `modal={false}`. Isso pode causar problemas de interação e visibilidade. Além disso, a API de snap points do vaul pode não funcionar corretamente com `modal={false}` e `dismissible={false}` combinados, fazendo o drawer não aparecer.

## Solução
Substituir o `Drawer` do vaul por um painel fixo na parte inferior da tela, com suporte a dois estados (minimizado/expandido) via clique no header. Isso é mais confiável para uso sobre o mapa e elimina dependência de snap points do vaul.

### Mudanças em `src/components/driver/ActiveDeliverySheet.tsx`

1. **Remover** o `Drawer`/`DrawerContent` do vaul
2. **Usar** uma `div` fixa no bottom com `z-[1000]`, transição suave de altura
3. **Estado minimizado**: mostra apenas a barra de status (fase, quantidade, valor) — clicável para expandir
4. **Estado expandido**: mostra endereço, botões "Cheguei na Coleta" / "Entrega Concluída" e botão do Google Maps
5. Manter toda a lógica e visual existentes, apenas trocar o container

### Arquivo modificado
- `src/components/driver/ActiveDeliverySheet.tsx`

