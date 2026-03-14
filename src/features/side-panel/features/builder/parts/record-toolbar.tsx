import { useState } from 'react'
import { Button } from '@ui'
import { MSG } from '@shared/constants/messages'

interface Props {
  workflowId: string
}

export function RecordToolbar({ workflowId }: Props) {
  const [isRecording, setIsRecording] = useState(false)

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
      isRecording ? 'bg-[var(--color-error)]/10' : 'bg-[var(--color-surface)]',
    ].join(' ')}>
      <Button
        variant={isRecording ? 'primary' : 'secondary'}
        size="sm"
        onClick={toggle}
        className={isRecording ? 'bg-[var(--color-error)] border-[var(--color-error)]' : ''}
      >
        {isRecording ? '⏹ Stop Recording' : '⏺ Record'}
      </Button>
      {isRecording && (
        <span className="text-xs text-[var(--color-error)] animate-pulse">Recording…</span>
      )}
    </div>
  )
}
