/**
 * Atuko Service Worker — Runtime orchestration engine.
 * Handles all extension messaging, triggers workflow execution,
 * and broadcasts status updates to popup and toast.
 */

import { MSG } from '@shared/constants/messages'
import {
  saveWorkflow,
  getAllWorkflows,
  getWorkflow,
  deleteWorkflow,
  getRunHistory,
  getSiteConfig,
  saveSiteConfig,
  getGlobalVars,
  purgeOldScreenshots,
} from '@shared/services/storage.service'
import {
  startWorkflow,
  pauseRun,
  resumeRun,
  stopRun,
  resolvePrompt,
  advanceStep,
  getActiveRunIds,
} from './runtime/workflow-runner'
import { nanoid } from './runtime/nanoid'

// ─── Startup ──────────────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Atuko] Extension installed')
})

self.addEventListener('activate', () => {
  purgeOldScreenshots().catch(console.error)
})

// ─── URL-match trigger ────────────────────────────────────────────────────────

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!tab.url) return
  if (changeInfo.status !== 'complete') return

  const allWorkflows = await getAllWorkflows()
  const enabled = allWorkflows.filter((w) => w.enabled)

  for (const workflow of enabled) {
    for (const trigger of workflow.triggers) {
      if (trigger.type !== 'url-match') continue

      const matches = urlMatchesTrigger(tab.url, trigger.pattern, trigger.matchType)
      if (!matches) continue

      const delay = trigger.delay ?? 0
      setTimeout(() => {
        triggerWorkflow(workflow.id, tabId, 'url-match', 'normal')
      }, delay)
    }
  }
})

function urlMatchesTrigger(
  url: string,
  pattern: string,
  matchType: 'exact' | 'prefix' | 'glob' | 'regex'
): boolean {
  switch (matchType) {
    case 'exact':  return url === pattern
    case 'prefix': return url.startsWith(pattern)
    case 'glob': {
      const regexStr = pattern
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.')
      return new RegExp(`^${regexStr}$`).test(url)
    }
    case 'regex': {
      try { return new RegExp(pattern).test(url) } catch { return false }
    }
  }
}

// ─── Message Router ───────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  handleMessage(message as Record<string, unknown> & { type: string }, sendResponse)
  return true
})

function handleMessage(
  message: Record<string, unknown> & { type: string },
  sendResponse: (response: unknown) => void
): void {
  const { type } = message

  switch (type) {
    case MSG.TRIGGER_WORKFLOW: {
      const workflowId = message['workflowId'] as string
      const mode = (message['mode'] as 'normal' | 'dry-run' | 'step-by-step') ?? 'normal'
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0]?.id
        if (!tabId) { sendResponse({ ok: false, error: 'No active tab' }); return }
        triggerWorkflow(workflowId, tabId, 'manual', mode)
          .then(() => sendResponse({ ok: true }))
          .catch((e) => sendResponse({ ok: false, error: String(e) }))
      })
      break
    }

    case MSG.PAUSE_RUN:
      pauseRun(message['runId'] as string)
      sendResponse({ ok: true })
      break

    case MSG.RESUME_RUN:
      resumeRun(message['runId'] as string)
      sendResponse({ ok: true })
      break

    case MSG.STOP_RUN:
      stopRun(message['runId'] as string)
      sendResponse({ ok: true })
      break

    case MSG.PROMPT_RESPONSE:
      resolvePrompt(message['runId'] as string, message['value'] as string)
      sendResponse({ ok: true })
      break

    case MSG.STEP_ADVANCE:
      advanceStep(message['runId'] as string)
      sendResponse({ ok: true })
      break

    case MSG.GET_RUN_STATUS:
      sendResponse({ activeRunIds: getActiveRunIds() })
      break

    case MSG.SAVE_WORKFLOW:
      saveWorkflow(message['workflow'] as Parameters<typeof saveWorkflow>[0])
        .then(() => sendResponse({ ok: true }))
        .catch((e) => sendResponse({ ok: false, error: String(e) }))
      break

    case MSG.GET_WORKFLOWS:
      getAllWorkflows()
        .then((workflows) => sendResponse({ workflows }))
        .catch((e) => sendResponse({ workflows: [], error: String(e) }))
      break

    case MSG.GET_WORKFLOW:
      getWorkflow(message['workflowId'] as string)
        .then((workflow) => sendResponse({ workflow }))
        .catch((e) => sendResponse({ workflow: null, error: String(e) }))
      break

    case MSG.DELETE_WORKFLOW:
      deleteWorkflow(message['workflowId'] as string)
        .then(() => sendResponse({ ok: true }))
        .catch((e) => sendResponse({ ok: false, error: String(e) }))
      break

    case MSG.GET_RUN_HISTORY:
      getRunHistory(message['workflowId'] as string)
        .then((runs) => sendResponse({ runs }))
        .catch((e) => sendResponse({ runs: [], error: String(e) }))
      break

    case MSG.SAVE_SITE_CONFIG:
      saveSiteConfig(message['config'] as Parameters<typeof saveSiteConfig>[0])
        .then(() => sendResponse({ ok: true }))
        .catch((e) => sendResponse({ ok: false, error: String(e) }))
      break

    case MSG.GET_SITE_CONFIG:
      getSiteConfig(message['hostname'] as string)
        .then((config) => sendResponse({ config }))
        .catch((e) => sendResponse({ config: null, error: String(e) }))
      break

    case MSG.RECORDED_ACTION: {
      const wfId = message['workflowId'] as string
      const step = message['step'] as import('@shared/types').StepObject
      getWorkflow(wfId)
        .then(wf => {
          if (!wf) { sendResponse({ ok: false, error: 'Workflow not found' }); return }
          return saveWorkflow({ ...wf, steps: [...wf.steps, step], updatedAt: new Date().toISOString() })
        })
        .then(() => sendResponse({ ok: true }))
        .catch((e) => sendResponse({ ok: false, error: String(e) }))
      break
    }

    case MSG.OPEN_SIDE_PANEL:
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const windowId = tabs[0]?.windowId
        if (!windowId) { sendResponse({ ok: false, error: 'No active window' }); return }
        chrome.sidePanel.open({ windowId })
          .then(() => sendResponse({ ok: true }))
          .catch((e) => sendResponse({ ok: false, error: String(e) }))
      })
      break

    default:
      sendResponse({ ok: false, error: `Unknown message type: ${type}` })
  }
}

// ─── Trigger helper ───────────────────────────────────────────────────────────

async function triggerWorkflow(
  workflowId: string,
  tabId: number,
  _source: 'manual' | 'url-match',
  mode: 'normal' | 'dry-run' | 'step-by-step'
): Promise<void> {
  const workflow = await getWorkflow(workflowId)
  if (!workflow) throw new Error(`Workflow ${workflowId} not found`)

  const globalVariables = await getGlobalVars()
  const siteConfig = workflow.siteConfig
    ? await getSiteConfig(workflow.siteConfig)
    : undefined

  await startWorkflow({
    workflow,
    tabId,
    runId: nanoid(),
    mode,
    siteVariables: siteConfig?.sharedVariables ?? {},
    globalVariables,
  })
}
