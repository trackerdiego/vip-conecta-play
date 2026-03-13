

## Plano: Melhorar visual da tela de Onboarding

### O que muda

1. **Copiar a logo** (`imgi_3_itiRNKefTPq-r5sXR_E7Aw@2k.png`) para `src/assets/logo-parada-vip.png`

2. **Adicionar background decorativo** com gradiente radial sutil (tons roxo/açaí) e formas abstratas via CSS, sem precisar de imagem externa — combina com o tema dark/purple do app

3. **Redesenhar `Onboarding.tsx`**:
   - Exibir a logo no topo (tamanho ~120px, com animação fade-in)
   - Background com gradiente radial decorativo (roxo escuro → açaí) + partículas existentes
   - Manter os dois cards (Influenciador/Entregador) com o visual atual
   - Adicionar um leve overlay com padrão radial para dar profundidade
   - Manter o link "Já tem conta? Entrar"

### Resultado visual
- Logo centralizada acima do título
- Fundo mais rico com gradientes radiais em tons de açaí/roxo
- Mesma estrutura de cards, mais polido e com identidade da marca

