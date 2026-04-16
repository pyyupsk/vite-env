# Zod v4 Patterns

Practical Zod v4 patterns for environment variable schemas. All examples assume the following import:

```ts
import { defineEnv } from '@vite-env/core'
import { z } from 'zod'
```

::: tip Zod v4 error parameter
Zod v4 uses `error` instead of `message` for custom error messages in `.refine()` and `.superRefine()`. Using `message` will have no effect.
:::

## Required String

```ts
API_KEY: z.string().min(1)
```

Accepts any non-empty string. Rejects an empty string `""`.

## URL

```ts
VITE_API_URL: z.url()
```

Validates URL format. This is Zod v4 shorthand for `z.string().url()`. Rejects strings that are not valid URLs.

## String Boolean

```ts
VITE_DEBUG: z.stringbool()
```

Accepts `"true"`, `"false"`, `"1"`, `"0"`, `"yes"`, `"no"`, `"on"`, `"off"` (case-insensitive) and coerces them to a JavaScript `boolean`. Useful for feature flags that are set as strings in `.env` files.

## Coerced Number

```ts
PORT: z.coerce.number()
```

Converts the string value to a number. Rejects values that cannot be parsed as a number (e.g. `"abc"`).

## Constrained Number

```ts
DB_POOL_SIZE: z.coerce.number().int().min(1).max(100)
```

Converts to number, then enforces: must be an integer, at least `1`, at most `100`. All constraints are checked after coercion.

## Enum

```ts
LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error'])
```

Accepts exactly one of the listed string values. Rejects anything else, including values that are close but not exact (e.g. `"DEBUG"`).

## Optional

```ts
SENTRY_DSN: z.string().optional()
```

The variable does not need to be set. Produces `undefined` when absent. Useful for variables that are only needed in specific environments.

## Default Value

```ts
LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info')
```

Uses the default when the variable is not set. The inferred type is `string` (not `string | undefined`) because a value is always present after parsing.

## Custom Validation

```ts
OPENAI_API_KEY: z.string().refine((val) => val.startsWith('sk-'), {
  error: 'Must start with sk-',
})
```

Runs an arbitrary predicate after basic type checks pass. The `error` property sets the failure message. Note that Zod v4 uses `error`, not `message` — using `message` will silently produce a generic error.

## Combining Patterns

Patterns compose naturally:

```ts
export default defineEnv({
  server: {
    DATABASE_URL: z.url(),
    JWT_SECRET: z.string().min(32),
    DB_POOL_SIZE: z.coerce.number().int().min(1).max(100).default(10),
    OPENAI_API_KEY: z
      .string()
      .refine((v) => v.startsWith('sk-'), { error: 'Must start with sk-' }),
    SENTRY_DSN: z.string().optional(),
  },
  client: {
    VITE_API_URL: z.url(),
    VITE_APP_NAME: z.string().min(1),
    VITE_DEBUG: z.stringbool().default(false),
    VITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  },
})
```
