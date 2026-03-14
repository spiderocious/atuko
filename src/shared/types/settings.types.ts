export type SelectorStrategy = 'css-first' | 'xpath-first' | 'auto'

export interface ExtensionSettings {
  selectorStrategy: SelectorStrategy
  defaultTimeoutMs: number
  defaultRetries: number
  notificationsEnabled: boolean
  consoleLogCaptureEnabled: boolean
  theme: 'system' | 'light' | 'dark'
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  selectorStrategy: 'auto',
  defaultTimeoutMs: 10000,
  defaultRetries: 2,
  notificationsEnabled: true,
  consoleLogCaptureEnabled: false,
  theme: 'system',
}
