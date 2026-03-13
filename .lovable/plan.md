

# App Nativo com Capacitor — Rastreamento em Background

## Problema atual
O rastreamento GPS funciona apenas com o browser aberto. Ao minimizar ou bloquear tela, `navigator.geolocation.watchPosition` para. Motoboys precisariam instalar o Traccar Client separado.

## Solução
Empacotar o app atual com **Capacitor** para publicar nas lojas. Um único app para motoboys e influencers. O rastreamento GPS roda em background via plugin nativo — substituindo a necessidade do Traccar Client.

## Arquitetura

```text
┌─────────────────────────────┐
│   Seu App (Capacitor)       │
│  ┌───────────┬────────────┐ │
│  │ Motoboy   │ Influencer │ │
│  │ (driver)  │ (referral) │ │
│  └─────┬─────┴────────────┘ │
│        │ Background GPS     │
│        ▼                    │
│  useDriverLocation.ts       │
│        │                    │
│        ▼                    │
│  traccar-proxy (edge fn)    │
│        │                    │
│        ▼                    │
│  Servidor Traccar           │
└─────────────────────────────┘
```

## Arquivos

| Ação | Arquivo | Descrição |
|------|---------|-----------|
| Criar | `capacitor.config.ts` | Configuração Capacitor com appId e server URL |
| Criar | `src/hooks/useNativeGeolocation.ts` | Wrapper que usa `@capacitor/geolocation` quando nativo, fallback para browser |
| Criar | `src/hooks/useBackgroundGeolocation.ts` | Background tracking nativo para motoboys (tela bloqueada) |
| Modificar | `src/hooks/useDriverLocation.ts` | Usar hook nativo ao invés de `navigator.geolocation` |
| Criar | `src/hooks/usePushNotifications.ts` | Push nativo para corridas novas |
| Modificar | `package.json` | Adicionar deps: `@capacitor/core`, `@capacitor/cli`, `@capacitor/geolocation`, `@capacitor/push-notifications`, `@capacitor/haptics`, `@capacitor-community/background-geolocation` |

## Após implementação — passos do usuário

1. Exportar projeto para GitHub via botão "Export to Github"
2. `git pull` → `npm install`
3. `npx cap add android` e/ou `npx cap add ios`
4. `npx cap update android` / `npx cap update ios`
5. `npm run build` → `npx cap sync`
6. `npx cap run android` ou `npx cap run ios`

Para publicar nas lojas: gerar build de release no Android Studio / Xcode.

Referência completa: [Blog post Lovable sobre Capacitor](https://lovable.dev/blog/mobile-app-with-lovable-and-capacitor)

