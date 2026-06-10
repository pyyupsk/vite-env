# netlify preset

`presets: [netlify]` validates Netlify's injected vars (`CONTEXT`, deploy URLs, build + commit metadata) alongside your own schema. All preset vars are server-side.

```bash
bun run --filter @vite-env/example-preset-netlify dev
```
