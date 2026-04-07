# Installation

## Core Package

Install `@vite-env/core` with your preferred schema validator:

### With Zod (recommended)

::: code-group

```sh [pnpm]
pnpm add @vite-env/core zod
```

```sh [npm]
npm install @vite-env/core zod
```

```sh [yarn]
yarn add @vite-env/core zod
```

```sh [bun]
bun add @vite-env/core zod
```

:::

### With any Standard Schema validator

If you prefer Valibot, ArkType, or another [Standard Schema](https://github.com/standard-schema/standard-schema)-compliant validator, install it instead of Zod:

::: code-group

```sh [pnpm]
pnpm add @vite-env/core valibot
```

```sh [npm]
npm install @vite-env/core valibot
```

```sh [yarn]
yarn add @vite-env/core valibot
```

```sh [bun]
bun add @vite-env/core valibot
```

:::

## CLI (Optional)

The `@vite-env/cli` package provides the `vite-env` command for type generation and validation checks outside of the Vite build process. Install it as a dev dependency:

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

## Requirements

| Requirement | Version    |
| ----------- | ---------- |
| Node.js     | >= 20.19.0 |
| Vite        | >= 8.0.0   |
| Zod         | >= 4.0.0 (optional — only for `defineEnv()`) |

When using `defineStandardEnv()`, install your preferred Standard Schema-compliant validator (Valibot, ArkType, etc.) instead of Zod. Any version that implements the [Standard Schema](https://github.com/standard-schema/standard-schema) spec works.
