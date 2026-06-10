# Contributing to vite-env

Thanks for your interest in contributing! This guide covers everything you need to get started.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 20.19.0
- [Bun](https://bun.sh/) >= 1.3.0

## Setup

```bash
git clone https://github.com/pyyupsk/vite-env.git
cd vite-env
bun install
bun run build
```

## Development Workflow

```bash
bun run dev         # watch mode for all packages
bun test            # vitest run (non-watch)
bun run lint        # check for lint errors
bun run lint:fix    # auto-fix lint errors
bun run typecheck   # type-check all packages
```

### Running a Single Test

```bash
bun test packages/core/src/leak.test.ts
```

### Building a Single Package

```bash
bun run --filter @vite-env/core build
```

### Examples

The `examples/` directory contains working Vite apps configured with the plugin. Use them to manually test changes:

```bash
bun run --filter @vite-env/example-basic dev
```

## Project Structure

```text
packages/core   → @vite-env/core   Vite plugin, validation, virtual modules, leak detection
packages/cli    → @vite-env/cli    CLI commands (check, generate, types) — thin wrappers over core
examples/basic   → @vite-env/example-basic     Zod path example app
examples/valibot → @vite-env/example-valibot   Standard Schema path example app
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
3. Add or update tests as needed — ensure `bun run test` passes.
4. Run `bun run lint:fix` and `bun run typecheck`.
5. Commit with a descriptive message.
6. Open a pull request against `main`.

## Release Process (Maintainers)

Releases follow a 4-step flow:

1. Update docs and READMEs for the new version, commit as `docs: ...`
2. Run `bun run release` — bumpp bumps all package versions, committed as `chore: release vX.Y.Z`
3. Push — CI publishes to npm automatically

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
