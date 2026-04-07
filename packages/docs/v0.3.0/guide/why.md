# Why vite-env

Vite's built-in environment variable handling is simple by design. For small projects that simplicity is fine. As an application grows, four problems tend to surface.

## 1. No runtime validation

With plain Vite, every environment variable is typed as `string | undefined` — regardless of whether it is required or must match a specific format.

```ts
// import.meta.env.VITE_PORT is string | undefined
const port = Number(import.meta.env.VITE_PORT)
// If VITE_PORT is missing: NaN — no error until something breaks downstream
```

A forgotten variable produces a silent wrong value or a confusing runtime crash deep inside your app, far from where the variable was read.

`vite-env` validates every variable at build start. If `VITE_PORT` is missing or not a valid number, the build stops immediately:

```ansi
[vite-env] Environment validation failed:

  VITE_PORT   Required
```

Every problem surfaces at once, before a single line of application code runs.

## 2. No server/client separation

Vite exposes any variable prefixed with `VITE_` to the client bundle. There is no built-in mechanism for server-only validated secrets — you either expose a variable or you do not use it at all.

```ts
// No way to have a validated server-only variable alongside client vars
const dbUrl = process.env.DATABASE_URL // unvalidated, no types
const apiUrl = import.meta.env.VITE_API_URL // validated by nothing
```

`vite-env` provides two separate virtual modules:

```ts
// Client code — only client variables available
import env from 'virtual:env/client'

// env.DATABASE_URL — does not exist on this type

// Server code — has access to both server and client variables
import env from 'virtual:env/server'

console.log(env.DATABASE_URL) // fully typed, validated
console.log(env.VITE_API_URL) // fully typed, validated
```

Server secrets are never included in the client module. The split is enforced by the schema, not by convention.

## 3. No leak detection

Even with good intentions, a server secret can reach client code through a shared utility, an accidental re-export, or a module that is used in both contexts. Vite has no way to catch this. The value ships to the browser silently.

```ts
// shared/config.ts — used in both server and client code
export const config = {
  dbUrl: process.env.DATABASE_URL, // accidentally bundled into client
}
```

`vite-env` scans every chunk in the client bundle during `generateBundle` and searches for the literal string values of server-only variables. If a secret value appears in any chunk, the build fails:

```ansi
[vite-env] Server environment variables detected in client bundle!

  ✗ DATABASE_URL found in assets/index-Bx92kA1.js

  These variables are marked as server-only and must never reach the browser.
```

This catches leaks that code review misses because the value is not a reference — it is the actual secret embedded in compiled output.

## 4. No type generation

The standard Vite approach to typed environment variables is a hand-maintained `env.d.ts` file:

```ts
// env.d.ts — written and updated by hand
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_PORT: string
  // developer added VITE_FEATURE_FLAG to .env but forgot this file
}
```

These files drift. Variables get added to `.env`, renamed, or removed, and the type file lags behind. TypeScript stops complaining and the mismatch goes unnoticed.

`vite-env` generates `vite-env.d.ts` from the Zod schema on every build start. The types always reflect what the schema says, including optionality, defaults, and coerced types. There is nothing to maintain by hand.
