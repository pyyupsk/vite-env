# vercel preset

`presets: [vercel]` validates the variables that Vercel sets (`VERCEL_ENV`, `VERCEL_URL`, deployment and git data) together with your own schema. All preset variables are server-only.

```bash
bun run --filter @vite-env/example-preset-vercel dev
```
