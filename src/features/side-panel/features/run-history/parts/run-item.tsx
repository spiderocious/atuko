import { RunRecord } from '@shared/types'
import { Badge } from '@ui'

function formatDuration(startTime: string, endTime?: string): string {
  if (!endTime) return 'In progress'
  const ms = new Date(endTime).getTime() - new Date(startTime).getTime()
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

interface Props {
  record: RunRecord
  isExpanded: boolean
  onToggle: () => void
}

export function RunItem({ record, isExpanded, onToggle }: Props) {
  return (
    <div className="border-b border-[var(--color-border)]">
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-[var(--color-surface-raised)] transition-colors"
        onClick={onToggle}
      >
        <Badge variant={
          record.status === 'success' ? 'success' :
          record.status === 'failed' ? 'error' : 'neutral'
        }>
          {record.status}
        </Badge>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[var(--color-text-primary)] truncate">{record.workflowName}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {record.triggeredBy} · {record.stepsCompleted}/{record.stepTotal} steps · {formatDuration(record.startTime, record.endTime)}
          </p>
        </div>
        <span className="text-xs text-[var(--color-text-secondary)] flex-shrink-0">{formatTime(record.startTime)}</span>
        <span className="text-xs text-[var(--color-text-secondary)]">{isExpanded ? '▲' : '▼'}</span>
      </div>
    </div>
  )
}
