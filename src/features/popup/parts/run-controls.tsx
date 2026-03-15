import { Pause, Play, Square } from '@shared/ui/icons'
import { Button } from '@ui'
import { ActiveRunState } from '@shared/types'
import { MSG } from '@shared/constants/messages'

interface Props { run: ActiveRunState }

export function RunControls({ run }: Props) {
  const isPaused = run.status === 'paused'

  const pause = () => chrome.runtime.sendMessage({ type: MSG.PAUSE_RUN, runId: run.runId })
  const resume = () => chrome.runtime.sendMessage({ type: MSG.RESUME_RUN, runId: run.runId })
  const stop = () => chrome.runtime.sendMessage({ type: MSG.STOP_RUN, runId: run.runId })

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" onClick={isPaused ? resume : pause} aria-label={isPaused ? 'Resume' : 'Pause'}>
        {isPaused ? <Play size={12} /> : <Pause size={12} />}
      </Button>
      <Button variant="ghost" size="sm" onClick={stop} className="text-[var(--color-error)]" aria-label="Stop">
        <Square size={12} />
      </Button>
    </div>
  )
}
