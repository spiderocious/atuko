// ─── Selector ────────────────────────────────────────────────────────────────

export interface SelectorObject {
  primary: string
  fallbacks: string[]
  stabilityScore: number // 0–1
}

// ─── Conditions ───────────────────────────────────────────────────────────────

export type ConditionType =
  | 'element-exists'
  | 'element-missing'
  | 'element-text'
  | 'element-value'
  | 'url-matches'
  | 'variable'
  | 'response-contains'

export type ConditionOperator =
  | 'equals'
  | 'not-equals'
  | 'contains'
  | 'not-contains'
  | 'starts-with'
  | 'ends-with'
  | 'greater-than'
  | 'less-than'
  | 'is-empty'
  | 'is-not-empty'

export interface ConditionObject {
  type: ConditionType
  selector?: SelectorObject
  pattern?: string
  variable?: string
  operator?: ConditionOperator
  value?: string
  responseVar?: string
  key?: string
}

// ─── Multi-value / Ask-at-runtime ─────────────────────────────────────────────

export interface MultiValueOption {
  label: string
  value: string
}

export interface MultiValueConfig {
  type: 'multi'
  prompt: string
  countdown: number
  options: MultiValueOption[]
}

export interface AskAtRuntimeConfig {
  type: 'ask'
  prompt: string
  inputType: 'text' | 'password'
  saveAs?: string
  persist: boolean
}

export type StepValue = string | MultiValueConfig | AskAtRuntimeConfig

// ─── Step onError ─────────────────────────────────────────────────────────────

export type OnErrorBehaviour = 'stop' | 'skip' | 'branch' | 'retry'

// ─── Step Base ────────────────────────────────────────────────────────────────

export interface StepBase {
  id: string
  type: StepType
  label: string
  onError: OnErrorBehaviour
  onErrorBranchId?: string
  retries: number
  retryDelay: number
  note?: string
}

// ─── Step Types ───────────────────────────────────────────────────────────────

export type StepType =
  | 'click'
  | 'fill'
  | 'wait'
  | 'scroll'
  | 'navigate'
  | 'submit'
  | 'select'
  | 'hover'
  | 'keypress'
  | 'extract'
  | 'screenshot'
  | 'tab'
  | 'clipboard'
  | 'storage'
  | 'log'
  | 'prompt'
  | 'setVariable'
  | 'branch'
  | 'loop'
  | 'stop'
  | 'jump'

// ─── Control Flow Steps ───────────────────────────────────────────────────────

export interface BranchStep extends StepBase {
  type: 'branch'
  condition: ConditionObject
  then: string[]
  else: string[]
  mergeAt: string
}

export type LoopType = 'count' | 'while' | 'for-each'

export interface LoopStep extends StepBase {
  type: 'loop'
  loopType: LoopType
  count?: number
  condition?: ConditionObject
  items?: string
  itemAs: string
  steps: string[]
  maxIterations: number
  breakOn?: ConditionObject
}

export interface StopStep extends StepBase {
  type: 'stop'
  reason?: string
  status: 'success' | 'failure' | 'cancelled'
}

export interface JumpStep extends StepBase {
  type: 'jump'
  stepId: string
  condition?: ConditionObject
}

// ─── Action Steps ─────────────────────────────────────────────────────────────

export interface ClickStep extends StepBase {
  type: 'click'
  selector: SelectorObject
  button: 'left' | 'right' | 'middle'
  doubleClick: boolean
  waitBefore: number
  scrollIntoView: boolean
  force: boolean
}

export interface FillStep extends StepBase {
  type: 'fill'
  selector: SelectorObject
  value: StepValue
  append: boolean
  simulateTyping: boolean
  typingDelay: number
  clearMethod: 'select-all' | 'triple-click' | 'ctrl-a'
  pressEnter: boolean
}

export type WaitType = 'duration' | 'element' | 'element-gone' | 'text' | 'network'

export interface WaitStep extends StepBase {
  type: 'wait'
  waitType: WaitType
  duration?: number
  selector?: SelectorObject
  text?: string
  networkPattern?: string
  timeout: number
  onTimeout: 'stop' | 'skip' | 'branch'
}

export type ScrollType = 'to' | 'by' | 'element' | 'top' | 'bottom'

export interface ScrollStep extends StepBase {
  type: 'scroll'
  target: 'page' | SelectorObject
  scrollType: ScrollType
  x?: number
  y?: number
  selector?: SelectorObject
  behavior: 'smooth' | 'instant'
}

