import { useState, useEffect } from 'react'
import { ActiveRunState, RunStatus, StepLog } from '@shared/types'
import { MSG } from '@shared/constants/messages'
import { useRunStatus } from '../hooks/use-run-status'
import { StatusDot } from '../parts/status-dot'
import { StepLabel } from '../parts/step-label'
import { StepCounter } from '../parts/step-counter'
import { ControlButtons } from '../parts/control-buttons'
import { StepLogExpander } from '../parts/step-log-expander'

interface Props {
  runId: string
  initialState: ActiveRunState
}

const DONE_STATUSES: RunStatus[] = ['success', 'failed']

export function ToastScreen({ runId, initialState }: Props) {
  const liveState = useRunStatus(runId)
  const state = liveState ?? initialState
  const [expanded, setExpanded] = useState(false)
  const [visible, setVisible] = useState(true)
  const [logs, setLogs] = useState<StepLog[]>([])

  // Accumulate step logs from STEP_RESULT messages
  useEffect(() => {
    const listener = (msg: { type: string; runId?: string; log?: StepLog }) => {
      if (msg.type === MSG.STEP_RESULT && msg.runId === runId && msg.log) {
        setLogs(prev => [...prev, msg.log!])
      }
    }
    chrome.runtime.onMessage.addListener(listener)
    return () => chrome.runtime.onMessage.removeListener(listener)
  }, [runId])

  const isDone = DONE_STATUSES.includes(state.status)

  const handlePause = () => {
    const type = state.status === 'paused' ? MSG.RESUME_RUN : MSG.PAUSE_RUN
    chrome.runtime.sendMessage({ type, runId })
  }

  const handleStop = () => {
    chrome.runtime.sendMessage({ type: MSG.STOP_RUN, runId })
  }

  if (!visible) return null

  const label = state.currentStepLabel || '…'
  const stepNum = state.currentStepIndex + 1
  const totalSteps = state.stepTotal

  return (
    <div style={{
      fontFamily: 'Inter, system-ui, sans-serif',
      width: 300,
      background: '#ffffff',
      borderRadius: 16,
      boxShadow: '0 10px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
      padding: '10px 14px',
      boxSizing: 'border-box',
      pointerEvents: 'auto',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(8px)',
      transition: 'opacity 200ms ease-out, transform 200ms ease-out',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <StatusDot status={state.isDryRun ? 'dry-run' : state.status} />
        <StepLabel label={label} />
        {!isDone && <StepCounter current={stepNum} total={totalSteps} />}
        {isDone ? (
          <button
            onClick={() => setVisible(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#9ca3af', pointerEvents: 'auto', lineHeight: 1 }}
          >×</button>
        ) : (
          <ControlButtons
            status={state.status}
            expanded={expanded}
            onPause={handlePause}
            onStop={handleStop}
            onToggleExpand={() => setExpanded(e => !e)}
          />
        )}
      </div>

      {/* Expanded log */}
      {expanded && logs.length > 0 && (
        <StepLogExpander logs={logs} />
      )}
    </div>
  )
}
