/**
 * page-fetch-proxy.ts
 * Injected into page context via scripting.executeScript to intercept
 * window.fetch and XMLHttpRequest before they hit the network.
 *
 * NOTE: This file runs in the PAGE context (not extension context).
 * It communicates intercept results back via window.postMessage.
 */

export type InterceptAction = 'read' | 'modify'

export interface PageInterceptRule {
  id: string
  urlPattern: string
  methods: string[]
  action: InterceptAction
  saveAs?: string
  responseBody?: unknown
  responseHeaders?: Record<string, string | number>
}

// Called by scripting.executeScript with the rules as args
export function installFetchProxy(rules: PageInterceptRule[]): void {
  if ((window as Window & { __atuko_proxy__?: boolean }).__atuko_proxy__) return
  ;(window as Window & { __atuko_proxy__?: boolean }).__atuko_proxy__ = true

  function matchesRule(rule: PageInterceptRule, url: string, method: string): boolean {
    const pattern = rule.urlPattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*')
    const re = new RegExp(pattern)
    const methodMatch = rule.methods.length === 0 || rule.methods.includes(method.toUpperCase())
    return re.test(url) && methodMatch
  }

  function notifyCapture(rule: PageInterceptRule, url: string, body: string, status: number) {
    window.postMessage({
      __atuko__: true,
      type: 'INTERCEPT_CAPTURE',
      ruleId: rule.id,
      saveAs: rule.saveAs,
      url,
      status,
      body,
    }, '*')
  }

  // ── Fetch override ──────────────────────────────────────────────────────────
  const origFetch = window.fetch.bind(window)
  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url
    const method = init?.method ?? (input instanceof Request ? input.method : 'GET')

    for (const rule of rules) {
      if (!matchesRule(rule, url, method)) continue

      if (rule.action === 'modify' && rule.responseBody !== undefined) {
        const headers = new Headers({ 'Content-Type': 'application/json', ...rule.responseHeaders as Record<string, string> })
        const status = (rule.responseHeaders?.['status'] as number) ?? 200
        return new Response(JSON.stringify(rule.responseBody), { status, headers })
      }

      if (rule.action === 'read') {
        const res = await origFetch(input, init)
        const clone = res.clone()
        clone.text().then(body => notifyCapture(rule, url, body, res.status))
        return res
      }
    }

    return origFetch(input, init)
  }

  // ── XHR override ────────────────────────────────────────────────────────────
  const OrigXHR = window.XMLHttpRequest
  class PatchedXHR extends OrigXHR {
    private _url = ''
    private _matchedRule: PageInterceptRule | null = null

    open(method: string, url: string | URL, async?: boolean, user?: string, password?: string) {
      this._url = String(url)
      for (const rule of rules) {
        if (matchesRule(rule, this._url, method)) {
          this._matchedRule = rule
          break
        }
      }
      if (async !== undefined) {
        super.open(method, url, async, user, password)
      } else {
        super.open(method, url)
      }
    }

    send(body?: Document | XMLHttpRequestBodyInit | null) {
      const rule = this._matchedRule
      if (rule?.action === 'modify' && rule.responseBody !== undefined) {
        // Fake the response
        Object.defineProperty(this, 'readyState', { get: () => 4 })
        Object.defineProperty(this, 'status', { get: () => (rule.responseHeaders?.['status'] as number) ?? 200 })
        Object.defineProperty(this, 'responseText', { get: () => JSON.stringify(rule.responseBody) })
        setTimeout(() => this.dispatchEvent(new Event('load')), 0)
        return
      }

      if (rule?.action === 'read') {
        this.addEventListener('load', () => {
          notifyCapture(rule, this._url, this.responseText, this.status)
        })
      }

      super.send(body)
    }
  }

  window.XMLHttpRequest = PatchedXHR as unknown as typeof XMLHttpRequest
}
