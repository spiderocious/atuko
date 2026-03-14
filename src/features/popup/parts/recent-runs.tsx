import { useEffect, useState } from 'react'
import { RunRecord } from '@shared/types'
import { Badge } from '@ui'
import { MSG } from '@shared/constants/messages'

function formatDuration(startTime: string, endTime?: string): string {
  if (!endTime) return ''
  const ms = new Date(endTime).getTime() - new Date(startTime).getTime()
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

interface Props { workflowId?: string }

export function RecentRuns({ workflowId }: Props) {
  const [records, setRecords] = useState<RunRecord[]>([])

  useEffect(() => {
    if (!workflowId) return
    chrome.runtime.sendMessage(
      { type: MSG.GET_RUN_HISTORY, workflowId },
      (res: { records?: RunRecord[] }) => {
        setRecords((res?.records ?? []).slice(0, 5))
      }
    )
  }, [workflowId])

  if (!workflowId || records.length === 0) return null

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide px-1">Recent</p>
      {records.map(r => (
        <div
          key={r.id}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border)]"
        >
          <div className="flex-1 min-w-0">
            <span className="text-xs text-[var(--color-text-primary)] truncate block">{r.workflowName}</span>
            <span className="text-xs text-[var(--color-text-secondary)]">
              {r.triggeredBy} · {formatDuration(r.startTime, r.endTime)}
            </span>
          </div>
          <Badge variant={r.status === 'success' ? 'success' : r.status === 'failed' ? 'error' : 'neutral'}>
            {r.status}
          </Badge>
        </div>
      ))}
    </div>
  )
}
