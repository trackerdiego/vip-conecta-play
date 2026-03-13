

# Integração Traccar — API Completa

## Visão Geral

Criar uma edge function proxy que conecta ao seu servidor Traccar, sincronizando posições dos entregadores e gerenciando dispositivos/corridas. O app enviará posições simultaneamente para o banco local e para o Traccar.

---

## 1. Secrets necessários

Precisaremos de 3 secrets:
- `TRACCAR_URL` — URL do seu servidor Traccar (ex: `https://traccar.seudominio.com`)
- `TRACCAR_USER` — Email/usuário admin do Traccar
- `TRACCAR_PASSWORD` — Senha admin do Traccar

## 2. Edge Function `traccar-proxy`

Criar `supabase/functions/traccar-proxy/index.ts` que:
- Autentica com o Traccar via Basic Auth (user:password)
- Expõe endpoints proxy:
  - `POST /devices` — criar dispositivo (1 por entregador)
  - `PUT /positions` — enviar posição GPS
  - `GET /devices` — listar dispositivos
  - `GET /positions` — buscar posições de dispositivos
  - `GET /reports/route` — relatório de rotas
- Valida JWT do usuário antes de processar
- Inclui CORS headers

## 3. Tabela `traccar_devices`

Criar tabela de mapeamento `driver_id ↔ traccar_device_id` para saber qual device do Traccar pertence a qual entregador. Campos: `driver_id`, `traccar_device_id`, `unique_id`.

## 4. Atualizar `useDriverLocation`

Quando o entregador ficar online:
1. Verificar se já tem device no Traccar (via `traccar_devices`)
2. Se não, criar device automaticamente
3. A cada sync de posição (10s), enviar também para o Traccar via edge function

## 5. Atualizar `useDeliveries`

Quando uma corrida for aceita:
- Opcional: criar geofence no Traccar para coleta/entrega

Quando concluída:
- Buscar relatório de rota do Traccar para a corrida

## 6. Hook `useTraccar`

Criar hook centralizado com funções:
- `syncPosition(lat, lng, heading, speed)` — envia posição ao Traccar
- `ensureDevice()` — cria device se não existir
- `getRouteReport(from, to)` — busca relatório de rota
- `listDevices()` — lista todos os dispositivos

## Arquivos

| Ação | Arquivo |
|------|---------|
| Criar | `supabase/functions/traccar-proxy/index.ts` |
| Criar | `src/hooks/useTraccar.ts` |
| Migração | Tabela `traccar_devices` |
| Modificar | `src/hooks/useDriverLocation.ts` |
| Config | `supabase/config.toml` (verify_jwt = false) |

