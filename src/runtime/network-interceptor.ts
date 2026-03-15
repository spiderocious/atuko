/**
 * network-interceptor.ts
 * Manages injection and removal of the page-level fetch/XHR proxy
 * based on the active site config's intercept rules.
 * Runs in the service worker context.
 */

import { SiteConfig, InterceptRule } from '@shared/types'
import { setVariable } from './variable-resolver'
import { ScopedVariableStore } from '@shared/types'
import { PageInterceptRule, installFetchProxy } from '../executor/page-fetch-proxy'

// Track which tabs have the proxy installed
const _installedTabs = new Set<number>()

function toPageRule(rule: InterceptRule): PageInterceptRule {
  return {
    id: rule.id,
    urlPattern: rule.urlPattern,
    methods: rule.methods,
    action: rule.action,
    saveAs: rule.saveAs,
    responseBody: rule.responseBody,
    responseHeaders: rule.responseHeaders as Record<string, string | number> | undefined,
  }
}

/**
 * Injects the fetch proxy into the given tab with all active intercept rules.
 */
export async function installInterceptor(tabId: number, siteConfig: SiteConfig): Promise<void> {
  const activeRules = siteConfig.interceptRules.filter(r => r.enabled)
  if (activeRules.length === 0) return

  const pageRules = activeRules.map(toPageRule)

  await chrome.scripting.executeScript({
    target: { tabId },
    func: installFetchProxy,
    args: [pageRules],
    world: 'MAIN', // runs in page context
  })

  _installedTabs.add(tabId)
}

/**
 * Removes the proxy tracking entry (the page proxy itself lives until navigation).
 */
export function removeInterceptor(tabId: number): void {
  _installedTabs.delete(tabId)
}

/**
 * Listens for INTERCEPT_CAPTURE messages from the page (sent via window.postMessage
 * → content script → service worker) and stores captured values.
 */
export function handleInterceptCapture(
  message: { ruleId: string; saveAs?: string; body: string; status: number; url: string },
  store: ScopedVariableStore
): ScopedVariableStore {
  if (!message.saveAs) return store
  return setVariable(message.saveAs, message.body, 'run', store)
}
