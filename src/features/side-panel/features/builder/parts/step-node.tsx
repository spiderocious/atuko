import {
  MousePointerClick,
  PenLine,
  Clock,
  ArrowDownUp,
  Globe,
  Send,
  ListFilter,
  HandMetal,
  Keyboard,
  Braces,
  Camera,
  LayoutDashboard,
  Clipboard,
  Database,
  FileText,
  MessageSquare,
  Variable,
  GitBranch,
  Repeat2,
  OctagonX,
  CornerDownRight,
  type LucideIcon,
} from '@shared/ui/icons'
import { Badge } from '@ui'
import { StepObject } from '@shared/types'

const STEP_ICONS: Record<string, LucideIcon> = {
  click: MousePointerClick,
  fill: PenLine,
  wait: Clock,
  scroll: ArrowDownUp,
  navigate: Globe,
  submit: Send,
  select: ListFilter,
  hover: HandMetal,
  keypress: Keyboard,
  extract: Braces,
  screenshot: Camera,
  tab: LayoutDashboard,
  clipboard: Clipboard,
  storage: Database,
  log: FileText,
  prompt: MessageSquare,
  setVariable: Variable,
  branch: GitBranch,
  loop: Repeat2,
  stop: OctagonX,
  jump: CornerDownRight,
}

interface Props {
  step: StepObject
  index: number
  isSelected: boolean
  onClick: () => void
  onDelete: () => void
}

export function StepNode({ step, index, isSelected, onClick, onDelete }: Props) {
  const Icon = STEP_ICONS[step.type] ?? FileText
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
      <Icon
        size={14}
        strokeWidth={1.5}
        className={isSelected ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-secondary)]'}
        style={{ flexShrink: 0 }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[var(--color-text-tertiary)] w-4 flex-shrink-0">{index + 1}</span>
          <span className="text-sm text-[var(--color-text-primary)] truncate">{label}</span>
        </div>
        <span className="text-xs text-[var(--color-text-secondary)] ml-5">{step.type}</span>
      </div>
      {!(step as unknown as { enabled?: boolean }).enabled && <Badge variant="neutral">off</Badge>}
      <button
        onClick={e => { e.stopPropagation(); onDelete() }}
        className="opacity-0 group-hover:opacity-100 text-[var(--color-text-secondary)] hover:text-[var(--color-error)] transition-all p-0.5 rounded text-sm"
        aria-label="Delete step"
      >
        ×
      </button>
    </div>
  )
}
