/**
 * Toast Bridge — mounts the Atuko React toast into the active page's DOM
 * using a shadow root for full style isolation.
 */

import React from 'react'
import { createRoot } from 'react-dom/client'
import { ActiveRunState } from '@shared/types'
import { ToastScreen } from '@features/toast/screen/toast-screen'

const TOAST_HOST_ID = 'atuko-toast-host'

let _root: ReturnType<typeof createRoot> | null = null

const PULSE_CSS = `
@keyframes atuko-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
`

export function injectToast(initialState: ActiveRunState): void {
  if (document.getElementById(TOAST_HOST_ID)) return

  const host = document.createElement('div')
  host.id = TOAST_HOST_ID
  Object.assign(host.style, {
    position: 'fixed',
    bottom: '16px',
    right: '16px',
    zIndex: '2147483647',
    pointerEvents: 'none',
  })
  document.body.appendChild(host)

  const shadow = host.attachShadow({ mode: 'open' })

  const style = document.createElement('style')
  style.textContent = PULSE_CSS
  shadow.appendChild(style)

  const mountPoint = document.createElement('div')
  shadow.appendChild(mountPoint)

  _root = createRoot(mountPoint)
  _root.render(React.createElement(ToastScreen, { runId: initialState.runId, initialState }))
}

export function removeToast(): void {
  const host = document.getElementById(TOAST_HOST_ID)
  if (host) host.remove()
  _root = null
}

// Keep updateToast for backwards compat (no-op since React manages state via messages)
export function updateToast(_update: { label?: string; counter?: string; status?: string }): void {
  // React component updates itself via chrome.runtime.onMessage
}
