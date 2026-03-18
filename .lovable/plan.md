

# Correções: Pin da loja e motoboy invisível no mapa

## Problemas identificados

### 1. Coordenadas da loja erradas
As coordenadas atuais (`-3.7373, -38.6531`) estão incorretas. O endereço real "Rua 100, 202, Planalto Caucaia" fica em **`-3.7424, -38.6635`** (confirmado via OpenStreetMap/Nominatim).

**Correção**: Atualizar `STORE_LAT` e `STORE_LNG` em `src/hooks/useAdminOperations.ts`.

### 2. Motoboy não aparece — problema de RLS na tabela `user_roles`
A tabela `user_roles` tem RLS que só permite cada usuário ver **seus próprios** roles (`auth.uid() = user_id`). Quando o admin consulta `user_roles` para listar drivers, a query retorna vazio porque o admin não tem role `driver` — ele só vê seu próprio role `admin`.

**Correção**: Adicionar uma policy de SELECT em `user_roles` para admins verem todos os roles:
```sql
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
```

### Arquivos alterados
- `src/hooks/useAdminOperations.ts` — Corrigir coordenadas para `-3.7424, -38.6635`
- Migration SQL — Adicionar RLS policy para admins na `user_roles`

