import type { ReactNode } from 'react'
import { StepObject } from '@shared/types'
import { SelectorPicker } from './selector-picker'

interface FieldProps {
  label: string
  children: ReactNode
}

function Field({ label, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-[var(--color-text-secondary)]">
        {label}
      </label>
      {children}
    </div>
  )
}

const INPUT_CLS = 'text-sm border border-[var(--color-border)] rounded px-2 py-1.5 bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand)] transition-colors w-full'
const CHECKBOX_CLS = 'w-4 h-4 accent-[var(--color-brand)] cursor-pointer'

interface Props {
  step: StepObject
  onChange: (patch: Partial<StepObject>) => void
}

export function StepInspector({ step, onChange }: Props) {
  const s = step as unknown as Record<string, unknown>
  const set = (key: string, value: unknown) => onChange({ [key]: value } as Partial<StepObject>)

  return (
    <div className="flex flex-col gap-4 p-3 overflow-y-auto h-full">
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
          {step.type} Step
        </h3>

        {/* Common fields */}
        <Field label="Label">
          <input className={INPUT_CLS} value={step.label} onChange={e => set('label', e.target.value)} placeholder="Step label…" />
        </Field>
        <Field label="Note">
          <input className={INPUT_CLS} value={step.note ?? ''} onChange={e => set('note', e.target.value)} placeholder="Optional note…" />
        </Field>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
            <input type="checkbox" className={CHECKBOX_CLS} checked={!!(s['enabled'] as boolean)} onChange={e => set('enabled', e.target.checked)} />
            Enabled
          </label>
        </div>
        <Field label="On Error">
          <select className={INPUT_CLS} value={step.onError} onChange={e => set('onError', e.target.value)}>
            <option value="stop">Stop</option>
            <option value="skip">Skip</option>
            <option value="retry">Retry</option>
            <option value="branch">Branch</option>
          </select>
        </Field>
        <Field label="Retries">
          <input className={INPUT_CLS} type="number" min={0} max={5} value={step.retries} onChange={e => set('retries', Number(e.target.value))} />
        </Field>
        <Field label="Retry delay (ms)">
          <input className={INPUT_CLS} type="number" min={0} value={step.retryDelay} onChange={e => set('retryDelay', Number(e.target.value))} />
        </Field>
      </div>

      <hr className="border-[var(--color-border)]" />

      {/* Type-specific fields */}
      <StepTypeFields step={step} s={s} set={set} cls={INPUT_CLS} checkCls={CHECKBOX_CLS} />
    </div>
  )
}

interface TypeFieldsProps {
  step: StepObject
  s: Record<string, unknown>
  set: (key: string, value: unknown) => void
  cls: string
  checkCls: string
}

