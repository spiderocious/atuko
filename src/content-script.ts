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

let currentSiteConfig: SiteConfig | undefined

// Fetch site config from service worker on load
chrome.runtime.sendMessage(
  { type: MSG.GET_SITE_CONFIG, hostname: window.location.hostname },
  (response: { config?: SiteConfig }) => {
    currentSiteConfig = response?.config
  }
)

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const msg = message as { type: string; step?: StepObject; isDryRun?: boolean; runId?: string; payload?: ActiveRunState }

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

  sendResponse({ ok: false, error: `Unknown CS message: ${msg.type}` })
})

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
