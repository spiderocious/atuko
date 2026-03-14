import { Badge } from '@ui'

export type StatusFilter = 'all' | 'enabled' | 'disabled' | 'failed'

interface Props {
  status: StatusFilter
  onStatusChange: (s: StatusFilter) => void
  tags: string[]
  activeTag: string | null
  onTagChange: (t: string | null) => void
}

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'enabled', label: 'Enabled' },
  { value: 'disabled', label: 'Disabled' },
  { value: 'failed', label: 'Last failed' },
]

export function WorkflowFilters({ status, onStatusChange, tags, activeTag, onTagChange }: Props) {
  return (
    <div className="flex flex-col gap-2 px-3 pb-2">
      <div className="flex gap-1 flex-wrap">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onStatusChange(opt.value)}
            className={[
              'text-xs px-2.5 py-1 rounded-full border transition-colors',
              status === opt.value
                ? 'bg-[var(--color-brand)] text-white border-[var(--color-brand)]'
                : 'bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]',
            ].join(' ')}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {tags.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {tags.map(tag => (
            <button key={tag} onClick={() => onTagChange(activeTag === tag ? null : tag)}>
              <Badge variant={activeTag === tag ? 'brand' : 'neutral'}>{tag}</Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
