import { StepType } from './workflow.types'

export type RunStatus = 'running' | 'paused' | 'success' | 'failed' | 'cancelled'

export type TriggerSource = 'manual' | 'url-match' | 'chain'

export interface StepLog {
  stepId: string
  stepIndex: number
  label: string
  type: StepType
  status: 'success' | 'failed' | 'skipped' | 'dry-run'
  startedAt: string
  completedAt: string
  durationMs: number
  output?: Record<string, string>
  error?: string
  wouldDoMessage?: string // dry-run only
}

export interface StepResult {
  stepId: string
  success: boolean
  output?: Record<string, string>
  error?: string
}

export interface RunRecord {
  id: string
  workflowId: string
  workflowName: string
  triggeredBy: TriggerSource
  isDryRun: boolean
  startTime: string
  endTime?: string
  status: RunStatus
  stepsCompleted: number
  stepTotal: number
  failedStep?: {
    id: string
    label: string
    error: string
  }
  stepLogs: StepLog[]
  output: Record<string, string>
  screenshots: RunScreenshot[]
  consoleLogs: ConsoleLogEntry[]
}

export interface RunScreenshot {
  stepId: string
  filename: string
  dataUri: string
  capturedAt: string
}

export interface ConsoleLogEntry {
  level: 'log' | 'warn' | 'error'
  message: string
  timestamp: string
  stepId: string
}

// ─── Active run state broadcast ────────────────────────────────────────────────

export interface ActiveRunState {
  runId: string
  workflowId: string
  workflowName: string
  status: RunStatus
  currentStepIndex: number
  currentStepLabel: string
  stepTotal: number
  isDryRun: boolean
  promptPending?: PendingPrompt
}

export interface PendingPrompt {
  stepId: string
  promptType: 'text' | 'password' | 'select'
  message: string
  options?: string[]
  countdown: number
  saveAs: string
}
