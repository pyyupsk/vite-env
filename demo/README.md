# vite-env demo

A minimal demo showing `@vite-env/core` working end-to-end with typed virtual modules, server/client splitting, and runtime access protection.

## What's inside

| File                 | Purpose                                                                |
| -------------------- | ---------------------------------------------------------------------- |
| `env.ts`             | Zod v4 schema — `defineEnv()` with server + client variables           |
| `env.standard.ts`    | Valibot schema — `defineStandardEnv()` showing Standard Schema support |
| `vite.config.ts`     | Plugin setup with all three options documented                         |
| `src/main.ts`        | Client code importing `virtual:env/client` with typed values           |
| `src/server-leak.ts` | Commented-out `virtual:env/server` import to demo the guard            |
| `.env`               | Sample environment variables                                           |

## Run it

```bash
# From the repo root
pnpm install
pnpm --filter @vite-env/core build

# Zod path (default)
cd demo
pnpm dev

# Standard Schema path (Valibot)
pnpm dev:standard
```

Open `http://localhost:5173` to see typed env variables rendered with their runtime types.

## Try the runtime access protection

1. Open `src/server-leak.ts`
2. Uncomment the `import { env } from 'virtual:env/server'` line
3. Run `pnpm build`

With the default `onClientAccessOfServerModule: 'warn'`, the build completes but logs a warning and exits with code 1. Change it to `'error'` in `vite.config.ts` to see a hard build failure, or `'stub'` to get a module that throws at runtime.

## Try the leak detector

1. Add this to `src/main.ts`:

   ```ts
   const secret = 'this-is-a-super-secret-jwt-key-that-is-at-least-32-chars'
   console.log(secret)
   ```

2. Run `pnpm build`

The build fails because a server variable's literal value appears in a client chunk.

## StackBlitz

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/pyyupsk/vite-env/tree/main/demo)

> Note: StackBlitz runs in WebContainers. The demo works for showing virtual modules and typed env, but build-time features (leak detection, access protection) require a full `vite build` which may not run in the browser sandbox.
