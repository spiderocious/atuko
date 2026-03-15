import { useState } from 'react'
import { StepObject } from '@shared/types'
import { StepNode } from './step-node'
import { StepConnector } from './step-connector'
import {
  MousePointerClick, PenLine, Clock, ArrowDownUp, Globe, Send, ListFilter, HandMetal,
  Keyboard, Braces, Camera, LayoutDashboard, Clipboard, Database, FileText,
  MessageSquare, Variable, GitBranch, Repeat2, OctagonX, CornerDownRight,
  type LucideIcon,
} from '@shared/ui/icons'

interface StepTypeInfo {
  type: string
  label: string
  icon: LucideIcon
}

const STEP_GROUPS: { label: string; steps: StepTypeInfo[] }[] = [
  {
    label: 'Actions',
    steps: [
      { type: 'click', label: 'Click', icon: MousePointerClick },
      { type: 'fill', label: 'Fill', icon: PenLine },
      { type: 'submit', label: 'Submit', icon: Send },
      { type: 'select', label: 'Select', icon: ListFilter },
      { type: 'hover', label: 'Hover', icon: HandMetal },
      { type: 'keypress', label: 'Keypress', icon: Keyboard },
    ],
  },
  {
    label: 'Navigation',
    steps: [
      { type: 'navigate', label: 'Navigate', icon: Globe },
      { type: 'scroll', label: 'Scroll', icon: ArrowDownUp },
      { type: 'tab', label: 'Tab', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Data',
    steps: [
      { type: 'extract', label: 'Extract', icon: Braces },
      { type: 'setVariable', label: 'Variable', icon: Variable },
      { type: 'clipboard', label: 'Clipboard', icon: Clipboard },
      { type: 'storage', label: 'Storage', icon: Database },
    ],
  },
  {
    label: 'Utility',
    steps: [
      { type: 'wait', label: 'Wait', icon: Clock },
      { type: 'screenshot', label: 'Screenshot', icon: Camera },
      { type: 'log', label: 'Log', icon: FileText },
      { type: 'prompt', label: 'Prompt', icon: MessageSquare },
    ],
  },
  {
    label: 'Control',
    steps: [
      { type: 'branch', label: 'Branch', icon: GitBranch },
      { type: 'loop', label: 'Loop', icon: Repeat2 },
      { type: 'jump', label: 'Jump', icon: CornerDownRight },
      { type: 'stop', label: 'Stop', icon: OctagonX },
    ],
  },
]

interface Props {
  steps: StepObject[]
  selectedStepId: string | null
  onSelectStep: (id: string) => void
  onDeleteStep: (id: string) => void
  onReorder: (from: number, to: number) => void
  onAddStep: (type: string) => void
}

export function FlowCanvas({ steps, selectedStepId, onSelectStep, onDeleteStep, onReorder, onAddStep }: Props) {
  const [dragFrom, setDragFrom] = useState<number | null>(null)
  const [showAddPanel, setShowAddPanel] = useState(false)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-0">
        {steps.map((step, i) => (
          <div key={step.id}>
            {i > 0 && <StepConnector />}
            <div
              draggable
              onDragStart={() => setDragFrom(i)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => {
                if (dragFrom !== null && dragFrom !== i) {
                  onReorder(dragFrom, i)
                }
                setDragFrom(null)
              }}
            >
              <StepNode
                step={step}
                index={i}
                isSelected={selectedStepId === step.id}
                onClick={() => onSelectStep(step.id)}
                onDelete={() => onDeleteStep(step.id)}
              />
            </div>
          </div>
        ))}

        {steps.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-surface-raised)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3"/>
                <path d="M12 8v8M8 12h8"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">No steps yet</p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Click "+ Add Step" below to start building</p>
            </div>
          </div>
        )}
      </div>

      {/* Add step */}
      <div className="border-t border-[var(--color-border)] p-2 flex-shrink-0">
        <button
          onClick={() => setShowAddPanel(p => !p)}
          className="w-full text-xs font-medium text-[var(--color-brand)] py-1.5 rounded-lg border border-dashed border-[var(--color-brand)]/50 hover:border-[var(--color-brand)] hover:bg-[var(--color-brand)]/5 transition-colors"
        >
          {showAddPanel ? '× Close' : '+ Add Step'}
        </button>
        {showAddPanel && (
          <div className="mt-2 flex flex-col gap-3 max-h-52 overflow-y-auto">
            {STEP_GROUPS.map(group => (
              <div key={group.label}>
                <p className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide px-1 mb-1">
                  {group.label}
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {group.steps.map(({ type, label, icon: Icon }) => (
                    <button
                      key={type}
                      onClick={() => { onAddStep(type); setShowAddPanel(false) }}
                      className="flex items-center gap-2 text-xs text-left px-2 py-1.5 rounded-md border border-[var(--color-border)] hover:border-[var(--color-brand)]/50 hover:bg-[var(--color-surface-raised)] transition-colors"
                    >
                      <Icon size={12} strokeWidth={1.5} className="text-[var(--color-text-secondary)] flex-shrink-0" />
                      <span className="text-[var(--color-text-primary)] truncate">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
