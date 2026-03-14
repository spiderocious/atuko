import { useState } from 'react'
import { Button } from '@ui'
import { MSG } from '@shared/constants/messages'

interface Props { runId: string }

export function QuickOverride({ runId }: Props) {
  const [seconds, setSeconds] = useState(10)

  const inject = () => {
    chrome.runtime.sendMessage({ type: MSG.QUICK_WAIT_OVERRIDE, runId, seconds })
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-surface-raised)] rounded-lg border border-[var(--color-border)]">
      <span className="text-xs text-[var(--color-text-secondary)] flex-1">Inject wait</span>
      <select
        value={seconds}
        onChange={e => setSeconds(Number(e.target.value))}
        className="text-xs border border-[var(--color-border)] rounded px-1.5 py-0.5 bg-[var(--color-surface)] text-[var(--color-text-primary)]"
      >
        {[5, 10, 30, 60].map(s => (
          <option key={s} value={s}>{s}s</option>
        ))}
      </select>
      <Button variant="secondary" size="sm" onClick={inject}>Inject</Button>
    </div>
  )
}
