# Quick Start

Get up and running with `vite-env` in three steps.

## Step 1: Define Your Schema

Create an `env.ts` file at your project root. This file declares which environment variables your app needs, whether they belong to the server or client, and what type each one should be:

```ts [env.ts]
import { defineEnv, z } from '@vite-env/core'

export default defineEnv({
  server: {
    DATABASE_URL: z.url(),
    JWT_SECRET: z.string().min(32),
    DB_POOL_SIZE: z.coerce.number().int().min(1).max(100).default(10),
  },
  client: {
    VITE_API_URL: z.url(),
    VITE_APP_NAME: z.string().min(1),
    VITE_DEBUG: z.stringbool().default(false),
  },
})
```

Variables under `server` are kept out of the client bundle. Variables under `client` must be prefixed with `VITE_` to match Vite convention and will be available in the browser.

## Step 2: Add the Plugin

Register `ViteEnv` in your Vite config:

```ts [vite.config.ts]
import ViteEnv from '@vite-env/core/plugin'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [ViteEnv()],
})
```

By default the plugin looks for `env.ts` in the project root. You can override this with the `configFile` option:

```ts
ViteEnv({ configFile: './config/env.ts' })
```

## Step 3: Import and Use

Once the plugin is configured, import validated env values directly from the virtual modules:

```ts
// In client code (browser)
import { env } from 'virtual:env/client'

env.VITE_API_URL // string
env.VITE_DEBUG // boolean
```

```ts
// In server code (SSR, API routes)
import { env } from 'virtual:env/server'

env.DATABASE_URL // string (server-only)
env.VITE_API_URL // string (also available)
```

Both modules are `Object.freeze()`'d — values cannot be mutated at runtime.

::: tip IDE Support

Run the following command once before your first build to generate the `vite-env.d.ts` type declaration file for full autocomplete and type-checking in your editor:

```sh
npx vite-env types
```

The plugin also regenerates this file automatically on every build.

:::
