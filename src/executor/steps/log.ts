import { LogStep } from '@shared/types'
import { StepResult } from '@shared/types'

export function executeLog(step: LogStep): StepResult {
  const method = step.level === 'error' ? console.error : step.level === 'warn' ? console.warn : console.log
  method(`[Atuko Log] ${step.message}`)
  return { stepId: step.id, success: true, output: { _log: step.message } }
}
