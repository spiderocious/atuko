import { WaitStep } from '@shared/types'
import { StepResult } from '@shared/types'
import { resolveSelector } from '../selector-resolver'
import { SiteConfig } from '@shared/types'

export async function executeWait(
  step: WaitStep,
  siteConfig: SiteConfig | undefined,
  isDryRun: boolean
): Promise<StepResult> {
  if (isDryRun) {
    return { stepId: step.id, success: true, output: { _dryRun: `Would wait (${step.waitType})` } }
  }

  const timeout = step.timeout ?? 10000

  switch (step.waitType) {
    case 'duration':
      await sleep(step.duration ?? 1000)
      return { stepId: step.id, success: true }

    case 'element': {
      if (!step.selector) return { stepId: step.id, success: false, error: 'No selector for wait element' }
      const found = await waitForCondition(
        () => resolveSelector(step.selector!, siteConfig) !== null,
        timeout
      )
      return found
        ? { stepId: step.id, success: true }
        : { stepId: step.id, success: false, error: 'Element did not appear within timeout' }
    }

    case 'element-gone': {
      if (!step.selector) return { stepId: step.id, success: false, error: 'No selector for wait element-gone' }
      const gone = await waitForCondition(
        () => resolveSelector(step.selector!, siteConfig) === null,
        timeout
      )
      return gone
        ? { stepId: step.id, success: true }
        : { stepId: step.id, success: false, error: 'Element did not disappear within timeout' }
    }

    case 'text': {
      if (!step.selector) return { stepId: step.id, success: false, error: 'No selector for wait text' }
      const textFound = await waitForCondition(() => {
        const r = resolveSelector(step.selector!, siteConfig)
        return r ? (r.element.textContent ?? '').includes(step.text ?? '') : false
      }, timeout)
      return textFound
        ? { stepId: step.id, success: true }
        : { stepId: step.id, success: false, error: `Text "${step.text}" not found within timeout` }
    }

    case 'network':
      // Network wait is handled at service worker level via intercept
      await sleep(timeout)
      return { stepId: step.id, success: true }

    default:
      return { stepId: step.id, success: false, error: `Unknown wait type` }
  }
}

async function waitForCondition(fn: () => boolean, timeout: number): Promise<boolean> {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    if (fn()) return true
    await sleep(100)
  }
  return false
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
