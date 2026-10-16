# ssr

A Vite SSR app. The server entry imports `virtual:env/server` (all variables). The client entry imports `virtual:env/client` (client variables only).

The server entry needs no plugin option. Vite 8 marks the `ssr` environment with `consumer: "server"`, and the plugin lets every server environment import `virtual:env/server`. The client environment cannot import it, unless you add `"client"` to `allowedServerEnvironments`.

```bash
bun run --filter @vite-env/example-ssr dev     # dev server in middleware mode on :5173
bun run --filter @vite-env/example-ssr build   # client build to dist/client, SSR build to dist/server
```

Things to try:

- Open <http://localhost:5173>. The server renders `SSR_GREETING` and the `DATABASE_URL` host. The client card lists only `VITE_*` keys.
- Add `import "virtual:env/server";` to `src/entry-client.ts`, then run `build`. The guard stops the client build.
- After a build, search `dist/client/assets/*.js` for `example-secret`. It is not there, because the leak scan checks every client chunk in `generateBundle`.
- Search `dist/server/entry-server.js` for `example-secret`. It is there. By default (`serverRuntime: "build-time"`), the server values are written into the server bundle. To read them from `process.env` at runtime instead, set `serverRuntime: "process-env"`. In that mode, the values are raw strings, so `coerce` and `default` do not apply.

The two builds write to different folders. If both use `dist`, the SSR build empties the folder and deletes the client build.
