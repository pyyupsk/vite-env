# Changelog

## [0.7.0](https://github.com/pyyupsk/vite-env/compare/core-v0.6.1...core-v0.7.0) (2026-06-13)


### Features

* add playground with integration tests and fix SSR leak detection ([d4e624b](https://github.com/pyyupsk/vite-env/commit/d4e624b9aaa31cf2845dcdaa00b3b219ae324293))
* **core:** add oxlint-disable to generated vite-env.d.ts ([#23](https://github.com/pyyupsk/vite-env/issues/23)) ([55709a9](https://github.com/pyyupsk/vite-env/commit/55709a9ba3c6d2976b58a2e360d444cd6925f2d2))
* **core:** add platform presets for Vercel, Railway, and Netlify ([#10](https://github.com/pyyupsk/vite-env/issues/10)) ([35c4830](https://github.com/pyyupsk/vite-env/commit/35c4830083680edbe10199a6566026e09a354253))
* **core:** add Standard Schema support alongside Zod ([#6](https://github.com/pyyupsk/vite-env/issues/6)) ([931e146](https://github.com/pyyupsk/vite-env/commit/931e1463857f10efde6dcd6763fcfec75fe00ee5))
* **core:** runtime access protection via Vite 8 Environment API ([#8](https://github.com/pyyupsk/vite-env/issues/8)) ([b5f5f55](https://github.com/pyyupsk/vite-env/commit/b5f5f55f32d20c0f8a1bda9eb5005c24a241a025))
* **docs:** redesign docs and landing site from scratch ([#27](https://github.com/pyyupsk/vite-env/issues/27)) ([03eabc3](https://github.com/pyyupsk/vite-env/commit/03eabc31e5fde42ba71547219a180643bb1181dc))
* implement core plugin and CLI packages ([78ce8cc](https://github.com/pyyupsk/vite-env/commit/78ce8ccc2ddf63d6356cbf78f3120fc91b88479c))


### Bug Fixes

* add explicit types conditions to all package exports ([0503646](https://github.com/pyyupsk/vite-env/commit/05036468bd0ec13f65254fc20ba037d4764a6138))
* **core:** gate preset validation on platform detection ([#32](https://github.com/pyyupsk/vite-env/issues/32)) ([8e2a877](https://github.com/pyyupsk/vite-env/commit/8e2a877780140779f886b5a8937ac02e47dc4fed))
* correct stringbool d.ts type, add CJS format and .env loading in CLI ([9aff5d4](https://github.com/pyyupsk/vite-env/commit/9aff5d4bc926a4b0d6cda98d3c48f7d5805cef63))
* **error-handling:** add try-catch to file watcher, CLI commands, config loader, and dts writer ([565f6ce](https://github.com/pyyupsk/vite-env/commit/565f6ce029427bd26ae3d9c0a7211cc831f2bfbf))
* exempt serverEnvironments from bundle leak detection ([#12](https://github.com/pyyupsk/vite-env/issues/12)) ([7d929da](https://github.com/pyyupsk/vite-env/commit/7d929da92a2a37f7d9904c8ee1f4991da8f20c47))
* **plugin:** invalidate server virtual module on HMR and use cached data for leak detection ([b4434a7](https://github.com/pyyupsk/vite-env/commit/b4434a78fcd65115a5912991be550acc6317853b))
* preserve original error cause when env config fails to load ([a86932b](https://github.com/pyyupsk/vite-env/commit/a86932b23311d829cdadc7fc197de3822603d4b0))
* **security:** enforce VITE_ prefix on shared keys and warn on short leak-detection skips ([0e16c06](https://github.com/pyyupsk/vite-env/commit/0e16c06f57d70b421ce42b73cd795fb55cc9c900))
* **test:** use path.join in dts test for Windows compatibility ([9e7a617](https://github.com/pyyupsk/vite-env/commit/9e7a617c28f0da57d943c90cc1e23b762128d660))
* **types:** improve type safety across core types ([6d506ee](https://github.com/pyyupsk/vite-env/commit/6d506ee2bab64c1a6c77bf1bc514f62aa879bc65))
* use jiti to load env.ts config for Node 20 and Windows support ([a78ebc8](https://github.com/pyyupsk/vite-env/commit/a78ebc801eab6e9a52850645cde3ee0c4fbce00e))
