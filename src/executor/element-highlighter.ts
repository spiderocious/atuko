/**
 * element-highlighter.ts
 * Injects a brand-colored outline over the resolved element during dry-run
 * or step-by-step mode. Removes itself after a delay.
 */

const HIGHLIGHT_ATTR = 'data-atuko-highlight'
const STYLE_ID = 'atuko-highlight-style'

function ensureStyle(): void {
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    [${HIGHLIGHT_ATTR}] {
      outline: 2px solid #7C5CFC !important;
      outline-offset: 2px !important;
      background-color: rgba(124, 92, 252, 0.08) !important;
      transition: outline 0.15s ease, background-color 0.15s ease;
    }
  `
  document.head.appendChild(style)
}

/**
 * Highlight an element for the given duration (default 1200ms).
 * Returns a cleanup function that removes the highlight immediately.
 */
export function highlightElement(el: Element, durationMs = 1200): () => void {
  ensureStyle()
  el.setAttribute(HIGHLIGHT_ATTR, '1')

  const timer = setTimeout(() => {
    el.removeAttribute(HIGHLIGHT_ATTR)
  }, durationMs)

  return () => {
    clearTimeout(timer)
    el.removeAttribute(HIGHLIGHT_ATTR)
  }
}

/**
 * Remove all active highlights from the page.
 */
export function clearAllHighlights(): void {
  document.querySelectorAll(`[${HIGHLIGHT_ATTR}]`).forEach(el => {
    el.removeAttribute(HIGHLIGHT_ATTR)
  })
}