export interface NavigateStep extends StepBase {
  type: 'navigate'
  url: string
  waitUntil: 'load' | 'domcontentloaded' | 'networkidle'
  timeout: number
}

export interface SubmitStep extends StepBase {
  type: 'submit'
  selector: SelectorObject
  waitForNavigation: boolean
  navigationTimeout: number
}

export interface SelectStep extends StepBase {
  type: 'select'
  selector: SelectorObject
  by: 'value' | 'label' | 'index'
  value: string | number
}

export interface HoverStep extends StepBase {
  type: 'hover'
  selector: SelectorObject
  duration: number
}

export interface KeypressStep extends StepBase {
  type: 'keypress'
  key: string
  target: 'page' | SelectorObject
  repeat: number
  delay: number
}

export type ExtractProperty = 'text' | 'html' | 'value' | 'attribute' | 'style'
export type ExtractTransform = 'trim' | 'lowercase' | 'uppercase' | 'number' | 'none'

export interface ExtractStep extends StepBase {
  type: 'extract'
  selector: SelectorObject
  property: ExtractProperty
  attribute?: string
  styleProperty?: string
  saveAs: string
  transform: ExtractTransform
}

export interface ScreenshotStep extends StepBase {
  type: 'screenshot'
  target: 'page' | 'viewport' | SelectorObject
  filename: string
  saveAs?: string
}

export type TabAction = 'open' | 'close' | 'switch' | 'close-others'
export type SwitchTo = 'new' | 'previous' | 'index' | 'match'

export interface TabStep extends StepBase {
  type: 'tab'
  action: TabAction
  url?: string
  switchTo?: SwitchTo
  tabIndex?: number
  urlPattern?: string
  waitUntil: 'load' | 'domcontentloaded'
  saveTabId?: string
}

export interface ClipboardStep extends StepBase {
  type: 'clipboard'
  action: 'read' | 'write'
  value?: string
  saveAs?: string
}

export type StorageAction = 'get' | 'set' | 'remove' | 'clear'
export type StorageStore = 'local' | 'session'

export interface StorageStep extends StepBase {
  type: 'storage'
  action: StorageAction
  store: StorageStore
  key?: string
  value?: string
  saveAs?: string
}

export interface LogStep extends StepBase {
  type: 'log'
  message: string
  level: 'info' | 'warn' | 'error'
}

export interface PromptStep extends StepBase {
  type: 'prompt'
  promptType: 'text' | 'password' | 'select'
  message: string
  options?: string[]
  countdown: number
  saveAs: string
}

export type SetVariableTransform =
  | 'trim'
  | 'lowercase'
  | 'uppercase'
  | 'number'
  | 'json-parse'
  | 'none'

export interface SetVariableStep extends StepBase {
  type: 'setVariable'
  name: string
  value: string
  scope: 'run' | 'workflow' | 'global' | 'site'
  transform: SetVariableTransform
}

// ─── Union ────────────────────────────────────────────────────────────────────

export type StepObject =
  | ClickStep
  | FillStep
  | WaitStep
  | ScrollStep
  | NavigateStep
  | SubmitStep
  | SelectStep
  | HoverStep
  | KeypressStep
  | ExtractStep
  | ScreenshotStep
  | TabStep
  | ClipboardStep
  | StorageStep
  | LogStep
  | PromptStep
  | SetVariableStep
  | BranchStep
  | LoopStep
  | StopStep
  | JumpStep

// ─── Triggers ─────────────────────────────────────────────────────────────────

export type TriggerType = 'manual' | 'url-match' | 'chain'
export type UrlMatchType = 'exact' | 'prefix' | 'glob' | 'regex'
export type MatchOn = 'load' | 'domcontentloaded' | 'urlchange'

export interface ManualTrigger {
  type: 'manual'
}

export interface UrlMatchTrigger {
  type: 'url-match'
  pattern: string
  matchType: UrlMatchType
  matchOn: MatchOn
  once: boolean
  delay: number
}

export interface ChainTrigger {
  type: 'chain'
  workflowId: string
  onStatus: 'success' | 'any'
  passVariables: string[]
}

export type TriggerObject = ManualTrigger | UrlMatchTrigger | ChainTrigger

// ─── Workflow ─────────────────────────────────────────────────────────────────

export interface Workflow {
  id: string
  name: string
  description: string
  site: string
  version: number
  enabled: boolean
  triggers: TriggerObject[]
  steps: StepObject[]
  variables: Record<string, string>
  siteConfig?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}
