type RunStatus = 'idle' | 'running' | 'waiting' | 'success' | 'failed' | 'dry-run'

interface StatusDotProps {
  status: RunStatus
  className?: string
}

const statusClasses: Record<RunStatus, string> = {
  idle:      'bg-status-idle',
  running:   'bg-status-running animate-pulse',
  waiting:   'bg-status-waiting animate-pulse',
  success:   'bg-status-success',
  failed:    'bg-status-failed',
  'dry-run': 'bg-status-dry-run',
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
        'inline-block w-2 h-2 rounded-full transition-colors duration-base',
        statusClasses[status],
        className,
      ].join(' ')}
    />
  )
}
