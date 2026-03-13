

## Problema

O build falha porque `@capacitor/core` é importado **estaticamente** e **dinamicamente** no mesmo arquivo (`useBackgroundGeolocation.ts`). O Vite trata isso como erro.

## Solução

Remover o `import()` dinâmico de `@capacitor/core` em `useBackgroundGeolocation.ts` e usar diretamente o `registerPlugin` já disponível pelo import estático.

## Mudança

**`src/hooks/useBackgroundGeolocation.ts`** — Linhas ~33-34: substituir o `await import('@capacitor/core')` por import estático:

```ts
// ANTES (linha 33-34):
const { registerPlugin } = await import('@capacitor/core');
const bgGeo = registerPlugin<any>('BackgroundGeolocation');

// DEPOIS:
import { registerPlugin } from '@capacitor/core'; // mover para o topo do arquivo
// ... e dentro da função start():
const bgGeo = registerPlugin<any>('BackgroundGeolocation');
```

Ou seja, adicionar `registerPlugin` ao import estático existente no topo e remover a linha do `await import`.

Após a mudança, fazer `git pull` e rodar `bunx @capgo/cli init` novamente.

