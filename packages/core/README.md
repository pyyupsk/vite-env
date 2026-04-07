# @vite-env/core

![Vite compatibility](https://registry.vite.dev/api/badges?package=@vite-env/core&tool=vite)

The `env.ts` layer for Vite — define once, validate everywhere, import with types.

- Typed virtual modules (`virtual:env/client`, `virtual:env/server`)
- Server/client split with build-time leak detection
- Runtime access protection — warns or errors when `virtual:env/server` is imported from a client environment
- Auto-coercion via Zod v4 (`z.stringbool()`, `z.coerce.number()`)
- Standard Schema support — use Valibot, ArkType, or any compliant validator
- Auto `.d.ts` generation
- Vite 8 / Rolldown native

## Install

```bash
pnpm add @vite-env/core zod
```

## Usage

**1. Define your schema** — `env.ts`

```ts
import { defineEnv } from '@vite-env/core'
import { z } from 'zod'

export default defineEnv({
  server: {
    DATABASE_URL: z.url(),
    JWT_SECRET: z.string().min(32),
  },
  client: {
    VITE_API_URL: z.url(),
    VITE_DARK_MODE: z.stringbool().default(false),
    VITE_NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
  },
})
```

**2. Add the plugin** — `vite.config.ts`

```ts
import ViteEnv from '@vite-env/core/plugin'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [ViteEnv()],
})
```

**3. Import typed env**

```ts
import { env } from 'virtual:env/client'

env.VITE_API_URL // string
env.VITE_DARK_MODE // boolean
env.VITE_NODE_ENV // 'development' | 'test' | 'production'
```

See the [full documentation](https://pyyupsk.github.io/vite-env/) for server/client split details, CLI tools, and more.

## License

[MIT](https://github.com/pyyupsk/vite-env/blob/main/LICENSE)
