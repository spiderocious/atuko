/**
 * SelectorInspector — hover overlay component that shows generated selector,
 * stability score, and fallback selectors for any hovered page element.
 *
 * Injected into the page via the builder's "Inspect" mode toggle.
 * This component renders in the EXTENSION side panel, not the page.
 */

interface InspectedElement {
  primary: string
  fallbacks: string[]
  stabilityScore: number
  tagName: string
  text: string
}

interface Props {
  data: InspectedElement | null
  onClose: () => void
  onUseSelector: (selector: string) => void
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  const color = score >= 0.8 ? 'var(--color-success)' :
                score >= 0.5 ? 'var(--color-warning)' :
                'var(--color-error)'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-[var(--color-border)]">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-mono" style={{ color }}>{pct}%</span>
    </div>
  )
}

export function SelectorInspector({ data, onClose, onUseSelector }: Props) {
  if (!data) return null

  return (
    <div className="flex flex-col gap-3 p-3 bg-[var(--color-surface-raised)] rounded-lg border border-[var(--color-border)] shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
          Selector Inspector
        </span>
        <button
          onClick={onClose}
          className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          ×
        </button>
      </div>

      <div>
        <p className="text-xs text-[var(--color-text-secondary)] mb-1">Element</p>
        <p className="text-xs font-mono text-[var(--color-text-primary)]">
          {`<${data.tagName.toLowerCase()}>`} {data.text && `"${data.text.slice(0, 40)}"`}
        </p>
      </div>

      <div>
        <p className="text-xs text-[var(--color-text-secondary)] mb-1">Primary selector</p>
        <div className="flex items-center gap-2">
          <code className="text-xs font-mono text-[var(--color-brand)] flex-1 break-all">
            {data.primary}
          </code>
          <button
            onClick={() => onUseSelector(data.primary)}
            className="text-xs text-[var(--color-brand)] hover:underline flex-shrink-0"
          >
            Use
          </button>
        </div>
        <ScoreBar score={data.stabilityScore} />
      </div>

      {data.fallbacks.length > 0 && (
        <div>
          <p className="text-xs text-[var(--color-text-secondary)] mb-1">Fallbacks</p>
          <div className="flex flex-col gap-1.5">
            {data.fallbacks.map((fb, i) => (
              <div key={i} className="flex items-center gap-2">
                <code className="text-xs font-mono text-[var(--color-text-primary)] flex-1 break-all">{fb}</code>
                <button
                  onClick={() => onUseSelector(fb)}
                  className="text-xs text-[var(--color-brand)] hover:underline flex-shrink-0"
                >
                  Use
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
