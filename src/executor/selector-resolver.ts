import { SelectorObject } from '@shared/types'
import { SiteConfig } from '@shared/types'

export interface ResolvedSelector {
  element: Element
  usedSelector: string
  stabilityScore: number
}

/**
 * Resolves a SelectorObject to a live DOM element.
 * Tries primary, then each fallback in order.
 * Resolves @alias references from site config.
 */
export function resolveSelector(
  selector: SelectorObject,
  siteConfig: SiteConfig | undefined
): ResolvedSelector | null {
  const selectors = [selector.primary, ...selector.fallbacks]

  for (const raw of selectors) {
    const resolved = resolveAlias(raw, siteConfig)
    const element = queryElement(resolved)
    if (element) {
      return {
        element,
        usedSelector: resolved,
        stabilityScore: selector.stabilityScore,
      }
    }
  }
  return null
}

function resolveAlias(selector: string, siteConfig: SiteConfig | undefined): string {
  if (!selector.startsWith('@') || !siteConfig) return selector
  const name = selector.slice(1)
  const alias = siteConfig.aliases.find((a) => a.name === name)
  return alias?.selector ?? selector
}

function queryElement(selector: string): Element | null {
  try {
    // Support explicit xpath= prefix as well as bare XPath expressions
    const xpath = selector.startsWith('xpath=') ? selector.slice(6) : selector
    if (xpath.startsWith('//') || xpath.startsWith('(//')) {
      const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      )
      return result.singleNodeValue as Element | null
    }
    return document.querySelector(selector)
  } catch {
    return null
  }
}
