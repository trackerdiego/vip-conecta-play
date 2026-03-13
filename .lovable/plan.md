

# Comissão Escalonada (1%–5%) + Viagens Gerenciadas pelo Admin

## Comissões por Nível

| Nível | XP | Comissão |
|---|---|---|
| Bronze | 0–500 | **1%** |
| Prata | 500–2.000 | **2%** |
| Ouro | 2.000–5.000 | **3.5%** |
| Diamante | 5.000+ | **5%** |

Exemplo: Pedido de R$50 → Bronze recebe R$0,50 / Diamante recebe R$2,50.

## Viagens

As viagens (Jericoacoara, 3 Praias, Lagoinha, Flexau, Flexeiras) serão cadastradas pelo admin no painel de prêmios com a meta de vendas que ele quiser. O admin pode criar metas semanais, mensais ou pontuais e desativar quando quiser. Nenhuma viagem é fixa no código.

## O que será feito

### 1. Criar tabela `commission_rates` no banco
Tabela com `level` (1-4) e `rate` (decimal). Seed com os 4 valores iniciais (0.01, 0.02, 0.035, 0.05). RLS: admin faz CRUD, autenticados podem ler.

### 2. Atualizar Edge Function `multipedidos-sync`
Na função `creditReferral`: buscar `profiles.level` do influenciador → buscar `commission_rates.rate` pelo nível → passar taxa dinâmica (hoje está fixo em 0.10).

### 3. Nova página `/admin/commissions`
Tela para o admin visualizar e editar as 4 taxas por nível. Simples: tabela com os 4 níveis e um campo de porcentagem editável para cada.

### 4. Atualizar `levels.ts` e Dashboard
Adicionar `commissionRate` ao objeto de cada nível para exibição. Mostrar "Sua comissão: X%" no card de saldo do influenciador.

### 5. Adicionar rota no App.tsx
Rota `/admin/commissions` protegida por role admin.

### Detalhes técnicos

```text
Webhook chega → Busca influenciador (profiles.level)
    → Busca taxa em commission_rates
    → credit_referral_commission(_commission_rate = taxa dinâmica)
```

As viagens continuam sendo gerenciadas na tela `/admin/prizes` existente, categoria "excursions". O admin define a meta (vendas) e ativa/desativa livremente.

