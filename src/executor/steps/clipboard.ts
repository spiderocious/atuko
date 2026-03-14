import { ClipboardStep } from '@shared/types'
import { StepResult } from '@shared/types'

export async function executeClipboard(
  step: ClipboardStep,
  isDryRun: boolean
): Promise<StepResult> {
  if (isDryRun) {
    return { stepId: step.id, success: true, output: { _dryRun: `Would ${step.action} clipboard` } }
  }

  if (step.action === 'write') {
    await navigator.clipboard.writeText(step.value ?? '')
    return { stepId: step.id, success: true }
  }

  const text = await navigator.clipboard.readText()
  const output: Record<string, string> = {}
  if (step.saveAs) output[step.saveAs] = text
  return { stepId: step.id, success: true, output }
}
