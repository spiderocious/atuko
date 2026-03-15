import { useState } from 'react'
import { SelectorAlias } from '@shared/types'
import { Button, Input } from '@ui'

interface Props {
  aliases: SelectorAlias[]
  onChange: (aliases: SelectorAlias[]) => void
}

export function AliasEditor({ aliases, onChange }: Props) {
  const [newName, setNewName] = useState('')
  const [newSelector, setNewSelector] = useState('')

  const add = () => {
    if (!newName.trim() || !newSelector.trim()) return
    onChange([...aliases, { name: newName.trim(), selector: newSelector.trim() }])
    setNewName('')
    setNewSelector('')
  }

  const remove = (index: number) => {
    onChange(aliases.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
        Selector Aliases
      </p>
      {aliases.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {aliases.map((alias, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)]"
            >
              <span className="text-xs font-mono text-[var(--color-brand)] flex-shrink-0">@{alias.name}</span>
              <span className="text-xs text-[var(--color-text-secondary)] flex-1 truncate">→ {alias.selector}</span>
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
          label="Alias name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="submit-button"
        />
        <Input
          label="Selector"
          value={newSelector}
          onChange={e => setNewSelector(e.target.value)}
          placeholder="#submit-btn or [data-testid='submit']"
        />
        <Button variant="secondary" size="sm" onClick={add}>Add Alias</Button>
      </div>
    </div>
  )
}
