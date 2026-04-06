# Installation

## Core Package

Install `@vite-env/core` along with `zod`, which is required as a peer dependency:

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
| Zod         | >= 4.0.0   |
