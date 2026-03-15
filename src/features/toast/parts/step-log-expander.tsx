import { StepLog } from '@shared/types'

interface Props { logs: StepLog[] }

export function StepLogExpander({ logs }: Props) {
  const recent = logs.slice(-5).reverse()

  return (
    <div style={{
      borderTop: '1px solid var(--color-border)',
      marginTop: 8,
      paddingTop: 8,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      maxHeight: 120,
      overflowY: 'auto',
    }}>
      {recent.map((log, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: log.status === 'success' ? 'var(--color-success)' : 'var(--color-error)',
            flexShrink: 0,
          }} />
          <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {log.label ?? `Step ${log.stepIndex + 1}`}
          </span>
        </div>
      ))}
    </div>
  )
}
