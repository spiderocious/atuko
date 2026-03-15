import { HTMLAttributes } from 'react'

type CardPadding = 'sm' | 'md' | 'lg'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding
}

const paddingClasses: Record<CardPadding, string> = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

export function Card({
  padding = 'md',
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={[
        'bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg',
        paddingClasses[padding],
        className,
      ].join(' ')}
      style={{ boxShadow: 'var(--shadow-sm)' }}
      {...props}
    >
      {children}
    </div>
  )
}
