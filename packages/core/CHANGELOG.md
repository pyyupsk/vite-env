# Changelog

## [0.6.4](https://github.com/pyyupsk/vite-env/compare/core-v0.6.3...core-v0.6.4) (2026-06-13)


### Bug Fixes

* **release:** remove invalid --tag flag from gh release create ([#66](https://github.com/pyyupsk/vite-env/issues/66)) ([c96b601](https://github.com/pyyupsk/vite-env/commit/c96b60117911f9d412a2a63042988ed3831e50ee))

## [0.6.3](https://github.com/pyyupsk/vite-env/compare/core-v0.6.2...core-v0.6.3) (2026-06-14)

### Bug Fixes

- resolve workspace:\* to current core version before packing cli ([#61](https://github.com/pyyupsk/vite-env/issues/61)) ([e03923e](https://github.com/pyyupsk/vite-env/commit/e03923e))
- pass --tag to gh release create ([#59](https://github.com/pyyupsk/vite-env/issues/59)) ([1896956](https://github.com/pyyupsk/vite-env/commit/1896956))

## [0.6.2](https://github.com/pyyupsk/vite-env/compare/core-v0.6.1...core-v0.6.2) (2026-06-13)

### Bug Fixes

- resolve catalog: protocol in published packages ([#50](https://github.com/pyyupsk/vite-env/issues/50)) ([306de1b](https://github.com/pyyupsk/vite-env/commit/306de1b3cf301889a062c03a384b73000722066c))

## [0.6.1](https://github.com/pyyupsk/vite-env/compare/core-v0.6.0...core-v0.6.1) (2026-06-12)

### Bug Fixes

- use quoted-literal regex in leak detector to eliminate false positives ([#41](https://github.com/pyyupsk/vite-env/issues/41)) ([c8bea05](https://github.com/pyyupsk/vite-env/commit/c8bea0593c41ee3d3c5f026c3517a3d486eeb9ff))
- rewrite workspace/catalog protocols before pack ([#40](https://github.com/pyyupsk/vite-env/issues/40)) ([3e756d3](https://github.com/pyyupsk/vite-env/commit/3e756d36a66696a5d4d3ab12306926a6bd606cf7))

## [0.6.0](https://github.com/pyyupsk/vite-env/compare/core-v0.5.4...core-v0.6.0) (2026-06-12)

### Features

- standalone runtime loader via @vite-env/core/load ([#37](https://github.com/pyyupsk/vite-env/issues/37)) ([9031b9e](https://github.com/pyyupsk/vite-env/commit/9031b9e4092d397782bfdd9817a33c27a7df9e58))

## [0.5.4](https://github.com/pyyupsk/vite-env/compare/core-v0.5.3...core-v0.5.4) (2026-06-10)

### Bug Fixes

- gate preset validation on platform detection ([#32](https://github.com/pyyupsk/vite-env/issues/32)) ([8e2a877](https://github.com/pyyupsk/vite-env/commit/8e2a877780140779f886b5a8937ac02e47dc4fed))

## [0.5.3](https://github.com/pyyupsk/vite-env/compare/core-v0.5.2...core-v0.5.3) (2026-06-08)

### Features

- add oxlint-disable to generated vite-env.d.ts ([#23](https://github.com/pyyupsk/vite-env/issues/23)) ([55709a9](https://github.com/pyyupsk/vite-env/commit/55709a9ba3c6d2976b58a2e360d444cd6925f2d2))

## [0.5.2](https://github.com/pyyupsk/vite-env/compare/core-v0.5.1...core-v0.5.2) (2026-04-16)

No user-facing changes.

## [0.5.1](https://github.com/pyyupsk/vite-env/compare/core-v0.5.0...core-v0.5.1) (2026-04-16)

### Bug Fixes

- exempt serverEnvironments from bundle leak detection ([#12](https://github.com/pyyupsk/vite-env/issues/12)) ([7d929da](https://github.com/pyyupsk/vite-env/commit/7d929da92a2a37f7d9904c8ee1f4991da8f20c47))

## [0.5.0](https://github.com/pyyupsk/vite-env/compare/core-v0.4.0...core-v0.5.0) (2026-04-08)

### Features

- add platform presets for Vercel, Railway, and Netlify ([#10](https://github.com/pyyupsk/vite-env/issues/10)) ([35c4830](https://github.com/pyyupsk/vite-env/commit/35c4830083680edbe10199a6566026e09a354253))

## [0.4.0](https://github.com/pyyupsk/vite-env/compare/core-v0.3.0...core-v0.4.0) (2026-04-07)

### Features

- runtime access protection via Vite 8 Environment API ([#8](https://github.com/pyyupsk/vite-env/issues/8)) ([b5f5f55](https://github.com/pyyupsk/vite-env/commit/b5f5f55f32d20c0f8a1bda9eb5005c24a241a025))

## [0.3.0](https://github.com/pyyupsk/vite-env/compare/core-v0.2.2...core-v0.3.0) (2026-04-07)

### Features

- add Standard Schema support alongside Zod ([#6](https://github.com/pyyupsk/vite-env/issues/6)) ([931e146](https://github.com/pyyupsk/vite-env/commit/931e1463857f10efde6dcd6763fcfec75fe00ee5))

## [0.2.2](https://github.com/pyyupsk/vite-env/compare/core-v0.2.1...core-v0.2.2) (2026-04-06)

No user-facing changes.

## [0.2.1](https://github.com/pyyupsk/vite-env/compare/core-v0.2.0...core-v0.2.1) (2026-04-06)

No user-facing changes.

## [0.2.0](https://github.com/pyyupsk/vite-env/compare/core-v0.1.0...core-v0.2.0) (2026-04-05)

### Bug Fixes

- invalidate server virtual module on HMR and use cached data for leak detection ([b4434a7](https://github.com/pyyupsk/vite-env/commit/b4434a78fcd65115a5912991be550acc6317853b))
- add try-catch to file watcher, CLI commands, config loader, and dts writer ([565f6ce](https://github.com/pyyupsk/vite-env/commit/565f6ce029427bd26ae3d9c0a7211cc831f2bfbf))
- enforce VITE\_ prefix on shared keys and warn on short leak-detection skips ([0e16c06](https://github.com/pyyupsk/vite-env/commit/0e16c06f57d70b421ce42b73cd795fb55cc9c900))
- improve type safety across core types ([6d506ee](https://github.com/pyyupsk/vite-env/commit/6d506ee2bab64c1a6c77bf1bc514f62aa879bc65))

## [0.1.0](https://github.com/pyyupsk/vite-env/releases/tag/core-v0.1.0) (2026-04-05)

Initial release.
