interface Props { current: number; total: number }

export function StepCounter({ current, total }: Props) {
  return (
    <span style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' }}>
      {current} / {total}
    </span>
  )
}
