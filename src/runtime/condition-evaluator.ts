import { ConditionObject, ConditionOperator, ScopedVariableStore } from '@shared/types'

/**
 * Evaluates a condition object against the current run state.
 * element-exists / element-missing / element-text / element-value
 * conditions require a DOM query result passed in via elementData.
 */

export interface ElementData {
  exists: boolean
  text: string
  value: string
}

export interface ConditionContext {
  url: string
  variables: ScopedVariableStore
  elementData?: ElementData
  responseVars: Record<string, unknown>
}

export function evaluateCondition(
  condition: ConditionObject,
  ctx: ConditionContext
): boolean {
  switch (condition.type) {
    case 'element-exists':
      return ctx.elementData?.exists ?? false

    case 'element-missing':
      return !(ctx.elementData?.exists ?? false)

    case 'element-text':
      return applyOperator(
        ctx.elementData?.text ?? '',
        condition.operator ?? 'equals',
        condition.value ?? ''
      )

    case 'element-value':
      return applyOperator(
        ctx.elementData?.value ?? '',
        condition.operator ?? 'equals',
        condition.value ?? ''
      )

    case 'url-matches': {
      const pattern = condition.pattern ?? ''
      try {
        return new RegExp(pattern).test(ctx.url)
      } catch {
        return ctx.url.includes(pattern)
      }
    }

    case 'variable': {
      const varName = condition.variable ?? ''
      const varValue =
        ctx.variables.run[varName] ??
        ctx.variables.workflow[varName] ??
        ctx.variables.site[varName] ??
        ctx.variables.global[varName] ??
        ''
      return applyOperator(varValue, condition.operator ?? 'equals', condition.value ?? '')
    }

    case 'response-contains': {
      const responseVar = condition.responseVar ?? ''
      const responseData = ctx.responseVars[responseVar]
      if (responseData == null) return false
      const keyPath = (condition.key ?? '').split('.')
      let current: unknown = responseData
      for (const k of keyPath) {
        if (typeof current !== 'object' || current === null) return false
        current = (current as Record<string, unknown>)[k]
      }
      return applyOperator(String(current ?? ''), condition.operator ?? 'equals', condition.value ?? '')
    }

    default:
      return false
  }
}

function applyOperator(actual: string, operator: ConditionOperator, expected: string): boolean {
  switch (operator) {
    case 'equals':       return actual === expected
    case 'not-equals':   return actual !== expected
    case 'contains':     return actual.includes(expected)
    case 'not-contains': return !actual.includes(expected)
    case 'starts-with':  return actual.startsWith(expected)
    case 'ends-with':    return actual.endsWith(expected)
    case 'greater-than': return Number(actual) > Number(expected)
    case 'less-than':    return Number(actual) < Number(expected)
    case 'is-empty':     return actual === '' || actual == null
    case 'is-not-empty': return actual !== '' && actual != null
    default:             return false
  }
}