function StepTypeFields({ step, s, set, cls, checkCls }: TypeFieldsProps) {
  const Field2 = ({ label, children }: { label: string; children: ReactNode }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-[var(--color-text-secondary)]">{label}</label>
      {children}
    </div>
  )

  // Selector helper — includes a crosshair element picker button
  const selectorInput = (
    <Field2 label="Selector">
      <SelectorPicker
        value={(s['selector'] as { primary: string })?.primary ?? ''}
        onChange={v => set('selector', { ...(s['selector'] as object ?? {}), primary: v })}
      />
    </Field2>
  )

  switch (step.type) {
    case 'click':
      return (
        <>
          {selectorInput}
          <Field2 label="Button">
            <select className={cls} value={s['button'] as string} onChange={e => set('button', e.target.value)}>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="middle">Middle</option>
            </select>
          </Field2>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className={checkCls} checked={!!s['doubleClick']} onChange={e => set('doubleClick', e.target.checked)} />
            Double click
          </label>
          <Field2 label="Wait before (ms)">
            <input className={cls} type="number" value={s['waitBefore'] as number} onChange={e => set('waitBefore', Number(e.target.value))} />
          </Field2>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className={checkCls} checked={!!s['scrollIntoView']} onChange={e => set('scrollIntoView', e.target.checked)} />
            Scroll into view
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className={checkCls} checked={!!s['force']} onChange={e => set('force', e.target.checked)} />
            Force click
          </label>
        </>
      )

    case 'fill':
      return (
        <>
          {selectorInput}
          <Field2 label="Value">
            <input className={cls} value={s['value'] as string} onChange={e => set('value', e.target.value)} placeholder="{{variable}} or text" />
          </Field2>
          <Field2 label="Clear method">
            <select className={cls} value={s['clearMethod'] as string} onChange={e => set('clearMethod', e.target.value)}>
              <option value="select-all">Select all</option>
              <option value="triple-click">Triple click</option>
              <option value="ctrl-a">Ctrl+A</option>
            </select>
          </Field2>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className={checkCls} checked={!!s['append']} onChange={e => set('append', e.target.checked)} />
            Append
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className={checkCls} checked={!!s['simulateTyping']} onChange={e => set('simulateTyping', e.target.checked)} />
            Simulate typing
          </label>
          {!!s['simulateTyping'] && (
            <Field2 label="Typing delay (ms)">
              <input className={cls} type="number" value={s['typingDelay'] as number ?? 0} onChange={e => set('typingDelay', Number(e.target.value))} />
            </Field2>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className={checkCls} checked={!!s['pressEnter']} onChange={e => set('pressEnter', e.target.checked)} />
            Press Enter after
          </label>
        </>
      )

    case 'wait':
      return (
        <>
          <Field2 label="Wait type">
            <select className={cls} value={s['waitType'] as string} onChange={e => set('waitType', e.target.value)}>
              <option value="duration">Duration</option>
              <option value="element">Element appears</option>
              <option value="element-gone">Element disappears</option>
              <option value="text">Text appears</option>
              <option value="network">Network idle</option>
            </select>
          </Field2>
          {s['waitType'] === 'duration' && (
            <Field2 label="Duration (ms)">
              <input className={cls} type="number" value={s['duration'] as number} onChange={e => set('duration', Number(e.target.value))} />
            </Field2>
          )}
          {(s['waitType'] === 'element' || s['waitType'] === 'element-gone') && selectorInput}
          {s['waitType'] === 'text' && (
            <Field2 label="Text">
              <input className={cls} value={s['text'] as string ?? ''} onChange={e => set('text', e.target.value)} placeholder="Text to wait for…" />
            </Field2>
          )}
          <Field2 label="Timeout (ms)">
            <input className={cls} type="number" value={s['timeout'] as number} onChange={e => set('timeout', Number(e.target.value))} />
          </Field2>
          <Field2 label="On timeout">
            <select className={cls} value={s['onTimeout'] as string} onChange={e => set('onTimeout', e.target.value)}>
              <option value="stop">Stop</option>
              <option value="skip">Skip</option>
              <option value="branch">Branch</option>
            </select>
          </Field2>
        </>
      )

    case 'scroll':
      return (
        <>
          <Field2 label="Scroll type">
            <select className={cls} value={s['scrollType'] as string} onChange={e => set('scrollType', e.target.value)}>
              <option value="to">To position</option>
              <option value="by">By offset</option>
              <option value="top">To top</option>
              <option value="bottom">To bottom</option>
              <option value="element">To element</option>
            </select>
          </Field2>
          {(s['scrollType'] === 'to' || s['scrollType'] === 'by') && (
            <>
              <Field2 label="X">
                <input className={cls} type="number" value={s['x'] as number ?? 0} onChange={e => set('x', Number(e.target.value))} />
              </Field2>
              <Field2 label="Y">
                <input className={cls} type="number" value={s['y'] as number ?? 0} onChange={e => set('y', Number(e.target.value))} />
              </Field2>
            </>
          )}
          {s['scrollType'] === 'element' && selectorInput}
          <Field2 label="Behavior">
            <select className={cls} value={s['behavior'] as string} onChange={e => set('behavior', e.target.value)}>
              <option value="smooth">Smooth</option>
              <option value="instant">Instant</option>
            </select>
          </Field2>
        </>
      )

    case 'navigate':
      return (
        <>
          <Field2 label="URL">
            <input className={cls} value={s['url'] as string} onChange={e => set('url', e.target.value)} placeholder="https://…" />
          </Field2>
          <Field2 label="Wait until">
            <select className={cls} value={s['waitUntil'] as string} onChange={e => set('waitUntil', e.target.value)}>
              <option value="load">Load</option>
              <option value="domcontentloaded">DOM ready</option>
              <option value="networkidle">Network idle</option>
            </select>
          </Field2>
          <Field2 label="Timeout (ms)">
            <input className={cls} type="number" value={s['timeout'] as number} onChange={e => set('timeout', Number(e.target.value))} />
          </Field2>
        </>
      )

    case 'submit':
      return (
        <>
          {selectorInput}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className={checkCls} checked={!!s['waitForNavigation']} onChange={e => set('waitForNavigation', e.target.checked)} />
            Wait for navigation
          </label>
          {!!s['waitForNavigation'] && (
            <Field2 label="Navigation timeout (ms)">
              <input className={cls} type="number" value={s['navigationTimeout'] as number ?? 5000} onChange={e => set('navigationTimeout', Number(e.target.value))} />
            </Field2>
          )}
        </>
      )

    case 'select':
      return (
        <>
          {selectorInput}
          <Field2 label="Select by">
            <select className={cls} value={s['by'] as string} onChange={e => set('by', e.target.value)}>
              <option value="value">Value</option>
              <option value="label">Label</option>
              <option value="index">Index</option>
            </select>
          </Field2>
          <Field2 label="Value">
            <input className={cls} value={String(s['value'] ?? '')} onChange={e => set('value', e.target.value)} />
          </Field2>
        </>
      )

    case 'hover':
      return (
        <>
          {selectorInput}
          <Field2 label="Duration (ms)">
            <input className={cls} type="number" value={s['duration'] as number} onChange={e => set('duration', Number(e.target.value))} />
          </Field2>
        </>
      )

    case 'keypress':
      return (
        <>
          <Field2 label="Key">
            <input className={cls} value={s['key'] as string} onChange={e => set('key', e.target.value)} placeholder="Enter, Escape, Ctrl+C…" />
          </Field2>
          <Field2 label="Target">
            <select className={cls} value={typeof s['target'] === 'string' ? s['target'] as string : 'page'} onChange={e => set('target', e.target.value)}>
              <option value="page">Page</option>
            </select>
          </Field2>
          <Field2 label="Repeat">
            <input className={cls} type="number" min={1} value={s['repeat'] as number} onChange={e => set('repeat', Number(e.target.value))} />
          </Field2>
          <Field2 label="Delay between (ms)">
            <input className={cls} type="number" value={s['delay'] as number} onChange={e => set('delay', Number(e.target.value))} />
          </Field2>
        </>
      )

    case 'extract':
      return (
        <>
          {selectorInput}
          <Field2 label="Property">
            <select className={cls} value={s['property'] as string} onChange={e => set('property', e.target.value)}>
              <option value="text">Text</option>
              <option value="html">HTML</option>
              <option value="value">Value</option>
              <option value="attribute">Attribute</option>
              <option value="style">Style</option>
            </select>
          </Field2>
          {s['property'] === 'attribute' && (
            <Field2 label="Attribute name">
              <input className={cls} value={s['attribute'] as string ?? ''} onChange={e => set('attribute', e.target.value)} placeholder="e.g. href, src, data-id" />
            </Field2>
          )}
          {s['property'] === 'style' && (
            <Field2 label="Style property">
              <input className={cls} value={s['styleProperty'] as string ?? ''} onChange={e => set('styleProperty', e.target.value)} placeholder="e.g. color, font-size" />
            </Field2>
          )}
          <Field2 label="Save as">
            <input className={cls} value={s['saveAs'] as string} onChange={e => set('saveAs', e.target.value)} placeholder="variable name" />
          </Field2>
          <Field2 label="Transform">
            <select className={cls} value={s['transform'] as string} onChange={e => set('transform', e.target.value)}>
              <option value="none">None</option>
              <option value="trim">Trim</option>
              <option value="lowercase">Lowercase</option>
              <option value="uppercase">Uppercase</option>
              <option value="number">Number</option>
            </select>
          </Field2>
        </>
      )

    case 'screenshot':
      return (
        <>
          <Field2 label="Target">
            <select className={cls} value={s['target'] as string} onChange={e => set('target', e.target.value)}>
              <option value="viewport">Viewport</option>
              <option value="page">Full page</option>
            </select>
          </Field2>
          <Field2 label="Filename">
            <input className={cls} value={s['filename'] as string} onChange={e => set('filename', e.target.value)} placeholder="screenshot.png" />
          </Field2>
          <Field2 label="Save as">
            <input className={cls} value={s['saveAs'] as string ?? ''} onChange={e => set('saveAs', e.target.value)} placeholder="variable name (optional)" />
          </Field2>
        </>
      )

    case 'tab':
      return (
        <>
          <Field2 label="Action">
            <select className={cls} value={s['action'] as string} onChange={e => set('action', e.target.value)}>
              <option value="open">Open</option>
              <option value="close">Close</option>
              <option value="switch">Switch</option>
              <option value="close-others">Close others</option>
            </select>
          </Field2>
          {s['action'] === 'open' && (
            <Field2 label="URL">
              <input className={cls} value={s['url'] as string ?? ''} onChange={e => set('url', e.target.value)} placeholder="https://…" />
            </Field2>
          )}
          <Field2 label="Wait until">
            <select className={cls} value={s['waitUntil'] as string} onChange={e => set('waitUntil', e.target.value)}>
              <option value="load">Load</option>
              <option value="domcontentloaded">DOM ready</option>
            </select>
          </Field2>
          <Field2 label="Save tab ID">
            <input className={cls} value={s['saveTabId'] as string ?? ''} onChange={e => set('saveTabId', e.target.value)} placeholder="variable name (optional)" />
          </Field2>
        </>
      )

    case 'clipboard':
      return (
        <>
          <Field2 label="Action">
            <select className={cls} value={s['action'] as string} onChange={e => set('action', e.target.value)}>
              <option value="read">Read</option>
              <option value="write">Write</option>
            </select>
          </Field2>
          {s['action'] === 'write' && (
            <Field2 label="Value">
              <input className={cls} value={s['value'] as string ?? ''} onChange={e => set('value', e.target.value)} />
            </Field2>
          )}
          {s['action'] === 'read' && (
            <Field2 label="Save as">
              <input className={cls} value={s['saveAs'] as string ?? ''} onChange={e => set('saveAs', e.target.value)} placeholder="variable name" />
            </Field2>
          )}
        </>
      )

    case 'storage':
      return (
        <>
          <Field2 label="Storage">
            <select className={cls} value={s['store'] as string} onChange={e => set('store', e.target.value)}>
              <option value="local">localStorage</option>
              <option value="session">sessionStorage</option>
            </select>
          </Field2>
          <Field2 label="Action">
            <select className={cls} value={s['action'] as string} onChange={e => set('action', e.target.value)}>
              <option value="get">Get</option>
              <option value="set">Set</option>
              <option value="remove">Remove</option>
              <option value="clear">Clear</option>
            </select>
          </Field2>
          {s['action'] !== 'clear' && (
            <Field2 label="Key">
              <input className={cls} value={s['key'] as string ?? ''} onChange={e => set('key', e.target.value)} />
            </Field2>
          )}
          {s['action'] === 'set' && (
            <Field2 label="Value">
              <input className={cls} value={s['value'] as string ?? ''} onChange={e => set('value', e.target.value)} />
            </Field2>
          )}
          {s['action'] === 'get' && (
            <Field2 label="Save as">
              <input className={cls} value={s['saveAs'] as string ?? ''} onChange={e => set('saveAs', e.target.value)} />
            </Field2>
          )}
        </>
      )

    case 'log':
      return (
        <>
          <Field2 label="Message">
            <input className={cls} value={s['message'] as string} onChange={e => set('message', e.target.value)} placeholder="Log message…" />
          </Field2>
          <Field2 label="Level">
            <select className={cls} value={s['level'] as string} onChange={e => set('level', e.target.value)}>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
            </select>
          </Field2>
        </>
      )

    case 'prompt':
      return (
        <>
          <Field2 label="Message">
            <input className={cls} value={s['message'] as string} onChange={e => set('message', e.target.value)} />
          </Field2>
          <Field2 label="Type">
            <select className={cls} value={s['promptType'] as string} onChange={e => set('promptType', e.target.value)}>
              <option value="text">Text</option>
              <option value="password">Password</option>
              <option value="select">Select</option>
            </select>
          </Field2>
          <Field2 label="Save as">
            <input className={cls} value={s['saveAs'] as string} onChange={e => set('saveAs', e.target.value)} />
          </Field2>
          <Field2 label="Countdown (s)">
            <input className={cls} type="number" value={s['countdown'] as number} onChange={e => set('countdown', Number(e.target.value))} />
          </Field2>
        </>
      )

    case 'setVariable':
      return (
        <>
          <Field2 label="Variable name">
            <input className={cls} value={s['name'] as string} onChange={e => set('name', e.target.value)} />
          </Field2>
          <Field2 label="Value">
            <input className={cls} value={s['value'] as string} onChange={e => set('value', e.target.value)} />
          </Field2>
          <Field2 label="Scope">
            <select className={cls} value={s['scope'] as string} onChange={e => set('scope', e.target.value)}>
              <option value="run">Run</option>
              <option value="workflow">Workflow</option>
              <option value="site">Site</option>
              <option value="global">Global</option>
            </select>
          </Field2>
          <Field2 label="Transform">
            <select className={cls} value={s['transform'] as string} onChange={e => set('transform', e.target.value)}>
              <option value="none">None</option>
              <option value="trim">Trim</option>
              <option value="lowercase">Lowercase</option>
              <option value="uppercase">Uppercase</option>
              <option value="number">Number</option>
              <option value="json-parse">JSON parse</option>
            </select>
          </Field2>
        </>
      )

    case 'branch':
    case 'loop':
      return (
        <p className="text-xs text-[var(--color-text-secondary)]">
          Edit branch/loop config in the JSON tab for full control over conditions and nested steps.
        </p>
      )

    case 'stop':
      return (
        <>
          <Field2 label="Reason">
            <input className={cls} value={s['reason'] as string ?? ''} onChange={e => set('reason', e.target.value)} placeholder="Why stopping…" />
          </Field2>
          <Field2 label="Status">
            <select className={cls} value={s['status'] as string} onChange={e => set('status', e.target.value)}>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </Field2>
        </>
      )

    case 'jump':
      return (
        <Field2 label="Target step ID">
          <input className={cls} value={s['stepId'] as string ?? ''} onChange={e => set('stepId', e.target.value)} placeholder="Step ID to jump to" />
        </Field2>
      )

    default:
      return <p className="text-xs text-[var(--color-text-secondary)]">No configuration available for this step type.</p>
  }
}
