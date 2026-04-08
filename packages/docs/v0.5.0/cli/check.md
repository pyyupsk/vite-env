# `vite-env check`

Validate environment variables against your schema without starting the Vite dev server.

## Usage

```sh
vite-env check [config] [--mode <mode>]
```

## Arguments

| Argument | Type   | Default       | Description                       |
| -------- | ------ | ------------- | --------------------------------- |
| `config` | string | `env.ts`      | Path to env definition file       |
| `--mode` | string | `development` | Vite mode for `.env` file loading |

## Behavior

The command loads environment variables using the same priority as the plugin: `.env` files are read first, then `process.env` values overlay them (so CI secrets always win). The merged set is then validated against your Zod schema.

- Exit code `0` — all variables passed validation
- Exit code `1` — validation failed or the config file could not be loaded

## CI/CD Example

Use `vite-env check` in CI to catch missing or invalid environment variables before your app starts.

```yaml [.github/workflows/ci.yml]
- name: Validate environment
  run: npx vite-env check --mode production
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    JWT_SECRET: ${{ secrets.JWT_SECRET }}
    VITE_API_URL: ${{ vars.VITE_API_URL }}
    VITE_APP_NAME: ${{ vars.VITE_APP_NAME }}
```

Because `process.env` takes priority over `.env` files, any variable you inject via CI secrets will override what is on disk — no special handling needed.
