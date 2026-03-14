import { PromptStep } from '@shared/types'
import { StepResult } from '@shared/types'
import { MSG } from '@shared/constants/messages'
import { PendingPrompt } from '@shared/types'

export function executePrompt(
  step: PromptStep,
  runId: string,
  isDryRun: boolean
): Promise<StepResult> {
  if (isDryRun) {
    const firstOption = step.options?.[0] ?? 'dry-run-value'
    return Promise.resolve({
      stepId: step.id,
      success: true,
      output: { [step.saveAs]: firstOption, _dryRun: `Would prompt: ${step.message}` },
    })
  }

  const pending: PendingPrompt = {
    stepId: step.id,
    promptType: step.promptType,
    message: step.message,
    options: step.options,
    countdown: step.countdown,
    saveAs: step.saveAs,
  }

  // Send prompt request to service worker which forwards to popup
  chrome.runtime.sendMessage({ type: MSG.PROMPT_REQUEST, runId, prompt: pending })

  // Wait for PROMPT_RESPONSE
  return new Promise<StepResult>((resolve) => {
    const listener = (message: { type: string; runId: string; value: string }) => {
      if (message.type === MSG.PROMPT_RESPONSE && message.runId === runId) {
        chrome.runtime.onMessage.removeListener(listener)
        resolve({
          stepId: step.id,
          success: true,
          output: { [step.saveAs]: message.value },
        })
      }
    }
    chrome.runtime.onMessage.addListener(listener)
  })
}
