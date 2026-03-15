import { useState } from 'react'
import { InterceptRule } from '@shared/types'
import { Button, Input } from '@ui'

interface Props {
  rules: InterceptRule[]
  onChange: (rules: InterceptRule[]) => void
}

const ALL_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']

export function InterceptRules({ rules, onChange }: Props) {
  const [newPattern, setNewPattern] = useState('')
  const [newAction, setNewAction] = useState<'read' | 'modify'>('read')
  const [newSaveAs, setNewSaveAs] = useState('')
  const [newMethods, setNewMethods] = useState<string[]>(['GET', 'POST'])
  const [newResponseBody, setNewResponseBody] = useState('')
  const [newResponseStatus, setNewResponseStatus] = useState(200)
  const [newContentType, setNewContentType] = useState('application/json')

  const toggleMethod = (method: string) => {
    setNewMethods(prev =>
      prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
    )
  }

  const add = () => {
    if (!newPattern.trim()) return
    const rule: InterceptRule = {
      id: crypto.randomUUID(),
      name: newPattern.trim(),
      enabled: true,
      urlPattern: newPattern.trim(),
      methods: newMethods.length > 0 ? newMethods : ['GET', 'POST'],
      action: newAction,
      ...(newAction === 'read' && newSaveAs.trim() ? { saveAs: newSaveAs.trim(), saveTo: 'run' as const } : {}),
      ...(newAction === 'modify' ? {
        responseBody: newResponseBody.trim() ? (() => {
          try { return JSON.parse(newResponseBody) } catch { return { body: newResponseBody } }
        })() : undefined,
        responseHeaders: {
          status: newResponseStatus,
          'Content-Type': newContentType,
        },
      } : {}),
    }
    onChange([...rules, rule])
    setNewPattern('')
    setNewSaveAs('')
    setNewResponseBody('')
    setNewResponseStatus(200)
    setNewContentType('application/json')
  }

  const remove = (index: number) => onChange(rules.filter((_, i) => i !== index))

  const inputCls = 'text-sm border border-[var(--color-border)] rounded px-2 py-1.5 bg-[var(--color-surface)] text-[var(--color-text-primary)] w-full focus:outline-none focus:border-[var(--color-brand)]'

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
        Intercept Rules
      </p>
      {rules.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {rules.map((rule, i) => (
            <div
              key={rule.id}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)]"
            >
              <span className="text-xs font-mono text-[var(--color-text-primary)] flex-1 truncate">
                {rule.urlPattern}
              </span>
              <span className="text-xs text-[var(--color-text-secondary)] flex-shrink-0">{rule.action}</span>
              <button
                onClick={() => remove(i)}
                className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-error)] transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Input
          label="URL pattern"
          value={newPattern}
          onChange={e => setNewPattern(e.target.value)}
          placeholder="**/api/users**"
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">Methods</label>
          <div className="flex flex-wrap gap-1">
            {ALL_METHODS.map(m => (
              <button
                key={m}
                type="button"
                onClick={() => toggleMethod(m)}
                className={[
                  'text-xs px-2 py-0.5 rounded border transition-colors',
                  newMethods.includes(m)
                    ? 'bg-[var(--color-brand)] border-[var(--color-brand)] text-white'
                    : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand)]',
                ].join(' ')}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">Action</label>
          <select
            className={inputCls}
            value={newAction}
            onChange={e => setNewAction(e.target.value as 'read' | 'modify')}
          >
            <option value="read">Read response</option>
            <option value="modify">Modify response</option>
          </select>
        </div>
        {newAction === 'read' && (
          <Input
            label="Save response as"
            value={newSaveAs}
            onChange={e => setNewSaveAs(e.target.value)}
            placeholder="responseVar"
          />
        )}
        {newAction === 'modify' && (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[var(--color-text-secondary)]">Response status</label>
              <input
                className={inputCls}
                type="number"
                value={newResponseStatus}
                onChange={e => setNewResponseStatus(Number(e.target.value))}
                placeholder="200"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[var(--color-text-secondary)]">Content-Type</label>
              <input
                className={inputCls}
                value={newContentType}
                onChange={e => setNewContentType(e.target.value)}
                placeholder="application/json"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[var(--color-text-secondary)]">Response body (JSON)</label>
              <textarea
                className={`${inputCls} resize-none font-mono`}
                rows={4}
                value={newResponseBody}
                onChange={e => setNewResponseBody(e.target.value)}
                placeholder={'{\n  "key": "value"\n}'}
              />
            </div>
          </>
        )}
        <Button variant="secondary" size="sm" onClick={add}>Add Rule</Button>
      </div>
    </div>
  )
}
