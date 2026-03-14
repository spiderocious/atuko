import { useState } from 'react'
import { StepObject } from '@shared/types'
import { StepNode } from './step-node'
import { StepConnector } from './step-connector'

const ALL_STEP_TYPES = [
  'click', 'fill', 'wait', 'scroll', 'navigate', 'submit', 'select', 'hover',
  'keypress', 'extract', 'screenshot', 'tab', 'clipboard', 'storage', 'log',
  'prompt', 'setVariable', 'branch', 'loop', 'stop', 'jump',
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
          <div className="flex flex-col items-center justify-center py-12 text-[var(--color-text-secondary)]">
            <p className="text-sm">No steps yet</p>
            <p className="text-xs mt-1">Add a step to get started</p>
          </div>
        )}
      </div>

      {/* Add step */}
      <div className="border-t border-[var(--color-border)] p-2">
        <button
          onClick={() => setShowAddPanel(p => !p)}
          className="w-full text-xs text-[var(--color-brand)] py-1.5 rounded-lg border border-dashed border-[var(--color-brand)]/50 hover:border-[var(--color-brand)] hover:bg-[var(--color-brand)]/5 transition-colors"
        >
          + Add Step
        </button>
        {showAddPanel && (
          <div className="mt-2 grid grid-cols-3 gap-1 max-h-40 overflow-y-auto">
            {ALL_STEP_TYPES.map(type => (
              <button
                key={type}
                onClick={() => { onAddStep(type); setShowAddPanel(false) }}
                className="text-xs text-left px-2 py-1.5 rounded border border-[var(--color-border)] hover:border-[var(--color-brand)]/50 hover:bg-[var(--color-surface-raised)] transition-colors truncate"
              >
                {type}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
