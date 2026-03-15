import { useState, useCallback } from 'react'
import { Workflow } from '@shared/types'

interface JsonSyncResult {
  jsonText: string
  parseError: string | null
  setJsonText: (text: string) => void
  applyJson: () => Workflow | null
}

export function useJsonSync(workflow: Workflow): JsonSyncResult {
  const [jsonText, setJsonTextState] = useState(() => JSON.stringify(workflow, null, 2))
  const [parseError, setParseError] = useState<string | null>(null)

  const setJsonText = useCallback((text: string) => {
    setJsonTextState(text)
    try {
      JSON.parse(text)
      setParseError(null)
    } catch (e) {
      setParseError(String(e))
    }
  }, [])

  const applyJson = useCallback((): Workflow | null => {
    try {
      const parsed = JSON.parse(jsonText) as Workflow
      setParseError(null)
      return parsed
    } catch (e) {
      setParseError(String(e))
      return null
    }
  }, [jsonText])

  return { jsonText, parseError, setJsonText, applyJson }
}
