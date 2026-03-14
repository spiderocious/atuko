import { ScrollStep } from '@shared/types'
import { StepResult } from '@shared/types'
import { resolveSelector } from '../selector-resolver'
import { SiteConfig } from '@shared/types'

export function executeScroll(
  step: ScrollStep,
  siteConfig: SiteConfig | undefined,
  isDryRun: boolean
): StepResult {
  if (isDryRun) {
    return { stepId: step.id, success: true, output: { _dryRun: `Would scroll (${step.scrollType})` } }
  }

  const behavior = step.behavior ?? 'smooth'
  const scrollTarget = step.target === 'page'
    ? window
    : (() => {
        const r = resolveSelector(step.target as Parameters<typeof resolveSelector>[0], siteConfig)
        return r?.element ?? window
      })()

  switch (step.scrollType) {
    case 'to':
      scrollTarget.scrollTo({ top: step.y, left: step.x, behavior })
      break
    case 'by':
      scrollTarget.scrollBy({ top: step.y, left: step.x, behavior })
      break
    case 'top':
      scrollTarget.scrollTo({ top: 0, behavior })
      break
    case 'bottom':
      scrollTarget.scrollTo({ top: Number.MAX_SAFE_INTEGER, behavior })
      break
    case 'element':
      if (step.selector) {
        const r = resolveSelector(step.selector, siteConfig)
        if (r) r.element.scrollIntoView({ behavior, block: 'center' })
      }
      break
  }

  return { stepId: step.id, success: true }
}
