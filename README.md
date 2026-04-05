# vite-env

The `env.ts` layer for Vite — define once, validate everywhere, import with types.

What [`@t3-oss/env`](https://github.com/t3-oss/t3-env) is for Next.js, but built natively on Vite 8 / Rolldown with zero boilerplate.

## Features

- **Typed virtual modules** — `import { env } from 'virtual:env/client'` with full IntelliSense
- **Server/client split** — server secrets never reach the browser bundle
- **Build-time leak detection** — fails the build if server values appear in client chunks
- **Auto-coercion** — `z.stringbool()`, `z.coerce.number()` just work
- **Auto `.d.ts` generation** — no more manual `vite-env.d.ts` maintenance
- **Auto `.env.example`** — `npx vite-env generate` from your schema
- **Zod v4 native** — first-class support for the latest Zod
- **Vite 8 / Rolldown native** — `moduleType: 'js'` on virtual modules, sequential hooks

## Install

```bash
pnpm add @vite-env/core zod
pnpm add -D @vite-env/cli # optional — for check/generate/types commands
```

## Usage

### 1. Define your schema — `env.ts`

```ts
import { defineEnv, z } from '@vite-env/core'

export default defineEnv({
  server: {
    DATABASE_URL: z.url(),
    JWT_SECRET: z.string().min(32),
    DB_POOL_SIZE: z.coerce.number().int().min(1).max(100).default(10),
    REDIS_URL: z.url().optional(),
  },
  client: {
    VITE_API_URL: z.url(),
    VITE_APP_NAME: z.string().min(1),
    VITE_DARK_MODE: z.stringbool().default(false),
    VITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  },
  shared: {
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
  },
})
```

### 2. Add the plugin — `vite.config.ts`

```ts
import ViteEnv from '@vite-env/core/plugin'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [ViteEnv()],
})
```

### 3. Use typed env in your app

```ts
// Client code — only client + shared vars available
import { env } from 'virtual:env/client' // TypeScript error — server var not accessible

// Server/SSR code — all vars available
import { env } from 'virtual:env/server'

env.VITE_API_URL // string
env.VITE_DARK_MODE // boolean (not "true")
env.NODE_ENV // 'development' | 'test' | 'production'
env.DATABASE_URL

env.DATABASE_URL // string
env.JWT_SECRET // string
env.VITE_API_URL // string (public vars also available server-side)
```

## How it works

| Section  | Available in `virtual:env/client` | Available in `virtual:env/server` |
| -------- | :-------------------------------: | :-------------------------------: |
| `client` |                Yes                |                Yes                |
| `shared` |                Yes                |                Yes                |
| `server` |                No                 |                Yes                |

- **Validation** runs on `buildStart` (fatal) and on `.env` file changes during dev (non-fatal warning)
- **Leak detection** scans client chunks at `generateBundle` for literal server variable values
- **`VITE_` prefix** is enforced at `defineEnv()` call time for all `client` keys
- **`process.env` wins** over `.env` files (CI secrets take precedence)

## CLI

```bash
# Validate env without starting dev server
npx vite-env check

# Generate .env.example from schema
npx vite-env generate

# Regenerate vite-env.d.ts
npx vite-env types
```

## Plugin Options

```ts
ViteEnv({
  configFile: './env.ts', // default — path to env definition file
})
```

## Packages

| Package                             | Description                                 |
| ----------------------------------- | ------------------------------------------- |
| [`@vite-env/core`](./packages/core) | Vite plugin + `defineEnv()` + Zod re-export |
| [`@vite-env/cli`](./packages/cli)   | CLI commands: `check`, `generate`, `types`  |

## Requirements

- Node.js >= 20.19.0
- Vite >= 8.0.0
- Zod >= 4.0.0

## License

[MIT](./LICENSE)
