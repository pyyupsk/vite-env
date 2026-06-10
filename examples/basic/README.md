# basic — Zod path

`defineEnv()` with Zod v4: server/client split, coercion (`z.coerce.number()`, `z.stringbool()`), defaults, optionals, and generated `vite-env.d.ts` type inference.

```bash
bun run --filter @vite-env/example-basic dev
```

What to try:

- Delete a required var from `.env` → dev server fails with a formatted validation error.
- Uncomment the `virtual:env/server` import in `src/server-guard.ts` and run `vite build` → the guard fires (`warn` mode by default; switch to `error` or `stub` in `vite.config.ts`).
- Check the generated `vite-env.d.ts` — `env.VITE_DEBUG` is `boolean`, `env.VITE_LOG_LEVEL` is the enum union.
