

# Navegação Guiada: Geocodificação + Sheet Deslizável

## Problema Raiz
Todas as entregas no banco possuem coordenadas `NULL`. O Multipedidos envia apenas endereços textuais, e a edge function não geocodifica. Sem lat/lng, o `RouteDisplay` não tem destino para traçar rota.

## Plano

### 1. Geocodificação na Edge Function (`multipedidos-sync`)
- Usar a API gratuita do Nominatim (OpenStreetMap) para converter endereço → lat/lng
- Geocodificar tanto o pickup ("Parada do Açaí VIP, Fortaleza") quanto o delivery address
- Gravar as coordenadas no banco junto com o pedido
- Fallback: se geocodificação falhar, manter null (rota não será traçada mas app não quebra)

### 2. ActiveDeliverySheet → Drawer deslizável
- Substituir o `motion.div` fixo por um componente `Drawer` (vaul) que já existe no projeto
- Comportamento: arrasta para baixo para esconder, arrasta para cima para mostrar
- Quando escondido: mapa com rota fica 100% visível
- Handle/grabber visual no topo do drawer para indicar que é arrastável
- Snap points: aberto (mostra info completa) e fechado (só handle visível)

### 3. Corrigir pedidos existentes
- Criar uma query de update para preencher as coordenadas dos pedidos existentes com coordenadas conhecidas da "Parada do Açaí VIP" como pickup fixo

## Arquivos
- `supabase/functions/multipedidos-sync/index.ts` — adicionar função de geocodificação via Nominatim
- `src/components/driver/ActiveDeliverySheet.tsx` — refatorar para usar Drawer (vaul) com swipe
- `src/pages/driver/DriverMap.tsx` — ajustar integração com novo drawer

## Coordenadas de Pickup Fixo
A "Parada do Açaí VIP" será hardcoded como pickup padrão (Fortaleza-CE). A geocodificação na edge function buscará as coordenadas exatas na primeira vez e as reutilizará.

