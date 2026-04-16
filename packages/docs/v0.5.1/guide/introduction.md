# Introduction

`vite-env` is a Vite plugin that replaces ad-hoc `import.meta.env` access with a validated, type-safe environment layer. You define your variables once in an `env.ts` file using Zod or any [Standard Schema](https://github.com/standard-schema/standard-schema)-compliant validator (Valibot, ArkType, etc.), and the plugin handles validation, virtual module generation, and type declaration output on every build.

## The problem

Vite exposes environment variables as untyped strings on `import.meta.env`. There is no built-in way to:

- Confirm a required variable is actually set before the app starts
- Prevent server secrets from reaching the client bundle
- Keep TypeScript types in sync with what `.env` actually contains

`vite-env` solves all three.

## Defining your environment

Everything starts from a single `env.ts` file at the root of your project:

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
    VITE_DEBUG: z.stringbool().default(false),
    VITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    VITE_NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
  },
})
```

`defineEnv()` takes two sections:

### `server`

Keys in `server` hold secrets and infrastructure values that must never reach the browser — things like `DATABASE_URL` and `JWT_SECRET`. They have no naming restriction. These variables are available only via `virtual:env/server`, which is a server-side import. Any attempt to import that module in client code will fail at bundle time.

### `client`

Keys in `client` are exposed to both the client bundle and server code. Every key **must** be prefixed with `VITE_` — `defineEnv` throws at startup if one is not. This mirrors Vite's own convention and makes the exposure boundary explicit.

Client variables are available via `virtual:env/client`.

## What happens at build time

When Vite starts (dev server or production build), the plugin runs through this sequence:

1. Loads your `env.ts` definition
2. Reads all `.env` files using Vite's standard env loading rules
3. Validates every variable against your schema — if anything is missing or invalid, the build fails immediately with a formatted error listing every problem
4. Generates `vite-env.d.ts` in your project root with TypeScript types (rich inference with Zod, `string` fallback with Standard Schema)
5. Makes `virtual:env/client` and `virtual:env/server` available as importable modules with fully typed, validated values

You never access a variable that failed validation. You never drift out of sync with your types.

## Platform presets

Deploying to Vercel, Railway, or Netlify? Instead of manually defining every platform-injected variable, use a preset:

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

Presets provide validated, typed schemas for all platform environment variables. Your definitions always win over preset values. See [Platform Presets](/v0.5.1/guide/platform-presets) for details.

---

Ready to add it to a project? See [Quick Start](/v0.5.1/guide/quick-start).
