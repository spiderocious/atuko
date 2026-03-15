import { useState } from 'react'
import { useRunHistory } from '../hooks/use-run-history'
import { RunItem } from '../parts/run-item'
import { RunDetail } from '../parts/run-detail'

interface Props { workflowId: string | null }

export function RunHistoryScreen({ workflowId }: Props) {
  const { data: records = [], isLoading } = useRunHistory(workflowId)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (!workflowId) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-[var(--color-text-secondary)] text-center px-6">
        Select a workflow from the Workflows tab to view its run history.
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-12 rounded-lg bg-[var(--color-surface-raised)] animate-pulse" />
        ))}
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-sm text-[var(--color-text-secondary)]">
        <p>No runs yet for this workflow.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col overflow-y-auto h-full">
      {records.map(record => (
        <div key={record.id}>
          <RunItem
            record={record}
            isExpanded={expandedId === record.id}
            onToggle={() => setExpandedId(prev => prev === record.id ? null : record.id)}
          />
          {expandedId === record.id && <RunDetail record={record} />}
        </div>
      ))}
    </div>
  )
}
