import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { isEnabled } from '@shared/constants/feature-flags'

const queryClient = new QueryClient()

export function PopupApp() {
  if (!isEnabled('POPUP')) {
    return null
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div
        style={{ width: 360, minHeight: 200 }}
        className="bg-[var(--color-bg)] text-[var(--color-text-primary)]"
      >
        <p className="p-4 text-sm text-[var(--color-text-secondary)]">
          Atuko — Popup placeholder
        </p>
      </div>
    </QueryClientProvider>
  )
}
