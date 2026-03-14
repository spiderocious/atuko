/**
 * Atuko Service Worker
 * Orchestrates workflow execution. Receives messages from side panel and popup,
 * dispatches steps to content script, broadcasts status updates.
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Atuko] Extension installed')
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('[Atuko SW] Message received:', message)
  sendResponse({ ok: true })
  return true
})
