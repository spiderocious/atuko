import { Workflow } from '@shared/types'
import { Badge, Dropdown } from '@ui'
import { MoreVertical } from '@shared/ui/icons'

interface Props {
  workflow: Workflow
  onEdit: (w: Workflow) => void
  onDuplicate: (w: Workflow) => void
  onDelete: (id: string) => void
  onRun: (w: Workflow) => void
  onToggleEnabled: (w: Workflow) => void
  onExport: (w: Workflow) => void
}

export function WorkflowItem({ workflow, onEdit, onDuplicate, onDelete, onRun, onToggleEnabled, onExport }: Props) {
  const triggerType = workflow.triggers[0]?.type ?? 'manual'

  return (
    <div className="flex items-start gap-3 px-3 py-3 border-b border-[var(--color-border)] hover:bg-[var(--color-surface-raised)] transition-colors group">
      {/* Enable toggle */}
      <label className="relative inline-flex items-center cursor-pointer mt-0.5 flex-shrink-0">
        <input
          type="checkbox"
          checked={workflow.enabled}
          onChange={() => onToggleEnabled(workflow)}
          className="sr-only peer"
        />
        <div className="w-8 h-4 bg-[var(--color-border)] rounded-full peer peer-checked:bg-[var(--color-brand)] transition-colors" />
        <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-[17px]" />
      </label>

      {/* Info */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEdit(workflow)}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
            {workflow.name}
          </span>
          <Badge variant={triggerType === 'url-match' ? 'info' : triggerType === 'chain' ? 'warning' : 'neutral'}>
            {triggerType}
          </Badge>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)] truncate mt-0.5">
          {workflow.site || 'Any site'} · {workflow.steps.length} steps
        </p>
        {workflow.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-1">
            {workflow.tags.map(tag => (
              <Badge key={tag} variant="neutral">{tag}</Badge>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <Dropdown
        align="right"
        trigger={
          <button aria-label="Workflow actions" className="p-1 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-raised)] opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical size={14} />
          </button>
        }
        items={[
          { label: 'Run', onClick: () => onRun(workflow) },
          { label: 'Edit', onClick: () => onEdit(workflow) },
          { label: 'Duplicate', onClick: () => onDuplicate(workflow) },
          { label: 'Export JSON', onClick: () => onExport(workflow) },
          { label: 'Delete', onClick: () => onDelete(workflow.id), destructive: true },
        ]}
      />
    </div>
  )
}
