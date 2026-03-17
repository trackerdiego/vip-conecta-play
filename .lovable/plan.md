

# Tornar agentevendeagente@gmail.com admin

O usuário já foi encontrado no banco com ID `12aa656f-b254-4a84-9e11-7f54931d8440` e role atual `influencer`.

## Plano

1. **Atualizar role para admin** — Executar um UPDATE na tabela `user_roles` para trocar de `influencer` para `admin` para este user_id.

```sql
UPDATE user_roles SET role = 'admin' WHERE user_id = '12aa656f-b254-4a84-9e11-7f54931d8440';
```

2. Após a mudança, o usuário deve fazer logout e login novamente para acessar `/admin`.

