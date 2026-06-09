import { defineConfig } from '@pyyupsk/eslint-config'
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { fileURLToPath } from 'node:url'

const docsDir = fileURLToPath(new URL('./apps/docs', import.meta.url))
const docsFiles = ['apps/docs/**/*.{ts,tsx}']

export default [
  ...defineConfig(),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
    },
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  { ...js.configs.recommended, files: docsFiles },
  ...tseslint.configs.recommended.map(c => ({ ...c, files: docsFiles })),
  { ...reactHooks.configs.flat.recommended, files: docsFiles },
  { ...reactRefresh.configs.vite, files: docsFiles },
  {
    files: docsFiles,
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        tsconfigRootDir: docsDir,
      },
    },
  },
]
