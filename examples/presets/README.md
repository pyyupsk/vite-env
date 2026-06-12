# presets

Platform presets from `@vite-env/core/presets`. Each preset is a typed bundle of the platform's injected server vars — spread into `defineEnv` via `presets: [...]` and merged before your own keys (your keys win on conflict).

| Example                | Preset    | Validates                                             |
| ---------------------- | --------- | ----------------------------------------------------- |
| [`vercel`](./vercel)   | `vercel`  | `VERCEL_ENV`, `VERCEL_URL`, deployment + git metadata |
| [`railway`](./railway) | `railway` | service/project/deployment ids, domains, TCP proxy    |
| [`netlify`](./netlify) | `netlify` | `CONTEXT`, deploy URLs, build + commit metadata       |

Presets are detection-gated: vars are required on the platform (marker var present — `VERCEL=1`, `RAILWAY_ENVIRONMENT_ID`, `NETLIFY=true`) and optional locally, so plain `vite dev` works without faking platform vars.
