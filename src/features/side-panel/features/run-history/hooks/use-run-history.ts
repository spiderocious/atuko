import { useQuery } from '@tanstack/react-query'
import { getRunHistory } from '@shared/services/storage.service'

export function useRunHistory(workflowId: string | null) {
  return useQuery({
    queryKey: ['run-history', workflowId],
    queryFn: () => getRunHistory(workflowId!),
    enabled: !!workflowId,
  })
}
