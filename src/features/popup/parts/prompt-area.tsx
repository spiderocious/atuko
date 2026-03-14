import { useState, useEffect, useRef } from 'react'
import { PendingPrompt } from '@shared/types'
import { Button, Input } from '@ui'

interface Props {
  prompt: PendingPrompt
  onRespond: (value: string) => void
}

export function PromptArea({ prompt, onRespond }: Props) {
  const [value, setValue] = useState(prompt.options?.[0] ?? '')
  const [countdown, setCountdown] = useState(
    prompt.promptType === 'select' ? prompt.countdown : null
  )
  const [skipTimer, setSkipTimer] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (countdown === null || skipTimer) return
    if (countdown <= 0) {
      onRespond(value)
      return
    }
    timerRef.current = setInterval(() => {
      setCountdown(c => (c !== null ? c - 1 : c))
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [countdown, skipTimer])

  const submit = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    onRespond(value)
  }

  const handleMoreTime = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setSkipTimer(false)
    setCountdown(10)
  }

  const handleSkipTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setSkipTimer(true)
  }

  return (
    <div className="flex flex-col gap-3 p-3 bg-[var(--color-surface-raised)] rounded-lg border border-[var(--color-border-strong)]">
      <div>
        <p className="text-xs font-semibold text-[var(--color-brand)] uppercase tracking-wide mb-1">Prompt</p>
        <p className="text-sm text-[var(--color-text-primary)]">{prompt.message}</p>
      </div>

      {prompt.promptType === 'select' && prompt.options ? (
        <div className="flex flex-col gap-1">
          {prompt.options.map(opt => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="prompt-select"
                value={opt}
                checked={value === opt}
                onChange={() => setValue(opt)}
                className="accent-[var(--color-brand)]"
              />
              <span className="text-sm text-[var(--color-text-primary)]">{opt}</span>
            </label>
          ))}
          {countdown !== null && !skipTimer && (
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Auto-selecting in {countdown}s
            </p>
          )}
          <div className="flex gap-2 mt-2">
            <Button variant="ghost" size="sm" onClick={handleMoreTime}>More time</Button>
            <Button variant="ghost" size="sm" onClick={handleSkipTimer}>Skip timer</Button>
          </div>
        </div>
      ) : (
        <Input
          label=""
          type={prompt.promptType === 'password' ? 'password' : 'text'}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit() }}
          placeholder="Enter value…"
        />
      )}

      <Button variant="primary" size="sm" onClick={submit}>Submit</Button>
    </div>
  )
}
