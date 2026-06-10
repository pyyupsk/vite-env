# ssr — server/client split for real

Vite SSR app where the server entry imports `virtual:env/server` (all vars) and the client entry imports `virtual:env/client` (client subset only). The `serverEnvironments: ['ssr']` option gates who may touch the server module — the client environment is always blocked.

```bash
bun run --filter @vite-env/example-ssr dev     # middleware-mode dev server on :5173
bun run --filter @vite-env/example-ssr build   # client build + SSR build
```

What to try:

- Open http://localhost:5173 — `SSR_GREETING` and the `DATABASE_URL` host render server-side; the client card lists only `VITE_*` keys.
- Add `import { env } from 'virtual:env/server'` to `src/entry-client.ts` and run `build` → guard fires.
- Inspect `dist/assets/*.js` after build — no server values present (leak scan runs in `generateBundle`).
