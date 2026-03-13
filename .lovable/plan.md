

# Configurar @capgo/capacitor-updater para OTA Updates

## O que é
O `@capgo/capacitor-updater` permite enviar atualizações do frontend (HTML/CSS/JS) diretamente para os dispositivos dos usuários, sem precisar republicar nas lojas. Apenas mudanças nativas (novos plugins, permissões) exigem nova submissão.

## Importante: Limitação no Lovable
O `@capgo/capacitor-updater` é um **plugin nativo Capacitor** — ele precisa ser instalado e configurado **localmente** após exportar o projeto para GitHub. Não é possível testá-lo no preview web. O que podemos fazer aqui:

1. Criar um hook `useCapgoUpdater.ts` com import dinâmico (mesmo padrão dos outros plugins)
2. Adicionar a configuração do plugin no `capacitor.config.ts`
3. Adicionar ao `rollupOptions.external` no `vite.config.ts`
4. Inicializar o updater no `App.tsx`

## Arquivos

| Ação | Arquivo | Descrição |
|------|---------|-----------|
| Criar | `src/hooks/useCapgoUpdater.ts` | Hook com import dinâmico do `@capgo/capacitor-updater`, checa e aplica updates no startup |
| Modificar | `capacitor.config.ts` | Adicionar config do CapacitorUpdater (autoUpdate: false para controle manual) |
| Modificar | `vite.config.ts` | Adicionar `@capgo/capacitor-updater` ao `rollupOptions.external` |
| Modificar | `src/App.tsx` | Chamar `useCapgoUpdater()` no componente raiz |

## Fluxo de atualização OTA

```text
1. Dev faz mudanças no Lovable
2. Exporta → git pull → npm run build
3. npx @capgo/cli upload -c production
4. App do usuário detecta update → baixa → aplica no próximo restart
```

## Após implementação — passos do usuário
1. Exportar projeto para GitHub
2. `npm install @capgo/capacitor-updater`
3. Criar conta em [capgo.app](https://capgo.app) e obter API key
4. `npx @capgo/cli init` para configurar o projeto
5. Para cada update: `npm run build` → `npx @capgo/cli upload`

