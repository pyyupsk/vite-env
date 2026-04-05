import type { z } from 'zod'

export interface EnvDefinition {
  server?: z.ZodRawShape
  client?: z.ZodRawShape
  shared?: z.ZodRawShape
}

export interface ValidationResult {
  success: boolean
  data: Record<string, unknown> | null
  errors: z.core.$ZodIssue[]
}

export type InferClientEnv<T extends EnvDefinition> = z.infer<
  z.ZodObject<NonNullable<T['client']> & NonNullable<T['shared']>>
>

export type InferServerEnv<T extends EnvDefinition> = z.infer<
  z.ZodObject<
    NonNullable<T['server']> & NonNullable<T['client']> & NonNullable<T['shared']>
  >
>
