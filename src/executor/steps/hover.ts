import { HoverStep } from '@shared/types'
import { StepResult } from '@shared/types'
import { resolveSelector } from '../selector-resolver'
import { SiteConfig } from '@shared/types'

export async function executeHover(
  step: HoverStep,
  siteConfig: SiteConfig | undefined,
  isDryRun: boolean
): Promise<StepResult> {
  const resolved = resolveSelector(step.selector, siteConfig)
  if (!resolved) {
    return { stepId: step.id, success: false, error: `Selector not found: ${step.selector.primary}` }
  }

  if (isDryRun) {
    return { stepId: step.id, success: true, output: { _dryRun: `Would hover [${resolved.usedSelector}]` } }
  }

  resolved.element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
  resolved.element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
  await sleep(step.duration ?? 500)
  return { stepId: step.id, success: true }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
