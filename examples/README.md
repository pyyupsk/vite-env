# Examples

Vite apps that you can run, one per feature of `@vite-env/core`. Each example has a committed `.env` with dummy values, so it runs without setup.

| Example                                | Validator                     | Shows                                                                  |
| -------------------------------------- | ----------------------------- | ---------------------------------------------------------------------- |
| [`basic`](./basic)                     | Zod (`defineEnv`)             | Server and client split, coercion, defaults, the guard, `.d.ts` output |
| [`react`](./react)                     | Zod                           | Typed env in React components                                          |
| [`ssr`](./ssr)                         | Zod                           | `virtual:env/server` in an SSR entry, `allowedServerEnvironments`      |
| [`valibot`](./valibot)                 | Valibot (`defineStandardEnv`) | A Standard Schema validator instead of Zod                             |
| [`node-script`](./node-script)         | Zod (`loadEnv`)               | Validated env in a plain Bun script, without Vite                      |
| [`presets/vercel`](./presets/vercel)   | Zod and the `vercel` preset   | Vercel platform variables                                              |
| [`presets/railway`](./presets/railway) | Zod and the `railway` preset  | Railway platform variables                                             |
| [`presets/netlify`](./presets/netlify) | Zod and the `netlify` preset  | Netlify platform variables                                             |

## Run an example

From the repo root, build the packages first. The examples use the workspace packages.

```bash
bun install
bun run build
bun run --filter @vite-env/example-basic dev
bun run --filter @vite-env/example-valibot dev
bun run --filter @vite-env/example-node-script seed
```
