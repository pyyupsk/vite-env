import type { z } from 'zod'

export interface EnvDefinition {
  server?: z.ZodRawShape
  client?: z.ZodRawShape
}

export type ValidationResult
  = | { success: true, data: Record<string, unknown>, errors: [] }
    | { success: false, data: null, errors: z.core.$ZodIssue[] }

type OrEmptyShape<T> = T extends z.ZodRawShape ? T : Record<string, never>

export type InferClientEnv<T extends EnvDefinition> = z.infer<
  z.ZodObject<OrEmptyShape<T['client']>>
>

export type InferServerEnv<T extends EnvDefinition> = z.infer<
  z.ZodObject<
    OrEmptyShape<T['server']> & OrEmptyShape<T['client']>
  >
>
