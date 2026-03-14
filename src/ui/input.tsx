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
            className="text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={id}
          className={[
            'h-8 px-3 rounded-md text-base text-text-primary',
            'bg-surface border',
            'placeholder:text-text-tertiary',
            'transition-colors duration-fast ease-out',
            'focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-0 focus:border-border-strong',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-error focus:ring-error'
              : 'border-border focus:border-border-strong',
            className,
          ].join(' ')}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          {...props}
        />
        {error ? (
          <p id={`${id}-error`} className="text-sm text-error">
            {error}
          </p>
        ) : hint ? (
          <p id={`${id}-hint`} className="text-sm text-text-tertiary">
            {hint}
          </p>
        ) : null}
      </div>
    )
  }
)

Input.displayName = 'Input'
