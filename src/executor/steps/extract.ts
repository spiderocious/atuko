import { ExtractStep } from '@shared/types'
import { StepResult } from '@shared/types'
import { resolveSelector } from '../selector-resolver'
import { SiteConfig } from '@shared/types'

export function executeExtract(
  step: ExtractStep,
  siteConfig: SiteConfig | undefined,
  isDryRun: boolean
): StepResult {
  const resolved = resolveSelector(step.selector, siteConfig)
  if (!resolved) {
    return { stepId: step.id, success: false, error: `Selector not found: ${step.selector.primary}` }
  }

  if (isDryRun) {
    return { stepId: step.id, success: true, output: { _dryRun: `Would extract ${step.property} from [${resolved.usedSelector}] as ${step.saveAs}` } }
  }

  const el = resolved.element
  let raw = ''

  switch (step.property) {
    case 'text':      raw = el.textContent ?? ''; break
    case 'html':      raw = el.innerHTML; break
    case 'value':     raw = (el as HTMLInputElement).value ?? ''; break
    case 'attribute': raw = el.getAttribute(step.attribute ?? '') ?? ''; break
    case 'style':     raw = getComputedStyle(el).getPropertyValue(step.styleProperty ?? ''); break
  }

  const transformed = applyTransform(raw, step.transform)
  return { stepId: step.id, success: true, output: { [step.saveAs]: transformed } }
}

function applyTransform(value: string, transform: ExtractStep['transform']): string {
  switch (transform) {
    case 'trim':      return value.trim()
    case 'lowercase': return value.toLowerCase()
    case 'uppercase': return value.toUpperCase()
    case 'number':    return String(Number(value))
    default:          return value
  }
}
