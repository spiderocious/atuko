import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { isEnabled } from '@shared/constants/feature-flags'

const queryClient = new QueryClient()

export function SidePanelApp() {
  if (!isEnabled('SIDE_PANEL')) {
    return null
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
        <p className="p-6 text-sm text-[var(--color-text-secondary)]">
          Atuko — Side panel placeholder
        </p>
      </div>
    </QueryClientProvider>
  )
}
