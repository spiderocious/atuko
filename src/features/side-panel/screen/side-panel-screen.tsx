import { useState } from 'react'
import { Workflow } from '@shared/types'
import { WorkflowsListScreen } from '../features/workflows-list/screen/workflows-list-screen'

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
  const [_editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null)

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
          <WorkflowsListScreen onEdit={(w) => { setEditingWorkflow(w); setActiveTab('builder') }} />
        )}
        {activeTab !== 'workflows' && (
          <div className="flex items-center justify-center h-full text-sm text-[var(--color-text-secondary)]">
            {TABS.find(t => t.id === activeTab)?.label} — coming in next phase
          </div>
        )}
      </div>
    </div>
  )
}
