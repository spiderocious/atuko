import { RunRecord, StepLog } from '@shared/types'
import { MSG } from '@shared/constants/messages'

interface Props { record: RunRecord }

export function RunDetail({ record }: Props) {
  const handleReplay = () => {
    chrome.runtime.sendMessage({
      type: MSG.TRIGGER_WORKFLOW,
      workflowId: record.workflowId,
      isDryRun: false,
      variables: record.output,
    })
  }

  return (
    <div className="px-3 py-3 flex flex-col gap-4 bg-[var(--color-surface-raised)] border-b border-[var(--color-border)]">
      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={handleReplay} className="text-xs text-[var(--color-brand)] hover:underline">
          ↺ Replay run
        </button>
      </div>

      {/* Error */}
      {record.failedStep && (
        <div className="rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 px-3 py-2">
          <p className="text-xs font-semibold text-[var(--color-error)] mb-1">
            Failed at: {record.failedStep.label}
          </p>
          <p className="text-xs text-[var(--color-error)] font-mono break-all">{record.failedStep.error}</p>
        </div>
      )}

      {/* Step logs */}
      <div>
        <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">Steps</p>
        <div className="flex flex-col gap-1">
          {record.stepLogs.map((log: StepLog) => (
            <div key={log.stepId} className="flex items-center gap-2">
              <span className={[
                'w-1.5 h-1.5 rounded-full flex-shrink-0',
                log.status === 'success' ? 'bg-[var(--color-success)]' :
                log.status === 'failed' ? 'bg-[var(--color-error)]' :
                'bg-[var(--color-text-secondary)]',
              ].join(' ')} />
              <span className="text-xs text-[var(--color-text-primary)] flex-1 truncate">
                {log.label || log.type}
              </span>
              <span className="text-xs text-[var(--color-text-secondary)] flex-shrink-0">{log.durationMs}ms</span>
            </div>
          ))}
        </div>
      </div>

      {/* Variable outputs */}
      {Object.keys(record.output).length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">Outputs</p>
          <div className="flex flex-col gap-0.5">
            {Object.entries(record.output).map(([k, v]) => (
              <div key={k} className="flex gap-2 text-xs font-mono py-0.5">
                <span className="text-[var(--color-brand)] flex-shrink-0">{k}</span>
                <span className="text-[var(--color-text-secondary)]">=</span>
                <span className="text-[var(--color-text-primary)] truncate">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Screenshots */}
      {record.screenshots.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">Screenshots</p>
          <div className="flex gap-2 flex-wrap">
            {record.screenshots.map(s => (
              <a key={s.stepId} href={s.dataUri} target="_blank" rel="noreferrer">
                <img
                  src={s.dataUri}
                  alt={s.filename}
                  className="w-20 h-14 object-cover rounded border border-[var(--color-border)]"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Console logs */}
      {record.consoleLogs.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">Console</p>
          <div className="flex flex-col gap-0.5 font-mono text-xs max-h-24 overflow-y-auto">
            {record.consoleLogs.map((log, i) => (
              <span key={i} className={
                log.level === 'error' ? 'text-[var(--color-error)]' :
                log.level === 'warn' ? 'text-[var(--color-warning)]' :
                'text-[var(--color-text-secondary)]'
              }>
                [{log.level}] {log.message}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
