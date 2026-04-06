# Comparison

Several tools address the gap in Vite's environment variable handling. Here is how the most common options compare.

**`@julr/vite-plugin-validate-env`** is a Vite plugin that validates environment variables at build time. It supports multiple schema libraries via [Standard Schema](https://github.com/standard-schema/standard-schema) (Zod, Valibot, ArkType) as well as a lightweight built-in validator. Validated variables are injected into `import.meta.env` with zero runtime overhead.

**`@t3-oss/env-core`** is a framework-agnostic library popularized by the T3 stack. It validates env vars at import time and provides runtime server/client access protection via a Proxy — accessing a server variable on the client throws an error. It requires mapping variables through a `runtimeEnv` or `runtimeEnvStrict` object, and supports Standard Schema validators (Zod, Valibot, ArkType). The project also ships framework-specific packages for Next.js and Nuxt, along with presets for common platforms (Vercel, Railway, Netlify, etc.).

**`@vite-env/core`** is purpose-built for Vite. It validates at build start, generates virtual modules for typed imports, splits variables between server and client, scans client bundles for leaked server secrets, and generates type declarations — all from a single `env.ts` file.

## Feature Matrix

| Feature                     | `@julr/vite-plugin-validate-env` | `@t3-oss/env-core`           | `@vite-env/core`               |
| --------------------------- | -------------------------------- | ---------------------------- | ------------------------------ |
| Validation on startup       | Yes (build time)                 | Yes (import time)            | Yes (build time)               |
| Server/client split         | No                               | Yes (runtime Proxy)          | Yes (separate virtual modules) |
| Runtime access protection   | No                               | Yes (Proxy throws on misuse) | No (enforced via TypeScript)   |
| Build-time leak scanning    | No                               | No                           | Yes (scans client chunks)      |
| `virtual:env` module        | No                               | No                           | Yes                            |
| Auto type generation        | No                               | No                           | Yes                            |
| Auto `.env.example`         | No                               | No                           | Yes                            |
| CLI tools                   | No                               | No                           | Yes                            |
| Schema libraries            | Standard Schema + built-in       | Standard Schema              | Zod v4                         |
| Platform presets            | No                               | Yes (Vercel, Railway, etc.)  | No                             |
| Vite 8 native               | Yes                              | N/A (framework-agnostic)     | Yes                            |
| Zod v4 native               | No (Zod v3)                      | Yes (v3 + v4)                | Yes                            |
| No `runtimeEnv` boilerplate | Yes                              | No                           | Yes                            |

## Trade-offs

Each tool makes different trade-offs:

- **`@julr/vite-plugin-validate-env`** is the lightest option — build-time validation with zero runtime cost, broad Vite version support (v2–v8), and multiple schema library choices. It does not separate server/client variables or provide virtual modules.

- **`@t3-oss/env-core`** offers the strongest runtime protection with its Proxy-based access control — accessing a server variable on the client throws immediately. The `runtimeEnv` mapping is extra work, but it gives you explicit control over what gets exposed. Platform presets reduce boilerplate for common deployment targets. It works with any framework, not just Vite.

- **`@vite-env/core`** automates the most — type generation, `.env.example`, virtual modules, and build-time leak scanning all happen from a single schema file. The trade-off is that it is Vite-specific and uses Zod v4 exclusively.
