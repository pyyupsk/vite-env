<img src="https://raw.githubusercontent.com/pyyupsk/vite-env/main/apps/docs/public/logo.svg" width="48" height="48" alt="">

# @vite-env/core

[![npm version](https://img.shields.io/npm/v/@vite-env/core?label=)](https://www.npmjs.com/package/@vite-env/core)
[![Vite compatibility](https://registry.vite.dev/api/badges?package=@vite-env/core&tool=vite)](https://registry.vite.dev/)

Typed, validated environment variables for Vite. You describe your variables once in `env.ts`. When Vite starts or builds, the plugin validates them. Your code then gets typed, read-only access.

[📖 Documentation](https://pyyupsk.github.io/vite-env/)

- Two virtual modules: `virtual:env/client` and `virtual:env/server`
- If client code imports the server module, the build fails
- If a server value appears in a client chunk, the build fails
- Validators: <img src="https://cdn.simpleicons.org/zod" height="14" alt=""> Zod 4 or any Standard Schema library
- Presets for <img src="https://cdn.simpleicons.org/vercel/000000/ffffff" height="14" alt=""> Vercel, <img src="https://cdn.simpleicons.org/railway/0B0D0E/ffffff" height="14" alt=""> Railway, and <img src="https://cdn.simpleicons.org/netlify" height="14" alt=""> Netlify
- `loadEnv()` for scripts that run outside Vite

## Install

```bash
npm install -D @vite-env/core
npm install zod # only if you use defineEnv() with Zod
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
  },
  client: {
    VITE_API_URL: z.url(),
    VITE_DARK_MODE: z.stringbool().default(false),
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
import { env } from "virtual:env/client";

env.VITE_API_URL; // string
env.VITE_DARK_MODE; // boolean
```

### Platform presets

```ts
import { defineEnv } from "@vite-env/core";
import { vercel } from "@vite-env/core/presets";
import { z } from "zod";

export default defineEnv({
  presets: [vercel],
  server: { DATABASE_URL: z.url() },
});
```

The presets are `vercel`, `railway`, and `netlify`.

### Scripts outside Vite

```ts
// scripts/seed.ts
import { loadEnv } from "@vite-env/core/load";
import config from "../env";

const { server, client } = await loadEnv(config);
```

`loadEnv()` returns `{ server, client, all }`. The optional second argument is `{ mode?, envDir? }`.

## License

[MIT](https://github.com/pyyupsk/vite-env/blob/main/LICENSE) License © 2026 [pyyupsk](https://github.com/pyyupsk)
