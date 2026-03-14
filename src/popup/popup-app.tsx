import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { isEnabled } from '@shared/constants/feature-flags'
import { PopupScreen } from '@features/popup/screen/popup-screen'

const queryClient = new QueryClient()

export function PopupApp() {
  if (!isEnabled('POPUP')) {
    return null
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PopupScreen />
    </QueryClientProvider>
  )
}
