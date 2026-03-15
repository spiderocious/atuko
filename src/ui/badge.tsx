import { HTMLAttributes } from 'react'

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'brand'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
  warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  error:   'bg-[var(--color-error-bg)] text-[var(--color-error)]',
  info:    'bg-[var(--color-info-bg)] text-[var(--color-info)]',
  neutral: 'bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)]',
  brand:   'bg-[var(--color-brand-dim)] text-[var(--color-brand)]',
}

export function Badge({
  variant = 'neutral',
  className = '',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center h-5 px-2 rounded-full text-[11px] font-medium',
        variantClasses[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </span>
  )
}
