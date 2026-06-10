# Examples

Runnable Vite apps demonstrating `@vite-env/core`. Each example ships a committed `.env` with dummy values so it works out of the box.

| Example                                      | Validation path                                    | Shows                                                              |
| -------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------ |
| [`basic`](./basic)                           | Zod (`defineEnv`)                                  | Server/client split, coercion, defaults, guard, `.d.ts` generation |
| [`react`](./react)                           | Zod                                                | Typed env in React components                                      |
| [`ssr`](./ssr)                               | Zod                                                | `virtual:env/server` in a real SSR entry, `serverEnvironments`     |
| [`valibot`](./valibot)                       | Standard Schema (`defineStandardEnv`) with Valibot | Bring-your-own validator via Standard Schema v1                    |
| [`presets/vercel`](./presets/vercel)         | Zod + `vercel` preset                              | Validating Vercel's injected platform vars                         |
| [`presets/railway`](./presets/railway)       | Zod + `railway` preset                             | Validating Railway's injected platform vars                        |
| [`presets/netlify`](./presets/netlify)       | Zod + `netlify` preset                             | Validating Netlify's injected platform vars                        |

## Running

From the repo root:

```bash
bun install
bun run build   # build packages first — examples resolve workspace deps
bun run --filter @vite-env/example-basic dev
bun run --filter @vite-env/example-valibot dev
```
