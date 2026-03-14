import { KeypressStep } from '@shared/types'
import { StepResult } from '@shared/types'
import { resolveSelector } from '../selector-resolver'
import { SiteConfig } from '@shared/types'

export async function executeKeypress(
  step: KeypressStep,
  siteConfig: SiteConfig | undefined,
  isDryRun: boolean
): Promise<StepResult> {
  if (isDryRun) {
    return { stepId: step.id, success: true, output: { _dryRun: `Would press ${step.key}` } }
  }

  let target: Element | Window = window
  if (step.target !== 'page') {
    const resolved = resolveSelector(step.target, siteConfig)
    if (!resolved) return { stepId: step.id, success: false, error: 'Keypress target not found' }
    target = resolved.element
  }

  const { key, modifiers } = parseKey(step.key)
  const eventInit: KeyboardEventInit = {
    key,
    bubbles: true,
    ctrlKey: modifiers.includes('Control'),
    metaKey: modifiers.includes('Meta'),
    shiftKey: modifiers.includes('Shift'),
    altKey: modifiers.includes('Alt'),
  }

  const repeat = step.repeat ?? 1
  const delay = step.delay ?? 50

  for (let i = 0; i < repeat; i++) {
    target.dispatchEvent(new KeyboardEvent('keydown', eventInit))
    target.dispatchEvent(new KeyboardEvent('keyup', eventInit))
    if (i < repeat - 1) await sleep(delay)
  }

  return { stepId: step.id, success: true }
}

function parseKey(combo: string): { key: string; modifiers: string[] } {
  const parts = combo.split('+')
  const key = parts[parts.length - 1]
  const modifiers = parts.slice(0, -1)
  return { key, modifiers }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
