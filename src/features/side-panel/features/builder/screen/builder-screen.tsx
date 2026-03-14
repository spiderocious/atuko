import { useEffect } from 'react'
import { Workflow } from '@shared/types'
import { Button } from '@ui'
import { useBuilderState } from '../hooks/use-builder-state'
import { FlowCanvas } from '../parts/flow-canvas'
import { StepInspector } from '../parts/step-inspector'
import { RecordToolbar } from '../parts/record-toolbar'

interface Props {
  workflow: Workflow
  onSave: (w: Workflow) => void
  onBack: () => void
}

export function BuilderScreen({ workflow, onSave, onBack }: Props) {
  const {
    workflow: wf,
    selectedStepId,
    isDirty,
    selectStep,
    addStep,
    removeStep,
    reorderSteps,
    updateStep,
    updateWorkflow,
  } = useBuilderState(workflow)

  // Keep internal state in sync when switching to a different workflow
  useEffect(() => {
    updateWorkflow(workflow)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflow.id])

  const selectedStep = wf.steps.find(s => s.id === selectedStepId) ?? null

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[var(--color-border)] flex-shrink-0">
        <button
          onClick={onBack}
          className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-sm transition-colors"
        >
          ← Back
        </button>
        <input
          className="flex-1 text-sm font-medium bg-transparent outline-none text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]"
          value={wf.name}
          onChange={e => updateWorkflow({ ...wf, name: e.target.value })}
          placeholder="Workflow name"
        />
        <Button
          variant="primary"
          size="sm"
          onClick={() => onSave(wf)}
          disabled={!isDirty}
        >
          Save
        </Button>
      </div>

      {/* Body: two columns */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: canvas */}
        <div className="flex flex-col w-1/2 border-r border-[var(--color-border)] overflow-hidden">
          <RecordToolbar workflowId={wf.id} />
          <FlowCanvas
            steps={wf.steps}
            selectedStepId={selectedStepId}
            onSelectStep={selectStep}
            onDeleteStep={removeStep}
            onReorder={reorderSteps}
            onAddStep={addStep}
          />
        </div>

        {/* Right: inspector */}
        <div className="flex-1 overflow-y-auto">
          {selectedStep ? (
            <StepInspector
              step={selectedStep}
              onChange={patch => updateStep(selectedStep.id, patch)}
            />
          ) : (
            <div className="p-3 flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">Workflow</h3>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">Site</label>
                <input
                  className="text-sm border border-[var(--color-border)] rounded px-2 py-1.5 bg-[var(--color-surface)] text-[var(--color-text-primary)] w-full focus:outline-none focus:border-[var(--color-brand)]"
                  value={wf.site}
                  onChange={e => updateWorkflow({ ...wf, site: e.target.value })}
                  placeholder="example.com"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">Description</label>
                <textarea
                  className="text-sm border border-[var(--color-border)] rounded px-2 py-1.5 bg-[var(--color-surface)] text-[var(--color-text-primary)] w-full focus:outline-none focus:border-[var(--color-brand)] resize-none"
                  rows={3}
                  value={wf.description}
                  onChange={e => updateWorkflow({ ...wf, description: e.target.value })}
                  placeholder="What does this workflow do?"
                />
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">Select a step on the left to configure it.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
