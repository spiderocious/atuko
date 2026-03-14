/**
 * Feature flags gate every major feature entrypoint.
 * Set a flag to false to disable the entire feature without touching feature code.
 */
export const FEATURE_FLAGS = {
  POPUP: true,
  SIDE_PANEL: true,
  TOAST: true,
  OPTIONS: true,
  RECORD_MODE: true,
  DRY_RUN_MODE: true,
  STEP_BY_STEP_MODE: true,
  SELECTOR_INSPECTOR: true,
  NETWORK_INTERCEPTION: true,
  RUNTIME_PROMPTS: true,
  MULTI_VALUE_INPUTS: true,
  WORKFLOW_EXPORT_IMPORT: true,
  WORKFLOW_TAGS: true,
  RUN_HISTORY: true,
  COMPLETION_NOTIFICATIONS: true,
  CONSOLE_LOG_CAPTURE: true,
  CLOUD_SYNC: false, // V2
  CHAIN_TRIGGER: false, // V2
  SCHEDULE_TRIGGER: false, // V2
} as const

export type FeatureFlag = keyof typeof FEATURE_FLAGS

export function isEnabled(flag: FeatureFlag): boolean {
  return FEATURE_FLAGS[flag]
}
