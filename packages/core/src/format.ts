import type { core } from 'zod'

export function formatZodError(issues: core.$ZodIssue[]): string {
  return issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join('.') : '(root)'
      return `  \x1B[31m✗\x1B[0m ${path.padEnd(28)} ${issue.message}`
    })
    .join('\n')
}
