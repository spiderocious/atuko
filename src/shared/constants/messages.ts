/**
 * All chrome.runtime message type constants.
 * Use these everywhere — never use raw strings for message types.
 */
export const MSG = {
  // Workflow execution
  TRIGGER_WORKFLOW: 'TRIGGER_WORKFLOW',
  STEP_RESULT: 'STEP_RESULT',
  PAUSE_RUN: 'PAUSE_RUN',
  RESUME_RUN: 'RESUME_RUN',
  STOP_RUN: 'STOP_RUN',
  GET_RUN_STATUS: 'GET_RUN_STATUS',
  PROMPT_RESPONSE: 'PROMPT_RESPONSE',
  PROMPT_REQUEST: 'PROMPT_REQUEST',
  QUICK_WAIT_OVERRIDE: 'QUICK_WAIT_OVERRIDE',
  STEP_ADVANCE: 'STEP_ADVANCE', // step-by-step mode

  // Step execution (SW → CS)
  EXECUTE_STEP: 'EXECUTE_STEP',

  // Status broadcast (SW → popup/toast)
  RUN_STATUS_UPDATE: 'RUN_STATUS_UPDATE',

  // Storage CRUD (side panel → SW)
  SAVE_WORKFLOW: 'SAVE_WORKFLOW',
  GET_WORKFLOWS: 'GET_WORKFLOWS',
  GET_WORKFLOW: 'GET_WORKFLOW',
  DELETE_WORKFLOW: 'DELETE_WORKFLOW',
  GET_RUN_HISTORY: 'GET_RUN_HISTORY',
  SAVE_SITE_CONFIG: 'SAVE_SITE_CONFIG',
  GET_SITE_CONFIG: 'GET_SITE_CONFIG',

  // Record mode (builder → CS)
  START_RECORD: 'START_RECORD',
  STOP_RECORD: 'STOP_RECORD',
  RECORDED_ACTION: 'RECORDED_ACTION',

  // Toast (CS internal)
  TOAST_UPDATE: 'TOAST_UPDATE',
  TOAST_DISMISS: 'TOAST_DISMISS',

  // Side panel
  OPEN_SIDE_PANEL: 'OPEN_SIDE_PANEL',

  // Element picker (side panel → SW → CS → SW → side panel)
  START_PICK: 'START_PICK',
  STOP_PICK: 'STOP_PICK',
  PICK_RESULT: 'PICK_RESULT',
} as const

export type MessageType = typeof MSG[keyof typeof MSG]
