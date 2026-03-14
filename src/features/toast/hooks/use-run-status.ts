import { useState, useEffect } from 'react'
import { ActiveRunState } from '@shared/types'
import { MSG } from '@shared/constants/messages'

export function useRunStatus(runId: string): ActiveRunState | null {
  const [state, setState] = useState<ActiveRunState | null>(null)

  useEffect(() => {
    const listener = (msg: { type: string; payload: ActiveRunState }) => {
      if (msg.type === MSG.RUN_STATUS_UPDATE && msg.payload?.runId === runId) {
        setState(msg.payload)
      }
    }
    chrome.runtime.onMessage.addListener(listener)
    return () => chrome.runtime.onMessage.removeListener(listener)
  }, [runId])

  return state
}
