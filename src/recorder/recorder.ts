/**
 * Main recorder — wires action capture to step generation,
 * debounces fill events, and sends RECORDED_ACTION to the service worker.
 *
 * Auto-wait: measures real elapsed time between recorded actions and
 * inserts a wait step when the gap exceeds MIN_WAIT_MS. Navigation events
 * get a waitUntil:'load' wait instead of a duration wait.
 */

import { StepObject, SelectorObject } from '@shared/types'
import { MSG } from '@shared/constants/messages'
import { startCapture, stopCapture, CapturedAction } from './action-capture'

let _workflowId: string | null = null
let _fillDebounce: ReturnType<typeof setTimeout> | null = null
let _lastFill: { selector: SelectorObject; value: string } | null = null

/** Timestamp of the last emitted step. Used to measure gaps for auto-wait. */
let _lastStepAt: number | null = null

/**
 * Minimum gap (ms) between actions before a wait step is auto-inserted.
 * 1 500 ms filters out normal interaction latency; anything longer is a real wait.
 */
const MIN_WAIT_MS = 1500

/**
 * Maximum duration we'll record as a single wait step.
 * Gaps larger than this (e.g. user walked away) are capped.
 */
const MAX_WAIT_MS = 30_000

function makeBase() {
  return {
    id: crypto.randomUUID(),
    label: '',
    note: '',
    enabled: true,
    onError: 'stop' as const,
    retries: 0,
    retryDelay: 0,
  }
}

function buildStep(action: CapturedAction): StepObject | null {
  const base = makeBase()

  switch (action.type) {
    case 'click':
      if (!action.selector) return null
      return {
        ...base,
        type: 'click',
        selector: action.selector,
        button: 'left',
        doubleClick: false,
        waitBefore: 0,
        scrollIntoView: true,
        force: false,
      }

    case 'fill':
      if (!action.selector) return null
      return {
        ...base,
        type: 'fill',
        selector: action.selector,
        value: action.value ?? '',
        clearMethod: 'select-all',
        append: false,
        simulateTyping: false,
        typingDelay: 0,
        pressEnter: false,
      }

    case 'submit':
      if (!action.selector) return null
      return {
        ...base,
        type: 'submit',
        selector: action.selector,
        waitForNavigation: true,
        navigationTimeout: 5000,
      }

    case 'keypress':
      return {
        ...base,
        type: 'keypress',
        key: action.key ?? 'Enter',
        target: 'page',
        repeat: 1,
        delay: 0,
      }

    case 'navigate':
      return {
        ...base,
        type: 'navigate',
        url: action.url ?? window.location.href,
        waitUntil: 'load',
        timeout: 10000,
      }

    default:
      return null
  }
}

function buildAutoWait(durationMs: number, afterNavigate: boolean): StepObject {
  const base = makeBase()
  const clamped = Math.min(Math.round(durationMs / 100) * 100, MAX_WAIT_MS)

  if (afterNavigate) {
    return {
      ...base,
      label: 'Wait for page load',
      type: 'wait',
      waitType: 'duration',
      duration: clamped,
      timeout: Math.max(clamped + 5000, 15000),
      onTimeout: 'stop',
    }
  }

  return {
    ...base,
    label: `Wait ${(clamped / 1000).toFixed(1)}s`,
    type: 'wait',
    waitType: 'duration',
    duration: clamped,
    timeout: Math.max(clamped + 5000, 10000),
    onTimeout: 'stop',
  }
}

function sendStep(step: StepObject) {
  chrome.runtime.sendMessage({
    type: MSG.RECORDED_ACTION,
    workflowId: _workflowId,
    step,
  })
}

/**
 * Emit a step, optionally preceded by an auto-wait if enough time has passed
 * since the last step.
 */
function emitStep(step: StepObject, actionTimestamp: number, isNavigate = false) {
  if (_lastStepAt !== null) {
    const gap = actionTimestamp - _lastStepAt
    if (gap >= MIN_WAIT_MS) {
      const waitStep = buildAutoWait(gap, isNavigate)
      sendStep(waitStep)
    }
  }
  sendStep(step)
  _lastStepAt = Date.now()
}

export function startRecording(workflowId: string): void {
  _workflowId = workflowId
  _lastStepAt = null

  startCapture((action: CapturedAction) => {
    // Debounce fill events — only emit after 600ms of no typing
    if (action.type === 'fill') {
      _lastFill = { selector: action.selector!, value: action.value ?? '' }
      if (_fillDebounce) clearTimeout(_fillDebounce)
      _fillDebounce = setTimeout(() => {
        if (_lastFill) {
          const step = buildStep({ type: 'fill', selector: _lastFill.selector, value: _lastFill.value, timestamp: Date.now() })
          if (step) emitStep(step, Date.now())
          _lastFill = null
        }
      }, 600)
      return
    }

    // Flush pending fill before click/submit/navigate
    if ((action.type === 'click' || action.type === 'submit' || action.type === 'navigate') && _lastFill) {
      if (_fillDebounce) clearTimeout(_fillDebounce)
      const fillStep = buildStep({ type: 'fill', selector: _lastFill.selector, value: _lastFill.value, timestamp: _lastFill ? Date.now() : action.timestamp })
      if (fillStep) emitStep(fillStep, action.timestamp)
      _lastFill = null
    }

    const step = buildStep(action)
    if (step) emitStep(step, action.timestamp, action.type === 'navigate')
  })
}

export function stopRecording(): void {
  // Flush pending fill
  if (_lastFill && _fillDebounce) {
    clearTimeout(_fillDebounce)
    const step = buildStep({ type: 'fill', selector: _lastFill.selector, value: _lastFill.value, timestamp: Date.now() })
    if (step) sendStep(step) // no auto-wait on final flush
    _lastFill = null
  }
  stopCapture()
  _workflowId = null
  _lastStepAt = null
}
