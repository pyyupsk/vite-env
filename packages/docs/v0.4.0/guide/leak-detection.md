# Leak Detection

`vite-env` scans your client bundle after every production build to make sure server-only environment variable **values** never reach the browser.

## What It Checks

The scanner looks at the **values** of server-only variables (the keys under `server` in your `env.ts`), not just their names. For each server variable, it takes the validated runtime value and searches for it as a literal string across every output chunk in the client bundle.

A variable is considered leaked when its exact value appears inside any chunk's generated code.

## When It Runs

Leak detection fires in Vite's `generateBundle` hook, which runs after the bundle is fully assembled. It is **skipped entirely for SSR builds** (`config.build.ssr` is truthy) — server bundles are expected to contain server values.

## The 8-Character Minimum

Values shorter than 8 characters are skipped to avoid false positives. A short value like `true`, `1`, or `dev` would match incidentally in many places in any JavaScript bundle.

When a server variable is skipped for this reason, the plugin logs a warning:

```ansi
⚠ [vite-env] Leak detection skipped 1 server variable(s) with values shorter than 8 chars: PORT
```

The skipped variable is **not** guaranteed to be absent from the bundle — it simply cannot be checked reliably. This is a known limitation.

## What a Leak Error Looks Like

If a server value is found in the client bundle, the build fails with:

```ansi
[vite-env] Server environment variables detected in client bundle!

  ✗ JWT_SECRET found in index-abc123.js
  ✗ DATABASE_URL found in utils-def456.js

  These variables are marked as server-only and must never reach the browser.
```

The error names the variable key and the specific chunk it was found in, so you can trace back where the value is being imported or inlined.

## How to Avoid False Positives

Keep server-only values longer than 8 characters. If a value is shorter (for example, a numeric port number like `3000`), the plugin skips it rather than flag a likely-spurious match.

If you have a short server value that you genuinely want to protect, the best approach is to ensure it never flows into code that is imported on the client side — the plugin cannot reliably catch it, so the boundary must be enforced structurally.

::: tip

If you see a leak error for a value that should not be in the client bundle, the usual cause is an `import` of a server module from a file that is also loaded on the client. Check your import graph and move server-only logic behind a server-only entry point.

:::
