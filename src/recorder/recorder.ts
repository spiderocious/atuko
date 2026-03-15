/**
 * Main recorder — wires action capture to step generation,
 * debounces fill events, and sends RECORDED_ACTION to the service worker.
 */

import { StepObject, SelectorObject } from '@shared/types'
import { MSG } from '@shared/constants/messages'
import { startCapture, stopCapture, CapturedAction } from './action-capture'

let _workflowId: string | null = null
let _fillDebounce: ReturnType<typeof setTimeout> | null = null
let _lastFill: { selector: SelectorObject; value: string } | null = null

function buildStep(action: CapturedAction): StepObject | null {
  const base = {
    id: crypto.randomUUID(),
    label: '',
    note: '',
    enabled: true,
    onError: 'stop' as const,
    retries: 0,
    retryDelay: 0,
  }

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

function sendStep(step: StepObject) {
  chrome.runtime.sendMessage({
    type: MSG.RECORDED_ACTION,
    workflowId: _workflowId,
    step,
  })
}

export function startRecording(workflowId: string): void {
  _workflowId = workflowId

  startCapture((action: CapturedAction) => {
    // Debounce fill events — only send after 600ms of no typing
    if (action.type === 'fill') {
      _lastFill = { selector: action.selector!, value: action.value ?? '' }
      if (_fillDebounce) clearTimeout(_fillDebounce)
      _fillDebounce = setTimeout(() => {
        if (_lastFill) {
          const step = buildStep({ type: 'fill', selector: _lastFill.selector, value: _lastFill.value, timestamp: Date.now() })
          if (step) sendStep(step)
          _lastFill = null
        }
      }, 600)
      return
    }

    // Flush pending fill before click/submit
    if ((action.type === 'click' || action.type === 'submit') && _lastFill) {
      if (_fillDebounce) clearTimeout(_fillDebounce)
      const fillStep = buildStep({ type: 'fill', selector: _lastFill.selector, value: _lastFill.value, timestamp: Date.now() })
      if (fillStep) sendStep(fillStep)
      _lastFill = null
    }

    const step = buildStep(action)
    if (step) sendStep(step)
  })
}

export function stopRecording(): void {
  // Flush pending fill
  if (_lastFill && _fillDebounce) {
    clearTimeout(_fillDebounce)
    const step = buildStep({ type: 'fill', selector: _lastFill.selector, value: _lastFill.value, timestamp: Date.now() })
    if (step) sendStep(step)
    _lastFill = null
  }
  stopCapture()
  _workflowId = null
}
