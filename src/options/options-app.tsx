import { isEnabled } from '@shared/constants/feature-flags'
import { OptionsScreen } from '@features/options/screen/options-screen'

export function OptionsApp() {
  if (!isEnabled('OPTIONS')) {
    return null
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      <OptionsScreen />
    </div>
  )
}
