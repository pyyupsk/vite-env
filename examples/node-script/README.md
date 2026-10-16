# node-script

Shows `@vite-env/core/load`: a validated env in a plain Bun or Node script, without Vite.

## Why

`virtual:env/server` only resolves inside Vite. If you run `bun scripts/seed.ts` directly, it fails with `Cannot find module 'virtual:env/server'`.

## How

Import `loadEnv` from `@vite-env/core/load` and pass your existing `env.ts` config:

```ts
import { loadEnv } from "@vite-env/core/load";
import config from "../env";

const { server, client } = await loadEnv(config);

server.DATABASE_URL; // string, the same schema as virtual:env/server
client.VITE_APP_NAME; // string, client keys only
```

It uses the same schema as the plugin. It also reads `.env` files, but it does not know Vite's `root` or `mode`. It reads the files from the current directory, and it takes the mode from `NODE_ENV`. If you run the script from another directory, pass `envDir`. Otherwise the validation fails, because the script finds no `.env` file.

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

| Option   | Default                                 | Description                               |
| -------- | --------------------------------------- | ----------------------------------------- |
| `mode`   | `process.env.NODE_ENV ?? "development"` | Picks the `.env.[mode]` files to load     |
| `envDir` | `process.cwd()`                         | The directory that holds the `.env` files |

It returns `{ server, client, all }`:

- `server`: all variables, server and client, typed
- `client`: only the client variables, typed
- `all`: the same object as `server`

If the env is not valid, it throws `[vite-env] Validation failed` with one line per field.
