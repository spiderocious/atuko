import { ClickStep } from '@shared/types'
import { StepResult } from '@shared/types'
import { resolveSelector } from '../selector-resolver'
import { SiteConfig } from '@shared/types'

export async function executeClick(
  step: ClickStep,
  siteConfig: SiteConfig | undefined,
  isDryRun: boolean
): Promise<StepResult> {
  if (step.waitBefore > 0) {
    await sleep(step.waitBefore)
  }

  const resolved = resolveSelector(step.selector, siteConfig)
  if (!resolved) {
    return { stepId: step.id, success: false, error: `Selector not found: ${step.selector.primary}` }
  }

  if (isDryRun) {
    highlightElement(resolved.element)
    return { stepId: step.id, success: true, output: { _dryRun: `Would click [${resolved.usedSelector}]` } }
  }

  if (step.scrollIntoView) {
    resolved.element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    await sleep(100)
  }

  const el = resolved.element as HTMLElement
  const clickInit: MouseEventInit = { bubbles: true, cancelable: true, button: buttonIndex(step.button) }

  if (step.doubleClick) {
    el.dispatchEvent(new MouseEvent('dblclick', clickInit))
  } else {
    el.dispatchEvent(new MouseEvent('click', clickInit))
  }

  return { stepId: step.id, success: true }
}

function buttonIndex(btn: 'left' | 'right' | 'middle'): number {
  return btn === 'right' ? 2 : btn === 'middle' ? 1 : 0
}

function highlightElement(el: Element) {
  const prev = (el as HTMLElement).style.outline
  ;(el as HTMLElement).style.outline = '2px solid #7C5CFC'
  setTimeout(() => { (el as HTMLElement).style.outline = prev }, 1500)
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
