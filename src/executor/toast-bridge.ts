/**
 * Toast Bridge — injects the Atuko runtime toast into the active page's DOM
 * using a shadow root for full style isolation.
 */

const TOAST_HOST_ID = 'atuko-toast-host'

let toastRoot: ShadowRoot | null = null

export function injectToast(cssText: string, htmlContent: string): void {
  if (document.getElementById(TOAST_HOST_ID)) return

  const host = document.createElement('div')
  host.id = TOAST_HOST_ID
  host.style.cssText = [
    'position: fixed',
    'bottom: 16px',
    'right: 16px',
    'z-index: 2147483647',
    'pointer-events: none',
  ].join(';')
  document.body.appendChild(host)

  toastRoot = host.attachShadow({ mode: 'open' })

  const style = document.createElement('style')
  style.textContent = cssText
  toastRoot.appendChild(style)

  const container = document.createElement('div')
  container.innerHTML = htmlContent
  toastRoot.appendChild(container)
}

export function updateToast(update: { label?: string; counter?: string; status?: string }): void {
  if (!toastRoot) return
  if (update.label) {
    const el = toastRoot.getElementById('atuko-step-label')
    if (el) el.textContent = update.label
  }
  if (update.counter) {
    const el = toastRoot.getElementById('atuko-step-counter')
    if (el) el.textContent = update.counter
  }
  if (update.status) {
    const el = toastRoot.getElementById('atuko-status-dot')
    if (el) el.setAttribute('data-status', update.status)
  }
}

export function removeToast(): void {
  const host = document.getElementById(TOAST_HOST_ID)
  if (host) host.remove()
  toastRoot = null
}
