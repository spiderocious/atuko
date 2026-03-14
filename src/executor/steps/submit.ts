import { SubmitStep } from '@shared/types'
import { StepResult } from '@shared/types'
import { resolveSelector } from '../selector-resolver'
import { SiteConfig } from '@shared/types'

export function executeSubmit(
  step: SubmitStep,
  siteConfig: SiteConfig | undefined,
  isDryRun: boolean
): StepResult {
  const resolved = resolveSelector(step.selector, siteConfig)
  if (!resolved) {
    return { stepId: step.id, success: false, error: `Form not found: ${step.selector.primary}` }
  }

  if (isDryRun) {
    return { stepId: step.id, success: true, output: { _dryRun: `Would submit form [${resolved.usedSelector}]` } }
  }

  const form = resolved.element as HTMLFormElement
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
  return { stepId: step.id, success: true }
}
