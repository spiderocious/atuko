import { SetVariableStep } from '@shared/types'
import { StepResult } from '@shared/types'

// setVariable is handled at the workflow-runner level (no DOM interaction needed)
// This executor exists only for dry-run logging
export function executeSetVariable(step: SetVariableStep, isDryRun: boolean): StepResult {
  if (isDryRun) {
    return {
      stepId: step.id,
      success: true,
      output: { _dryRun: `Would set ${step.scope} variable "${step.name}" = "${step.value}"` },
    }
  }
  return { stepId: step.id, success: true }
}
