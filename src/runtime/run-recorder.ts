import { RunRecord, StepLog, RunStatus } from '@shared/types'
import { appendRunRecord } from '@shared/services/storage.service'
import { MSG } from '@shared/constants/messages'

/**
 * Finalises a run record, writes it to storage, fires a notification,
 * and broadcasts the final status to all extension views.
 */
export async function finaliseRun(
  record: RunRecord,
  status: RunStatus
): Promise<void> {
  const finalRecord: RunRecord = {
    ...record,
    status,
    endTime: new Date().toISOString(),
  }

  await appendRunRecord(finalRecord)
  await broadcastStatus(finalRecord)
  await fireNotification(finalRecord)
}

export function buildStepLog(
  opts: Omit<StepLog, 'completedAt' | 'durationMs'> & { startedAt: string }
): StepLog {
  const completedAt = new Date().toISOString()
  const durationMs =
    new Date(completedAt).getTime() - new Date(opts.startedAt).getTime()
  return { ...opts, completedAt, durationMs }
}

async function broadcastStatus(record: RunRecord): Promise<void> {
  try {
    await chrome.runtime.sendMessage({
      type: MSG.RUN_STATUS_UPDATE,
      record,
    })
  } catch {
    // No listeners open — that's fine
  }
}

async function fireNotification(record: RunRecord): Promise<void> {
  const hasPermission = await chrome.permissions.contains({
    permissions: ['notifications'],
  })
  if (!hasPermission) return

  const succeeded = record.status === 'success'
  const title = succeeded
    ? `Workflow finished — ${record.workflowName}`
    : `Workflow failed — ${record.workflowName}`

  const message = succeeded
    ? `Completed ${record.stepsCompleted} steps`
    : record.failedStep
    ? `Failed at step: ${record.failedStep.label}`
    : 'An error occurred'

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon-48.png',
    title,
    message,
  })
}
