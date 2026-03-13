

# Corrigir build — imports Capacitor condicionais

## Problema
Os hooks `useNativeGeolocation.ts` e `usePushNotifications.ts` importam diretamente `@capacitor/geolocation` e `@capacitor/push-notifications`. Esses pacotes não estão instalados no ambiente Lovable (apenas `@capacitor/core`, `@capacitor/cli` e `@capacitor/haptics` estão no package.json), causando falha no build.

## Solução
Usar **imports dinâmicos** (`import()`) com try/catch para esses plugins, assim como já é feito no `useBackgroundGeolocation.ts`. Quando o plugin não está disponível, usar fallback do browser.

## Arquivos a modificar

### 1. `src/hooks/useNativeGeolocation.ts`
- Remover `import { Geolocation } from '@capacitor/geolocation'` (import estático)
- Usar `import('@capacitor/geolocation')` dinâmico dentro das funções, com try/catch
- Fallback para `navigator.geolocation` se o import falhar

### 2. `src/hooks/usePushNotifications.ts`
- Remover `import { PushNotifications } from '@capacitor/push-notifications'` (import estático)
- Usar `import('@capacitor/push-notifications')` dinâmico dentro do setup, com try/catch
- Se não disponível, simplesmente não registrar push

### 3. Remover `@capacitor/geolocation` e `@capacitor/push-notifications` do `package.json`
- Esses pacotes devem ser instalados apenas localmente pelo usuário após exportar para GitHub
- Manter apenas `@capacitor/core`, `@capacitor/cli`, `@capacitor/haptics`

## Resultado
- Build funciona no Lovable (web preview)
- Quando compilado nativamente com Capacitor, os plugins funcionam normalmente
- PWA continua funcionando como fallback

