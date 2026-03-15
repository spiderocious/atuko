import {
  Workflow,
  StepObject,
  ScopedVariableStore,
  RunRecord,
  StepLog,
  ActiveRunState,
  BranchStep,
  LoopStep,
  StopStep,
  JumpStep,
  SetVariableStep,
} from '@shared/types'
import { MSG } from '@shared/constants/messages'
import { executeStep } from './step-executor'
import { evaluateCondition, ConditionContext } from './condition-evaluator'
import { resolveString, setVariable, BuiltinContext } from './variable-resolver'
import { finaliseRun, buildStepLog } from './run-recorder'
import { getSettings } from '@shared/services/storage.service'

export type RunMode = 'normal' | 'dry-run' | 'step-by-step'

export interface RunOptions {
  workflow: Workflow
  tabId: number
  runId: string
  mode: RunMode
  siteVariables: Record<string, string>
  globalVariables: Record<string, string>
}

// Active runs keyed by runId
const activeRuns = new Map<string, RunState>()

interface RunState {
  paused: boolean
  stopped: boolean
  waitingForPrompt: boolean
  waitingForStep: boolean // step-by-step mode
  promptResolve?: (value: string) => void
  stepAdvanceResolve?: () => void
}

export async function startWorkflow(opts: RunOptions): Promise<void> {
  const { workflow, tabId, runId, mode, siteVariables, globalVariables } = opts
  const settings = await getSettings()

  const runState: RunState = {
    paused: false,
    stopped: false,
    waitingForPrompt: false,
    waitingForStep: false,
  }
  activeRuns.set(runId, runState)

  let store: ScopedVariableStore = {
    run: {},
    workflow: workflow.variables ?? {},
    site: siteVariables,
    global: globalVariables,
  }

  const stepLogs: StepLog[] = []
  const record: RunRecord = {
    id: runId,
    workflowId: workflow.id,
    workflowName: workflow.name,
    triggeredBy: 'manual',
    isDryRun: mode === 'dry-run',
    startTime: new Date().toISOString(),
    status: 'running',
    stepsCompleted: 0,
    stepTotal: workflow.steps.length,
    stepLogs,
    output: {},
    screenshots: [],
    consoleLogs: [],
  }

  // Build step map for O(1) lookup by id
  const stepMap = new Map<string, StepObject>()
  for (const step of workflow.steps) {
    stepMap.set(step.id, step)
  }

  const ctx = { runId, tabId, store, record, runState, settings, mode, workflow }

  try {
    await executeSteps(workflow.steps.map((s) => s.id), stepMap, ctx)
    await finaliseRun(record, 'success')
    broadcastTerminalStatus(ctx, 'success')
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    record.failedStep = record.failedStep ?? { id: '', label: '', error: message }
    await finaliseRun(record, 'failed')
    broadcastTerminalStatus(ctx, 'failed')
  } finally {
    activeRuns.delete(runId)
  }
}

interface ExecContext {
  runId: string
  tabId: number
  store: ScopedVariableStore
  record: RunRecord
  runState: RunState
  settings: Awaited<ReturnType<typeof getSettings>>
  mode: RunMode
  workflow: Workflow
  loopDepth?: number
  iteration?: number
  item?: string
}

