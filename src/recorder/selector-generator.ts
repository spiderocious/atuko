/**
 * Generates a primary CSS selector + fallback list from a DOM element.
 * Prioritises stable attributes (data-testid, aria-label, id, name)
 * then text content for interactive elements, before falling back to
 * class/positional selectors.
 */

import { SelectorObject } from '@shared/types'
import { scoreSelector } from './stability-scorer'

// Tags where visible text is a reliable targeting signal
const TEXT_TAGS = new Set(['BUTTON', 'A', 'LABEL', 'SUMMARY', 'LI', 'OPTION', 'TH', 'TD', 'SPAN', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'])
const TEXT_ROLES = new Set(['button', 'link', 'menuitem', 'tab', 'option', 'treeitem'])

/** Returns true if the text string is stable enough to use as a selector. */
function isStableText(text: string): boolean {
  if (!text || text.length === 0 || text.length > 40) return false
  if (/^\d+(\.\d+)?$/.test(text)) return false       // pure numbers (prices, counts)
  if (/^[\W_]+$/.test(text)) return false             // only symbols/punctuation
  if (/\d{4,}/.test(text)) return false               // contains long number sequences
  return true
}

/** Escape single quotes for use inside XPath string literals. */
function xpathText(text: string): string {
  // XPath can't escape quotes inside a single-quoted string — use concat() for strings with apostrophes
  if (!text.includes("'")) return `'${text}'`
  if (!text.includes('"')) return `"${text}"`
  // Mixed: use concat()
  return `concat('${text.replace(/'/g, `', "'", '`)}')`
}

export function generateSelector(el: Element): SelectorObject {
  const candidates: string[] = []
  const tag = el.tagName.toLowerCase()

  // 1. data-testid / data-cy / data-qa
  for (const attr of ['data-testid', 'data-cy', 'data-qa', 'data-id']) {
    const val = el.getAttribute(attr)
    if (val) candidates.push(`[${attr}="${CSS.escape(val)}"]`)
  }

  // 2. aria-label
  const ariaLabel = el.getAttribute('aria-label')
  if (ariaLabel) candidates.push(`[aria-label="${CSS.escape(ariaLabel)}"]`)

  // 3. role attribute
  const role = el.getAttribute('role')
  if (role) candidates.push(`[role="${role}"]`)

  // 4. id
  const id = el.id
  if (id) candidates.push(`#${CSS.escape(id)}`)

  // 5. name attribute (inputs, selects)
  const name = el.getAttribute('name')
  if (name) candidates.push(`[name="${CSS.escape(name)}"]`)

  // 6. type + placeholder for inputs
  if (el.tagName === 'INPUT') {
    const type = (el as HTMLInputElement).type
    const placeholder = el.getAttribute('placeholder')
    if (type && placeholder) {
      candidates.push(`input[type="${type}"][placeholder="${CSS.escape(placeholder)}"]`)
    } else if (type && type !== 'text') {
      candidates.push(`input[type="${type}"]`)
    }
  }

  // 7. Text content — for interactive elements with short stable labels
  const isTextTarget = TEXT_TAGS.has(el.tagName) || (role !== null && TEXT_ROLES.has(role))
  if (isTextTarget) {
    const raw = el.textContent?.trim() ?? ''
    if (isStableText(raw)) {
      // XPath exact match (executor must support xpath= prefix)
      candidates.push(`xpath=//${tag}[normalize-space()=${xpathText(raw)}]`)
    }
  }

  // 8. Class-based (first 2 meaningful classes, skip state/utility classes)
  const classes = Array.from(el.classList).filter(c =>
    !c.match(/^(active|hover|focus|selected|open|disabled|visible|hidden|is-|has-)/)
  )
  if (classes.length > 0) {
    candidates.push(`${tag}.${classes.slice(0, 2).map(CSS.escape).join('.')}`)
  }

  // 9. Nth-child positional fallback
  const positional = buildPositionalSelector(el)
  if (positional) candidates.push(positional)

  // Sort by stability score descending
  const sorted = candidates.sort((a, b) => scoreSelector(b) - scoreSelector(a))

  const primary = sorted[0] ?? buildPositionalSelector(el) ?? tag
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
    const t = current.tagName.toLowerCase()
    const parent: Element | null = current.parentElement
    if (!parent) break

    const siblings = Array.from(parent.children).filter((c: Element) => c.tagName === current!.tagName)
    if (siblings.length > 1) {
      const index = siblings.indexOf(current) + 1
      parts.unshift(`${t}:nth-of-type(${index})`)
    } else {
      parts.unshift(t)
    }

    current = parent
  }

  return parts.join(' > ')
}
