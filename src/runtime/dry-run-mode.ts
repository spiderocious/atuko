/**
 * dry-run-mode.ts
 * Helpers for dry-run execution.
 * In dry-run mode, steps don't mutate the page — they highlight the target
 * element and return a descriptive "would-do" message.
 */

import { StepObject, StepResult } from '@shared/types'

/**
 * Builds a human-readable description of what a step would do.
 */
export function describeStep(step: StepObject): string {
  const s = step as unknown as Record<string, unknown>
  const selector = (s['selector'] as { primary?: string } | undefined)?.primary ?? ''

  switch (step.type) {
    case 'click':
      return `Would click ${selector}${s['doubleClick'] ? ' (double)' : ''}`
    case 'fill':
      return `Would fill "${s['value']}" into ${selector}`
    case 'wait':
      return `Would wait ${s['duration'] ?? s['timeout']}ms`
    case 'scroll':
      return `Would scroll ${s['scrollType']} on ${selector || 'page'}`
    case 'navigate':
      return `Would navigate to ${s['url']}`
    case 'submit':
      return `Would submit form ${selector}`
    case 'select':
      return `Would select "${s['value']}" by ${s['by']} in ${selector}`
    case 'hover':
      return `Would hover over ${selector} for ${s['duration']}ms`
    case 'keypress':
      return `Would press ${s['key']}${(s['repeat'] as number) > 1 ? ` × ${s['repeat']}` : ''}`
    case 'extract':
      return `Would extract ${s['property']} from ${selector} → {{${s['saveAs']}}}`
    case 'screenshot':
      return `Would capture ${s['target']} screenshot as ${s['filename']}`
    case 'tab':
      return `Would ${s['action']} tab${s['url'] ? ` (${s['url']})` : ''}`
    case 'clipboard':
      return `Would ${s['action']} clipboard`
    case 'storage':
      return `Would ${s['action']} ${s['storageType']} storage key "${s['key']}"`
    case 'log':
      return `Would log [${s['level']}]: ${s['message']}`
    case 'prompt':
      return `Would show prompt: "${s['message']}"`
    case 'setVariable':
      return `Would set {{${s['name']}}} = "${s['value']}" (${s['scope']} scope)`
    case 'branch':
      return `Would evaluate branch condition`
    case 'loop':
      return `Would start loop (${s['loopType']})`
    case 'stop':
      return `Would stop run${s['reason'] ? `: ${s['reason']}` : ''}`
    case 'jump':
      return `Would jump to step ${s['targetId'] ?? s['stepId']}`
    default:
      return `Would execute ${(step as { type: string }).type}`
  }
}

/**
 * Returns a dry-run StepResult with the "would do" description.
 */
export function dryRunResult(step: StepObject): StepResult {
  return {
    stepId: step.id,
    success: true,
    output: { _dryRun: describeStep(step) },
  }
}
