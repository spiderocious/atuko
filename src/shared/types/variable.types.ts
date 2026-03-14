export type VariableScope = 'run' | 'workflow' | 'global' | 'site'

export type VariableStore = Record<string, string>

export interface ScopedVariableStore {
  run: VariableStore
  workflow: VariableStore
  global: VariableStore
  site: VariableStore
}

// Built-in variable names — these are resolved at runtime by variable-resolver
export const BUILTIN_VARIABLES = [
  '$url',
  '$title',
  '$timestamp',
  '$date',
  '$time',
  '$runId',
  '$stepIndex',
  '$iteration',
  '$item',
] as const

export type BuiltinVariable = typeof BUILTIN_VARIABLES[number]
