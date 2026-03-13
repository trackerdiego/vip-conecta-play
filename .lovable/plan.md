

## Entendi a frustração

Você tem razão — o Capgo e os comandos nativos estão tomando tempo sem resultado. A melhor solução para testar rápido no celular (Android e iOS) é transformar seu app em **PWA instalável**. Funciona direto pelo navegador, sem precisar de Xcode, Android Studio, ou qualquer `npx cap sync`.

## O que já existe

- `manifest.json` com configuração básica (falta ícones em tamanhos corretos)
- `index.html` já referencia o manifest
- **Não tem** service worker nem `vite-plugin-pwa`

## O que vou fazer

### 1. Instalar `vite-plugin-pwa` e configurar em `vite.config.ts`
- Adicionar o plugin com service worker automático (Workbox)
- Configurar `navigateFallbackDenylist` para `/~oauth`
- Incluir manifest inline com ícones PWA corretos

### 2. Atualizar `manifest.json` com ícones em tamanhos padrão
- 192x192 e 512x512 (gerados a partir do favicon existente ou usando placeholders)

### 3. Adicionar meta tags PWA no `index.html`
- `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style` para iOS

### 4. Criar página `/install` com instruções de instalação
- Detecta se já está instalado
- Mostra botão de instalar (Android) ou instruções "Compartilhar > Adicionar à Tela Inicial" (iOS)

### 5. Limpar código Capacitor desnecessário
- Remover `@capacitor/core` e `@capacitor/cli` do `package.json`
- Remover `capacitor.config.ts`
- Remover hooks nativos (`useCapgoUpdater`, `useBackgroundGeolocation`, `usePushNotifications`)
- Simplificar `useNativeGeolocation` para usar apenas a API do browser
- Remover externals do Capacitor em `vite.config.ts`
- Remover `AppInitializer` do `App.tsx`

## Resultado

Seu app vai funcionar como app instalável em **qualquer celular** — Android ou iPhone — direto pelo link publicado, sem app store, sem build nativo. Basta acessar o link e instalar.

