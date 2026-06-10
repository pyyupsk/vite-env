# Examples

Runnable Vite apps demonstrating `@vite-env/core`. Each example ships a committed `.env` with dummy values so it works out of the box.

| Example                  | Validation path                                      | Shows                                                              |
| ------------------------ | ---------------------------------------------------- | ------------------------------------------------------------------ |
| [`basic`](./basic)       | Zod (`defineEnv`)                                    | Server/client split, coercion, defaults, guard, `.d.ts` generation |
| [`valibot`](./valibot)   | Standard Schema (`defineStandardEnv`) with Valibot   | Bring-your-own validator via Standard Schema v1                    |

## Running

From the repo root:

```bash
bun install
bun run build   # build packages first — examples resolve workspace deps
bun run --filter @vite-env/example-basic dev
bun run --filter @vite-env/example-valibot dev
```
