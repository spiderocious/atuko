import React from 'react'
import { RunStatus } from '@shared/types'

interface Props {
  status: RunStatus
  expanded: boolean
  onPause: () => void
  onStop: () => void
  onToggleExpand: () => void
}

export function ControlButtons({ status, expanded, onPause, onStop, onToggleExpand }: Props) {
  const btnStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px 6px',
    borderRadius: 4,
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 1,
    pointerEvents: 'auto',
  }

  const isPaused = status === 'paused'

  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <button style={btnStyle} onClick={onPause} title={isPaused ? 'Resume' : 'Pause'}>
        {isPaused ? '▶' : '⏸'}
      </button>
      <button style={{ ...btnStyle, color: '#ef4444' }} onClick={onStop} title="Stop">
        ■
      </button>
      <button style={btnStyle} onClick={onToggleExpand} title={expanded ? 'Collapse' : 'Expand'}>
        {expanded ? '▲' : '▼'}
      </button>
    </div>
  )
}
