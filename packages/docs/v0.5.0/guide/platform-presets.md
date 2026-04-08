# Platform Presets

Presets are pre-built environment schemas for common deployment platforms. Instead of manually defining every `VERCEL_ENV`, `RAILWAY_SERVICE_NAME`, or `NETLIFY` variable, you pass a preset and get validated, typed access to all platform-injected variables.

## Usage

```ts
import { defineEnv } from '@vite-env/core'
import { vercel } from '@vite-env/core/presets'
import { z } from 'zod'

export default defineEnv({
  presets: [vercel],
  server: {
    DATABASE_URL: z.url(),
  },
  client: {
    VITE_API_URL: z.url(),
  },
})
```

The preset's variables are merged into `server` and `client` alongside your own definitions. Your definitions always take precedence over preset values.

## Available Presets

### Vercel

```ts
import { vercel } from '@vite-env/core/presets'
```

Covers all [Vercel system environment variables](https://vercel.com/docs/projects/environment-variables/system-environment-variables):

| Variable                         | Type                                         | Required |
| -------------------------------- | -------------------------------------------- | -------- |
| `VERCEL`                         | `'1'`                                        | Yes      |
| `VERCEL_ENV`                     | `'production' \| 'preview' \| 'development'` | Yes      |
| `VERCEL_URL`                     | `string`                                     | Yes      |
| `VERCEL_PROJECT_PRODUCTION_URL`  | `string`                                     | Yes      |
| `VERCEL_DEPLOYMENT_ID`           | `string`                                     | Yes      |
| `VERCEL_BRANCH_URL`              | `string`                                     | No       |
| `VERCEL_REGION`                  | `string`                                     | No       |
| `VERCEL_GIT_PROVIDER`            | `string`                                     | No       |
| `VERCEL_GIT_REPO_SLUG`           | `string`                                     | No       |
| `VERCEL_GIT_REPO_OWNER`          | `string`                                     | No       |
| `VERCEL_GIT_COMMIT_REF`          | `string`                                     | No       |
| `VERCEL_GIT_COMMIT_SHA`          | `string`                                     | No       |
| `VERCEL_GIT_COMMIT_MESSAGE`      | `string`                                     | No       |
| `VERCEL_GIT_COMMIT_AUTHOR_LOGIN` | `string`                                     | No       |
| `VERCEL_GIT_PULL_REQUEST_ID`     | `string`                                     | No       |
| `VERCEL_SKEW_PROTECTION_ENABLED` | `'1'`                                        | No       |

::: tip
`VERCEL_URL` is a bare hostname (e.g. `myapp-abc123.vercel.app`), not a full URL. The preset uses `z.string().min(1)` instead of `z.url()`.
:::

### Railway

```ts
import { railway } from '@vite-env/core/presets'
```

Covers [Railway service variables](https://docs.railway.com/reference/variables):

| Variable                   | Type     | Required |
| -------------------------- | -------- | -------- |
| `RAILWAY_ENVIRONMENT_ID`   | `string` | Yes      |
| `RAILWAY_ENVIRONMENT_NAME` | `string` | Yes      |
| `RAILWAY_SERVICE_ID`       | `string` | Yes      |
| `RAILWAY_SERVICE_NAME`     | `string` | Yes      |
| `RAILWAY_PROJECT_ID`       | `string` | Yes      |
| `RAILWAY_PROJECT_NAME`     | `string` | Yes      |
| `RAILWAY_DEPLOYMENT_ID`    | `string` | Yes      |
| `RAILWAY_REPLICA_ID`       | `string` | No       |
| `RAILWAY_GIT_COMMIT_SHA`   | `string` | No       |
| `RAILWAY_GIT_BRANCH`       | `string` | No       |
| `RAILWAY_GIT_REPO_NAME`    | `string` | No       |
| `RAILWAY_GIT_REPO_OWNER`   | `string` | No       |
| `RAILWAY_PUBLIC_DOMAIN`    | `string` | No       |
| `RAILWAY_PRIVATE_DOMAIN`   | `string` | No       |
| `RAILWAY_TCP_PROXY_DOMAIN` | `string` | No       |
| `RAILWAY_TCP_PROXY_PORT`   | `number` | No       |

::: info
`PORT` is intentionally excluded. It's a generic name set by many tools — handle it in your own server config.
:::

### Netlify

```ts
import { netlify } from '@vite-env/core/presets'
```

Covers [Netlify build environment variables](https://docs.netlify.com/configure-builds/environment-variables/):

| Variable              | Type                                                           | Required |
| --------------------- | -------------------------------------------------------------- | -------- |
| `NETLIFY`             | `'true'`                                                       | Yes      |
| `BUILD_ID`            | `string`                                                       | Yes      |
| `CONTEXT`             | `'production' \| 'deploy-preview' \| 'branch-deploy' \| 'dev'` | Yes      |
| `DEPLOY_ID`           | `string`                                                       | Yes      |
| `DEPLOY_URL`          | `url`                                                          | Yes      |
| `DEPLOY_PRIME_URL`    | `url`                                                          | Yes      |
| `URL`                 | `url`                                                          | Yes      |
| `BRANCH`              | `string`                                                       | Yes      |
| `COMMIT_REF`          | `string`                                                       | Yes      |
| `PULL_REQUEST`        | `'true'`                                                       | No       |
| `REVIEW_ID`           | `string`                                                       | No       |
| `REPOSITORY_URL`      | `url`                                                          | No       |
| `INCOMING_HOOK_TITLE` | `string`                                                       | No       |
| `INCOMING_HOOK_URL`   | `url`                                                          | No       |

::: tip
Unlike Vercel, Netlify URLs (`DEPLOY_URL`, `URL`, etc.) are full `https://` URLs, so the preset validates them with `z.url()`.
:::

## How Merging Works

Presets are merged in order, then your definitions are applied on top:

```txt
preset 1 → preset 2 → … → your server/client
```

- If multiple presets define the same key, the **last preset** wins (with a console warning).
- If a preset and your own config define the same key, **your definition wins** (with a console warning).

This means you can always override a preset's schema for a variable if you need a different validation rule.

## Combining Presets

You can use multiple presets if your app deploys to different platforms or you want to layer concerns:

```ts
export default defineEnv({
  presets: [vercel, railway],
  server: {
    DATABASE_URL: z.url(),
  },
})
```

## The EnvPreset Type

Presets use the `EnvPreset` type, which has the same shape as `EnvDefinition`:

```ts
interface EnvPreset {
  server?: z.ZodRawShape
  client?: z.ZodRawShape
}
```

You can create custom presets for your own infrastructure:

```ts
import type { EnvPreset } from '@vite-env/core'
import { z } from 'zod'

export const myInfra = {
  server: {
    MY_SERVICE_URL: z.url(),
    MY_SERVICE_TOKEN: z.string().min(1),
  },
} satisfies EnvPreset
```
