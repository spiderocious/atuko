/**
 * Scores how stable/resilient a CSS selector is.
 * Higher score = more likely to survive DOM changes.
 */

export function scoreSelector(selector: string): number {
  if (!selector) return 0

  // data-testid, data-cy, data-qa → very stable
  if (/\[data-testid=|data-cy=|data-qa=/.test(selector)) return 0.95

  // aria-label, role → high semantic stability
  if (/\[aria-label=|\[role=/.test(selector)) return 0.85

  // id → stable but can change
  if (/^#/.test(selector) || /\[id=/.test(selector)) return 0.85

  // name attribute on inputs
  if (/\[name=/.test(selector)) return 0.75

  // xpath= text selectors (normalize-space exact match)
  if (/^xpath=/.test(selector) && /normalize-space\(\)/.test(selector)) return 0.72

  // text content selectors (XPath :contains type)
  if (/text\(\)|contains\(/.test(selector)) return 0.70

  // class selectors only
  if (/^\./.test(selector) && !/\s/.test(selector)) return 0.55

  // tag + class combos
  if (/[a-z]+\.[a-z]/i.test(selector)) return 0.50

  // nth-child / positional
  if (/nth-child|nth-of-type|:first-|:last-/.test(selector)) return 0.30

  // deep descendant paths (fragile)
  if ((selector.match(/\s/g)?.length ?? 0) > 3) return 0.25

  return 0.45
}

export function scoreSelectorList(selectors: string[]): number {
  if (selectors.length === 0) return 0
  return Math.max(...selectors.map(scoreSelector))
}
