

# Integração LocationIQ — Mapas + Geocodificação Reversa

## Visão Geral

Substituir os tiles do OpenStreetMap por tiles do LocationIQ com 4 estilos de mapa selecionáveis, e adicionar geocodificação reversa para converter coordenadas em endereços legíveis.

---

## 1. API Key

A chave do LocationIQ é usada diretamente no navegador (tiles e geocoding), então será armazenada como variável pública `VITE_LOCATIONIQ_KEY` no código. Vou solicitar a chave para salvar como secret acessível no frontend.

## 2. Estilos de mapa disponíveis

4 estilos de tiles do LocationIQ:

| Estilo | URL do tile | Visual |
|--------|-------------|--------|
| Ruas | `https://tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=KEY` | Padrão colorido |
| Escuro | `https://tiles.locationiq.com/v3/dark/r/{z}/{x}/{y}.png?key=KEY` | Tema escuro |
| Claro | `https://tiles.locationiq.com/v3/light/r/{z}/{x}/{y}.png?key=KEY` | Minimalista claro |
| Satélite | `https://tiles.locationiq.com/v3/ocean/r/{z}/{x}/{y}.png?key=KEY` | Estilo oceano/terreno |

## 3. Componente MapStyleSelector

Criar um botão flutuante no mapa (canto inferior direito) que abre um mini-menu para trocar entre os 4 estilos. O estilo selecionado será persistido em `localStorage`.

## 4. Hook `useReverseGeocode`

Criar `src/hooks/useReverseGeocode.ts`:
- Função `reverseGeocode(lat, lng)` que chama `https://us1.locationiq.com/v1/reverse?key=KEY&lat=LAT&lon=LNG&format=json`
- Retorna endereço formatado (`display_name`)
- Cache de resultados por coordenada arredondada para evitar chamadas duplicadas
- Rate limiting (máx 2 req/s conforme limites do LocationIQ)

## 5. Usar geocodificação reversa no DriverMap

- Mostrar endereço atual do entregador no card de status (opcional)
- Quando uma entrega não tem `pickup_address`/`delivery_address` preenchido, fazer reverse geocode a partir de `pickup_lat/lng`

## 6. Arquivos

| Ação | Arquivo |
|------|---------|
| Criar | `src/hooks/useReverseGeocode.ts` |
| Criar | `src/components/shared/MapStyleSelector.tsx` |
| Modificar | `src/pages/driver/DriverMap.tsx` (tiles + seletor de estilo) |
| Config | Adicionar `VITE_LOCATIONIQ_KEY` ao projeto |

