import { ActiveRunState } from '@shared/types'
import { Button } from '@ui'
import { useActiveRuns } from '../hooks/use-active-runs'
import { useRuntimePrompts } from '../hooks/use-runtime-prompts'
import { ActiveRunsPanel } from '../parts/active-runs-panel'
import { QuickOverride } from '../parts/quick-override'
import { PromptArea } from '../parts/prompt-area'
import { RecentRuns } from '../parts/recent-runs'
import { StepByStepControls } from '../parts/step-by-step-controls'

export function PopupScreen() {
  const activeRuns = useActiveRuns()
  const promptRun = activeRuns.find(r => r.promptPending) ?? null
  const { prompt, respond } = useRuntimePrompts(promptRun?.runId ?? null)
  const firstActive = activeRuns[0] as ActiveRunState | undefined
  const pausedRun = activeRuns.find(r => r.status === 'paused') as ActiveRunState | undefined

  const openOptions = () => chrome.runtime.openOptionsPage()
  const openSidePanel = () => chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' })

  return (
    <div
      className="flex flex-col bg-[var(--color-surface)] text-[var(--color-text-primary)]"
      style={{ width: 360, maxHeight: 600, overflowY: 'auto' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
        <span className="text-base font-semibold text-[var(--color-brand)]">Atuko</span>
        <button
          onClick={openOptions}
          className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors p-1 rounded"
          title="Settings"
        >
          ⚙
        </button>
      </div>

      <div className="flex flex-col gap-3 p-3">
        {/* Active Runs */}
        <ActiveRunsPanel runs={activeRuns} />

        {/* Step-by-step controls for paused run */}
        {pausedRun && <StepByStepControls run={pausedRun} />}

        {/* Quick override for first active running run */}
        {firstActive && firstActive.status === 'running' && (
          <QuickOverride runId={firstActive.runId} />
        )}

        {/* Prompt area */}
        {prompt && promptRun && (
          <PromptArea prompt={prompt} onRespond={respond} />
        )}

        {/* Recent runs */}
        {firstActive && (
          <RecentRuns workflowId={firstActive.workflowId} />
        )}
      </div>

      {/* Footer */}
      <div className="px-3 pb-3">
        <Button variant="secondary" size="sm" onClick={openSidePanel} className="w-full">
          Open side panel
        </Button>
      </div>
    </div>
  )
}
