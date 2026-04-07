# Env Priority

When `vite-env` loads environment variables, multiple sources are merged together. The following table shows which source wins when the same key exists in more than one place:

| Priority    | Source              | Description                     |
| ----------- | ------------------- | ------------------------------- |
| 1 (highest) | `process.env`       | System/CI environment variables |
| 2           | `.env.[mode].local` | Mode-specific local overrides   |
| 3           | `.env.[mode]`       | Mode-specific variables         |
| 4           | `.env.local`        | Local overrides                 |
| 5 (lowest)  | `.env`              | Default variables               |

Higher priority always wins. If `DATABASE_URL` is defined in both `.env` and `process.env`, the `process.env` value is used.

## Why `process.env` wins

System environment variables and CI pipeline secrets are always applied last, so they override any file-based configuration. This means you can deploy the same codebase to multiple environments by setting variables at the system level without touching any `.env` files.

## All variables are loaded

`vite-env` calls Vite's `loadEnv()` with an empty prefix (`''`). Vite's default behavior is to only load variables that start with `VITE_`, but the empty prefix disables that filter and loads everything from the `.env` files. Your Zod schema then determines which variables are actually validated and exposed — not the prefix.

## Local files should be gitignored

`.env.local` and `.env.[mode].local` are intended for machine-specific overrides that should never be committed to source control. Add them to your `.gitignore`:

```ansi
.env.local
.env.*.local
```

## Mode

`[mode]` corresponds to Vite's mode, which defaults to `development` during `vite dev` and `production` during `vite build`. You can override it with the `--mode` flag:

```sh
vite build --mode staging
```

With `--mode staging`, Vite will load `.env.staging` and `.env.staging.local` in addition to `.env` and `.env.local`.
