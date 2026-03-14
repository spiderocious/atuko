import { LucideIcon } from '@shared/ui/icons'
import { Button } from './button'

interface EmptyStateProps {
  icon: LucideIcon
  headline: string
  body?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, headline, body, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 px-6 text-center">
      <Icon
        size={36}
        strokeWidth={1.5}
        className="text-text-tertiary"
      />
      <div className="flex flex-col gap-1 max-w-[240px]">
        <p className="text-lg font-semibold text-text-primary">{headline}</p>
        {body ? (
          <p className="text-base text-text-secondary">{body}</p>
        ) : null}
      </div>
      {action ? (
        <Button variant="primary" size="md" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </div>
  )
}
