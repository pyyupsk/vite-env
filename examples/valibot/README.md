# valibot

`defineStandardEnv()` with Valibot. Any library that implements [Standard Schema v1](https://github.com/standard-schema/standard-schema) works the same way, for example ArkType or Effect Schema.

```bash
bun run --filter @vite-env/example-valibot dev
```

Things to try:

- Set `VITE_API_URL=not-a-url` in `.env`. The dev server stops and lists the Standard Schema issues.
- Replace Valibot with another Standard Schema library in `env.ts`. You do not need to change the plugin configuration.
