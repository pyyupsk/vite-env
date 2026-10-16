# presets

Platform presets from `@vite-env/core/presets`. A preset is a typed set of the server variables that a platform sets. Add it with `presets: [...]` in `defineEnv`. If one of your keys has the same name as a preset key, your key wins.

| Example                | Preset    | Validates                                                |
| ---------------------- | --------- | -------------------------------------------------------- |
| [`vercel`](./vercel)   | `vercel`  | `VERCEL_ENV`, `VERCEL_URL`, deployment and git data      |
| [`railway`](./railway) | `railway` | Service, project, and deployment IDs, domains, TCP proxy |
| [`netlify`](./netlify) | `netlify` | `CONTEXT`, deploy URLs, build and commit data            |

Each preset looks for the platform's marker variable (`VERCEL=1`, `RAILWAY_ENVIRONMENT_ID`, `NETLIFY=true`). On the platform, the required preset variables must be set. Everywhere else every preset variable is optional, so `vite dev` works without fake platform values. If you define a key with the same name, your schema applies on every machine.
