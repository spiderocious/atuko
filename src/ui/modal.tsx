import { ReactNode, useEffect, useRef } from 'react'
import { X } from '@shared/ui/icons'
import { Button } from './button'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  width?: number
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  width = 420,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      if (!dialog.open) dialog.showModal()
    } else {
      if (dialog.open) dialog.close()
    }
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleCancel = (e: Event) => {
      e.preventDefault()
      onClose()
    }
    dialog.addEventListener('cancel', handleCancel)
    return () => dialog.removeEventListener('cancel', handleCancel)
  }, [onClose])

  if (!open) return null

  return (
    <dialog
      ref={dialogRef}
      className={[
        'p-0 rounded-xl shadow-lg border border-border bg-surface',
        'backdrop:bg-black/40 backdrop:backdrop-blur-sm',
        'open:flex open:flex-col',
        'max-h-[90vh] overflow-hidden',
      ].join(' ')}
      style={{ width }}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose()
      }}
    >
      {title ? (
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
            <X size={16} strokeWidth={1.5} />
          </Button>
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

      {footer ? (
        <div className="px-5 py-4 border-t border-border flex justify-end gap-2">
          {footer}
        </div>
      ) : null}
    </dialog>
  )
}
