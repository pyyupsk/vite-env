# node-script example

Demonstrates `@vite-env/core/load` — validated env in a plain Bun/Node script, no Vite required.

## Problem

`virtual:env/server` only resolves inside Vite's module graph. Running `bun scripts/seed.ts` directly fails with `Cannot find module 'virtual:env/server'`.

## Solution

Import `loadEnv` from `@vite-env/core/load` and pass your existing `env.ts` config:

```ts
import { loadEnv } from "@vite-env/core/load";
import config from "../env";

const { server, client } = await loadEnv(config);

server.DATABASE_URL; // string — typed, same schema as virtual:env/server
client.VITE_APP_NAME; // string — only client vars
```

Same `.env` files, same schema, same validation — without Vite.

## Run

```bash
bun run seed
# or directly:
bun scripts/seed.ts
```

## API

```ts
loadEnv(config, options?)
```

| Option   | Default                                 | Description                             |
| -------- | --------------------------------------- | --------------------------------------- |
| `mode`   | `process.env.NODE_ENV ?? "development"` | Controls which `.env.[mode]` files load |
| `envDir` | `cwd()`                                 | Directory to search for `.env` files    |

Returns `{ server, client, all }`:

- `server` — all validated vars (server + client), typed
- `client` — only `VITE_*` vars, typed
- `all` — alias for `server`

Throws `[vite-env] Validation failed` with per-field messages on invalid env.
