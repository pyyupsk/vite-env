# Comparison

Several tools address the gap in Vite's environment variable handling. Here is how the most common options compare.

## Overview

**`@julr/vite-plugin-validate-env`** is a Vite plugin that validates environment variables at build time. It supports multiple schema libraries via [Standard Schema](https://github.com/standard-schema/standard-schema) (Zod, Valibot, ArkType) as well as a lightweight built-in validator with zero external dependencies. Validated variables are injected into `import.meta.env` with zero runtime overhead. It works across Vite 2–8.

**`@t3-oss/env-core`** is a framework-agnostic library popularized by the T3 stack. It validates env vars at import time and provides runtime server/client access protection via a Proxy — accessing a server variable on the client throws an error. It requires mapping variables through a `runtimeEnv` or `runtimeEnvStrict` object, and supports any Standard Schema v1 validator (Zod v3/v4, Valibot, ArkType). The project ships framework-specific packages for Next.js and Nuxt, along with presets for 12+ deployment platforms (Vercel, Railway, Netlify, Render, Fly, Coolify, etc.). The `extends` system allows composing env definitions across monorepo packages.

**`@vite-env/core`** is purpose-built for Vite 8. It validates at build start, generates virtual modules (`virtual:env/client` and `virtual:env/server`) for typed imports, splits variables between server and client, scans client bundles for leaked server secrets, and generates type declarations and `.env.example` — all from a single `env.ts` file. It supports Zod v4 natively (with rich `.d.ts` type inference) and any Standard Schema-compliant validator via `defineStandardEnv()`. Runtime access protection uses Vite 8's Environment API to guard `virtual:env/server` imports from client environments.

## Feature Matrix

| Feature | `@julr/vite-plugin-validate-env` | `@t3-oss/env-core` | `@vite-env/core` |
| --- | --- | --- | --- |
| **Validation timing** | Build time (Vite `config` hook) | Import time (app startup) | Build time (Vite `buildStart` hook) |
| **Server/client split** | No | Yes (runtime Proxy) | Yes (separate virtual modules) |
| **Runtime access protection** | No | Yes (Proxy throws on misuse) | Yes (Vite 8 Environment API guard) |
| **Build-time leak scanning** | No | No | Yes (scans client chunks for server values) |
| **`virtual:env` module** | No (`import.meta.env` only) | No (returns plain object) | Yes (`virtual:env/client` + `virtual:env/server`) |
| **Auto `.d.ts` generation** | No (manual `ImportMetaEnvAugmented` setup) | No (types inferred from schema) | Yes (generates `vite-env.d.ts` automatically) |
| **Auto `.env.example`** | No | No | Yes (`npx vite-env generate`) |
| **CLI tools** | No | No | Yes (`check`, `generate`, `types`) |
| **Schema libraries** | Standard Schema + built-in validator | Standard Schema (Zod, Valibot, ArkType) | Zod v4 + Standard Schema |
| **Platform presets** | No | Yes (Vercel, Railway, Netlify, Render, Fly, + more) | Yes (Vercel, Railway, Netlify) |
| **Monorepo / extends** | No | Yes (`extends` composes multiple env objects) | No |
| **Framework adapters** | No (Vite only) | Yes (Next.js, Nuxt, core) | No (Vite only) |
| **Vite version support** | v2–v8 | N/A (framework-agnostic) | v8+ only |
| **Zod v4 native** | No (Zod via Standard Schema, typically v3) | Yes (v3 + v4 via Standard Schema) | Yes (first-class `defineEnv()` with rich type introspection) |
| **No `runtimeEnv` boilerplate** | Yes | No (required for Next.js/Nuxt tree-shaking) | Yes |
| **Dev-mode `.env` watching** | No (validates once at startup) | No (validates once at import) | Yes (watches `.env*` files, revalidates on change) |
| **Built-in validator (zero deps)** | Yes (`Schema.string()`, `Schema.number()`, etc.) | No | No |

## Trade-offs

Each tool makes different trade-offs. Choosing the right one depends on your framework, your team's needs, and what guarantees matter most.

### `@julr/vite-plugin-validate-env`

**Best for:** Projects that want build-time validation with minimal setup and zero runtime cost.

**Strengths:**

- Lightest option — validated values are injected via Vite's `define` config at build time, adding nothing to the runtime bundle.
- Built-in validator (`Schema.string()`, `Schema.number()`, etc.) requires no external schema library.
- Broadest Vite compatibility (v2–v8).
- `loadAndValidateEnv()` function works outside Vite for standalone server code.

**Gives up:**

- No server/client split. All validated variables go into `import.meta.env` equally — there's no mechanism to restrict which variables are available where.
- No virtual modules. You use `import.meta.env.VITE_*` directly, which means no named imports, no destructuring with type safety.
- No auto-generated types. You must manually set up `ImportMetaEnvAugmented` in a `.d.ts` file to get typed `import.meta.env`.
- No `.env` file watching during dev — validation runs once at plugin setup.

### `@t3-oss/env-core`

**Best for:** Multi-framework projects (Next.js, Nuxt, Vite) and monorepos that need composable env definitions.

**Strengths:**

- Runtime Proxy protection catches server variable access on the client immediately, even if TypeScript is bypassed.
- `extends` system lets you compose env definitions across monorepo packages — define shared vars once, extend in each app.
- 12+ platform presets (Vercel, Railway, Netlify, Render, Fly, Coolify, Uploadthing, Supabase, Neon, etc.) reduce boilerplate for common deployment targets.
- Framework adapters handle framework-specific concerns (Next.js `NEXT_PUBLIC_` prefix, Nuxt `NUXT_PUBLIC_` prefix) with correct tree-shaking behavior.
- `skipValidation` option allows Docker builds where env vars aren't available at build time.
- `emptyStringAsUndefined` treats `PORT=` as undefined — useful for CI defaults.

**Gives up:**

- `runtimeEnv` / `runtimeEnvStrict` requires listing every variable twice — once in the schema, once in the runtime mapping. This exists because Next.js tree-shakes `process.env` and needs explicit references. It's real boilerplate.
- Validation happens at import time (app startup), not at build time. A missing variable won't fail the build — it fails when the app boots. You can work around this by importing the env file in your framework config (`next.config.ts`, `nuxt.config.ts`).
- No build-time leak detection. Server values that accidentally end up in client chunks aren't caught by the library.
- Schema names (not values) can leak to the client bundle when server and client schemas are defined in the same file.
- No auto `.d.ts` generation or `.env.example` generation.

### `@vite-env/core`

**Best for:** Vite 8 projects that want maximum automation and build-time safety from a single schema file.

**Strengths:**

- Everything is derived from one `env.ts` — validation, virtual modules, type declarations, `.env.example`, and leak detection.
- Virtual modules (`virtual:env/client`, `virtual:env/server`) provide clean typed imports with `Object.freeze()` at runtime.
- Build-time leak scanning detects server variable values in client chunks and fails the build — a security guarantee no other tool provides.
- Runtime access protection via Vite 8's Environment API guards `virtual:env/server` imports from client environments with three modes: `'error'` (hard fail), `'warn'` (log + exit code 1), or `'stub'` (runtime throw for isomorphic files).
- Zod v4's `defineEnv()` path provides rich `.d.ts` type inference — enums become literal unions, optionals become `?:`, numbers stay `number`.
- Dev-mode `.env*` file watching revalidates automatically with HMR reload.
- Platform presets for Vercel, Railway, and Netlify.

**Gives up:**

- Vite 8+ only. Does not work with Vite 2–7, Next.js, Nuxt (without Vite), or other bundlers.
- No `extends` / monorepo composition. Each app defines its own `env.ts` independently.
- No framework adapters. It hooks directly into Vite's plugin API and assumes Vite is your build tool.
- Zod is the first-class path. Standard Schema support (`defineStandardEnv()`) works but produces less specific `.d.ts` types (all fields typed as `string` instead of inferred types).
- Fewer platform presets than t3-env (3 vs 12+).
- Leak detection skips server values shorter than 8 characters to avoid false positives — very short secrets won't be caught.

## When to use what

- **You use Vite 8 and want the most automated, secure setup** → `@vite-env/core`
- **You use Next.js, Nuxt, or multiple frameworks** → `@t3-oss/env-core`
- **You want the lightest possible validation with broad Vite support** → `@julr/vite-plugin-validate-env`
- **You have a monorepo with shared env definitions** → `@t3-oss/env-core` (for `extends`)
- **Build-time leak detection is a hard requirement** → `@vite-env/core` (only option)
