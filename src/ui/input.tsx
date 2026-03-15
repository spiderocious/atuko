import { InputHTMLAttributes, forwardRef, useId } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id: externalId, ...props }, ref) => {
    const generatedId = useId()
    const id = externalId ?? generatedId

    return (
      <div className="flex flex-col gap-1.5">
        {label ? (
          <label
            htmlFor={id}
            className="text-[13px] font-medium text-[var(--color-text-secondary)]"
          >
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={id}
          className={[
            'h-8 px-3 rounded-md text-[14px] text-[var(--color-text-primary)]',
            'bg-[var(--color-surface)] border',
            'placeholder:text-[var(--color-text-tertiary)]',
            'transition-colors duration-[100ms]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] focus:ring-offset-0',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]'
              : 'border-[var(--color-border)] focus:border-[var(--color-border-strong)]',
            className,
          ].join(' ')}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          {...props}
        />
        {error ? (
          <p id={`${id}-error`} className="text-[13px] text-[var(--color-error)]">
            {error}
          </p>
        ) : hint ? (
          <p id={`${id}-hint`} className="text-[13px] text-[var(--color-text-tertiary)]">
            {hint}
          </p>
        ) : null}
      </div>
    )
  }
)

Input.displayName = 'Input'
