import { useState, useEffect, useCallback } from 'react'
import { PendingPrompt } from '@shared/types'
import { MSG } from '@shared/constants/messages'

export function useRuntimePrompts(runId: string | null) {
  const [prompt, setPrompt] = useState<PendingPrompt | null>(null)

  useEffect(() => {
    const listener = (msg: unknown) => {
      const m = msg as { type: string; runId?: string; prompt?: PendingPrompt }
      if (m.type === MSG.PROMPT_REQUEST && m.runId === runId) {
        setPrompt(m.prompt ?? null)
      }
      if (m.type === MSG.RUN_STATUS_UPDATE) {
        const payload = (m as { payload?: { runId?: string; promptPending?: PendingPrompt | null } }).payload
        if (payload?.runId === runId) {
          setPrompt(payload.promptPending ?? null)
        }
      }
    }
    chrome.runtime.onMessage.addListener(listener)
    return () => chrome.runtime.onMessage.removeListener(listener)
  }, [runId])

  const respond = useCallback((value: string) => {
    if (!runId || !prompt) return
    chrome.runtime.sendMessage({ type: MSG.PROMPT_RESPONSE, runId, stepId: prompt.stepId, value })
    setPrompt(null)
  }, [runId, prompt])

  return { prompt, respond }
}
