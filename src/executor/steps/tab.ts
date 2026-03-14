import { TabStep } from '@shared/types'
import { StepResult } from '@shared/types'

export function executeTab(step: TabStep, isDryRun: boolean): StepResult {
  if (isDryRun) {
    return { stepId: step.id, success: true, output: { _dryRun: `Would perform tab action: ${step.action}` } }
  }

  // Tab operations must be delegated to service worker (requires chrome.tabs API)
  return new Promise<StepResult>((resolve) => {
    chrome.runtime.sendMessage(
      { type: 'EXECUTE_TAB_STEP', step },
      (response: StepResult | undefined) => {
        resolve(response ?? { stepId: step.id, success: false, error: 'Tab operation failed' })
      }
    )
  }) as unknown as StepResult
}
