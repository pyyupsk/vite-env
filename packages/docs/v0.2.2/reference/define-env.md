# defineEnv()

`defineEnv` is the entry point for declaring your environment schema. It validates your definition at call time and returns it unchanged, preserving the exact type for downstream inference.

## Signature

```ts
function defineEnv<T extends EnvDefinition>(definition: T): T
```

## EnvDefinition

```ts
interface EnvDefinition {
  server?: z.ZodRawShape
  client?: z.ZodRawShape
}
```

Both properties are optional. Each is a Zod raw shape — a plain object where every value is a Zod schema.

```ts
import { defineEnv, z } from '@vite-env/core'

export default defineEnv({
  server: {
    DATABASE_URL: z.url(),
    JWT_SECRET: z.string().min(32),
  },
  client: {
    VITE_API_URL: z.url(),
    VITE_APP_NAME: z.string().min(1),
  },
})
```

## VITE\_ Prefix Enforcement

All keys in `client` must start with `VITE_`. This matches Vite's own convention for browser-exposed variables and is enforced immediately when `defineEnv` is called — before any build step runs.

If a key is missing the prefix, `defineEnv` throws:

```ansi
[vite-env] Client env var "API_URL" must be prefixed with VITE_.
  Rename it to "VITE_API_URL" or move it to "server" if it's secret.
```

There is no equivalent restriction on `server` keys.

## Return Value

`defineEnv` returns the definition object unchanged. It is an identity function with a validation side-effect. Its only purpose at runtime is the prefix check — the return value is the same reference passed in.

The generic `T` preserves the exact literal shape of the definition, which is required for accurate type inference with `InferClientEnv` and `InferServerEnv`.

## Type Inference

Use the exported helper types to derive typed env shapes from your definition:

```ts
import type { InferClientEnv, InferServerEnv } from '@vite-env/core'
import env from './env'

type ClientEnv = InferClientEnv<typeof env>
// { VITE_API_URL: string; VITE_APP_NAME: string }

type ServerEnv = InferServerEnv<typeof env>
// { DATABASE_URL: string; JWT_SECRET: string; VITE_API_URL: string; VITE_APP_NAME: string }
```

`InferClientEnv` infers only the `client` shape. `InferServerEnv` infers the combined `server` and `client` shape, which matches what the `virtual:env/server` module exposes.

### Type Signatures

```ts
type InferClientEnv<T extends EnvDefinition> = z.infer<
  z.ZodObject<OrEmptyShape<T['client']>>
>

type InferServerEnv<T extends EnvDefinition> = z.infer<
  z.ZodObject<OrEmptyShape<T['server']> & OrEmptyShape<T['client']>>
>
```

## validateEnv()

`validateEnv` is the lower-level function used internally by the plugin. It is exported for testing or programmatic use.

```ts
function validateEnv(
  def: EnvDefinition,
  rawEnv: Record<string, string>,
): ValidationResult
```

It merges `server` and `client` shapes into a single Zod object schema and runs `safeParse` against the provided raw environment.

### ValidationResult

```ts
type ValidationResult =
  | { success: true; data: Record<string, unknown>; errors: [] }
  | { success: false; data: null; errors: z.core.$ZodIssue[] }
```

On success, `data` contains the validated and coerced values. On failure, `errors` contains the Zod issue list and `data` is `null`.

```ts
import { defineEnv, validateEnv, z } from '@vite-env/core'

const def = defineEnv({
  server: { PORT: z.coerce.number().default(3000) },
})

const result = validateEnv(def, process.env as Record<string, string>)

if (result.success) {
  console.log(result.data.PORT) // number
} else {
  console.error(result.errors)
}
```
