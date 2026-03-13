

## Plano: Redesign da tela de Onboarding (tema claro + imagens como botões)

### Mudanças

1. **Copiar as duas imagens** para `src/assets/`:
   - Influenciadora → `src/assets/img-influencer.png`
   - Entregador → `src/assets/img-driver.png`

2. **Redesenhar `Onboarding.tsx`** com tema claro:
   - Fundo branco/claro com gradiente suave em tons de roxo/lilás
   - Logo no topo centralizada
   - Título "Escolha seu perfil"
   - Dois botões-imagem (as ilustrações) com bordas arredondadas, sombra suave, e label embaixo de cada um
   - Remover os cards grandes verde/roxo
   - Manter link "Já tem conta? Entrar"
   - Manter animações Framer Motion

3. **Estilo dos botões-imagem**: cada ilustração ocupa ~45% da largura, com `rounded-2xl`, sombra, e texto descritivo abaixo. Ao clicar, navega para o registro com a role correspondente.

