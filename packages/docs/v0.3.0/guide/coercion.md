# Type Coercion

Environment variables are always strings when read from `.env` files or `process.env`. Zod lets you coerce them into the proper runtime types so your code works with numbers, booleans, and enums directly — no manual parsing required.

The examples on this page come from the playground schema.

## Numbers

Use `z.coerce.number()` to convert a string to a number. Add `.int()`, `.min()`, and `.max()` to constrain the value:

```ts
DB_POOL_SIZE: z.coerce.number().int().min(1).max(100).default(10)
// "10" → 10  (number, not string)
// ""   → uses default: 10
// "0"  → validation error: too small
```

The `.default()` value is used when the variable is absent from the environment entirely.

## Booleans

Use `z.stringbool()` for boolean flags. It accepts the full range of common truthy and falsy string representations:

```ts
VITE_DEBUG: z.stringbool().default(false)
```

Accepted values (case-insensitive):

| Truthy   | Falsy     |
| -------- | --------- |
| `"true"` | `"false"` |
| `"1"`    | `"0"`     |
| `"yes"`  | `"no"`    |
| `"on"`   | `"off"`   |

Any other string fails validation. The output is an actual `boolean`, not a string.

## Enums

Use `z.enum()` to restrict a variable to a fixed set of values. TypeScript infers a union type from the tuple:

```ts
VITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info')
// TypeScript type: 'debug' | 'info' | 'warn' | 'error'
// "verbose" → validation error: invalid enum value
```

```ts
VITE_NODE_ENV: z.enum(['development', 'test', 'production']).default(
  'development',
)
```

Enums pair well with `.default()` so you always have a sensible fallback without requiring every developer to set the variable in their `.env.local`.

## URLs

Use `z.url()` to validate that a string is a well-formed URL:

```ts
DATABASE_URL: z.url()
VITE_API_URL: z.url()
// "not-a-url" → validation error: invalid url
// "https://api.example.com" → passes
```

The validated value remains a string — `z.url()` validates format, it does not transform the value into a `URL` object.

## Optional variables

Use `.optional()` for variables that may be absent. No default is applied — the value is `undefined` when the variable is not set:

```ts
REDIS_URL: z.url().optional()
// present and valid → string
// absent           → undefined
```

This is useful for optional integrations that your code checks for at runtime:

```ts
import { env } from 'virtual:env/server'

if (env.REDIS_URL) {
  // connect to Redis
}
```

## Combining coercions

Coercions compose with other Zod methods. A variable can be coerced, constrained, defaulted, and made optional in a single chain:

```ts
DB_POOL_SIZE: z.coerce.number().int().min(1).max(100).default(10)
```

Zod runs the chain left to right: coerce the string to a number, assert it is an integer, check the range, then apply the default if the input was absent.
