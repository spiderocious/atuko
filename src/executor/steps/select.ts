import { SelectStep } from '@shared/types'
import { StepResult } from '@shared/types'
import { resolveSelector } from '../selector-resolver'
import { SiteConfig } from '@shared/types'

export function executeSelect(
  step: SelectStep,
  siteConfig: SiteConfig | undefined,
  isDryRun: boolean
): StepResult {
  const resolved = resolveSelector(step.selector, siteConfig)
  if (!resolved) {
    return { stepId: step.id, success: false, error: `Select not found: ${step.selector.primary}` }
  }

  if (isDryRun) {
    return { stepId: step.id, success: true, output: { _dryRun: `Would select [${resolved.usedSelector}] by ${step.by}: ${step.value}` } }
  }

  const el = resolved.element as HTMLSelectElement
  const val = String(step.value)

  switch (step.by) {
    case 'value':
      el.value = val
      break
    case 'label': {
      const opt = Array.from(el.options).find((o) => o.text === val)
      if (opt) el.value = opt.value
      break
    }
    case 'index':
      el.selectedIndex = Number(step.value)
      break
  }

  el.dispatchEvent(new Event('change', { bubbles: true }))
  return { stepId: step.id, success: true }
}
