/**
 * DEMO: Runtime access protection
 *
 * Uncomment the import below and rebuild to see the server module guard in action.
 *
 * What happens depends on the `onClientAccessOfServerModule` option in vite.config.ts:
 *   - 'error' → build fails with a hard error
 *   - 'warn'  → build succeeds but logs a warning and exits with code 1
 *   - 'stub'  → build succeeds but the module throws at runtime if executed
 *
 * This file is imported by main.ts to demonstrate that the guard prevents
 * server secrets from reaching client code.
 */

// Uncomment the next line to trigger the guard:
// import { env } from 'virtual:env/server'

// If using 'stub' mode, this would throw at runtime:
// console.log(env.DATABASE_URL)

export {}
