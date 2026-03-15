import { Workflow } from '@shared/types'
import { Button } from '@ui'
import { useJsonSync } from '../hooks/use-json-sync'

interface Props {
  workflow: Workflow
  onApply: (w: Workflow) => void
}

export function JsonConfigScreen({ workflow, onApply }: Props) {
  const { jsonText, parseError, setJsonText, applyJson } = useJsonSync(workflow)

  const handleApply = () => {
    const parsed = applyJson()
    if (parsed) onApply(parsed)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--color-border)] flex-shrink-0">
        <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
          JSON Config
        </span>
        <Button variant="primary" size="sm" onClick={handleApply} disabled={!!parseError}>
          Apply
        </Button>
      </div>
      {parseError && (
        <div className="px-3 py-2 bg-[var(--color-error)]/10 border-b border-[var(--color-error)]/20 flex-shrink-0">
          <p className="text-xs text-[var(--color-error)] font-mono break-all">{parseError}</p>
        </div>
      )}
      <textarea
        className="flex-1 font-mono text-xs p-3 bg-[var(--color-surface)] text-[var(--color-text-primary)] resize-none outline-none leading-relaxed"
        value={jsonText}
        onChange={e => setJsonText(e.target.value)}
        spellCheck={false}
      />
    </div>
  )
}
