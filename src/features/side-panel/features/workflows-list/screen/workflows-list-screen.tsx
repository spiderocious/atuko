import { useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ClipboardList, SearchX } from '@shared/ui/icons'
import { Workflow } from '@shared/types'
import { Button, EmptyState } from '@ui'
import { MSG } from '@shared/constants/messages'
import { getLastRunsForWorkflows } from '@shared/services/storage.service'
import { useWorkflows, useSaveWorkflow, useDeleteWorkflow, useDuplicateWorkflow } from '../hooks/use-workflows'
import { WorkflowSearch } from '../parts/workflow-search'
import { WorkflowFilters, StatusFilter } from '../parts/workflow-filters'
import { WorkflowItem } from '../parts/workflow-item'

interface Props {
  onEdit: (workflow: Workflow) => void
}

export function WorkflowsListScreen({ onEdit }: Props) {
  const { data: workflows = [], isLoading } = useWorkflows()
  const saveWf = useSaveWorkflow()
  const deleteWf = useDeleteWorkflow()
  const duplicateWf = useDuplicateWorkflow()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const workflowIds = workflows.map(w => w.id)
  const { data: lastRuns = {} } = useQuery({
    queryKey: ['last-runs', workflowIds],
    queryFn: () => getLastRunsForWorkflows(workflowIds),
    enabled: workflowIds.length > 0 && statusFilter === 'failed',
  })

  // Collect all unique tags
  const allTags = Array.from(new Set(workflows.flatMap(w => w.tags)))

  // Filter
  const filtered = workflows.filter(w => {
    if (search && !w.name.toLowerCase().includes(search.toLowerCase()) && !w.site.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter === 'enabled' && !w.enabled) return false
    if (statusFilter === 'disabled' && w.enabled) return false
    if (statusFilter === 'failed' && lastRuns[w.id]?.status !== 'failed') return false
    if (activeTag && !w.tags.includes(activeTag)) return false
    return true
  })

  const handleRun = (w: Workflow) => {
    chrome.runtime.sendMessage({ type: MSG.TRIGGER_WORKFLOW, workflowId: w.id, isDryRun: false })
  }

  const handleToggleEnabled = (w: Workflow) => {
    saveWf.mutate({ ...w, enabled: !w.enabled, updatedAt: new Date().toISOString() })
  }

  const handleExport = (w: Workflow) => {
    const blob = new Blob([JSON.stringify(w, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${w.name.replace(/\s+/g, '-').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: { target: { files: FileList | null; value: string } }) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as Partial<Workflow>
        if (!parsed.id || !parsed.name || !parsed.steps) {
          alert('Invalid workflow JSON')
          return
        }
        saveWf.mutate({
          ...parsed,
          id: crypto.randomUUID(), // new ID to avoid conflicts
          updatedAt: new Date().toISOString(),
        } as Workflow)
      } catch {
        alert('Failed to parse JSON')
      }
    }
    reader.readAsText(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Workflows</h2>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
            Import
          </Button>
          <Button variant="primary" size="sm" onClick={() => onEdit({
            id: crypto.randomUUID(),
            name: 'New Workflow',
            description: '',
            site: '',
            version: 1,
            enabled: true,
            triggers: [{ type: 'manual' }],
            steps: [],
            variables: {},
            tags: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })}>
            + New
          </Button>
        </div>
      </div>

      <WorkflowSearch value={search} onChange={setSearch} />
      <WorkflowFilters
        status={statusFilter}
        onStatusChange={setStatusFilter}
        tags={allTags}
        activeTag={activeTag}
        onTagChange={setActiveTag}
      />

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col gap-2 p-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 rounded-lg bg-[var(--color-surface-raised)] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={search ? SearchX : ClipboardList}
            headline={search ? 'No matching workflows' : 'No workflows yet'}
            body={search ? 'Try a different search term' : 'Record one or import a JSON file to get started'}
          />
        ) : (
          filtered.map(w => (
            <WorkflowItem
              key={w.id}
              workflow={w}
              onEdit={onEdit}
              onDuplicate={wf => duplicateWf.mutate(wf)}
              onDelete={id => deleteWf.mutate(id)}
              onRun={handleRun}
              onToggleEnabled={handleToggleEnabled}
              onExport={handleExport}
            />
          ))
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImport}
      />
    </div>
  )
}
