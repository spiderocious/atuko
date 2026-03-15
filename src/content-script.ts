/**
 * Atuko Content Script
 * Injected into every page. Executes workflow steps against the live DOM.
 * Receives step execution commands from the service worker.
 */

import { MSG } from '@shared/constants/messages'
import { StepObject, SiteConfig, ActiveRunState } from '@shared/types'
import { StepResult } from '@shared/types'
import { injectToast, removeToast } from './executor/toast-bridge'
import { executeClick } from './executor/steps/click'
import { executeFill } from './executor/steps/fill'
import { executeWait } from './executor/steps/wait'
import { executeScroll } from './executor/steps/scroll'
import { executeNavigate } from './executor/steps/navigate'
import { executeSubmit } from './executor/steps/submit'
import { executeSelect } from './executor/steps/select'
import { executeHover } from './executor/steps/hover'
import { executeKeypress } from './executor/steps/keypress'
import { executeExtract } from './executor/steps/extract'
import { executeScreenshot } from './executor/steps/screenshot'
import { executeTab } from './executor/steps/tab'
import { executeClipboard } from './executor/steps/clipboard'
import { executeStorageStep } from './executor/steps/storage-step'
import { executeLog } from './executor/steps/log'
import { executePrompt } from './executor/steps/prompt'
import { executeSetVariable } from './executor/steps/set-variable'
import { startRecording, stopRecording } from './recorder/recorder'
import { generateSelector } from './recorder/selector-generator'

let currentSiteConfig: SiteConfig | undefined

// Fetch site config from service worker on load
chrome.runtime.sendMessage(
  { type: MSG.GET_SITE_CONFIG, hostname: window.location.hostname },
  (response: { config?: SiteConfig }) => {
    currentSiteConfig = response?.config
  }
)

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const msg = message as { type: string; step?: StepObject; isDryRun?: boolean; runId?: string; payload?: ActiveRunState; workflowId?: string }

  if (msg.type === MSG.EXECUTE_STEP && msg.step) {
    handleExecuteStep(msg.step, msg.isDryRun ?? false, msg.runId ?? '')
      .then(sendResponse)
      .catch((e) => sendResponse({ stepId: msg.step!.id, success: false, error: String(e) }))
    return true
  }

  if (msg.type === MSG.RUN_STATUS_UPDATE && msg.payload) {
    const payload = msg.payload
    if (payload.status === 'running') {
      injectToast(payload)
    } else if (payload.status === 'success' || payload.status === 'failed') {
      setTimeout(() => removeToast(), 2000)
    }
    sendResponse({ ok: true })
    return
  }

  if (msg.type === MSG.START_RECORD && msg.workflowId) {
    startRecording(msg.workflowId)
    sendResponse({ ok: true })
    return
  }

  if (msg.type === MSG.STOP_RECORD) {
    stopRecording()
    sendResponse({ ok: true })
    return
  }

  if (msg.type === MSG.START_PICK) {
    startElementPicker()
    sendResponse({ ok: true })
    return
  }

  if (msg.type === MSG.STOP_PICK) {
    stopElementPicker()
    sendResponse({ ok: true })
    return
  }

  sendResponse({ ok: false, error: `Unknown CS message: ${msg.type}` })
})

// ─── Element Picker ───────────────────────────────────────────────────────────

let _pickerActive = false
let _pickerStyle: HTMLStyleElement | null = null
let _pickerOverlay: HTMLElement | null = null

