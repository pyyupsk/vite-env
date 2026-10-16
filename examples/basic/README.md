# basic

`defineEnv()` with Zod 4. It shows the server and client split, coercion (`z.coerce.number()`, `z.stringbool()`), defaults, optional keys, and the generated `vite-env.d.ts`.

```bash
bun run --filter @vite-env/example-basic dev
```

Things to try:

- Delete a required variable from `.env`. The dev server stops and prints the validation error.
- Uncomment the `virtual:env/server` import in `src/server-guard.ts`, then run `vite build`. The guard reports the import. This example sets `onClientAccessOfServerModule: "warn"` in `vite.config.ts`. Change it to `"error"` or `"stub"` to see the other modes.
- Open the generated `vite-env.d.ts`. `env.VITE_DEBUG` is a `boolean`, and `env.VITE_LOG_LEVEL` is a union of the enum values.
