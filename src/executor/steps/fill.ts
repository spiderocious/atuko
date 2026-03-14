import { FillStep } from '@shared/types'
import { StepResult } from '@shared/types'
import { resolveSelector } from '../selector-resolver'
import { SiteConfig } from '@shared/types'

export async function executeFill(
  step: FillStep,
  siteConfig: SiteConfig | undefined,
  isDryRun: boolean
): Promise<StepResult> {
  const resolved = resolveSelector(step.selector, siteConfig)
  if (!resolved) {
    return { stepId: step.id, success: false, error: `Selector not found: ${step.selector.primary}` }
  }

  const value = typeof step.value === 'string' ? step.value : ''

  if (isDryRun) {
    return { stepId: step.id, success: true, output: { _dryRun: `Would fill [${resolved.usedSelector}] with "${value}"` } }
  }

  const el = resolved.element as HTMLInputElement

  if (!step.append) {
    el.focus()
    document.execCommand('selectAll')
    document.execCommand('delete')
  }

  if (step.simulateTyping) {
    for (const char of value) {
      el.dispatchEvent(new KeyboardEvent('keydown', { key: char, bubbles: true }))
      el.value += char
      el.dispatchEvent(new InputEvent('input', { bubbles: true, data: char }))
      el.dispatchEvent(new KeyboardEvent('keyup', { key: char, bubbles: true }))
      await sleep(step.typingDelay ?? 50)
    }
  } else {
    el.value = step.append ? el.value + value : value
    el.dispatchEvent(new InputEvent('input', { bubbles: true }))
    el.dispatchEvent(new Event('change', { bubbles: true }))
  }

  if (step.pressEnter) {
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    el.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }))
  }

  return { stepId: step.id, success: true }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
