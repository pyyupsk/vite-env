---
layout: home

hero:
  name: "vite-env"
  text: "The env.ts layer for Vite"
  tagline: "Define once. Validate everywhere. Import with types."
  actions:
    - text: "Get Started"
      link: /guide/introduction
      theme: brand
    - text: "View on GitHub"
      link: https://github.com/pyyupsk/vite-env
      theme: alt

features:
  - title: "Typed Virtual Modules"
    details: "Import `env` from `virtual:env/client` or `virtual:env/server` with full IntelliSense and type safety."
    icon:
      src: /icons/code.svg
  - title: "Server / Client Split"
    details: "Enforce variable boundaries at define-time with automatic VITE_ prefix validation. Server secrets never reach the browser."
    icon:
      src: /icons/split.svg
  - title: "Build-time Leak Detection"
    details: "Scans client bundles for server secret values before they ship. Catches leaks that code review misses."
    icon:
      src: /icons/shield.svg
  - title: "Runtime Access Protection"
    details: "Warns or errors when `virtual:env/server` is imported from a client environment. Configurable per Vite 8 environment."
    icon:
      src: /icons/lock.svg
  - title: "Auto Type Generation"
    details: "Generates `vite-env.d.ts` on every build start. No manual type declarations that drift from reality."
    icon:
      src: /icons/types.svg
  - title: "Auto .env.example"
    details: "Generate documented `.env.example` files from your Zod schema with types, defaults, and required flags."
    icon:
      src: /icons/check.svg
  - title: "Platform Presets"
    details: "Pre-built schemas for Vercel, Railway, and Netlify. One import gives you validated, typed access to all platform variables."
    icon:
      src: /icons/cloud.svg
  - title: "Zod v4 + Standard Schema"
    details: "First-class Zod v4 support with rich type inference. Or use Valibot, ArkType, or any Standard Schema validator."
    icon:
      src: /icons/bolt.svg
---
