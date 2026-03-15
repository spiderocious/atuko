import { useState } from 'react'
import { Workflow } from '@shared/types'
import { WorkflowsListScreen } from '../features/workflows-list/screen/workflows-list-screen'
import { BuilderScreen } from '../features/builder/screen/builder-screen'
import { JsonConfigScreen } from '../features/json-config/screen/json-config-screen'
import { RunHistoryScreen } from '../features/run-history/screen/run-history-screen'
import { SiteConfigScreen } from '../features/site-config/screen/site-config-screen'
import { SettingsScreen } from '../features/settings/screen/settings-screen'
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

  const handleJsonApply = (w: Workflow) => {
    setEditingWorkflow(w)
    saveWorkflow.mutate(w)
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
        {activeTab === 'config' && editingWorkflow && (
          <JsonConfigScreen workflow={editingWorkflow} onApply={handleJsonApply} />
        )}
        {activeTab === 'config' && !editingWorkflow && (
          <div className="flex items-center justify-center h-full text-sm text-[var(--color-text-secondary)]">
            Open a workflow in the Builder tab first.
          </div>
        )}
        {activeTab === 'history' && (
          <RunHistoryScreen workflowId={editingWorkflow?.id ?? null} />
        )}
        {activeTab === 'site-config' && <SiteConfigScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </div>
    </div>
  )
}
