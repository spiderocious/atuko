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
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--color-brand-dim)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </div>
        <div className="text-center">
          <p className="text-[13px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            No active runs
          </p>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Open the panel to start a workflow
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
