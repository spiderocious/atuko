import { NavigateStep } from '@shared/types'
import { StepResult } from '@shared/types'

export async function executeNavigate(
  step: NavigateStep,
  isDryRun: boolean
): Promise<StepResult> {
  if (isDryRun) {
    return { stepId: step.id, success: true, output: { _dryRun: `Would navigate to ${step.url}` } }
  }

  const url = step.url.startsWith('http') ? step.url : window.location.origin + step.url
  window.location.href = url
  return { stepId: step.id, success: true }
}
