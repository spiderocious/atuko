import { StepObject, ScopedVariableStore } from '@shared/types'
import { MSG } from '@shared/constants/messages'
import { StepResult } from '@shared/types'
import { resolveString, BuiltinContext } from './variable-resolver'

export interface ExecuteStepOptions {
  step: StepObject
  tabId: number
  store: ScopedVariableStore
  context: BuiltinContext
  isDryRun: boolean
  timeoutMs: number
}

/**
 * Sends a step to the content script on the active tab and waits for the result.
 * Handles per-step timeout. Returns a StepResult.
 */
export async function executeStep(opts: ExecuteStepOptions): Promise<StepResult> {
  const { step, tabId, store, context, isDryRun, timeoutMs } = opts

  // Resolve {{variable}} in the step before sending
  const resolvedStep = resolveStepVariables(step, store, context)

  return new Promise<StepResult>((resolve) => {
    const timer = setTimeout(() => {
      resolve({
        stepId: step.id,
        success: false,
        error: `Step timed out after ${timeoutMs}ms`,
      })
    }, timeoutMs)

    chrome.tabs.sendMessage(
      tabId,
      { type: MSG.EXECUTE_STEP, step: resolvedStep, isDryRun },
      (response: StepResult | undefined) => {
        clearTimeout(timer)
        if (chrome.runtime.lastError) {
          resolve({
            stepId: step.id,
            success: false,
            error: chrome.runtime.lastError.message ?? 'Content script unreachable',
          })
          return
        }
        resolve(
          response ?? {
            stepId: step.id,
            success: false,
            error: 'No response from content script',
          }
        )
      }
    )
  })
}

/**
 * Deep-clones a step and resolves all string fields containing {{variable}}.
 * Only processes fields that commonly hold interpolated values.
 */
function resolveStepVariables(
  step: StepObject,
  store: ScopedVariableStore,
  context: BuiltinContext
): StepObject {
  const resolve = (s: string) => resolveString(s, store, context)

  // Shallow clone step then patch known string fields
  const resolved = { ...step } as Record<string, unknown>

  const stringFields = ['label', 'note', 'reason']
  for (const field of stringFields) {
    if (typeof resolved[field] === 'string') {
      resolved[field] = resolve(resolved[field] as string)
    }
  }

  // Step-type specific field resolution
  if ('url' in resolved && typeof resolved['url'] === 'string') {
    resolved['url'] = resolve(resolved['url'])
  }
  if ('message' in resolved && typeof resolved['message'] === 'string') {
    resolved['message'] = resolve(resolved['message'] as string)
  }
  if ('value' in resolved && typeof resolved['value'] === 'string') {
    resolved['value'] = resolve(resolved['value'] as string)
  }
  if ('key' in resolved && typeof resolved['key'] === 'string') {
    resolved['key'] = resolve(resolved['key'] as string)
  }

  return resolved as unknown as StepObject
}
