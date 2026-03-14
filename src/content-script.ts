/**
 * Atuko Content Script
 * Injected into every page. Executes workflow steps against the live DOM.
 * Receives step execution commands from the service worker.
 */

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('[Atuko CS] Message received:', message)
  sendResponse({ ok: true })
  return true
})
