import { ScreenshotStep } from '@shared/types'
import { StepResult } from '@shared/types'

export async function executeScreenshot(
  step: ScreenshotStep,
  isDryRun: boolean
): Promise<StepResult> {
  if (isDryRun) {
    return { stepId: step.id, success: true, output: { _dryRun: `Would capture screenshot` } }
  }

  // Screenshots require the offscreen document API or chrome.tabs.captureVisibleTab
  // from the service worker. Signal to SW to capture on our behalf.
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: 'CAPTURE_SCREENSHOT', stepId: step.id, target: step.target === 'page' || step.target === 'viewport' ? step.target : 'viewport' },
      (response: { dataUri?: string } | undefined) => {
        if (!response?.dataUri) {
          resolve({ stepId: step.id, success: false, error: 'Screenshot capture failed' })
          return
        }
        const output: Record<string, string> = {}
        if (step.saveAs) output[step.saveAs] = response.dataUri
        resolve({ stepId: step.id, success: true, output })
      }
    )
  })
}
