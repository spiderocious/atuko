import { ActiveRunState } from '@shared/types'
import { Button } from '@ui'
import { MSG } from '@shared/constants/messages'

interface Props {
  run: ActiveRunState
}

export function StepByStepControls({ run }: Props) {
  const advance = () => {
    chrome.runtime.sendMessage({ type: MSG.STEP_ADVANCE, runId: run.runId })
  }

  const stop = () => {
    chrome.runtime.sendMessage({ type: MSG.STOP_RUN, runId: run.runId })
  }

  return (
    <div className="flex flex-col gap-2 p-3 bg-[var(--color-surface-raised)] rounded-lg border border-[var(--color-brand)]/30">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-[var(--color-brand)] uppercase tracking-wide">
          Step-by-step
        </span>
        <span className="text-xs text-[var(--color-text-secondary)]">
          {run.currentStepIndex + 1} / {run.stepTotal}
        </span>
      </div>
      <p className="text-sm text-[var(--color-text-primary)] font-medium truncate">
        {run.currentStepLabel}
      </p>
      <div className="flex gap-2">
        <Button variant="primary" size="sm" onClick={advance} className="flex-1">
          Next step →
        </Button>
        <Button variant="ghost" size="sm" onClick={stop} className="text-[var(--color-error)]">
          Stop
        </Button>
      </div>
    </div>
  )
}
