# ssr

A Vite SSR app. The server entry imports `virtual:env/server` (all variables). The client entry imports `virtual:env/client` (client variables only). `allowedServerEnvironments: ['ssr']` sets which environments can import the server module. The client environment can never import it.

```bash
bun run --filter @vite-env/example-ssr dev     # dev server in middleware mode on :5173
bun run --filter @vite-env/example-ssr build   # client build and SSR build
```

Things to try:

- Open <http://localhost:5173>. The server renders `SSR_GREETING` and the `DATABASE_URL` host. The client card lists only `VITE_*` keys.
- Add `import { env } from 'virtual:env/server'` to `src/entry-client.ts`, then run `build`. The guard stops the build.
- After a build, search `dist/assets/*.js`. No server values are in it, because the leak scan runs in `generateBundle`.
