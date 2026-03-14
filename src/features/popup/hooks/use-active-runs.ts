import { useState, useEffect } from 'react'
import { ActiveRunState } from '@shared/types'
import { MSG } from '@shared/constants/messages'

export function useActiveRuns(): ActiveRunState[] {
  const [runs, setRuns] = useState<Map<string, ActiveRunState>>(new Map())

  useEffect(() => {
    const listener = (msg: unknown) => {
      const m = msg as { type: string; payload?: ActiveRunState }
      if (m.type !== MSG.RUN_STATUS_UPDATE || !m.payload) return
      const p = m.payload
      setRuns(prev => {
        const next = new Map(prev)
        if (p.status === 'success' || p.status === 'failed' || p.status === 'cancelled') {
          next.delete(p.runId)
        } else {
          next.set(p.runId, p)
        }
        return next
      })
    }
    chrome.runtime.onMessage.addListener(listener)
    return () => chrome.runtime.onMessage.removeListener(listener)
  }, [])

  return Array.from(runs.values())
}
