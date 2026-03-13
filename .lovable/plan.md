

## Problem

The `bun run build` command fails because Vite emits a chunk size warning that Capgo treats as a build error (non-zero exit status).

## Solution

Add `build.chunkSizeWarningLimit` to `vite.config.ts` to increase the threshold (e.g., 1500 kB), preventing the warning from appearing.

## Changes

**`vite.config.ts`** — Add `chunkSizeWarningLimit: 1500` inside the `build` object:

```ts
build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: { ... }
}
```

After this change, pull the code and run `bunx @capgo/cli init` again to resume the onboarding.

