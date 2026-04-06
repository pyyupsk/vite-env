# How It Works

`vite-env` integrates with Vite's plugin lifecycle to load, validate, and expose your environment variables as typed virtual modules. Here is what happens at each stage.

## Plugin Lifecycle

### 1. `configResolved` — Load the Definition File

When Vite resolves its configuration, the plugin loads your `env.ts` definition file using [`jiti`](https://github.com/unjs/jiti), which supports TypeScript natively without a separate compilation step. The file path is resolved relative to Vite's `root` option (your project root by default).

If the file cannot be found or fails to parse, the plugin throws immediately with a helpful error message pointing to the expected location.

### 2. `buildStart` — Validate and Generate Types

At the start of every build (including dev server startup), the plugin:

1. Merges environment sources in priority order (see [Source Priority](#source-priority) below).
2. Runs the merged values through your Zod schema via `validateEnv`.
3. Generates `vite-env.d.ts` in your project root for IDE support.

In a production build, validation failure is fatal — the build stops with a formatted error listing every invalid field. In dev mode (via `configureServer`), validation failure logs a warning without crashing the server.

### 3. `resolveId` / `load` — Serve Virtual Modules

The plugin intercepts two module IDs:

| Import               | Contents                        |
| -------------------- | ------------------------------- |
| `virtual:env/client` | Only `VITE_`-prefixed variables |
| `virtual:env/server` | All validated variables         |

Both modules export a single `env` object that is wrapped in `Object.freeze()` to prevent runtime mutation.

### 4. `generateBundle` — Detect Server Leaks

After bundling client code, the plugin scans every chunk in the output bundle for string literals that match server-only variable values. If any server secret appears verbatim in client code, the build fails with a detailed error listing the key and the chunk it was found in.

To reduce false positives, values shorter than 8 characters are skipped (short strings like `"true"` or `"10"` are too common to flag reliably). A warning is logged for any skipped keys.

This check is skipped entirely for SSR builds (`config.build.ssr === true`).

### 5. `configureServer` (Dev Only) — Watch and Reload

In dev mode, the plugin watches all `.env*` files in your `envDir`. When any of them changes:

1. A 150ms debounce timer is started to coalesce rapid successive writes.
2. The sources are reloaded and revalidated against your schema.
3. On success, both virtual modules are invalidated and a full HMR reload is triggered.
4. On failure, a warning is logged and the previous validated state is kept — the dev server keeps running.

## Source Priority

Environment variables are merged from multiple sources. Higher entries in the list win:

| Priority    | Source                                         |
| ----------- | ---------------------------------------------- |
| 1 (highest) | `process.env` — CI pipeline secrets always win |
| 2           | `.env.[mode].local`                            |
| 3           | `.env.[mode]`                                  |
| 4           | `.env.local`                                   |
| 5 (lowest)  | `.env`                                         |

Vite's `loadEnv` is called with an empty prefix (`''`), which means **all** variables are loaded from `.env` files — not just `VITE_`-prefixed ones. Your Zod schema is what determines which variables are required and how they are typed. This makes it possible to validate server-only secrets (like `DATABASE_URL`) that would otherwise be filtered out by Vite's default prefix behaviour.
