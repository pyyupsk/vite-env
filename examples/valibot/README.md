# valibot

`defineStandardEnv()` with Valibot. Any library that implements [Standard Schema v1](https://github.com/standard-schema/standard-schema) works the same way, for example ArkType or Effect Schema.

```bash
bun run --filter @vite-env/example-valibot dev
```

Things to try:

- Set `VITE_API_URL=not-a-url` in `.env`. Vite restarts the dev server, the validation fails, and the server lists the Standard Schema issues. It stays down until you fix the value.
- Replace Valibot with another Standard Schema library in `env.ts`. You do not need to change the plugin configuration.
- Open the generated `vite-env.d.ts`. Every key is a `string`. Standard Schema gives no type information at runtime, so the plugin cannot write the output type of a schema. If a schema transforms a value to a number or a boolean, the type is still `string`.
