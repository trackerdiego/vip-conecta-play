

## Plano: Adicionar logo + tema claro nas telas de autenticação

### Telas afetadas

1. **Login** (`src/pages/auth/Login.tsx`) — trocar emoji 🍇 pela logo, fundo claro com gradiente suave
2. **Register** (`src/pages/auth/Register.tsx`) — adicionar logo no topo, fundo claro
3. **ForgotPassword** (`src/pages/auth/ForgotPassword.tsx`) — adicionar logo, fundo claro
4. **ResetPassword** (`src/pages/auth/ResetPassword.tsx`) — adicionar logo, fundo claro
5. **SplashScreen** (`src/pages/SplashScreen.tsx`) — trocar emoji pela logo oficial
6. **InstallPWA** (`src/pages/InstallPWA.tsx`) — adicionar logo, tema claro

### O que muda em cada tela

- **Logo**: importar `logo-parada-vip.png` e exibir no topo (~h-20) com `drop-shadow-lg`
- **Fundo claro**: usar `bg-gradient-to-b from-background via-accent/60 to-background` + radial sutil (mesmo padrão da Onboarding)
- **Remover** o ícone emoji 🍇 e o quadrado roxo do Login e SplashScreen
- **Manter** toda a funcionalidade e lógica existente intacta

### Resultado
Todas as telas de autenticação e a splash terão a logo oficial da Parada do Açaí VIP e o tema claro consistente com a tela de Onboarding.

