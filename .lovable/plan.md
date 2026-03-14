

# Templates de Stories com Imagens Fornecidas

## Resumo
Substituir os templates atuais (gradientes + emojis) por templates baseados nas 4 imagens enviadas. Cada template usa a imagem como fundo completo, com o link de indicação da influenciadora sobreposto dinamicamente. O botão "Copiar Link" e "Compartilhar/Baixar" continuam funcionando.

## Imagens recebidas

1. **Delivery Liberado** — fundo bege, logo, "Atenção! o delivery está liberado"
2. **Energia** — fundo amarelo, casal fitness, "Açaí é altamente indicado para repor suas energias"
3. **Amor** — fundo amarelo, casal romântico, "Tomar um açaí com seu amor"
4. **Irresistível** — fundo amarelo/roxo, mulher animada, "Eu nunca resisto a um açaí da parada"

## O que será feito

### 1. Copiar as 4 imagens para `src/assets/stories/`
Salvar como `story-1.png`, `story-2.png`, `story-3.png`, `story-4.png`.

### 2. Reescrever `StoryCreator.tsx`
- Templates usam `backgroundImage` (import do asset) em vez de gradientes CSS
- Preview mostra a imagem como fundo com `object-cover`
- A area "LINK DO INFLUENCER" é substituída dinamicamente pelo link real da influenciadora
- Canvas export: carrega a imagem via `new Image()`, desenha no canvas 1080x1920, sobrepõe o link de indicação na posição correta
- Manter botões: Copiar Link, Postar Story (share/download)

### 3. Lógica do Canvas Export
- `drawImage()` para preencher o canvas com a imagem do template
- Desenhar o link de indicação na posição onde aparece "LINK DO INFLUENCER" nas imagens (~centro-baixo)
- Sem necessidade de redesenhar textos — eles já fazem parte da imagem

### Estrutura dos templates
```text
Template[] = [
  { id, name, image: import(...), linkPosition: {x, y} },
  ...
]
```

Cada template tem uma posição `linkPosition` calibrada para onde o link deve ser renderizado no canvas, correspondendo à area "LINK DO INFLUENCER" de cada imagem.

