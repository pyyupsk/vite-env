# Plugin Options

The `ViteEnv` plugin accepts an optional options object. It is intentionally minimal.

## Usage

```ts [vite.config.ts]
import ViteEnv from '@vite-env/core/plugin'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [ViteEnv(options)],
})
```

## ViteEnvOptions

| Option                         | Type                          | Default      | Description                                                                  |
| ------------------------------ | ----------------------------- | ------------ | ---------------------------------------------------------------------------- |
| `configFile`                   | `string`                      | `'./env.ts'` | Path to the env definition file, relative to the Vite root                   |
| `serverEnvironments`           | `string[]`                    | `['ssr']`    | Vite 8 environment names allowed to import `virtual:env/server`              |
| `onClientAccessOfServerModule` | `'warn' \| 'error' \| 'stub'` | `'warn'`     | Behavior when `virtual:env/server` is imported from a disallowed environment |

### configFile

```ts
ViteEnv({ configFile: './config/env.ts' })
```

The path is resolved relative to `config.root` (your Vite project root, which defaults to `process.cwd()`). If the file cannot be found or loaded, the build fails immediately with a clear error pointing to the expected path.

### serverEnvironments

```ts
ViteEnv({ serverEnvironments: ['ssr', 'workerd'] })
```

A list of Vite 8 environment names treated as server-side. Defaults to `['ssr']`. This controls two things:

1. **Import access** — environments in this list are permitted to import `virtual:env/server`. Others are subject to `onClientAccessOfServerModule`.
2. **Leak detection** — the bundle scanner is skipped entirely for environments in this list, since their output never reaches the browser.

Common additions:

- Cloudflare Workers: `'workerd'`
- React Server Components: `'rsc'`
- Deno Deploy: `'ssr'` (already included by default)

### onClientAccessOfServerModule

```ts
ViteEnv({ onClientAccessOfServerModule: 'error' })
```

Controls what happens when `virtual:env/server` is imported from an environment not in `serverEnvironments`.

| Value     | Behavior                                                                                                  |
| --------- | --------------------------------------------------------------------------------------------------------- |
| `'warn'`  | Prints a deprecation warning to the terminal and writes `vite-env-warnings.log`. Build exits with code 1. |
| `'error'` | Throws a hard build error. No artifacts are emitted.                                                      |
| `'stub'`  | Returns a module that throws at runtime if the import actually executes.                                  |

The default is `'warn'` in the 0.x release series. **It will change to `'error'` in 1.0.0.**

Use `'stub'` for testing environments (e.g. Vitest `jsdom`) or framework isomorphic files where the import exists but the code path is never reached on the client.

## Why So Few Options?

vite-env is opinionated by design. The surface area is small on purpose.

### No onError callback

There is no `onError` hook and no way to suppress or intercept validation failures. This is intentional:

- **During builds**, validation failure is always fatal. A build that succeeds with missing or invalid environment variables would produce a broken artifact. There is no situation where "continue anyway" is the right choice in production.
- **During dev**, validation failure is always a non-fatal warning. The dev server keeps running so that a typo in a `.env` file doesn't force you to restart everything — you fix the value and the server revalidates automatically.

These two behaviors cover the only two cases that matter. Making them configurable would just mean giving users a way to shoot themselves in the foot: silencing build errors or crashing dev servers on minor misconfigurations.

If your use case genuinely requires custom error handling, use `validateEnv` directly and integrate it into your own Vite plugin.
