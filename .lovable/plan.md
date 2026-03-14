
# Renomear para "Parada do Açaí Caucaia" + Corrigir Coordenadas

## Contexto
O estabelecimento se chama "Parada do Açaí Caucaia", não "Parada do Açaí VIP". As coordenadas atuais (-3.7319, -38.5267) apontam para Fortaleza, mas a sede fica em Caucaia-CE.

## Sobre a Alocação de Pedidos
O sistema já funciona no modelo **broadcast**: todos os drivers online recebem a notificação simultaneamente via Realtime, e quem aceitar primeiro leva (o banco de dados garante atomicidade). Para a fase inicial com poucos entregadores no app, esse modelo é adequado.

## Alterações

### 1. Edge Function (`supabase/functions/multipedidos-sync/index.ts`)
- Renomear `pickup_address` de "Parada do Açaí VIP" → "Parada do Açaí Caucaia"
- Atualizar coordenadas fixas para a localização real em Caucaia-CE (buscar coordenadas corretas de Caucaia)
- Atualizar comentário

### 2. Atualizar pedidos existentes no banco
- UPDATE nas deliveries existentes para corrigir o nome do pickup_address

### 3. Renomear referências na UI (somente alt text de imagens e textos descritivos)
- `src/pages/auth/Login.tsx` — alt text
- `src/pages/auth/Register.tsx` — alt text e texto
- `src/pages/auth/ForgotPassword.tsx` — alt text
- `src/pages/auth/ResetPassword.tsx` — alt text
- `src/pages/SplashScreen.tsx` — alt text
- `src/pages/Onboarding.tsx` — alt text
- `src/pages/InstallPWA.tsx` — alt text e texto
- `src/pages/influencer/StoryCreator.tsx` — título de share

**Nota**: Os nomes de arquivo de assets (`logo-parada-vip.png`) e imports não precisam mudar — são apenas nomes internos de arquivo.

## Arquivos modificados
- `supabase/functions/multipedidos-sync/index.ts`
- 8 arquivos de UI (renomear textos)
- 1 query de UPDATE no banco (pickup_address)
