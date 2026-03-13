

# Fix: Elementos invisíveis no tema claro (Earnings)

## Problema

O app não força tema escuro. Na tela de Ganhos (`/driver/earnings`), o botão "Solicitar PIX" dentro do card roxo usa `variant="outline"` (fundo branco) com `text-primary-foreground` (texto branco) = **texto branco sobre fundo branco**, invisível até o hover.

O design do app (cores escuras, glassmorphism, brand roxo) foi pensado para dark mode, mas o `<html>` não tem a classe `dark`.

## Solução

**Forçar dark mode globalmente** adicionando `class="dark"` no `<html>` do `index.html`. Isso ativa todas as variáveis CSS do bloco `.dark` definidas em `index.css`, resolvendo:

- Botão "Solicitar PIX" (texto branco ficará visível sobre fundo escuro)
- Cards com `bg-card` e `border-border` terão cores escuras corretas
- `text-foreground` e `text-muted-foreground` serão legíveis
- BottomNav e todos os outros componentes ficarão consistentes

## Arquivo

| Ação | Arquivo |
|------|---------|
| Modificar | `index.html` — adicionar `class="dark"` no `<html>` |

Mudança de 1 linha.

