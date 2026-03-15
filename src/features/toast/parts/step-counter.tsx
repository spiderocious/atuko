interface Props { current: number; total: number }

export function StepCounter({ current, total }: Props) {
  return (
    <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>
      {current} / {total}
    </span>
  )
}