function startElementPicker(): void {
  if (_pickerActive) return
  _pickerActive = true

  // Inject cursor + hover highlight style
  _pickerStyle = document.createElement('style')
  _pickerStyle.id = 'atuko-picker-style'
  _pickerStyle.textContent = `
    body * { cursor: crosshair !important; }
    .atuko-pick-hover { outline: 2px solid #7C5CFC !important; outline-offset: 1px; background: rgba(124,92,252,0.08) !important; }
  `
  document.head.appendChild(_pickerStyle)

  // Floating badge
  _pickerOverlay = document.createElement('div')
  _pickerOverlay.id = 'atuko-picker-overlay'
  _pickerOverlay.style.cssText = `
    position: fixed; top: 12px; left: 50%; transform: translateX(-50%);
    z-index: 2147483647; background: #7C5CFC; color: #fff;
    font: 600 13px/1 -apple-system, sans-serif; padding: 6px 14px;
    border-radius: 9999px; pointer-events: none;
    box-shadow: 0 4px 12px rgba(124,92,252,0.4);
  `
  _pickerOverlay.textContent = 'Click an element to select it — Esc to cancel'
  document.body.appendChild(_pickerOverlay)

  document.addEventListener('mouseover', _onPickHover, true)
  document.addEventListener('click', _onPickClick, true)
  document.addEventListener('keydown', _onPickKeydown, true)
}

function stopElementPicker(): void {
  if (!_pickerActive) return
  _pickerActive = false
  document.removeEventListener('mouseover', _onPickHover, true)
  document.removeEventListener('click', _onPickClick, true)
  document.removeEventListener('keydown', _onPickKeydown, true)
  _pickerStyle?.remove()
  _pickerStyle = null
  _pickerOverlay?.remove()
  _pickerOverlay = null
  document.querySelectorAll('.atuko-pick-hover').forEach(el => el.classList.remove('atuko-pick-hover'))
}

function _onPickHover(e: Event): void {
  document.querySelectorAll('.atuko-pick-hover').forEach(el => el.classList.remove('atuko-pick-hover'))
  const el = e.target as Element
  if (el && el !== _pickerOverlay) el.classList.add('atuko-pick-hover')
}

function _onPickClick(e: Event): void {
  e.preventDefault()
  e.stopPropagation()
  const el = e.target as Element
  if (!el || el === _pickerOverlay) return
  const selectorObj = generateSelector(el)
  stopElementPicker()
  chrome.runtime.sendMessage({
    type: MSG.PICK_RESULT,
    selector: selectorObj.primary,
    selectorObj: {
      ...selectorObj,
      tagName: el.tagName,
      text: el.textContent?.trim().slice(0, 80) ?? '',
    },
  })
}

function _onPickKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    e.preventDefault()
    e.stopPropagation()
    stopElementPicker()
    chrome.runtime.sendMessage({ type: MSG.PICK_RESULT, selector: null })
  }
}

// ─── Step executor ────────────────────────────────────────────────────────────

async function handleExecuteStep(
  step: StepObject,
  isDryRun: boolean,
  runId: string
): Promise<StepResult> {
  switch (step.type) {
    case 'click':       return executeClick(step, currentSiteConfig, isDryRun)
    case 'fill':        return executeFill(step, currentSiteConfig, isDryRun)
    case 'wait':        return executeWait(step, currentSiteConfig, isDryRun)
    case 'scroll':      return executeScroll(step, currentSiteConfig, isDryRun)
    case 'navigate':    return executeNavigate(step, isDryRun)
    case 'submit':      return executeSubmit(step, currentSiteConfig, isDryRun)
    case 'select':      return executeSelect(step, currentSiteConfig, isDryRun)
    case 'hover':       return executeHover(step, currentSiteConfig, isDryRun)
    case 'keypress':    return executeKeypress(step, currentSiteConfig, isDryRun)
    case 'extract':     return executeExtract(step, currentSiteConfig, isDryRun)
    case 'screenshot':  return executeScreenshot(step, isDryRun)
    case 'tab':         return executeTab(step, isDryRun)
    case 'clipboard':   return executeClipboard(step, isDryRun)
    case 'storage':     return executeStorageStep(step, isDryRun)
    case 'log':         return executeLog(step)
    case 'prompt':      return executePrompt(step, runId, isDryRun)
    case 'setVariable': return executeSetVariable(step, isDryRun)
    default:
      return { stepId: step.id, success: false, error: `Unknown step type: ${step.type}` }
  }
}
