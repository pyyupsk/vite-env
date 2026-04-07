import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    root: '.',
    exclude: ['**/node_modules/**', '**/.local/**', '**/.worktrees/**'],
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**/*.ts'],
      exclude: [
        '**/*.d.ts',
        '**/*.test.ts',
        '**/types.ts',
        'packages/cli/src/**', // CLI commands are thin wrappers; core logic is tested
        'packages/core/src/index.ts', // re-exports only
      ],
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      },
    },
  },
})
