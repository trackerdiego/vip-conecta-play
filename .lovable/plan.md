

# Corrigir domínio do link de indicação no Story Creator

## Problema
O `StoryCreator.tsx` usa `https://vip-conecta-play.lovable.app/r/CODE` em vez do domínio correto `https://app.paradadoacai.online/r/CODE`. O Dashboard já está correto.

## Correção
**Arquivo:** `src/pages/influencer/StoryCreator.tsx` (linha 47)
- Trocar `https://vip-conecta-play.lovable.app/r/${referralCode}` por `https://app.paradadoacai.online/r/${referralCode}`

Apenas 1 linha alterada. Todos os locais que usam `shareLink` (preview, canvas, copiar, compartilhar) serão corrigidos automaticamente.

