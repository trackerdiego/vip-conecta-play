

# Regenerar SQL sem tabelas com UUID de usuário

## Tabelas que serão incluídas (dados de configuração/conteúdo)
- `commission_rates` — taxas de comissão por nível
- `missions` — missões disponíveis
- `prizes` — prêmios cadastrados
- `orders` — pedidos (sem FK de usuário)

## Tabelas excluídas (dependem de UUIDs de usuário)
`profiles`, `user_roles`, `wallets`, `transactions`, `deliveries`, `driver_locations`, `user_missions`, `user_prizes`, `referral_sales`, `traccar_devices`, `withdrawal_requests`

## Execução
Script Python via `psql` exportando apenas as 4 tabelas acima como `INSERT INTO ... ON CONFLICT DO NOTHING`, salvo em `/mnt/documents/migration_data_only.sql`.

