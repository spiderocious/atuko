import { useEffect, useState } from 'react'
import { Workflow, TriggerObject, UrlMatchTrigger, ChainTrigger } from '@shared/types'
import { Button } from '@ui'
import { ChevronLeft, Plus, Trash2 } from '@shared/ui/icons'
import { useBuilderState } from '../hooks/use-builder-state'
import { FlowCanvas } from '../parts/flow-canvas'
import { StepInspector } from '../parts/step-inspector'
import { RecordToolbar } from '../parts/record-toolbar'

interface Props {
  workflow: Workflow
  onSave: (w: Workflow) => void
  onBack: () => void
}

const INPUT_CLS = 'text-sm border border-[var(--color-border)] rounded px-2 py-1.5 bg-[var(--color-surface)] text-[var(--color-text-primary)] w-full focus:outline-none focus:border-[var(--color-brand)] transition-colors'

function TriggerEditor({ triggers, onChange }: { triggers: TriggerObject[]; onChange: (t: TriggerObject[]) => void }) {
  const addTrigger = (type: TriggerObject['type']) => {
    let newTrigger: TriggerObject
    if (type === 'manual') newTrigger = { type: 'manual' }
    else if (type === 'url-match') newTrigger = { type: 'url-match', pattern: '', matchType: 'glob', matchOn: 'load', once: false, delay: 0 }
    else newTrigger = { type: 'chain', workflowId: '', onStatus: 'success', passVariables: [] }
    onChange([...triggers, newTrigger])
  }

  const updateTrigger = (index: number, patch: Partial<TriggerObject>) => {
    onChange(triggers.map((t, i) => i === index ? { ...t, ...patch } as TriggerObject : t))
  }

  const removeTrigger = (index: number) => {
    onChange(triggers.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-2">
      {triggers.map((t, i) => (
        <div key={i} className="flex flex-col gap-2 p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-text-primary)] capitalize">{t.type}</span>
            <button
              onClick={() => removeTrigger(i)}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-error)] transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
          {t.type === 'url-match' && (
            <>
              <input
                className={INPUT_CLS}
                value={(t as UrlMatchTrigger).pattern}
                onChange={e => updateTrigger(i, { pattern: e.target.value } as Partial<UrlMatchTrigger>)}
                placeholder="https://example.com/path*"
              />
              <div className="grid grid-cols-2 gap-1.5">
                <select className={INPUT_CLS} value={(t as UrlMatchTrigger).matchType} onChange={e => updateTrigger(i, { matchType: e.target.value } as Partial<UrlMatchTrigger>)}>
                  <option value="glob">Glob</option>
                  <option value="exact">Exact</option>
                  <option value="prefix">Prefix</option>
                  <option value="regex">Regex</option>
                </select>
                <select className={INPUT_CLS} value={(t as UrlMatchTrigger).matchOn} onChange={e => updateTrigger(i, { matchOn: e.target.value } as Partial<UrlMatchTrigger>)}>
                  <option value="load">On load</option>
                  <option value="domcontentloaded">DOM ready</option>
                  <option value="urlchange">URL change</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-[var(--color-text-primary)]">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 accent-[var(--color-brand)]"
                    checked={(t as UrlMatchTrigger).once}
                    onChange={e => updateTrigger(i, { once: e.target.checked } as Partial<UrlMatchTrigger>)}
                  />
                  Run once per visit
                </label>
                <div className="flex items-center gap-1.5 flex-1">
                  <label className="text-xs text-[var(--color-text-secondary)] flex-shrink-0">Delay (ms)</label>
                  <input
                    className={INPUT_CLS}
                    type="number"
                    min={0}
                    value={(t as UrlMatchTrigger).delay}
                    onChange={e => updateTrigger(i, { delay: Number(e.target.value) } as Partial<UrlMatchTrigger>)}
                  />
                </div>
              </div>
            </>
          )}
          {t.type === 'chain' && (
            <>
              <input
                className={INPUT_CLS}
                value={(t as ChainTrigger).workflowId}
                onChange={e => updateTrigger(i, { workflowId: e.target.value } as Partial<ChainTrigger>)}
                placeholder="Workflow ID to chain from"
              />
              <select className={INPUT_CLS} value={(t as ChainTrigger).onStatus} onChange={e => updateTrigger(i, { onStatus: e.target.value } as Partial<ChainTrigger>)}>
                <option value="success">On success</option>
                <option value="any">On any completion</option>
              </select>
            </>
          )}
        </div>
      ))}
      <div className="flex gap-1">
        {(['manual', 'url-match', 'chain'] as TriggerObject['type'][]).map(type => (
          <button
            key={type}
            onClick={() => addTrigger(type)}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-dashed border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors"
          >
            <Plus size={10} /> {type}
          </button>
        ))}
      </div>
    </div>
  )
}

