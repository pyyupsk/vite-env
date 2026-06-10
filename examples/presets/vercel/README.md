# vercel preset

`presets: [vercel]` validates Vercel's injected vars (`VERCEL_ENV`, `VERCEL_URL`, deployment + git metadata) alongside your own schema. All preset vars are server-side.

```bash
bun run --filter @vite-env/example-preset-vercel dev
```
