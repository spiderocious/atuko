import { Badge } from '@ui'
import { StepObject } from '@shared/types'

const STEP_ICONS: Record<string, string> = {
  click: '🖱',
  fill: '✏️',
  wait: '⏳',
  scroll: '↕',
  navigate: '🔗',
  submit: '📤',
  select: '📋',
  hover: '👆',
  keypress: '⌨',
  extract: '📤',
  screenshot: '📸',
  tab: '🗂',
  clipboard: '📋',
  storage: '💾',
  log: '📝',
  prompt: '💬',
  setVariable: '📦',
  branch: '⑂',
  loop: '↺',
  stop: '⏹',
  jump: '↷',
}

interface Props {
  step: StepObject
  index: number
  isSelected: boolean
  onClick: () => void
  onDelete: () => void
}

export function StepNode({ step, index, isSelected, onClick, onDelete }: Props) {
  const icon = STEP_ICONS[step.type] ?? '•'
  const label = step.label || step.type

  return (
    <div
      onClick={onClick}
      className={[
        'flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all group',
        isSelected
          ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/5 shadow-sm'
          : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand)]/50 hover:bg-[var(--color-surface-raised)]',
        !(step as unknown as { enabled?: boolean }).enabled ? 'opacity-50' : '',
      ].join(' ')}
    >
      <span className="text-sm flex-shrink-0 w-5 text-center">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[var(--color-text-secondary)] w-4 flex-shrink-0">{index + 1}</span>
          <span className="text-sm text-[var(--color-text-primary)] truncate">{label}</span>
        </div>
        <span className="text-xs text-[var(--color-text-secondary)] ml-5">{step.type}</span>
      </div>
      {!(step as unknown as { enabled?: boolean }).enabled && <Badge variant="neutral">off</Badge>}
      <button
        onClick={e => { e.stopPropagation(); onDelete() }}
        className="opacity-0 group-hover:opacity-100 text-[var(--color-text-secondary)] hover:text-[var(--color-error)] transition-all p-0.5 rounded text-sm"
      >
        ×
      </button>
    </div>
  )
}
