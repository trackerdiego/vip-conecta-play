

# Dois assuntos: CSS do itinerário + Fluxo da corrida

## 1. CSS não escondendo o itinerário

A regra `.leaflet-routing-container { display: none !important; }` já existe no CSS, mas o Leaflet Routing Machine pode criar outros elementos como `.leaflet-routing-alt` e o container de erro `.leaflet-routing-error`. Vou reforçar o CSS com seletores mais abrangentes para garantir que tudo seja ocultado.

### Mudança em `src/index.css`
Substituir a regra atual por:
```css
.leaflet-routing-container,
.leaflet-routing-alt,
.leaflet-routing-error,
.leaflet-routing-geocoders {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  overflow: hidden !important;
}
```

## 2. Sobre o fluxo da corrida (resposta informativa)

**O que acontece em um cenário real:**

1. Driver aceita a corrida → status = `accepted` → rota traçada até o **ponto de coleta** (📍)
2. Driver chega no local e aperta **"Cheguei na Coleta"** → status = `picked_up` → rota muda para o **ponto de entrega** (🏠)
3. Driver chega no destino e aperta **"Entrega Concluída"** → status = `delivered` → valor creditado na carteira, rota removida do mapa

**Para o seu teste agora:** Você pode simplesmente apertar os botões na ordem — primeiro "Cheguei na Coleta", depois "Entrega Concluída" — mesmo sem se mover fisicamente. O sistema vai processar normalmente e creditar o valor.

### Arquivo modificado
- `src/index.css` — seletores CSS mais abrangentes

