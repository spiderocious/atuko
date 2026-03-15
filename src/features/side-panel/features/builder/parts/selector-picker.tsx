/**
 * SelectorPicker — inline input + crosshair button.
 * When the button is clicked, puts the content script into pick mode.
 * When the user clicks an element on the page, the selector is sent back
 * via PICK_RESULT and fills this input.
 */

import { useEffect, useState } from 'react'
import { MSG } from '@shared/constants/messages'

interface Props {
  value: string
  onChange: (selector: string) => void
  placeholder?: string
  className?: string
}

export function SelectorPicker({ value, onChange, placeholder = 'CSS or XPath selector', className = '' }: Props) {
  const [picking, setPicking] = useState(false)

  useEffect(() => {
    if (!picking) return

    const handler = (message: Record<string, unknown>) => {
      if (message['type'] !== MSG.PICK_RESULT) return
      const selector = message['selector'] as string | null
      if (selector) onChange(selector)
      setPicking(false)
    }

    chrome.runtime.onMessage.addListener(handler)
    return () => chrome.runtime.onMessage.removeListener(handler)
  }, [picking, onChange])

  const startPick = () => {
    setPicking(true)
    chrome.runtime.sendMessage({ type: MSG.START_PICK })
  }

  const cancelPick = () => {
    setPicking(false)
    chrome.runtime.sendMessage({ type: MSG.STOP_PICK })
  }

  const inputCls = [
    'flex-1 text-[13px] border border-[var(--color-border)] rounded-l px-2 py-1.5',
    'bg-[var(--color-surface)] text-[var(--color-text-primary)]',
    'focus:outline-none focus:border-[var(--color-brand)] transition-colors',
    'placeholder:text-[var(--color-text-tertiary)]',
    className,
  ].join(' ')

  return (
    <div className="flex items-stretch">
      <input
        className={inputCls}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={picking ? cancelPick : startPick}
        title={picking ? 'Cancel — press Esc on the page' : 'Pick element from page'}
        className={[
          'flex items-center justify-center w-8 rounded-r border border-l-0 transition-colors flex-shrink-0',
          picking
            ? 'bg-[var(--color-brand)] border-[var(--color-brand)] text-white'
            : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-brand)]',
        ].join(' ')}
      >
        {picking ? (
          // X icon
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/>
          </svg>
        ) : (
          // Crosshair icon
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="7" cy="7" r="3"/>
            <line x1="7" y1="1" x2="7" y2="4"/>
            <line x1="7" y1="10" x2="7" y2="13"/>
            <line x1="1" y1="7" x2="4" y2="7"/>
            <line x1="10" y1="7" x2="13" y2="7"/>
          </svg>
        )}
      </button>
    </div>
  )
}
