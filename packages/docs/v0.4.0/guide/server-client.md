# Server vs Client

`vite-env` divides environment variables into two buckets — `server` and `client` — and exposes them through separate virtual modules. The split enforces a hard boundary: secrets defined in `server` can never leak into the browser bundle.

## Access matrix

| Variable type            | `virtual:env/client` | `virtual:env/server` |
| ------------------------ | :------------------: | :------------------: |
| Client (`VITE_*` prefix) |         Yes          |         Yes          |
| Server (no prefix)       |          No          |         Yes          |

The server module includes **all** validated variables — both server-only and client. The client module includes **only** the client variables.

## The `VITE_` prefix rule

Every key defined under `client` must start with `VITE_`. This is enforced at `defineEnv()` call time, before any build starts. If you define a client key without the prefix, you get an immediate startup error:

```ansi
[vite-env] Client env var "API_URL" must be prefixed with VITE_.
  Rename it to "VITE_API_URL" or move it to "server" if it's secret.
```

This mirrors Vite's own convention and makes the exposure boundary explicit — anything prefixed with `VITE_` is expected to be public.

```ts
import { defineEnv } from '@vite-env/core'
import { z } from 'zod'

export default defineEnv({
  server: {
    DATABASE_URL: z.url(), // no prefix required — server only
    JWT_SECRET: z.string().min(32),
  },
  client: {
    VITE_API_URL: z.url(), // VITE_ prefix required
    VITE_APP_NAME: z.string().min(1),
    // API_URL: z.url(),        // would throw at startup
  },
})
```

Server keys can technically carry a `VITE_` prefix, but doing so defeats the purpose: it signals a public variable while hiding it from the client module.

## TypeScript boundary enforcement

The generated `vite-env.d.ts` declares separate module types for each virtual module. If you try to access a server-only variable from the client module, TypeScript will catch it:

```ts
// In a client-side file
import { env } from 'virtual:env/client'

console.log(env.VITE_API_URL) // OK
console.log(env.DATABASE_URL) // TypeScript error:
// Property 'DATABASE_URL' does not exist on type
// '{ VITE_API_URL: string; VITE_APP_NAME: string; ... }'
```

The type error surfaces at development time, not at runtime. The client module's type only declares keys from the `client` section of your schema.

## Importing from the correct module

Use `virtual:env/client` in browser code and in any file that may be bundled for the client:

```ts
import { env } from 'virtual:env/client'

const apiUrl = env.VITE_API_URL
```

Use `virtual:env/server` in server-side code, API routes, or build scripts that run only in Node:

```ts
import { env } from 'virtual:env/server'

const dbUrl = env.DATABASE_URL
const apiUrl = env.VITE_API_URL // also available here
```

## Runtime access protection

Starting in `v0.4.0`, vite-env uses the Vite 8 Environment API to detect which environment is importing `virtual:env/server` at build time. If a disallowed environment (e.g. `client`) imports the server module, the plugin responds based on the `onClientAccessOfServerModule` option.

The default behavior (`'warn'`) prints a deprecation warning and writes a `vite-env-warnings.log` file in your project root listing every violating importer. The build exits with code 1 to signal that action is required, but artifacts are still emitted.

```ansi
[vite-env] DEPRECATION WARNING
─────────────────────────────────────────────────────────────────
virtual:env/server was imported from the "client" environment.
This will be a hard build error in 1.0.0.

To enforce now:  onClientAccessOfServerModule: 'error'
To silence:      onClientAccessOfServerModule: 'stub'

Found in: src/lib/config.ts
─────────────────────────────────────────────────────────────────
```

To opt into the strict behavior now:

```ts
ViteEnv({ onClientAccessOfServerModule: 'error' })
```

For edge runtimes that are not `ssr`, add them to `serverEnvironments`:

```ts
ViteEnv({ serverEnvironments: ['ssr', 'workerd'] })
```

See [Plugin Options](/v0.4.0/reference/plugin-options#onclientaccessofservermodule) for the full reference.
