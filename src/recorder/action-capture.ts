/**
 * DOM event listeners that capture user actions during record mode.
 * Fires a callback with a partial step descriptor for each captured action.
 */

import { generateSelector } from './selector-generator'

export interface CapturedAction {
  type: string
  selector?: ReturnType<typeof generateSelector>
  value?: string
  key?: string
  url?: string
  timestamp: number
}

type ActionCallback = (action: CapturedAction) => void

let _listeners: Array<{ type: string; handler: EventListener; target: EventTarget }> = []

function capture(action: CapturedAction, cb: ActionCallback) {
  cb(action)
}

export function startCapture(cb: ActionCallback): void {
  stopCapture() // clean up any previous listeners

  const onClick = (e: Event) => {
    const el = e.target as Element
    if (!el || !(el instanceof Element)) return
    capture({
      type: 'click',
      selector: generateSelector(el),
      timestamp: Date.now(),
    }, cb)
  }

  const onInput = (e: Event) => {
    const el = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    if (!el || !(el instanceof HTMLElement)) return
    if (!('value' in el)) return
    capture({
      type: 'fill',
      selector: generateSelector(el),
      value: el.value,
      timestamp: Date.now(),
    }, cb)
  }

  const onSubmit = (e: Event) => {
    const el = e.target as HTMLFormElement
    if (!el || !(el instanceof HTMLFormElement)) return
    capture({
      type: 'submit',
      selector: generateSelector(el),
      timestamp: Date.now(),
    }, cb)
  }

  const onKeydown = (e: KeyboardEvent) => {
    // Only capture special keys, not regular typing (captured by input event)
    const specials = ['Enter', 'Escape', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
    if (!specials.includes(e.key)) return
    const modifiers: string[] = []
    if (e.ctrlKey) modifiers.push('Ctrl')
    if (e.metaKey) modifiers.push('Meta')
    if (e.altKey) modifiers.push('Alt')
    if (e.shiftKey) modifiers.push('Shift')
    const key = [...modifiers, e.key].join('+')
    capture({ type: 'keypress', key, timestamp: Date.now() }, cb)
  }

  _listeners = [
    { type: 'click', handler: onClick as EventListener, target: document },
    { type: 'change', handler: onInput as EventListener, target: document },
    { type: 'submit', handler: onSubmit as EventListener, target: document },
    { type: 'keydown', handler: onKeydown as EventListener, target: document },
  ]

  for (const { type, handler, target } of _listeners) {
    target.addEventListener(type, handler, true) // capture phase
  }
}

export function stopCapture(): void {
  for (const { type, handler, target } of _listeners) {
    target.removeEventListener(type, handler, true)
  }
  _listeners = []
}