async function executeSteps(
  stepIds: string[],
  stepMap: Map<string, StepObject>,
  ctx: ExecContext
): Promise<void> {
  let i = 0
  while (i < stepIds.length) {
    const stepId = stepIds[i]
    const step = stepMap.get(stepId)
    if (!step) { i++; continue }

    // Pause support
    while (ctx.runState.paused && !ctx.runState.stopped) {
      await sleep(200)
    }
    if (ctx.runState.stopped) throw new Error('Run stopped by user')

    // Step-by-step mode: wait for advance signal
    if (ctx.mode === 'step-by-step') {
      await waitForStepAdvance(ctx.runState)
    }

    // Broadcast current step
    broadcastRunStatus(ctx, step)

    // Control flow steps
    if (step.type === 'branch') {
      await executeBranch(step as BranchStep, stepMap, ctx)
      i++
      continue
    }
    if (step.type === 'loop') {
      await executeLoop(step as LoopStep, stepMap, ctx)
      i++
      continue
    }
    if (step.type === 'stop') {
      const stopStep = step as StopStep
      if (stopStep.reason) {
        ctx.record.stepLogs.push(buildStepLog({
          stepId: step.id,
          stepIndex: ctx.record.stepsCompleted,
          label: step.label,
          type: 'stop',
          status: 'success',
          startedAt: new Date().toISOString(),
        }))
      }
      throw new Error(`STOP:${stopStep.status}`)
    }
    if (step.type === 'jump') {
      const jumpStep = step as JumpStep
      const conditionMet = !jumpStep.condition || evaluateCondition(jumpStep.condition, buildConditionCtx(ctx))
      if (conditionMet) {
        const jumpIndex = stepIds.indexOf(jumpStep.stepId)
        if (jumpIndex !== -1) { i = jumpIndex; continue }
      }
      i++
      continue
    }
    if (step.type === 'setVariable') {
      const sv = step as SetVariableStep
      const resolved = resolveString(sv.value, ctx.store, buildBuiltinCtx(ctx, i))
      const transformed = applyTransform(resolved, sv.transform)
      ctx.store = setVariable(sv.name, transformed, sv.scope, ctx.store)
      ctx.record.stepsCompleted++
      i++
      continue
    }

    // Action step execution with retry
    const stepResult = await executeWithRetry(step, ctx, i)

    const startedAt = new Date().toISOString()
    const log = buildStepLog({
      stepId: step.id,
      stepIndex: ctx.record.stepsCompleted,
      label: step.label,
      type: step.type,
      status: stepResult.success ? 'success' : 'failed',
      startedAt,
      output: stepResult.output,
      error: stepResult.error,
    })
    ctx.record.stepLogs.push(log)

    if (stepResult.output) {
      ctx.store = { ...ctx.store, run: { ...ctx.store.run, ...stepResult.output } }
      ctx.record.output = { ...ctx.record.output, ...stepResult.output }
    }

    if (!stepResult.success) {
      const behaviour = step.onError
      if (behaviour === 'stop') {
        ctx.record.failedStep = { id: step.id, label: step.label, error: stepResult.error ?? '' }
        throw new Error(stepResult.error ?? 'Step failed')
      } else if (behaviour === 'branch' && step.onErrorBranchId) {
        const branchIdx = stepIds.indexOf(step.onErrorBranchId)
        if (branchIdx !== -1) { i = branchIdx; continue }
      }
      // skip: just continue
    }

    ctx.record.stepsCompleted++
    i++
  }
}

async function executeWithRetry(
  step: StepObject,
  ctx: ExecContext,
  stepIndex: number
): Promise<{ success: boolean; output?: Record<string, string>; error?: string }> {
  const retries = step.retries ?? ctx.settings.defaultRetries
  const retryDelay = step.retryDelay ?? 1000
  // For wait/navigate steps that carry their own timeout, use that instead of the global default
  // so a wait step with duration: 12000 isn't killed at the 10000ms global limit.
  const stepOwnTimeout = 'timeout' in step ? (step as { timeout: number }).timeout : undefined
  const timeoutMs = stepOwnTimeout ?? ctx.settings.defaultTimeoutMs

  for (let attempt = 0; attempt <= retries; attempt++) {
    const result = await executeStep({
      step,
      tabId: ctx.tabId,
      store: ctx.store,
      context: buildBuiltinCtx(ctx, stepIndex),
      isDryRun: ctx.mode === 'dry-run',
      timeoutMs,
    })
    if (result.success || attempt === retries) return result
    await sleep(retryDelay)
  }
  return { success: false, error: 'Max retries exceeded' }
}

async function executeBranch(
  step: BranchStep,
  stepMap: Map<string, StepObject>,
  ctx: ExecContext
): Promise<void> {
  const conditionMet = evaluateCondition(step.condition, buildConditionCtx(ctx))
  const branchStepIds = conditionMet ? step.then : step.else
  await executeSteps(branchStepIds, stepMap, ctx)
}

async function executeLoop(
  step: LoopStep,
  stepMap: Map<string, StepObject>,
  ctx: ExecContext
): Promise<void> {
  const max = step.maxIterations ?? 100
  const loopCtx = { ...ctx, loopDepth: (ctx.loopDepth ?? 0) + 1 }

  if (step.loopType === 'count') {
    const count = step.count ?? 0
    for (let i = 0; i < Math.min(count, max); i++) {
      if (ctx.runState.stopped) break
      if (step.breakOn && evaluateCondition(step.breakOn, buildConditionCtx(ctx))) break
      loopCtx.iteration = i
      await executeSteps(step.steps, stepMap, loopCtx)
    }
  } else if (step.loopType === 'while') {
    let i = 0
    while (i < max) {
      if (ctx.runState.stopped) break
      if (!step.condition || !evaluateCondition(step.condition, buildConditionCtx(ctx))) break
      if (step.breakOn && evaluateCondition(step.breakOn, buildConditionCtx(ctx))) break
      loopCtx.iteration = i
      await executeSteps(step.steps, stepMap, loopCtx)
      i++
    }
  } else if (step.loopType === 'for-each') {
    const itemsVar = step.items ?? ''
    const raw = ctx.store.run[itemsVar] ?? ctx.store.workflow[itemsVar] ?? '[]'
    let items: string[] = []
    try { items = JSON.parse(raw) } catch { /* skip */ }
    for (let i = 0; i < Math.min(items.length, max); i++) {
      if (ctx.runState.stopped) break
      if (step.breakOn && evaluateCondition(step.breakOn, buildConditionCtx(ctx))) break
      loopCtx.iteration = i
      loopCtx.item = String(items[i])
      loopCtx.store = setVariable(step.itemAs ?? '$item', loopCtx.item, 'run', loopCtx.store)
      await executeSteps(step.steps, stepMap, loopCtx)
    }
  }
}

