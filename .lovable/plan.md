

# Atualizar domínio no app para `paradadoacai.online`

Agora que o domínio está configurado, preciso atualizar todas as referências no código para usar o novo domínio.

## Alterações

### 1. Links de referral (3 arquivos)
- **`src/pages/influencer/Dashboard.tsx`** — Alterar `https://paradadoacai.app/r/` → `https://app.paradadoacai.online/r/`
- **`src/pages/influencer/StoryCreator.tsx`** — Mesma alteração acima
- **`src/pages/ReferralRedirect.tsx`** — Manter como está (a URL do cardápio `pedir.delivery/paradadoacai` não muda)

### 2. Meta tags e OG tags
- **`index.html`** — Atualizar `og:url` se necessário (atualmente não tem `og:url` definido, considerar adicionar com o novo domínio)

### 3. Manifest e PWA
- **`vite.config.ts`** — Atualizar `start_url` e `scope` se necessário (já estão como `/`, sem mudança necessária)

## Resumo
Basicamente trocar `paradadoacai.app` → `app.paradadoacai.online` nos links de compartilhamento dos influenciadores. Isso garante que os links nos stories e QR codes apontem para o domínio correto.

