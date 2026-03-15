import { ActiveRunState, RunStatus } from '@shared/types'
import { Badge, StatusDot } from '@ui'
import { RunControls } from './run-controls'

// StatusDot accepts 'idle' | 'running' | 'waiting' | 'success' | 'failed' | 'dry-run'
// Map ActiveRunState's RunStatus to the StatusDot's accepted subset
function toStatusDotStatus(status: RunStatus): 'idle' | 'running' | 'waiting' | 'success' | 'failed' | 'dry-run' {
  switch (status) {
    case 'running': return 'running'
    case 'paused': return 'waiting'
    case 'success': return 'success'
    case 'failed': return 'failed'
    case 'cancelled': return 'idle'
  }
}

interface Props { runs: ActiveRunState[] }

export function ActiveRunsPanel({ runs }: Props) {
  if (runs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--color-surface-raised)' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7" stroke="var(--color-text-tertiary)" strokeWidth="1.5"/>
            <path d="M9 5.5V9L11 11" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="text-center">
          <p className="text-[13px] font-medium" style={{ color: 'var(--color-text-primary)' }}>
            No active runs
          </p>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
            Start a workflow from the side panel
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {runs.map(run => (
        <div
          key={run.runId}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border)]"
        >
          <StatusDot status={toStatusDotStatus(run.status)} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                {run.workflowName}
              </span>
              {run.isDryRun && <Badge variant="info">dry run</Badge>}
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] truncate mt-0.5">
              {run.currentStepLabel} — {run.currentStepIndex + 1} / {run.stepTotal}
            </p>
          </div>
          <RunControls run={run} />
        </div>
      ))}
    </div>
  )
}
