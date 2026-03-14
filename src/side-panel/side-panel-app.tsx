import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { isEnabled } from '@shared/constants/feature-flags'
import { SidePanelScreen } from '@features/side-panel/screen/side-panel-screen'

const queryClient = new QueryClient()

export function SidePanelApp() {
  if (!isEnabled('SIDE_PANEL')) {
    return null
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SidePanelScreen />
    </QueryClientProvider>
  )
}
