interface Props { label: string }

export function StepLabel({ label }: Props) {
  return (
    <span style={{
      fontSize: 13,
      fontWeight: 500,
      color: 'var(--color-text-primary)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      flex: 1,
    }}>
      {label}
    </span>
  )
}
