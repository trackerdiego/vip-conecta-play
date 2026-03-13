

# Toggle Online/Offline estilo app de mobilidade

## O que muda

Substituir o `DriverStatusPill` (botão pill simples) por um **toggle switch largo** com animação de deslizar, similar ao Uber/99/iFood:

- Fundo cinza escuro quando **Offline**, verde quando **Online**
- Bolinha branca que desliza da esquerda (off) para direita (on) com spring animation via Framer Motion
- Texto "Offline" / "Online" ao lado do toggle
- Feedback tátil (vibração) ao trocar status
- Tamanho generoso (~56px altura) para toque fácil

## Arquivo

| Ação | Arquivo |
|------|---------|
| Reescrever | `src/components/shared/DriverStatusPill.tsx` — transformar em toggle switch animado com Framer Motion |

Mudança em 1 arquivo apenas. A interface (`isOnline` + `onToggle`) permanece a mesma, sem necessidade de alterar `DriverMap.tsx`.

