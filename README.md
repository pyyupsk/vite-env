# vite-env

[![Unit Test](https://github.com/pyyupsk/vite-env/actions/workflows/unit-test.yml/badge.svg)](https://github.com/pyyupsk/vite-env/actions/workflows/unit-test.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=pyyupsk_vite-env&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=pyyupsk_vite-env)
[![Vite compatibility](https://registry.vite.dev/api/badges?package=@vite-env/core&tool=vite)](https://registry.vite.dev/)
[![npm version](https://img.shields.io/npm/v/@vite-env/core)](https://www.npmjs.com/package/@vite-env/core)
[![npm downloads](https://img.shields.io/npm/dm/@vite-env/core)](https://www.npmjs.com/package/@vite-env/core)
[![License](https://img.shields.io/github/license/pyyupsk/vite-env)](./LICENSE)

The `env.ts` layer for Vite — define once, validate everywhere, import with types.

What [`@t3-oss/env`](https://github.com/t3-oss/t3-env) is for Next.js, but built natively on Vite 8 / Rolldown with zero boilerplate.

## Features

- **Typed virtual modules** — `import { env } from 'virtual:env/client'` with full IntelliSense
- **Server/client split** — server secrets never reach the browser bundle
- **Build-time leak detection** — fails the build if server values appear in client chunks
- **Runtime access protection** — Vite 8 Environment API guards `virtual:env/server` imports from client environments (`'warn'`, `'error'`, or `'stub'` mode)
- **Auto-coercion** — `z.stringbool()`, `z.coerce.number()` just work
- **Auto `.d.ts` generation** — no more manual `vite-env.d.ts` maintenance
- **Auto `.env.example`** — `npx vite-env generate` from your schema
- **Zod v4 native** — first-class support with rich type inference (enums become literal unions, optionals become `?:`)
- **Standard Schema support** — use Valibot, ArkType, or any Standard Schema-compliant validator via `defineStandardEnv()`
- **Platform presets** — pre-built schemas for Vercel, Railway, and Netlify
- **Dev-mode `.env` watching** — revalidates automatically on `.env*` file changes with HMR reload
- **Vite 8 / Rolldown native** — `moduleType: 'js'` on virtual modules, sequential hooks

## How does it compare?

`@vite-env/core` is the only Vite env tool that combines build-time validation, virtual module imports, server/client splitting, and build-time leak detection from a single `env.ts` file. If you use Next.js or need monorepo composition, [`@t3-oss/env`](https://github.com/t3-oss/t3-env) is the better fit; if you want the lightest validation with broad Vite version support, [`@julr/vite-plugin-validate-env`](https://github.com/Julr/vite-plugin-validate-env) is worth a look.

See the full comparison with feature matrix and trade-offs: **[Comparison page](https://pyyupsk.github.io/vite-env/guide/comparison.html)**

## Install

```bash
pnpm add @vite-env/core zod
pnpm add -D @vite-env/cli # optional — for check/generate/types commands
```

## Usage

### 1. Define your schema — `env.ts`

```ts
import { defineEnv } from '@vite-env/core'
import { z } from 'zod'

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
    VITE_NODE_ENV: z
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
// Client code — only client vars available
import { env } from 'virtual:env/client'

env.VITE_API_URL // string
env.VITE_DARK_MODE // boolean (not "true")
env.VITE_NODE_ENV // 'development' | 'test' | 'production'
```

```ts
// Server/SSR code — all vars available
import { env } from 'virtual:env/server'

env.DATABASE_URL // string
env.JWT_SECRET // string
env.VITE_API_URL // string (client vars also available server-side)
```

## How it works

| Section  | Available in `virtual:env/client` | Available in `virtual:env/server` |
| -------- | :-------------------------------: | :-------------------------------: |
| `client` |                Yes                |                Yes                |
| `server` |                No                 |                Yes                |

- **Validation** runs on `buildStart` (fatal) and on `.env` file changes during dev (non-fatal warning)
- **Leak detection** scans client chunks at `generateBundle` for literal server variable values
- **`VITE_` prefix** is enforced at `defineEnv()` call time for all `client` keys
- **`process.env` wins** over `.env` files (CI secrets take precedence)

## Standard Schema support

Use any Standard Schema-compliant validator instead of Zod:

```ts
import { defineStandardEnv } from '@vite-env/core'
import * as v from 'valibot'

export default defineStandardEnv({
  server: {
    DATABASE_URL: v.pipe(v.string(), v.url()),
  },
  client: {
    VITE_API_URL: v.pipe(v.string(), v.url()),
  },
})
```

Same plugin, same virtual modules, same leak detection. Zod is optional when using `defineStandardEnv()`.

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
  configFile: './env.ts', // path to env definition file
  serverEnvironments: ['ssr'], // Vite 8 environments allowed to import virtual:env/server
  onClientAccessOfServerModule: 'warn', // 'warn' | 'error' | 'stub' — default changes to 'error' in 1.0.0
})
```

## Platform Presets

Pre-built schemas for common deployment platforms — Vercel, Railway, and Netlify:

```ts
import { defineEnv } from '@vite-env/core'
import { vercel } from '@vite-env/core/presets'
import { z } from 'zod'

export default defineEnv({
  presets: [vercel],
  server: {
    DATABASE_URL: z.url(),
  },
  client: {
    VITE_API_URL: z.url(),
  },
})
```

Available presets: `vercel`, `railway`, `netlify`. Your definitions always take precedence over preset values.

## Packages

| Package                             | Description                                         |
| ----------------------------------- | --------------------------------------------------- |
| [`@vite-env/core`](./packages/core) | Vite plugin + `defineEnv()` + `defineStandardEnv()` |
| [`@vite-env/cli`](./packages/cli)   | CLI commands: `check`, `generate`, `types`          |

## Requirements

- Node.js >= 20.19.0
- Vite >= 8.0.0
- Zod >= 4.0.0 (optional — required only when using `defineEnv()`)

## License

[MIT](./LICENSE)
