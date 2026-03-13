

# Situação Atual: Missões e Prêmios

## O que existe hoje

**Missões (`missions`)**: A tabela existe no banco de dados, mas está **vazia**. O hook `useMissions` já busca dados reais do banco. Falta apenas uma forma de cadastrar as missões.

**Prêmios/Metas**: São **100% dados fictícios** (hardcoded em `mockData.ts`). Não existe tabela no banco nem tela de gerenciamento.

## O que precisa ser criado

### 1. Tabela `prizes` no banco
Armazenar prêmios com: nome, emoji, categoria (excursões/cupons/cashback), meta de indicações necessárias, e status ativo.

### 2. Tabela `user_prizes` para progresso
Vincular usuário ao prêmio, rastrear progresso e resgate.

### 3. Painel Admin para gerenciar tudo
Uma área `/admin` com:
- **Missões**: Criar, editar, ativar/desativar missões (título, descrição, ícone, tipo, meta, recompensa)
- **Prêmios**: Criar, editar prêmios por meta de indicações
- **Visão geral**: Ver influenciadores ativos, vendas, saques pendentes

### 4. Conectar Rewards ao banco real
Substituir `mockPrizes` por dados reais da tabela `prizes`.

## Detalhes técnicos

```text
┌─────────────────────────────────────────┐
│            PAINEL ADMIN                 │
│                                         │
│  ┌─────────────┐  ┌──────────────────┐  │
│  │  Missões     │  │  Prêmios/Metas   │  │
│  │  CRUD        │  │  CRUD            │  │
│  └─────────────┘  └──────────────────┘  │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │  Visão geral: influenciadores,     ││
│  │  vendas, saques pendentes          ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
         │                    │
         ▼                    ▼
   missions (tabela)    prizes (nova tabela)
         │                    │
         ▼                    ▼
   useMissions hook     usePrizes hook (novo)
         │                    │
         ▼                    ▼
   Dashboard / Missions   Rewards page
```

### Migrações SQL
- Criar tabela `prizes` (id, name, emoji, category, target, is_active, created_at)
- Criar tabela `user_prizes` (id, user_id, prize_id, progress, claimed_at)
- RLS: usuários veem prêmios ativos; gerenciam próprio progresso; admins fazem CRUD

### Novas páginas
- `/admin/missions` — listar, criar e editar missões
- `/admin/prizes` — listar, criar e editar prêmios
- `/admin/overview` — dashboard com métricas

### Alterações em páginas existentes
- `Rewards.tsx` — trocar `mockPrizes` por dados do banco
- `Dashboard.tsx` — trocar `mockPrizes` por dados do banco

