# valibot — Standard Schema path

`defineStandardEnv()` with Valibot. Any library implementing [Standard Schema v1](https://github.com/standard-schema/standard-schema) works the same way — ArkType, Effect Schema, etc.

```bash
bun run --filter @vite-env/example-valibot dev
```

What to try:

- Set `VITE_API_URL=not-a-url` in `.env` → dev server fails with a formatted Standard Schema issue list.
- Swap Valibot for another Standard Schema library in `env.ts` — no plugin config change needed.
