# Vite 8 / Rolldown

`vite-env` is compatible with Vite 8 and its Rolldown-based bundler. This page documents the specific implementation details that make it work correctly with Rolldown.

## Minimum versions

| Dependency | Minimum version |
| ---------- | --------------- |
| Vite       | >= 8.0.0        |
| Node.js    | >= 20.19.0      |

## `moduleType: 'js'`

Both `buildClientModule()` and `buildServerModule()` in `virtual.ts` return an object with a `moduleType: 'js'` property alongside the generated `code`:

```ts
return {
  moduleType: 'js', // Required: Vite 8 / Rolldown explicit moduleType
  code: `...`,
}
```

This tells Rolldown to treat the virtual module output as JavaScript. Without this property, Rolldown may not parse the module correctly and can fail to resolve imports from `virtual:env/client` or `virtual:env/server`.

## Virtual module loading

The `load()` hook returns objects with both `code` and `moduleType` properties rather than a plain string. Returning a plain string was acceptable in Vite 5/6 with Rollup, but Rolldown-based Vite 8 expects the structured object format for virtual modules.

## ESM-only

The plugin package uses `"type": "module"` in its `package.json` and is distributed exclusively as ESM. Vite 8 requires plugins to be ESM.

## `enforce: 'pre'`

The plugin sets `enforce: 'pre'` in its plugin object. This means the plugin's hooks run before Vite's core transform hooks and before other plugins that do not set `enforce`. In practice this is important for the `resolveId` and `load` hooks, which must intercept `virtual:env/client` and `virtual:env/server` before any other plugin attempts to resolve them.

## Leak detection in `generateBundle`

The `generateBundle` hook scans the output bundle for server-only variable values that may have been accidentally included in client-facing chunks. The bundle object is typed as read-only by Vite's plugin API, so `vite-env` casts it to `Record<string, { type: string, code?: string }>` and iterates its entries without modifying them. The hook short-circuits immediately when building in SSR mode (`resolvedConfig.build.ssr`), since server bundles are expected to contain server variables.

If a server-only variable value is found in a client chunk, the build is aborted with an error that names the variable and the chunk it was found in.
