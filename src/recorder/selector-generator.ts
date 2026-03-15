/**
 * Generates a primary CSS selector + fallback list from a DOM element.
 * Prioritises stable attributes (data-testid, aria-label, id, name)
 * before falling back to class/positional selectors.
 */

import { SelectorObject } from '@shared/types'
import { scoreSelector } from './stability-scorer'

export function generateSelector(el: Element): SelectorObject {
  const candidates: string[] = []

  // 1. data-testid / data-cy / data-qa
  for (const attr of ['data-testid', 'data-cy', 'data-qa', 'data-id']) {
    const val = el.getAttribute(attr)
    if (val) candidates.push(`[${attr}="${CSS.escape(val)}"]`)
  }

  // 2. aria-label
  const ariaLabel = el.getAttribute('aria-label')
  if (ariaLabel) candidates.push(`[aria-label="${CSS.escape(ariaLabel)}"]`)

  // 3. role + text (for buttons/links)
  const role = el.getAttribute('role')
  if (role) candidates.push(`[role="${role}"]`)

  // 4. id
  const id = el.id
  if (id) candidates.push(`#${CSS.escape(id)}`)

  // 5. name attribute (inputs, selects)
  const name = el.getAttribute('name')
  if (name) candidates.push(`[name="${CSS.escape(name)}"]`)

  // 6. type + value for inputs
  if (el.tagName === 'INPUT') {
    const type = (el as HTMLInputElement).type
    const placeholder = el.getAttribute('placeholder')
    if (type && placeholder) {
      candidates.push(`input[type="${type}"][placeholder="${CSS.escape(placeholder)}"]`)
    } else if (type) {
      candidates.push(`input[type="${type}"]`)
    }
  }

  // 7. Class-based (first meaningful class)
  const classes = Array.from(el.classList).filter(c => !c.match(/^(active|hover|focus|selected|open|disabled|visible|hidden)/))
  if (classes.length > 0) {
    candidates.push(`${el.tagName.toLowerCase()}.${classes.slice(0, 2).map(CSS.escape).join('.')}`)
  }

  // 8. Nth-child positional fallback
  const positional = buildPositionalSelector(el)
  if (positional) candidates.push(positional)

  // Sort by stability score descending
  const sorted = candidates.sort((a, b) => scoreSelector(b) - scoreSelector(a))

  const primary = sorted[0] ?? buildPositionalSelector(el) ?? el.tagName.toLowerCase()
  const fallbacks = sorted.slice(1)

  return {
    primary,
    fallbacks,
    stabilityScore: scoreSelector(primary),
  }
}

function buildPositionalSelector(el: Element): string {
  const parts: string[] = []
  let current: Element | null = el

  while (current && current !== document.body) {
    const tag = current.tagName.toLowerCase()
    const parent: Element | null = current.parentElement
    if (!parent) break

    const siblings = Array.from(parent.children).filter((c: Element) => c.tagName === current!.tagName)
    if (siblings.length > 1) {
      const index = siblings.indexOf(current) + 1
      parts.unshift(`${tag}:nth-of-type(${index})`)
    } else {
      parts.unshift(tag)
    }

    current = parent
  }

  return parts.join(' > ')
}
