import type { StandardSchemaV1 } from '@standard-schema/spec'
import type { z } from 'zod'

export type EnvDefinition = {
  server?: z.ZodRawShape
  client?: z.ZodRawShape
}

export type StandardEnvDefinition = {
  server?: Record<string, StandardSchemaV1>
  client?: Record<string, StandardSchemaV1>
  /** @internal */
  readonly _standard: true
}

export type EnvPreset = {
  server?: z.ZodRawShape
  client?: z.ZodRawShape
}

export type AnyEnvDefinition = EnvDefinition | StandardEnvDefinition

export type ValidationResult
  = | { success: true, data: Record<string, unknown>, errors: [] }
    | { success: false, data: null, errors: z.core.$ZodIssue[] }

export type StandardValidationIssue = {
  message: string
  path: readonly (PropertyKey | StandardSchemaV1.PathSegment)[]
}

export type StandardValidationResult
  = | { success: true, data: Record<string, unknown>, errors: [] }
    | { success: false, data: null, errors: StandardValidationIssue[] }

type OrEmptyShape<T> = T extends z.ZodRawShape ? T : Record<string, never>

export type InferClientEnv<T extends EnvDefinition> = z.infer<
  z.ZodObject<OrEmptyShape<T['client']>>
>

export type InferServerEnv<T extends EnvDefinition> = z.infer<
  z.ZodObject<
    OrEmptyShape<T['server']> & OrEmptyShape<T['client']>
  >
>
