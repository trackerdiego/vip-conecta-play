

# Exportar SQL completo de todas as tabelas

## O que será feito
Executar queries em todas as 15 tabelas do banco e gerar um arquivo SQL único com `INSERT INTO` statements para cada registro, pronto para importar em outro banco.

## Tabelas incluídas
`profiles`, `user_roles`, `wallets`, `transactions`, `orders`, `deliveries`, `driver_locations`, `missions`, `user_missions`, `prizes`, `user_prizes`, `commission_rates`, `referral_sales`, `traccar_devices`, `withdrawal_requests`

## Formato de saída
Arquivo `/mnt/documents/migration_complete.sql` contendo:
1. Comentários separando cada tabela
2. Statements `INSERT INTO ... VALUES (...)` para cada linha
3. Ordem respeitando dependências (ex: `profiles` antes de `user_roles`, `wallets` antes de `transactions`)

## Execução
Script Python usando `psql` para extrair dados de cada tabela via `COPY TO STDOUT WITH CSV HEADER`, converter para SQL INSERT statements, e salvar no arquivo final.

## Build errors existentes
Também corrigirei os 2 erros de TypeScript em `multipedidos-sync/index.ts` onde `err` é do tipo `unknown` (precisa de cast `(err as Error).message`).

