

# Contextualização Completa do Módulo Motoboy (Driver)

O objetivo aqui é gerar um documento/guia completo que você pode enviar como prompt no outro projeto para replicar o módulo de motoboys exatamente como funciona aqui. Vou criar um arquivo Markdown com tudo.

## O que será gerado

Um arquivo `/mnt/documents/driver-module-context.md` contendo:

1. **Dependências NPM necessárias** (leaflet, react-leaflet, leaflet-routing-machine, framer-motion, recharts, zustand)

2. **Tipo TypeScript** para leaflet-routing-machine (`src/types/leaflet-routing-machine.d.ts`)

3. **CSS necessário** (importar `leaflet/dist/leaflet.css`, variáveis brand-purple, brand-green, brand-orange)

4. **Código completo de cada arquivo** (14 arquivos):
   - `src/stores/authStore.ts` — state management com Zustand
   - `src/hooks/useNativeGeolocation.ts` — GPS do navegador
   - `src/hooks/useReverseGeocode.ts` — geocodificação reversa LocationIQ
   - `src/hooks/useTraccar.ts` — integração Traccar via edge function
   - `src/hooks/useDriverLocation.ts` — sync posição driver
   - `src/hooks/useDeliveries.ts` — lógica de entregas, ofertas, batch
   - `src/hooks/useWallet.ts` — carteira do driver
   - `src/components/shared/DriverStatusPill.tsx` — toggle online/offline
   - `src/components/shared/CurrencyDisplay.tsx` — exibição R$
   - `src/components/shared/MapStyleSelector.tsx` — seletor de tiles
   - `src/components/shared/BottomNav.tsx` — navegação inferior
   - `src/components/driver/NavigationBar.tsx` — barra de navegação turn-by-turn
   - `src/components/driver/DeliveryOfferSheet.tsx` — sheet de oferta
   - `src/components/driver/ActiveDeliverySheet.tsx` — painel de entrega ativa
   - `src/components/driver/RouteDisplay.tsx` — traçado de rota no mapa
   - `src/pages/driver/DriverMap.tsx` — página principal do mapa
   - `src/pages/driver/History.tsx` — histórico de corridas
   - `src/pages/driver/Earnings.tsx` — ganhos
   - `src/pages/driver/Profile.tsx` — perfil
   - `src/pages/driver/PersonalData.tsx` — dados pessoais

5. **Schema do banco** — tabelas `deliveries`, `driver_locations`, `traccar_devices`, `wallets`, `transactions`, `profiles`, `user_roles` com suas colunas e RLS

6. **Edge Function** `traccar-proxy/index.ts` completa

7. **Rotas no App.tsx** — bloco exato de rotas driver protegidas

8. **Secrets necessários** — TRACCAR_URL, TRACCAR_USER, TRACCAR_PASSWORD

9. **Instruções de uso** — como colar no outro projeto como prompt

## Formato de entrega

Um único arquivo Markdown bem organizado que o usuário pode copiar e colar como contexto/prompt no outro projeto Lovable.

## Passos da implementação

1. Gerar o arquivo Markdown completo em `/mnt/documents/driver-module-context.md` com todo o código-fonte, schema SQL e instruções
2. Validar que todos os arquivos estão incluídos

