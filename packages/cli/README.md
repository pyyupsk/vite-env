# @vite-env/cli

CLI companion for [`@vite-env/core`](https://www.npmjs.com/package/@vite-env/core) — validate, generate, and type your Vite environment variables.

## Install

```bash
pnpm add -D @vite-env/cli
```

## Commands

### `vite-env check`

Validate environment variables against your `env.ts` schema without starting the dev server. Useful in CI pipelines.

```bash
npx vite-env check
npx vite-env check --config ./env.ts --mode production
```

### `vite-env generate`

Generate a `.env.example` file from your schema with type hints, defaults, and required flags.

```bash
npx vite-env generate
npx vite-env generate --output .env.example
```

### `vite-env types`

Regenerate `vite-env.d.ts` from your schema without running the dev server.

```bash
npx vite-env types
```

## Options

All commands accept:

| Flag       | Default  | Description                 |
| ---------- | -------- | --------------------------- |
| `--config` | `env.ts` | Path to env definition file |

`check` also accepts:

| Flag     | Default       | Description                     |
| -------- | ------------- | ------------------------------- |
| `--mode` | `development` | Vite mode for .env file loading |

`generate` also accepts:

| Flag       | Default        | Description      |
| ---------- | -------------- | ---------------- |
| `--output` | `.env.example` | Output file path |

## License

[MIT](https://github.com/pyyupsk/vite-env/blob/main/LICENSE)
