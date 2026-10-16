# Contributing

Thank you for helping with vite-env. This page tells you how to set up the repo, make a change, and open a pull request.

## Requirements

- [Node.js](https://nodejs.org/) 20.19.0 or later
- [Bun](https://bun.sh/) 1.3.0 or later

## Setup

```bash
git clone https://github.com/pyyupsk/vite-env.git
cd vite-env
bun install
bun run build
```

## Commands

```bash
bun run dev         # watch mode for all packages
bun run test        # run all tests once
bun run lint        # oxlint
bun run lint:fix    # oxlint with fixes
bun run format      # oxfmt
bun run typecheck   # type-check all packages
```

Run one test file:

```bash
bun run test packages/core/src/leak.test.ts
```

Build one package:

```bash
bun run --filter @vite-env/core build
```

To try a change in a real app, run one of the [examples](./examples):

```bash
bun run --filter @vite-env/example-basic dev
```

## Project structure

```text
packages/core   @vite-env/core   Vite plugin, validation, virtual modules, leak detection
packages/cli    @vite-env/cli    check, generate, and types commands, thin wrappers over core
apps/docs       docs site at https://pyyupsk.github.io/vite-env/
examples/       runnable Vite apps, one per feature
```

## Conventions

- Lint and format: [oxlint](https://oxc.rs/docs/guide/usage/linter) and [oxfmt](https://oxc.rs/docs/guide/usage/formatter). The pre-commit hook runs `oxlint --fix` on staged files.
- Tests: put `*.test.ts` next to the file it tests. Coverage must stay at 85% or more.
- Test descriptions: lowercase.
- CLI coverage: the CLI package is not in the coverage report, because it only wraps core. Test the core logic instead.
- Commit messages: use [Conventional Commits](https://www.conventionalcommits.org/) with the package as the scope, and say what changed:
  - `feat(core): add platform presets for Vercel, Railway, and Netlify`
  - `fix(cli): handle missing config file`
  - `docs: update the quick start`

## Pull requests

1. Fork the repo and create a branch from `main`.
2. Make your change.
3. Add or update tests. Make sure that `bun run test` passes.
4. Run `bun run lint:fix`, `bun run format`, and `bun run typecheck`.
5. Commit with a Conventional Commits message.
6. Open a pull request against `main`.

CI runs lint, typecheck, and the tests on Ubuntu and Windows with Node 22, 24, and 26. All checks must pass before a merge.

## Releases (maintainers)

Release Please automates releases:

1. When CI passes, merge the pull request into `main`.
2. Release Please opens a pull request that bumps the versions from the commit messages.
3. Merge that pull request. It pushes a `vX.Y.Z` tag.
4. The tag starts the release workflow. changelogithub writes the GitHub release notes, and the workflow publishes the packages to npm.

## License

When you contribute, you agree that your contribution is licensed under the [MIT License](./LICENSE).
