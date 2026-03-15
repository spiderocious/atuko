import {
  ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'

interface DropdownItem {
  label: string
  onClick: () => void
  disabled?: boolean
  destructive?: boolean
  icon?: ReactNode
}

interface DropdownProps {
  trigger: ReactNode
  items: DropdownItem[]
  align?: 'left' | 'right'
}

export function Dropdown({ trigger, items, align = 'left' }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative inline-block">
      <div
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setOpen((v) => !v)
        }}
      >
        {trigger}
      </div>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className={[
            'absolute z-50 mt-1 min-w-[160px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]',
            'py-1 flex flex-col',
            align === 'right' ? 'right-0' : 'left-0',
          ].join(' ')}
          style={{ boxShadow: 'var(--shadow-md)' }}
        >
          {items.map((item, i) => (
            <button
              key={i}
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                item.onClick()
                setOpen(false)
              }}
              className={[
                'flex items-center gap-2 px-3 py-2 text-[13px] text-left w-full',
                'transition-colors duration-[100ms]',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                item.destructive
                  ? 'text-[var(--color-error)] hover:bg-[var(--color-error-bg)]'
                  : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-raised)]',
              ].join(' ')}
            >
              {item.icon ? (
                <span className="text-[var(--color-text-tertiary)]">{item.icon}</span>
              ) : null}
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
