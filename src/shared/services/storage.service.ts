import {
  Workflow,
  RunRecord,
  SiteConfig,
  VariableStore,
  ExtensionSettings,
  DEFAULT_SETTINGS,
} from '@shared/types'
import {
  STORAGE_KEYS,
  MAX_RUN_HISTORY,
  SCREENSHOT_PURGE_AGE_MS,
} from '@shared/constants/storage-keys'

// ─── Low-level helpers ────────────────────────────────────────────────────────

function localGet<T>(key: string): Promise<T | undefined> {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => {
      resolve(result[key] as T | undefined)
    })
  })
}

function localSet(key: string, value: unknown): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, resolve)
  })
}

function localRemove(key: string): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.remove(key, resolve)
  })
}

function syncGet<T>(key: string): Promise<T | undefined> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(key, (result) => {
      resolve(result[key] as T | undefined)
    })
  })
}

function syncSet(key: string, value: unknown): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [key]: value }, resolve)
  })
}

// ─── Workflows ────────────────────────────────────────────────────────────────

export async function getWorkflowIndex(): Promise<string[]> {
  return (await localGet<string[]>(STORAGE_KEYS.WORKFLOW_INDEX)) ?? []
}

export async function saveWorkflow(workflow: Workflow): Promise<void> {
  const key = `${STORAGE_KEYS.WORKFLOW_PREFIX}${workflow.id}`
  await localSet(key, workflow)

  const index = await getWorkflowIndex()
  if (!index.includes(workflow.id)) {
    await localSet(STORAGE_KEYS.WORKFLOW_INDEX, [...index, workflow.id])
  }
}

export async function getWorkflow(id: string): Promise<Workflow | undefined> {
  const key = `${STORAGE_KEYS.WORKFLOW_PREFIX}${id}`
  return localGet<Workflow>(key)
}

export async function getAllWorkflows(): Promise<Workflow[]> {
  const index = await getWorkflowIndex()
  const workflows = await Promise.all(index.map(getWorkflow))
  return workflows.filter((w): w is Workflow => w !== undefined)
}

export async function deleteWorkflow(id: string): Promise<void> {
  const key = `${STORAGE_KEYS.WORKFLOW_PREFIX}${id}`
  await localRemove(key)

  const index = await getWorkflowIndex()
  await localSet(
    STORAGE_KEYS.WORKFLOW_INDEX,
    index.filter((wid) => wid !== id)
  )
}

// ─── Site Configs ─────────────────────────────────────────────────────────────

export async function getSiteConfigIndex(): Promise<string[]> {
  return (await localGet<string[]>(STORAGE_KEYS.SITE_CONFIG_INDEX)) ?? []
}

export async function saveSiteConfig(config: SiteConfig): Promise<void> {
  const key = `${STORAGE_KEYS.SITE_CONFIG_PREFIX}${config.hostname}`
  await localSet(key, config)

  const index = await getSiteConfigIndex()
  if (!index.includes(config.hostname)) {
    await localSet(STORAGE_KEYS.SITE_CONFIG_INDEX, [...index, config.hostname])
  }
}

export async function getSiteConfig(hostname: string): Promise<SiteConfig | undefined> {
  const key = `${STORAGE_KEYS.SITE_CONFIG_PREFIX}${hostname}`
  return localGet<SiteConfig>(key)
}

export async function deleteSiteConfig(hostname: string): Promise<void> {
  const key = `${STORAGE_KEYS.SITE_CONFIG_PREFIX}${hostname}`
  await localRemove(key)

  const index = await getSiteConfigIndex()
  await localSet(
    STORAGE_KEYS.SITE_CONFIG_INDEX,
    index.filter((h) => h !== hostname)
  )
}

// ─── Global Variables ─────────────────────────────────────────────────────────

export async function getGlobalVars(): Promise<VariableStore> {
  return (await localGet<VariableStore>(STORAGE_KEYS.GLOBAL_VARS)) ?? {}
}

export async function setGlobalVar(name: string, value: string): Promise<void> {
  const vars = await getGlobalVars()
  await localSet(STORAGE_KEYS.GLOBAL_VARS, { ...vars, [name]: value })
}

export async function saveGlobalVars(vars: VariableStore): Promise<void> {
  await localSet(STORAGE_KEYS.GLOBAL_VARS, vars)
}

// ─── Run History ──────────────────────────────────────────────────────────────

export async function getRunHistory(workflowId: string): Promise<RunRecord[]> {
  const key = `${STORAGE_KEYS.RUN_HISTORY_PREFIX}${workflowId}`
  return (await localGet<RunRecord[]>(key)) ?? []
}

export async function appendRunRecord(record: RunRecord): Promise<void> {
  const history = await getRunHistory(record.workflowId)
  const updated = [record, ...history].slice(0, MAX_RUN_HISTORY)
  const key = `${STORAGE_KEYS.RUN_HISTORY_PREFIX}${record.workflowId}`
  await localSet(key, updated)
}

export async function getRunRecord(
  workflowId: string,
  runId: string
): Promise<RunRecord | undefined> {
  const history = await getRunHistory(workflowId)
  return history.find((r) => r.id === runId)
}

/** Returns a map of workflowId → last RunRecord (most recent run) for each given ID. */
export async function getLastRunsForWorkflows(
  workflowIds: string[]
): Promise<Record<string, RunRecord | undefined>> {
  if (workflowIds.length === 0) return {}
  const keys = workflowIds.map(id => `${STORAGE_KEYS.RUN_HISTORY_PREFIX}${id}`)
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (result) => {
      const out: Record<string, RunRecord | undefined> = {}
      workflowIds.forEach((id, i) => {
        const history = result[keys[i]] as RunRecord[] | undefined
        out[id] = history?.[0]
      })
      resolve(out)
    })
  })
}

// ─── Screenshots ──────────────────────────────────────────────────────────────

interface ScreenshotEntry {
  dataUri: string
  capturedAt: string
}

export async function saveScreenshot(
  runId: string,
  filename: string,
  dataUri: string
): Promise<void> {
  const key = `${STORAGE_KEYS.SCREENSHOT_PREFIX}${runId}:${filename}`
  const entry: ScreenshotEntry = { dataUri, capturedAt: new Date().toISOString() }
  await localSet(key, entry)
}

/**
 * Purge screenshots older than SCREENSHOT_PURGE_AGE_MS.
 * Called on service worker startup.
 */
export async function purgeOldScreenshots(): Promise<void> {
  const allData = await new Promise<Record<string, unknown>>((resolve) => {
    chrome.storage.local.get(null, resolve)
  })

  const cutoff = Date.now() - SCREENSHOT_PURGE_AGE_MS
  const keysToRemove: string[] = []

  for (const [key, value] of Object.entries(allData)) {
    if (!key.startsWith(STORAGE_KEYS.SCREENSHOT_PREFIX)) continue
    const entry = value as ScreenshotEntry
    if (entry?.capturedAt && new Date(entry.capturedAt).getTime() < cutoff) {
      keysToRemove.push(key)
    }
  }

  if (keysToRemove.length > 0) {
    await new Promise<void>((resolve) => {
      chrome.storage.local.remove(keysToRemove, resolve)
    })
  }
}

// ─── Extension Settings ───────────────────────────────────────────────────────

export async function getSettings(): Promise<ExtensionSettings> {
  const stored = await syncGet<Partial<ExtensionSettings>>(STORAGE_KEYS.SETTINGS)
  return { ...DEFAULT_SETTINGS, ...stored }
}

export async function saveSettings(settings: ExtensionSettings): Promise<void> {
  await syncSet(STORAGE_KEYS.SETTINGS, settings)
}
