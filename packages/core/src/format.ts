import type { core } from 'zod'
import type { GuardFail } from './guard'
import type { StandardValidationIssue } from './types'

export function formatZodError(issues: core.$ZodIssue[]): string {
  return issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join('.') : '(root)'
      return `  \x1B[31m✗\x1B[0m ${path.padEnd(28)} ${issue.message}`
    })
    .join('\n')
}

export function formatStandardSchemaError(issues: StandardValidationIssue[]): string {
  return issues
    .map((issue) => {
      const path = issue.path.length > 0
        ? issue.path.map(seg => typeof seg === 'object' && seg !== null && 'key' in seg ? String(seg.key) : String(seg)).join('.')
        : '(root)'
      return `  \x1B[31m✗\x1B[0m ${path.padEnd(28)} ${issue.message}`
    })
    .join('\n')
}

const YELLOW = '\x1B[33m'
const BOLD_YELLOW = '\x1B[1;33m'
const CYAN = '\x1B[36m'
const RESET = '\x1B[0m'

const BOX_WIDTH = 66
// 1 left border + 2 left spaces + content + 1 right border = BOX_WIDTH
// content area = BOX_WIDTH - 4
const CONTENT_AREA = BOX_WIDTH - 4

/** Maximum visible character length for an importer path inside the warning box. */
export const IMPORTER_MAX_LEN = CONTENT_AREA - 'Found in: '.length

/**
 * Truncates an importer path to fit within maxLen visible characters.
 * Adds a leading '…' when truncation occurs so the rightmost (most specific) part is preserved.
 */
export function truncateImporter(importerPath: string, maxLen: number): string {
  if (importerPath.length <= maxLen)
    return importerPath
  return `\u2026${importerPath.slice(-(maxLen - 1))}`
}

function boxTop(): string {
  return `${YELLOW}\u250C${'─'.repeat(BOX_WIDTH - 2)}\u2510${RESET}`
}

function boxBottom(): string {
  return `${YELLOW}\u2514${'─'.repeat(BOX_WIDTH - 2)}\u2518${RESET}`
}

function boxLine(visibleText: string, renderedText = visibleText): string {
  const rightPad = ' '.repeat(Math.max(0, CONTENT_AREA - visibleText.length))
  return `${YELLOW}\u2502${RESET}  ${renderedText}${rightPad}${YELLOW}\u2502${RESET}`
}

/**
 * Renders the colored terminal warning box for 'warn' mode.
 * Every line is exactly 66 characters wide (visible chars, excluding ANSI codes),
 * assuming Vite environment names are short (≤19 chars). Longer names will extend
 * the line beyond 66 chars without crashing — Math.max(0) prevents negative padding.
 * Use in logger.warn() calls — not in log files.
 */
export function formatGuardWarning(fail: GuardFail): string {
  const importerDisplay = fail.importer === undefined
    ? '(unknown)'
    : truncateImporter(fail.importer, IMPORTER_MAX_LEN)

  const warnTitle = 'To enforce now:  onClientAccessOfServerModule: \'error\''
  const stubTitle = 'To silence:      onClientAccessOfServerModule: \'stub\''

  return [
    boxTop(),
    boxLine(
      '[vite-env] DEPRECATION WARNING',
      `${BOLD_YELLOW}[vite-env] DEPRECATION WARNING${RESET}`,
    ),
    boxLine(''),
    boxLine(`virtual:env/server was imported from the "${fail.envName}"`),
    boxLine('environment. This will be a hard build error in 1.0.0.'),
    boxLine(''),
    boxLine(warnTitle, `To enforce now:  ${CYAN}onClientAccessOfServerModule: 'error'${RESET}`),
    boxLine(stubTitle, `To silence:      ${CYAN}onClientAccessOfServerModule: 'stub'${RESET}`),
    boxLine(''),
    boxLine(`Found in: ${importerDisplay}`),
    boxBottom(),
  ].join('\n')
}

/**
 * Renders the plain-text hard error message thrown in 'error' mode.
 * No ANSI — thrown as an Error message, not printed via logger.
 */
export function formatHardError(fail: GuardFail): string {
  const importerLine = fail.importer ?? '(unknown)'
  return [
    `[vite-env] virtual:env/server is not available in the "${fail.envName}" environment.`,
    ``,
    `  Server-only modules cannot be imported from client code.`,
    `  Add this environment to serverEnvironments if intentional:`,
    ``,
    `    ViteEnv({ serverEnvironments: ['ssr', '${fail.envName}'] })`,
    ``,
    `  Or change enforcement:`,
    ``,
    `    ViteEnv({ onClientAccessOfServerModule: 'stub' })`,
    ``,
    `  Imported from: ${importerLine}`,
  ].join('\n')
}

/**
 * Renders a single ANSI-free log entry for vite-env-warnings.log.
 * Uses the same (unknown) convention as formatGuardWarning for missing importers.
 */
export function formatGuardLogEntry(fail: GuardFail, timestamp: string): string {
  const importerLine = fail.importer ?? '(unknown)'
  return [
    `[${timestamp}] virtual:env/server accessed from "${fail.envName}" environment`,
    `  Importer: ${importerLine}`,
  ].join('\n')
}
