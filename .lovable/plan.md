

# Plano de Melhorias — Experiência do Motoboy (Despacho de Pedidos)

## Problemas Identificados

1. **Histórico usa dados fictícios** — `History.tsx` importa `mockDeliveryHistory` em vez de buscar do banco
2. **Sem som de alerta** — quando chega uma corrida, o motoboy só vê o card se estiver olhando a tela
3. **Sem botão "Navegar"** — o motoboy não consegue abrir Waze/Google Maps para ir ao endereço
4. **Realtime pode não funcionar** — a tabela `deliveries` precisa estar habilitada no Realtime (publication)
5. **Card de entrega ativa mostra pouca informação** — não mostra valor da corrida nem ambos os endereços
6. **Admin Overview não tem link para Comissões** — a tela criada anteriormente não aparece no painel

## O que será feito

### 1. Histórico com dados reais
Substituir `mockDeliveryHistory` por query real na tabela `deliveries` filtrada pelo `driver_id`. Manter os filtros Hoje/Semana/Mês funcionando com datas reais.

### 2. Som de alerta na nova corrida
Adicionar um arquivo de áudio curto (notification beep) e tocar automaticamente quando `pendingOffer` chega. Combinar com vibração já existente.

### 3. Botão "Navegar" no card de entrega ativa
Ao clicar, abre Google Maps ou Waze com o endereço de destino (coleta ou entrega dependendo do status). Usa deep link `https://www.google.com/maps/dir/?api=1&destination=LAT,LNG`.

### 4. Habilitar Realtime na tabela `deliveries`
Migração SQL: `ALTER PUBLICATION supabase_realtime ADD TABLE public.deliveries;`

### 5. Card de entrega ativa melhorado
Mostrar ambos endereços (coleta e entrega), valor da corrida, e botão de navegação. Destacar o endereço atual com cor.

### 6. Link para Comissões no Admin Overview
Adicionar card "Comissões por Nível" e botão "Gerenciar Comissões" no painel admin.

## Detalhes Técnicos

- **History.tsx**: Trocar import mock por `useQuery` com `supabase.from('deliveries')`, filtrar por `driver_id` e datas
- **DriverMap.tsx**: Importar `useRef` para `Audio`, tocar som no `useEffect` que detecta `pendingOffer`
- **DriverMap.tsx**: Adicionar botão com ícone de navegação no card ativo, abrir via `window.open()`
- **Migração SQL**: Uma linha para habilitar realtime
- **AdminOverview.tsx**: Adicionar card de comissões e link `/admin/commissions`

