# netlify preset

`presets: [netlify]` validates the variables that Netlify sets (`CONTEXT`, deploy URLs, build and commit data) together with your own schema. All preset variables are server-only.

```bash
bun run --filter @vite-env/example-preset-netlify dev
```