function buildBuiltinCtx(ctx: ExecContext, stepIndex: number): BuiltinContext {
  return {
    url: '',
    title: '',
    runId: ctx.runId,
    stepIndex,
    iteration: ctx.iteration,
    item: ctx.item,
  }
}

function buildConditionCtx(ctx: ExecContext): ConditionContext {
  return {
    url: '',
    variables: ctx.store,
    responseVars: {},
  }
}

function broadcastRunStatus(ctx: ExecContext, currentStep: StepObject): void {
  const state: ActiveRunState = {
    runId: ctx.runId,
    workflowId: ctx.workflow.id,
    workflowName: ctx.workflow.name,
    status: 'running',
    currentStepIndex: ctx.record.stepsCompleted,
    currentStepLabel: currentStep.label,
    stepTotal: ctx.workflow.steps.length,
    isDryRun: ctx.mode === 'dry-run',
  }
  const statusMsg = { type: MSG.RUN_STATUS_UPDATE, payload: state }
  // Send to extension surfaces (side panel, popup)
  chrome.runtime.sendMessage(statusMsg).catch(() => {})
  // Forward to the content script on the workflow's tab so the toast updates
  chrome.tabs.sendMessage(ctx.tabId, statusMsg).catch(() => {})
}

function broadcastTerminalStatus(ctx: ExecContext, status: 'success' | 'failed'): void {
  const state: ActiveRunState = {
    runId: ctx.runId,
    workflowId: ctx.workflow.id,
    workflowName: ctx.workflow.name,
    status,
    currentStepIndex: ctx.record.stepsCompleted,
    currentStepLabel: status === 'success' ? 'Done' : (ctx.record.failedStep?.label ?? 'Failed'),
    stepTotal: ctx.workflow.steps.length,
    isDryRun: ctx.mode === 'dry-run',
  }
  const statusMsg = { type: MSG.RUN_STATUS_UPDATE, payload: state }
  chrome.runtime.sendMessage(statusMsg).catch(() => {})
  chrome.tabs.sendMessage(ctx.tabId, statusMsg).catch(() => {})
}

export function pauseRun(runId: string): void {
  const state = activeRuns.get(runId)
  if (state) state.paused = true
}

export function resumeRun(runId: string): void {
  const state = activeRuns.get(runId)
  if (state) state.paused = false
}

export function stopRun(runId: string): void {
  const state = activeRuns.get(runId)
  if (state) { state.stopped = true; state.paused = false }
}

export function resolvePrompt(runId: string, value: string): void {
  const state = activeRuns.get(runId)
  if (state?.promptResolve) {
    state.promptResolve(value)
    state.promptResolve = undefined
    state.waitingForPrompt = false
  }
}

export function advanceStep(runId: string): void {
  const state = activeRuns.get(runId)
  if (state?.stepAdvanceResolve) {
    state.stepAdvanceResolve()
    state.stepAdvanceResolve = undefined
    state.waitingForStep = false
  }
}

export function getActiveRunIds(): string[] {
  return Array.from(activeRuns.keys())
}

function waitForStepAdvance(state: RunState): Promise<void> {
  state.waitingForStep = true
  return new Promise((resolve) => { state.stepAdvanceResolve = resolve })
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function applyTransform(
  value: string,
  transform: SetVariableStep['transform']
): string {
  switch (transform) {
    case 'trim':       return value.trim()
    case 'lowercase':  return value.toLowerCase()
    case 'uppercase':  return value.toUpperCase()
    case 'number':     return String(Number(value))
    case 'json-parse': {
      try { return JSON.stringify(JSON.parse(value)) } catch { return value }
    }
    default: return value
  }
}
