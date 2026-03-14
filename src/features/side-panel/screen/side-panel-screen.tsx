import { useState } from 'react'
import { Workflow } from '@shared/types'
import { WorkflowsListScreen } from '../features/workflows-list/screen/workflows-list-screen'
import { BuilderScreen } from '../features/builder/screen/builder-screen'
import { useSaveWorkflow } from '../features/workflows-list/hooks/use-workflows'

type Tab = 'workflows' | 'builder' | 'config' | 'history' | 'site-config' | 'settings'

const TABS: { id: Tab; label: string }[] = [
  { id: 'workflows', label: 'Workflows' },
  { id: 'builder', label: 'Builder' },
  { id: 'config', label: 'Config' },
  { id: 'history', label: 'History' },
  { id: 'site-config', label: 'Site' },
  { id: 'settings', label: 'Settings' },
]

export function SidePanelScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('workflows')
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null)
  const saveWorkflow = useSaveWorkflow()

  const handleEdit = (w: Workflow) => {
    setEditingWorkflow(w)
    setActiveTab('builder')
  }

  const handleSave = (w: Workflow) => {
    saveWorkflow.mutate(w, {
      onSuccess: () => {
        setEditingWorkflow(w)
      },
    })
  }

  const handleBack = () => {
    setActiveTab('workflows')
    setEditingWorkflow(null)
  }

  return (
    <div className="flex flex-col h-screen bg-[var(--color-surface)] text-[var(--color-text-primary)]">
      {/* Tab bar */}
      <nav className="flex border-b border-[var(--color-border)] bg-[var(--color-surface)] overflow-x-auto flex-shrink-0">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-[var(--color-brand)] text-[var(--color-brand)]'
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'workflows' && (
          <WorkflowsListScreen onEdit={handleEdit} />
        )}
        {activeTab === 'builder' && editingWorkflow && (
          <BuilderScreen
            workflow={editingWorkflow}
            onSave={handleSave}
            onBack={handleBack}
          />
        )}
        {activeTab === 'builder' && !editingWorkflow && (
          <div className="flex items-center justify-center h-full text-sm text-[var(--color-text-secondary)]">
            Select a workflow to edit, or create a new one.
          </div>
        )}
        {activeTab !== 'workflows' && activeTab !== 'builder' && (
          <div className="flex items-center justify-center h-full text-sm text-[var(--color-text-secondary)]">
            {TABS.find(t => t.id === activeTab)?.label} — coming in next phase
          </div>
        )}
      </div>
    </div>
  )
}
