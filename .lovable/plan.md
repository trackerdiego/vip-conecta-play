

# Corrigir Geocodificação dos Endereços de Entrega

## Problema
O Nominatim falha porque:
1. Endereço inclui "(Ref: ...)", "altos", e complementos que poluem a query
2. A cidade é extraída do campo `city` do pedido (ex: "Caucaia"), mas a função adiciona fixamente ", Fortaleza, CE, Brasil"
3. Quando `city` está vazio, pega do `client.city` que pode ser de outra cidade (ex: "Joinville")

## Solução

### 1. Melhorar `geocodeAddress` na edge function (`multipedidos-sync`)
- Limpar o endereço antes de enviar ao Nominatim: remover "(Ref: ...)", complementos
- Usar a cidade real do pedido (não fixar "Fortaleza")
- Construir query estruturada: `street=X&city=Y&state=CE&country=Brazil` (API estruturada do Nominatim é mais precisa)
- Fallback: se falhar com busca estruturada, tentar busca simples só com rua + número + cidade

### 2. Criar função `buildGeoQuery` separada de `buildDeliveryAddress`
- `buildDeliveryAddress` continua retornando endereço completo para exibição ao driver
- `buildGeoQuery` retorna apenas os campos relevantes para geocodificação (rua, número, bairro, cidade)

### 3. Usar a cidade correta do pedido
- Prioridade: `order.city` → `order.client?.city` → "Fortaleza" (fallback)
- Estado: "CE" fixo (operação local)

## Arquivo modificado
- `supabase/functions/multipedidos-sync/index.ts` — refatorar geocodeAddress para usar busca estruturada e limpar dados

