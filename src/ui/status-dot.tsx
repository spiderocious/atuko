type RunStatus = 'idle' | 'running' | 'waiting' | 'success' | 'failed' | 'dry-run'

interface StatusDotProps {
  status: RunStatus
  className?: string
}

const statusStyles: Record<RunStatus, string> = {
  idle:      'bg-[var(--color-status-idle)]',
  running:   'bg-[var(--color-status-running)] animate-pulse',
  waiting:   'bg-[var(--color-status-waiting)] animate-pulse',
  success:   'bg-[var(--color-status-success)]',
  failed:    'bg-[var(--color-status-failed)]',
  'dry-run': 'bg-[var(--color-status-dry-run)]',
}

const statusLabels: Record<RunStatus, string> = {
  idle:      'Idle',
  running:   'Running',
  waiting:   'Waiting',
  success:   'Success',
  failed:    'Failed',
  'dry-run': 'Dry run',
}

export function StatusDot({ status, className = '' }: StatusDotProps) {
  return (
    <span
      role="status"
      aria-label={statusLabels[status]}
      className={[
        'inline-block w-2 h-2 rounded-full flex-shrink-0',
        statusStyles[status],
        className,
      ].join(' ')}
    />
  )
}
