# CLI Overview

`@vite-env/cli` provides the `vite-env` command for validating environment variables, generating `.env.example` files, and regenerating type declarations — all without starting the Vite dev server.

## Installation

::: code-group

```sh [pnpm]
pnpm add -D @vite-env/cli
```

```sh [npm]
npm install -D @vite-env/cli
```

```sh [yarn]
yarn add -D @vite-env/cli
```

```sh [bun]
bun add -D @vite-env/cli
```

:::

## Commands

| Command             | Description                                                    |
| ------------------- | -------------------------------------------------------------- |
| `vite-env check`    | Validate environment variables without starting the dev server |
| `vite-env generate` | Generate `.env.example` from your schema                       |
| `vite-env types`    | Regenerate `vite-env.d.ts` type declarations                   |

All commands read from `env.ts` by default. Pass a custom path as the first argument to use a different config file:

```sh
vite-env check path/to/env.ts
vite-env generate path/to/env.ts
vite-env types path/to/env.ts
```
