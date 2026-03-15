import { useState } from 'react'
import { InterceptRule } from '@shared/types'
import { Button, Input } from '@ui'

interface Props {
  rules: InterceptRule[]
  onChange: (rules: InterceptRule[]) => void
}

export function InterceptRules({ rules, onChange }: Props) {
  const [newPattern, setNewPattern] = useState('')
  const [newAction, setNewAction] = useState<'read' | 'modify'>('read')
  const [newSaveAs, setNewSaveAs] = useState('')

  const add = () => {
    if (!newPattern.trim()) return
    const rule: InterceptRule = {
      id: crypto.randomUUID(),
      name: newPattern.trim(),
      enabled: true,
      urlPattern: newPattern.trim(),
      methods: ['GET', 'POST'],
      action: newAction,
      ...(newAction === 'read' && newSaveAs.trim() ? { saveAs: newSaveAs.trim(), saveTo: 'run' as const } : {}),
    }
    onChange([...rules, rule])
    setNewPattern('')
    setNewSaveAs('')
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
        <Button variant="secondary" size="sm" onClick={add}>Add Rule</Button>
      </div>
    </div>
  )
}