function VariablesEditor({ variables, onChange }: { variables: Record<string, string>; onChange: (v: Record<string, string>) => void }) {
  const [newKey, setNewKey] = useState('')
  const [newVal, setNewVal] = useState('')
  const entries = Object.entries(variables)

  const addEntry = () => {
    if (!newKey.trim()) return
    onChange({ ...variables, [newKey.trim()]: newVal })
    setNewKey('')
    setNewVal('')
  }

  const updateValue = (key: string, val: string) => onChange({ ...variables, [key]: val })

  const removeEntry = (key: string) => {
    const next = { ...variables }
    delete next[key]
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map(([key, val]) => (
        <div key={key} className="flex items-center gap-1.5">
          <span className="text-xs font-mono text-[var(--color-brand)] w-24 flex-shrink-0 truncate">{key}</span>
          <input
            className={`${INPUT_CLS} flex-1`}
            value={val}
            onChange={e => updateValue(key, e.target.value)}
            placeholder="value"
          />
          <button
            onClick={() => removeEntry(key)}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-error)] transition-colors flex-shrink-0"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <input
          className={`${INPUT_CLS} w-24 flex-shrink-0`}
          value={newKey}
          onChange={e => setNewKey(e.target.value)}
          placeholder="key"
          onKeyDown={e => e.key === 'Enter' && addEntry()}
        />
        <input
          className={`${INPUT_CLS} flex-1`}
          value={newVal}
          onChange={e => setNewVal(e.target.value)}
          placeholder="default value"
          onKeyDown={e => e.key === 'Enter' && addEntry()}
        />
        <button
          onClick={addEntry}
          className="flex items-center justify-center w-7 h-7 rounded border border-dashed border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors flex-shrink-0"
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  )
}

export function BuilderScreen({ workflow, onSave, onBack }: Props) {
  const {
    workflow: wf,
    selectedStepId,
    isDirty,
    selectStep,
    addStep,
    appendStep,
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
          className="flex items-center gap-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-sm transition-colors"
        >
          <ChevronLeft size={14} />
          Back
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
          <RecordToolbar workflowId={wf.id} onStepRecorded={appendStep} />
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
            <div className="p-3 flex flex-col gap-4">
              {/* Metadata */}
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">Workflow</h3>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[var(--color-text-secondary)]">Site</label>
                  <input
                    className={INPUT_CLS}
                    value={wf.site}
                    onChange={e => updateWorkflow({ ...wf, site: e.target.value })}
                    placeholder="example.com"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[var(--color-text-secondary)]">Description</label>
                  <textarea
                    className={`${INPUT_CLS} resize-none`}
                    rows={3}
                    value={wf.description}
                    onChange={e => updateWorkflow({ ...wf, description: e.target.value })}
                    placeholder="What does this workflow do?"
                  />
                </div>
              </div>

              <hr className="border-[var(--color-border)]" />

              {/* Triggers */}
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">Triggers</h3>
                <TriggerEditor
                  triggers={wf.triggers}
                  onChange={triggers => updateWorkflow({ ...wf, triggers })}
                />
              </div>

              <hr className="border-[var(--color-border)]" />

              {/* Variables */}
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">Variables</h3>
                <p className="text-xs text-[var(--color-text-secondary)]">Default values used during this workflow's run.</p>
                <VariablesEditor
                  variables={wf.variables}
                  onChange={variables => updateWorkflow({ ...wf, variables })}
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
