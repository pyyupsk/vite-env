<img src="https://raw.githubusercontent.com/pyyupsk/vite-env/main/apps/docs/public/logo.svg" width="48" height="48" alt="">

# @vite-env/cli

[![npm version](https://img.shields.io/npm/v/@vite-env/cli?label=)](https://www.npmjs.com/package/@vite-env/cli)

Commands for [`@vite-env/core`](https://www.npmjs.com/package/@vite-env/core) that work without a Vite build: validate the env, write `.env.example`, and regenerate types.

[📖 Documentation](https://pyyupsk.github.io/vite-env/docs/cli)

## Install

```bash
npm install -D @vite-env/cli
```

## Commands

### `vite-env check`

Validates the env against your `env.ts` schema. If a value is wrong, it exits with a non-zero code. Run it in CI before you deploy.

```bash
npx vite-env check
npx vite-env check --config ./env.ts --mode production
```

### `vite-env generate`

Writes `.env.example` from your schema, with the type and default of each key.

```bash
npx vite-env generate
npx vite-env generate --output .env.example
```

### `vite-env types`

Writes `vite-env.d.ts` from your schema without a Vite build.

```bash
npx vite-env types
```

## Options

| Flag       | Commands   | Default        | Description                              |
| ---------- | ---------- | -------------- | ---------------------------------------- |
| `--config` | all        | `env.ts`       | Path to the env definition file          |
| `--mode`   | `check`    | `development`  | Vite mode, picks the `.env.[mode]` files |
| `--output` | `generate` | `.env.example` | Output file path                         |

## License

[MIT](https://github.com/pyyupsk/vite-env/blob/main/LICENSE) License © 2026 [pyyupsk](https://github.com/pyyupsk)
