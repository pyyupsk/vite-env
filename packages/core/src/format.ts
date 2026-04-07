import type { core } from 'zod'
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
