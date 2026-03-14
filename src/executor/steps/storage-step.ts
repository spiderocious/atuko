import { StorageStep } from '@shared/types'
import { StepResult } from '@shared/types'

export function executeStorageStep(
  step: StorageStep,
  isDryRun: boolean
): StepResult {
  if (isDryRun) {
    return { stepId: step.id, success: true, output: { _dryRun: `Would ${step.action} ${step.store}Storage` } }
  }

  const storage = step.store === 'session' ? sessionStorage : localStorage

  switch (step.action) {
    case 'get': {
      const val = storage.getItem(step.key ?? '')
      const output: Record<string, string> = {}
      if (step.saveAs && val !== null) output[step.saveAs] = val
      return { stepId: step.id, success: true, output }
    }
    case 'set':
      storage.setItem(step.key ?? '', step.value ?? '')
      return { stepId: step.id, success: true }
    case 'remove':
      storage.removeItem(step.key ?? '')
      return { stepId: step.id, success: true }
    case 'clear':
      storage.clear()
      return { stepId: step.id, success: true }
    default:
      return { stepId: step.id, success: false, error: 'Unknown storage action' }
  }
}
