

# Melhorar link copiável e compartilhamento no Story Creator

## Problemas identificados

1. **Link não copiável**: O link dentro do preview do story (caixa preta com QrCode) é apenas um `<span>` — não tem `onClick` para copiar.
2. **Story como imagem**: Quando o influenciador clica "Postar Story", o sistema gera uma **imagem PNG** via Canvas API. Imagens postadas em stories do Instagram/WhatsApp **não têm links clicáveis** — o link fica apenas visual na imagem.

## Solução

### 1. Tornar o link copiável ao clicar
No `StoryCreator.tsx`, transformar a caixa do link (linhas 177-184) em um botão que copia o link ao clicar, com feedback visual (toast "Link copiado!").

### 2. Adicionar botão "Copiar Link" separado
Abaixo dos botões "Postar Story" e "Baixar", adicionar um terceiro botão ou uma seção clara com o link + botão de copiar. Isso garante que o influenciador possa:
- Baixar/postar a imagem do story
- Copiar o link separadamente para colar na bio, sticker de link, ou legenda

### 3. Orientação ao usuário
Adicionar texto explicativo: "Cole o link na sua bio ou use o sticker de link nos stories" — já que imagens em stories não suportam links clicáveis nativamente.

### Arquivos alterados
- `src/pages/influencer/StoryCreator.tsx` — adicionar onClick na caixa do link, botão "Copiar Link" dedicado, e texto de orientação

