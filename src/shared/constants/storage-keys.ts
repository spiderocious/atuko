/**
 * All chrome.storage key strings — never use raw strings in feature code.
 */
export const STORAGE_KEYS = {
  // Workflows — keyed by workflow ID: `${WORKFLOW_PREFIX}${id}`
  WORKFLOW_PREFIX: 'workflow:',

  // All workflow IDs index
  WORKFLOW_INDEX: 'workflowIndex',

  // Site configs — keyed by hostname: `${SITE_CONFIG_PREFIX}${hostname}`
  SITE_CONFIG_PREFIX: 'siteConfig:',

  // All site config hostnames index
  SITE_CONFIG_INDEX: 'siteConfigIndex',

  // Global variables
  GLOBAL_VARS: 'globalVars',

  // Run history — keyed by workflow ID: `${RUN_HISTORY_PREFIX}${workflowId}`
  RUN_HISTORY_PREFIX: 'runHistory:',

  // Screenshots — keyed by run ID: `${SCREENSHOT_PREFIX}${runId}`
  SCREENSHOT_PREFIX: 'screenshots:',

  // Extension settings (chrome.storage.sync)
  SETTINGS: 'settings',
} as const

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS]

// Max runs stored per workflow
export const MAX_RUN_HISTORY = 50

// Screenshots older than this are purged on service worker startup
export const SCREENSHOT_PURGE_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days
