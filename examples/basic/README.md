# basic

`defineEnv()` with Zod 4. It shows the server and client split, coercion (`z.coerce.number()`, `z.stringbool()`), defaults, optional keys, and the generated `vite-env.d.ts`.

```bash
bun run --filter @vite-env/example-basic dev
```

Things to try:

- Start the dev server without a required variable, for example `JWT_SECRET`. The server does not start, and it prints the validation error. If you change `.env` while the server runs, Vite restarts it, and the same check runs again.
- In `src/server-guard.ts`, uncomment `import "virtual:env/server"`, then run `bun run build`. The build stops with `virtual:env/server is not available in the "client" environment`.
- Set `onClientAccessOfServerModule: "warn"` in `vite.config.ts` and build again. The guard prints a warning instead of an error. The build still stops, because the leak scan finds `DATABASE_URL` and `JWT_SECRET` in the client chunk.
- Open the generated `vite-env.d.ts`. `env.VITE_DEBUG` is a `boolean`, and `env.VITE_LOG_LEVEL` is a union of the enum values.

The import in `src/server-guard.ts` has no bindings on purpose. If you write `import { env } from "virtual:env/server"` and do not use `env`, TypeScript removes the import, and the guard never sees it.
