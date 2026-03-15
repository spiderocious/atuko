import { ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-brand)] text-[var(--color-text-inverse)] hover:bg-[var(--color-brand-dark)] active:bg-[var(--color-brand-dark)] border border-transparent',
  secondary:
    'bg-transparent text-[var(--color-text-primary)] border border-[var(--color-border-strong)] hover:bg-[var(--color-surface-raised)] active:bg-[var(--color-surface-overlay)]',
  ghost:
    'bg-transparent text-[var(--color-text-secondary)] border border-transparent hover:bg-[var(--color-surface-raised)] active:bg-[var(--color-surface-overlay)]',
  danger:
    'bg-[var(--color-error-bg)] text-[var(--color-error)] border border-transparent hover:opacity-80 active:opacity-70',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-7 px-[10px] text-[13px]',
  md: 'h-8 px-3 text-[14px]',
  lg: 'h-9 px-4 text-[15px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          'inline-flex items-center justify-center gap-1.5 rounded-md font-medium',
          'transition-colors duration-[150ms]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-1',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'select-none cursor-pointer',
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(' ')}
        {...props}
      >
        {loading ? (
          <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
