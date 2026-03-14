import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Workflow } from '@shared/types'
import {
  getAllWorkflows,
  saveWorkflow,
  deleteWorkflow,
} from '@shared/services/storage.service'

export const WORKFLOWS_KEY = ['workflows'] as const

export function useWorkflows() {
  return useQuery({
    queryKey: WORKFLOWS_KEY,
    queryFn: getAllWorkflows,
  })
}

export function useSaveWorkflow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (workflow: Workflow) => saveWorkflow(workflow),
    onSuccess: () => qc.invalidateQueries({ queryKey: WORKFLOWS_KEY }),
  })
}

export function useDeleteWorkflow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteWorkflow(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: WORKFLOWS_KEY }),
  })
}

export function useDuplicateWorkflow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (workflow: Workflow) => {
      const copy: Workflow = {
        ...workflow,
        id: crypto.randomUUID(),
        name: `${workflow.name} (copy)`,
        enabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      await saveWorkflow(copy)
      return copy
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: WORKFLOWS_KEY }),
  })
}
