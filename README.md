<img src="https://raw.githubusercontent.com/pyyupsk/vite-env/main/apps/docs/public/logo.svg" width="56" height="56" alt="">

# vite-env

[![npm version](https://img.shields.io/npm/v/@vite-env/core?label=)](https://www.npmjs.com/package/@vite-env/core)
[![npm downloads](https://img.shields.io/npm/dm/@vite-env/core)](https://www.npmjs.com/package/@vite-env/core)
[![Vite compatibility](https://registry.vite.dev/api/badges?package=@vite-env/core&tool=vite)](https://registry.vite.dev/)
[![Unit Test](https://github.com/pyyupsk/vite-env/actions/workflows/unit-test.yml/badge.svg)](https://github.com/pyyupsk/vite-env/actions/workflows/unit-test.yml)
[![codecov](https://codecov.io/gh/pyyupsk/vite-env/graph/badge.svg?token=KWNO78JEPM)](https://codecov.io/gh/pyyupsk/vite-env)

Typed, validated environment variables for <img src="https://cdn.simpleicons.org/vite" height="14" alt=""> Vite. You describe your variables once in `env.ts`. When Vite starts or builds, the plugin validates them. Your code then gets typed, read-only access.

[📖 Documentation](https://pyyupsk.github.io/vite-env/)

## Features

- Types come from your schema and are written to `vite-env.d.ts`
- Two virtual modules: `virtual:env/client` for browser code, `virtual:env/server` for server code
- If client code imports `virtual:env/server`, the build fails (modes `error`, `warn`, or `stub`)
- If a server value appears in a client chunk, the build fails
- When a `.env` file changes, the dev server validates the env again
- Validators: <img src="https://cdn.simpleicons.org/zod" height="14" alt=""> Zod 4 or any [Standard Schema](https://standardschema.dev) library
- Standard Schema examples: <img src="https://raw.githubusercontent.com/fabian-hiller/valibot/main/brand/valibot-icon.svg" height="14" alt=""> Valibot and <img src="https://arktype.io/image/logo.png" height="14" alt=""> ArkType
- Presets for <img src="https://cdn.simpleicons.org/vercel/000000/ffffff" height="14" alt=""> Vercel, <img src="https://cdn.simpleicons.org/railway/0B0D0E/ffffff" height="14" alt=""> Railway, and <img src="https://cdn.simpleicons.org/netlify" height="14" alt=""> Netlify variables
- `loadEnv()` for <img src="https://cdn.simpleicons.org/nodedotjs" height="14" alt=""> Node and <img src="https://cdn.simpleicons.org/bun/000000/ffffff" height="14" alt=""> Bun scripts that run outside Vite
- A CLI to check the env in CI, write `.env.example`, and regenerate types

## Install

```bash
npm install -D @vite-env/core
npm install zod # only if you use defineEnv() with Zod
npm install -D @vite-env/cli # optional, for the check, generate, and types commands
```

## Usage

Describe your variables in `env.ts`:

```ts
// env.ts
import { defineEnv } from "@vite-env/core";
import { z } from "zod";

export default defineEnv({
  server: {
    DATABASE_URL: z.url(),
    JWT_SECRET: z.string().min(32),
    DB_POOL_SIZE: z.coerce.number().int().min(1).max(100).default(10),
  },
  client: {
    VITE_API_URL: z.url(),
    VITE_DARK_MODE: z.stringbool().default(false),
    VITE_LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  },
});
```

Add the plugin. `configFile` is required:

```ts
// vite.config.ts
import ViteEnv from "@vite-env/core/plugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [ViteEnv({ configFile: "./env.ts" })],
});
```

Import the typed env:

```ts
// browser code: client keys only
import { env } from "virtual:env/client";

env.VITE_API_URL; // string
env.VITE_DARK_MODE; // boolean, not "true"
env.VITE_LOG_LEVEL; // "debug" | "info" | "warn" | "error"
```

```ts
// server code: server and client keys
import { env } from "virtual:env/server";

env.DATABASE_URL; // string
env.VITE_API_URL; // string
```

## How it works

| Block    | In `virtual:env/client` | In `virtual:env/server` |
| -------- | :---------------------: | :---------------------: |
| `client` |           Yes           |           Yes           |
| `server` |           No            |           Yes           |

- Validation runs on `buildStart` and stops the build on a bad value. In dev, a `.env` change runs it again and logs a warning.
- `process.env` wins over `.env` files, so secrets from CI take priority.
- Client keys must start with `VITE_`. Set `clientPrefix` to use a different prefix.
- Leak detection scans client chunks in `generateBundle`. It skips values shorter than 8 characters and chunks that hold only `node_modules` code. It does not find strings built at runtime, for example with `String.fromCharCode`. Use it as a second line of defense, not as your only secret check.

## Standard Schema

Use `defineStandardEnv()` with any Standard Schema validator. You do not need Zod for this path.

```ts
import { defineStandardEnv } from "@vite-env/core";
import * as v from "valibot";

export default defineStandardEnv({
  _standard: true,
  server: {
    DATABASE_URL: v.pipe(v.string(), v.url()),
  },
  client: {
    VITE_API_URL: v.pipe(v.string(), v.url()),
  },
});
```

## Platform presets

```ts
import { defineEnv } from "@vite-env/core";
import { vercel } from "@vite-env/core/presets";
import { z } from "zod";

export default defineEnv({
  presets: [vercel],
  server: { DATABASE_URL: z.url() },
});
```

The presets are `vercel`, `railway`, and `netlify`. If one of your keys has the same name as a preset key, your key wins.

## Scripts outside Vite

`virtual:env/*` only resolves inside Vite. For a seed or migration script, pass the same config to `loadEnv()`:

```ts
// scripts/seed.ts
import { loadEnv } from "@vite-env/core/load";
import config from "../env";

const { server, client } = await loadEnv(config);

server.DATABASE_URL; // string
```

## CLI

```bash
npx vite-env check     # validate the env, for example in CI
npx vite-env generate  # write .env.example from the schema
npx vite-env types     # regenerate vite-env.d.ts
```

## Packages

| Package                             | Contents                                                       |
| ----------------------------------- | -------------------------------------------------------------- |
| [`@vite-env/core`](./packages/core) | Vite plugin, `defineEnv()`, `defineStandardEnv()`, `loadEnv()` |
| [`@vite-env/cli`](./packages/cli)   | The `check`, `generate`, and `types` commands                  |

## Requirements

- Node.js 20.19.0 or later
- Vite 8.0.0 or later
- Zod 4 (for `defineEnv()` only)

## Why?

[`@t3-oss/env`](https://github.com/t3-oss/t3-env) does this job for Next.js. vite-env does it for Vite 8, from one `env.ts`. It validates at build time and gives you virtual modules to import. It also splits server and client keys and scans client chunks for leaked server values.

If you use Next.js or need env composition across a monorepo, use `@t3-oss/env`. If you want light validation that supports older Vite versions, look at [`@julr/vite-plugin-validate-env`](https://github.com/Julr/vite-plugin-validate-env).

## License

[MIT](./LICENSE) License © 2026 [pyyupsk](https://github.com/pyyupsk)
