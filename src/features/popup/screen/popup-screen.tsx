import { ActiveRunState } from '@shared/types'
import { MSG } from '@shared/constants/messages'
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
  const openSidePanel = () =>
    chrome.runtime.sendMessage({ type: MSG.OPEN_SIDE_PANEL })

  return (
    <div
      className="flex flex-col bg-[var(--color-bg)] text-[var(--color-text-primary)]"
      style={{ width: 360, maxHeight: 600, overflowY: 'auto' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--color-brand)' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L12 4V10L7 13L2 10V4L7 1Z" fill="white" fillOpacity="0.9" />
              <circle cx="7" cy="7" r="2" fill="white" />
            </svg>
          </div>
          <span
            className="text-[15px] font-semibold tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Atuko
          </span>
        </div>
        <button
          onClick={openOptions}
          className="w-7 h-7 rounded-md flex items-center justify-center transition-colors"
          style={{ color: 'var(--color-text-tertiary)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-raised)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          title="Settings"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" clipRule="evenodd" d="M8 5.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM4.5 8a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0z"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M8 1a.5.5 0 01.5.5v1.17A5.515 5.515 0 0110.9 3.6l.828-.828a.5.5 0 01.707.707l-.828.829A5.515 5.515 0 0112.33 6.5H13.5a.5.5 0 010 1h-1.17A5.515 5.515 0 0111.4 9.9l.828.828a.5.5 0 01-.707.707l-.829-.828A5.515 5.515 0 019.5 11.33V12.5a.5.5 0 01-1 0v-1.17A5.515 5.515 0 016.1 10.4l-.828.829a.5.5 0 01-.707-.707l.828-.829A5.515 5.515 0 013.67 7.5H2.5a.5.5 0 010-1h1.17A5.515 5.515 0 014.6 4.1l-.829-.828a.5.5 0 01.707-.707l.829.828A5.515 5.515 0 017.5 2.67V1.5A.5.5 0 018 1z"/>
          </svg>
        </button>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--color-border)', margin: '0 16px' }} />

      {/* Body */}
      <div className="flex flex-col gap-2 p-4">
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

      {/* Footer CTA */}
      <div className="px-4 pb-4">
        <button
          onClick={openSidePanel}
          className="w-full h-9 rounded-lg text-[13px] font-medium transition-colors flex items-center justify-center gap-2"
          style={{
            background: 'var(--color-brand)',
            color: '#fff',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-brand-dark)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-brand)')}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <rect x="2" y="2" width="5" height="12" rx="1" opacity="0.5"/>
            <rect x="9" y="2" width="5" height="12" rx="1"/>
          </svg>
          Open workflows panel
        </button>
      </div>
    </div>
  )
}
