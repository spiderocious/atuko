import { RunStatus } from '@shared/types'

const COLOR_MAP: Record<RunStatus | 'dry-run', string> = {
  running: '#7C5CFC',
  paused: '#f59e0b',
  success: '#22c55e',
  failed: '#ef4444',
  cancelled: '#9ca3af',
  'dry-run': '#60a5fa',
}

interface Props { status: RunStatus | 'dry-run' }

export function StatusDot({ status }: Props) {
  const color = COLOR_MAP[status] ?? '#9ca3af'
  const pulse = status === 'running'
  return (
    <span style={{
      display: 'inline-block',
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: color,
      flexShrink: 0,
      animation: pulse ? 'atuko-pulse 1.5s ease-in-out infinite' : 'none',
    }} />
  )
}
