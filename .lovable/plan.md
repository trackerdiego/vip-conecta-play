

# Diagnóstico: Entregas Não Chegam ao Motorista

## Problema Principal Encontrado

**Bug crítico de RLS (segurança do banco)**: A política de UPDATE na tabela `deliveries` exige `driver_id = auth.uid()`. Mas entregas pendentes chegam com `driver_id = NULL`. Quando o motorista tenta aceitar (fazer UPDATE para atribuir seu ID), o banco **bloqueia** porque `NULL != auth.uid()`.

Resultado: o motorista vê a oferta via realtime, mas ao clicar "Aceitar", o UPDATE falha silenciosamente.

## Problemas Secundários

1. **Fare incorreto**: As entregas existentes no banco têm `fare: 10.00` (total do pedido) em vez de `fare: 4.00` (delivery_fee). A edge function atualizada ainda não foi redeployada.

2. **Sem polling de pendentes**: Se o motorista abre o app **depois** que a entrega já foi criada, ele não vê nada — o código só escuta INSERTs em tempo real, não consulta entregas pendentes já existentes.

## Correções

### 1. Corrigir RLS da tabela `deliveries`
- Adicionar política: "Drivers can accept pending deliveries" — permite UPDATE onde `status = 'pending'` por qualquer usuário autenticado (o código já filtra por `eq('status', 'pending')`)
- Manter a política existente para entregas já aceitas

### 2. Redesplegar edge function `multipedidos-sync`
- Garantir que a versão com a lógica de fare corrigida está ativa
- Testar com curl simulando um pedido

### 3. Adicionar query de entregas pendentes ao montar
- No `useDeliveries`, adicionar uma query que busca entregas `status = 'pending'` ao montar o hook
- Se existir alguma pendente, mostrar como oferta automaticamente

### 4. Limpar entregas de teste antigas
- Deletar as entregas de teste pendentes com fare incorreto para não poluir

## Resumo Técnico

```text
Fluxo atual (quebrado):
  Webhook → INSERT delivery (driver_id=NULL) → Realtime → Driver vê oferta
  → Driver clica Aceitar → UPDATE blocked by RLS ❌

Fluxo corrigido:
  Webhook → INSERT delivery (driver_id=NULL) → Realtime → Driver vê oferta
  → Driver clica Aceitar → UPDATE allowed (new RLS policy) ✅
  
  + Driver abre app → Query pendentes existentes → Mostra oferta
```

