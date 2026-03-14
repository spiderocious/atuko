interface Props {
  isBranch?: boolean
}

export function StepConnector({ isBranch }: Props) {
  return (
    <div className="flex items-center justify-center py-0.5">
      <div className={[
        'w-px h-4',
        isBranch ? 'bg-[var(--color-brand)] opacity-50' : 'bg-[var(--color-border)]',
      ].join(' ')} />
    </div>
  )
}
