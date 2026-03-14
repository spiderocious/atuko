import { ScopedVariableStore } from '@shared/types'

/**
 * Resolves {{variable}} interpolation in a string.
 * Built-in variables ($url, $timestamp, etc.) are resolved from context.
 * Named variables are resolved from the scoped store (run → workflow → site → global).
 */
export function resolveString(
  template: string,
  store: ScopedVariableStore,
  context: BuiltinContext
): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_match, key: string) => {
    const trimmed = key.trim()
    const resolved = resolveVariable(trimmed, store, context)
    return resolved ?? `{{${trimmed}}}`
  })
}

export interface BuiltinContext {
  url: string
  title: string
  runId: string
  stepIndex: number
  iteration?: number
  item?: string
}

function resolveVariable(
  name: string,
  store: ScopedVariableStore,
  context: BuiltinContext
): string | undefined {
  // Built-in variables
  switch (name) {
    case '$url':       return context.url
    case '$title':     return context.title
    case '$timestamp': return new Date().toISOString()
    case '$date':      return new Date().toISOString().slice(0, 10)
    case '$time':      return new Date().toTimeString().slice(0, 8)
    case '$runId':     return context.runId
    case '$stepIndex': return String(context.stepIndex)
    case '$iteration': return String(context.iteration ?? 0)
    case '$item':      return context.item ?? ''
  }

  // Scoped lookup: run → workflow → site → global
  return (
    store.run[name] ??
    store.workflow[name] ??
    store.site[name] ??
    store.global[name]
  )
}

export function setVariable(
  name: string,
  value: string,
  scope: 'run' | 'workflow' | 'global' | 'site',
  store: ScopedVariableStore
): ScopedVariableStore {
  return {
    ...store,
    [scope]: { ...store[scope], [name]: value },
  }
}
