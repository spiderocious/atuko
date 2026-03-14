import { useState, useCallback } from 'react'
import { Workflow, StepObject } from '@shared/types'

function createDefaultStep(type: string): StepObject {
  const base = {
    id: crypto.randomUUID(),
    label: '',
    note: '' as string | undefined,
    // enabled is not part of StepBase but included as a UI-only field
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    enabled: true as any,
    onError: 'stop' as const,
    retries: 0,
    retryDelay: 0,
  }

  switch (type) {
    case 'click':
      return {
        ...base,
        type: 'click',
        selector: { primary: '', fallbacks: [], stabilityScore: 0 },
        button: 'left',
        doubleClick: false,
        waitBefore: 0,
        scrollIntoView: true,
        force: false,
      }
    case 'fill':
      return {
        ...base,
        type: 'fill',
        selector: { primary: '', fallbacks: [], stabilityScore: 0 },
        value: '',
        clearMethod: 'select-all',
        append: false,
        simulateTyping: false,
        typingDelay: 0,
        pressEnter: false,
      }
    case 'wait':
      return {
        ...base,
        type: 'wait',
        waitType: 'duration',
        duration: 1000,
        timeout: 10000,
        onTimeout: 'stop' as const,
      }
    case 'scroll':
      return {
        ...base,
        type: 'scroll',
        scrollType: 'to',
        target: 'page',
        x: 0,
        y: 0,
        behavior: 'smooth',
      }
    case 'navigate':
      return {
        ...base,
        type: 'navigate',
        url: '',
        waitUntil: 'load',
        timeout: 10000,
      }
    case 'submit':
      return {
        ...base,
        type: 'submit',
        selector: { primary: '', fallbacks: [], stabilityScore: 0 },
        waitForNavigation: false,
        navigationTimeout: 5000,
      }
    case 'select':
      return {
        ...base,
        type: 'select',
        selector: { primary: '', fallbacks: [], stabilityScore: 0 },
        by: 'value',
        value: '',
      }
    case 'hover':
      return {
        ...base,
        type: 'hover',
        selector: { primary: '', fallbacks: [], stabilityScore: 0 },
        duration: 500,
      }
    case 'keypress':
      return {
        ...base,
        type: 'keypress',
        key: 'Enter',
        target: 'page',
        repeat: 1,
        delay: 0,
      }
    case 'extract':
      return {
        ...base,
        type: 'extract',
        selector: { primary: '', fallbacks: [], stabilityScore: 0 },
        property: 'text',
        saveAs: '',
        transform: 'none',
      }
    case 'screenshot':
      return {
        ...base,
        type: 'screenshot',
        target: 'viewport',
        filename: 'screenshot.png',
      }
    case 'tab':
      return {
        ...base,
        type: 'tab',
        action: 'open',
        url: '',
        waitUntil: 'load',
        saveTabId: '',
      }
    case 'clipboard':
      return {
        ...base,
        type: 'clipboard',
        action: 'read',
        saveAs: '',
      }
    case 'storage':
      return {
        ...base,
        type: 'storage',
        action: 'get',
        store: 'local',
        key: '',
        saveAs: '',
      }
    case 'log':
      return {
        ...base,
        type: 'log',
        message: '',
        level: 'info',
      }
    case 'prompt':
      return {
        ...base,
        type: 'prompt',
        promptType: 'text',
        message: '',
        saveAs: '',
        countdown: 30,
      }
    case 'setVariable':
      return {
        ...base,
        type: 'setVariable',
        name: '',
        value: '',
        scope: 'run',
        transform: 'none',
      }
    case 'branch':
      return {
        ...base,
        type: 'branch',
        condition: { type: 'variable', operator: 'equals', variable: '', value: '' },
        then: [],
        else: [],
        mergeAt: '',
      }
    case 'loop':
      return {
        ...base,
        type: 'loop',
        loopType: 'count',
        count: 3,
        maxIterations: 100,
        itemAs: '',
        steps: [],
      }
    case 'stop':
      return {
        ...base,
        type: 'stop',
        reason: '',
        status: 'success',
      }
    case 'jump':
      return {
        ...base,
        type: 'jump',
        stepId: '',
      }
    default:
      return {
        ...base,
        type: 'log',
        message: `Unknown step: ${type}`,
        level: 'info',
      } as StepObject
  }
}

interface BuilderState {
  workflow: Workflow
  selectedStepId: string | null
  isDirty: boolean
  selectStep: (id: string | null) => void
  updateWorkflow: (w: Workflow) => void
  addStep: (type: string) => void
  removeStep: (id: string) => void
  reorderSteps: (from: number, to: number) => void
  updateStep: (stepId: string, patch: Partial<StepObject>) => void
}

export function useBuilderState(initial: Workflow): BuilderState {
  const [workflow, setWorkflow] = useState(initial)
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  const updateWorkflow = useCallback((w: Workflow) => {
    setWorkflow(w)
    setIsDirty(true)
  }, [])

  const selectStep = useCallback((id: string | null) => setSelectedStepId(id), [])

  const addStep = useCallback((type: string) => {
    const step = createDefaultStep(type)
    setWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, step],
      updatedAt: new Date().toISOString(),
    }))
    setIsDirty(true)
    setSelectedStepId(step.id)
  }, [])

  const removeStep = useCallback((id: string) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.filter(s => s.id !== id),
      updatedAt: new Date().toISOString(),
    }))
    setIsDirty(true)
    setSelectedStepId(prev => prev === id ? null : prev)
  }, [])

  const reorderSteps = useCallback((from: number, to: number) => {
    setWorkflow(prev => {
      const steps = [...prev.steps]
      const [moved] = steps.splice(from, 1)
      steps.splice(to, 0, moved)
      return { ...prev, steps, updatedAt: new Date().toISOString() }
    })
    setIsDirty(true)
  }, [])

  const updateStep = useCallback((stepId: string, patch: Partial<StepObject>) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map(s => s.id === stepId ? { ...s, ...patch } as StepObject : s),
      updatedAt: new Date().toISOString(),
    }))
    setIsDirty(true)
  }, [])

  return { workflow, selectedStepId, isDirty, selectStep, updateWorkflow, addStep, removeStep, reorderSteps, updateStep }
}
