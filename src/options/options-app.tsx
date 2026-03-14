import { isEnabled } from '@shared/constants/feature-flags'

export function OptionsApp() {
  if (!isEnabled('OPTIONS')) {
    return null
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      <p className="p-6 text-sm text-[var(--color-text-secondary)]">
        Atuko — Settings placeholder
      </p>
    </div>
  )
}
