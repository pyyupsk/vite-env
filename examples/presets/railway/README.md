# railway preset

`presets: [railway]` validates Railway's injected vars (service/project/deployment ids, domains, TCP proxy) alongside your own schema. All preset vars are server-side.

```bash
bun run --filter @vite-env/example-preset-railway dev
```
