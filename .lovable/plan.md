

# Gerar SQL completo de schema + functions para Supabase externo

## O que será gerado
Um arquivo `/mnt/documents/schema_completo.sql` contendo todo o schema do banco, pronto para executar no SQL Editor de um Supabase externo. Inclui:

1. Enum `app_role`
2. Todas as 15 tabelas com constraints e defaults
3. Todas as RLS policies
4. Todas as functions (`has_role`, `get_user_role`, `generate_referral_code`, `handle_new_user`, `update_updated_at_column`, `credit_referral_commission`, `credit_driver_delivery`)
5. Triggers (on_auth_user_created, updated_at triggers, orders_updated_at)
6. Realtime publications
7. Unique indexes

## O que NÃO inclui
- Dados (já exportados no `migration_data_only.sql`)
- Secrets (precisam ser configurados manualmente no dashboard do Supabase externo)

## Secrets necessários no Supabase externo
Lista dos secrets que precisam ser configurados manualmente nas Edge Functions do novo projeto:
- `TRACCAR_URL`, `TRACCAR_USER`, `TRACCAR_PASSWORD`
- `MULTIPEDIDOS_INTEGRATION_TOKEN`, `MULTIPEDIDOS_RESTAURANT_ID`

## Execução
Script que consolida todas as 15 migrations em um único arquivo SQL ordenado, usando `CREATE OR REPLACE` e `IF NOT EXISTS` onde possível para ser idempotente.

