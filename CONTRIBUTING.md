# Contributing to vite-env

Thanks for your interest in contributing! This guide covers everything you need to get started.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 20.19.0
- [pnpm](https://pnpm.io/) 10.33.0

## Setup

```bash
git clone https://github.com/pyyupsk/vite-env.git
cd vite-env
pnpm install
pnpm build
```

## Development Workflow

```bash
pnpm dev            # watch mode for all packages
pnpm test           # vitest in watch mode
pnpm lint           # check for lint errors
pnpm lint:fix       # auto-fix lint errors
pnpm typecheck      # type-check all packages
```

### Running a Single Test

```bash
pnpm test -- packages/core/src/leak.test.ts
```

### Building a Single Package

```bash
pnpm --filter @vite-env/core build
```

### Playground

The `playground/` directory is a working Vite app configured with the plugin. Use it to manually test changes:

```bash
pnpm --filter playground dev
```

## Project Structure

```text
packages/core   → @vite-env/core   Vite plugin, validation, virtual modules, leak detection
packages/cli    → @vite-env/cli    CLI commands (check, generate, types) — thin wrappers over core
packages/docs   → @vite-env/docs   VitePress documentation site
playground/     → demo app for manual testing
```

## Code Conventions

- **Linting** — uses [@antfu/eslint-config](https://github.com/antfu/eslint-config). A pre-commit hook runs `lint-staged` automatically.
- **Tests** — colocated with source files (`*.test.ts` next to `*.ts`). Coverage threshold is 85% for lines, functions, branches, and statements.
- **Test descriptions** — must be lowercase (except `it` block names).
- **CLI coverage** — the CLI package is excluded from coverage since it's thin wrappers. Test the underlying core logic instead.
- **Commit messages** — describe concrete changes, not which convention motivated them. Use [Conventional Commits](https://www.conventionalcommits.org/) scoped to the package:
  - `feat(core): add platform presets for Vercel, Railway, and Netlify`
  - `fix(cli): handle missing config file gracefully`
  - `docs: update quick-start guide`

## Submitting a Pull Request

1. Fork the repository and create a branch from `main`.
2. Make your changes.
3. Add or update tests as needed — ensure `pnpm test -- --run` passes.
4. Run `pnpm lint:fix` and `pnpm typecheck`.
5. Commit with a descriptive message.
6. Open a pull request against `main`.

## Release Process (Maintainers)

Releases follow a 4-step flow:

1. Update docs and READMEs for the new version, commit as `docs: ...`
2. Run `pnpm release` — bumpp bumps all package versions and generates a versioned doc snapshot, committed as `chore: release vX.Y.Z`
3. Commit the generated snapshot as `docs(versioned): snapshot vX.Y.Z docs`
4. Push — CI publishes to npm and deploys docs automatically

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
