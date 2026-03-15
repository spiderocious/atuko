import { useEffect, useState } from 'react'
import { StepObject } from '@shared/types'
import { Button } from '@ui'
import { MSG } from '@shared/constants/messages'

interface Props {
  workflowId: string
  onStepRecorded: (step: StepObject) => void
}

export function RecordToolbar({ workflowId, onStepRecorded }: Props) {
  const [isRecording, setIsRecording] = useState(false)

  // Listen for recorded steps from the content script
  useEffect(() => {
    if (!isRecording) return

    const handler = (message: Record<string, unknown>) => {
      if (message['type'] !== MSG.RECORDED_ACTION) return
      if (message['workflowId'] !== workflowId) return
      const step = message['step'] as StepObject
      if (step) onStepRecorded(step)
    }

    chrome.runtime.onMessage.addListener(handler)
    return () => chrome.runtime.onMessage.removeListener(handler)
  }, [isRecording, workflowId, onStepRecorded])

  const toggle = () => {
    if (isRecording) {
      chrome.runtime.sendMessage({ type: MSG.STOP_RECORD, workflowId })
      setIsRecording(false)
    } else {
      chrome.runtime.sendMessage({ type: MSG.START_RECORD, workflowId })
      setIsRecording(true)
    }
  }

  return (
    <div className={[
      'flex items-center gap-2 px-3 py-2 border-b border-[var(--color-border)]',
      isRecording ? 'bg-[var(--color-error-bg)]' : 'bg-[var(--color-surface)]',
    ].join(' ')}>
      <Button
        variant={isRecording ? 'primary' : 'secondary'}
        size="sm"
        onClick={toggle}
        className={isRecording ? 'bg-[var(--color-error)] border-[var(--color-error)] hover:opacity-80' : ''}
      >
        {isRecording ? '⏹ Stop Recording' : '⏺ Record'}
      </Button>
      {isRecording && (
        <span className="text-xs font-medium text-[var(--color-error)] animate-pulse">
          Recording actions on the page…
        </span>
      )}
    </div>
  )
}
