export const IPC_CHANNELS = {
  GET_SOURCES: 'recording:get-sources',
  SAVE_RECORDING_CHUNK: 'recording:save-chunk',
  FINALIZE_RECORDING: 'recording:finalize',
  VALIDATE_RECORDING: 'recording:validate',
  GET_PROJECTS: 'storage:get-projects',
  GET_PROJECT: 'storage:get-project',
  SAVE_PROJECT: 'storage:save-project',
  DELETE_PROJECT: 'storage:delete-project',
  GET_SETTINGS: 'storage:get-settings',
  SAVE_SETTINGS: 'storage:save-settings',
  EXPORT_PROJECT: 'export:start',
  CANCEL_EXPORT: 'export:cancel',
  EXPORT_PROGRESS: 'export:progress',
  GET_SYSTEM_INFO: 'system:get-info',
  SETUP_MEDIA_HANDLER: 'recording:setup-media-handler',
  SETUP_MEDIA_HANDLER_WITH_SOURCE: 'recording:setup-media-handler-with-source'
} as const;

export type IpcChannel = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS];

export type RecorderState =
  | 'IDLE'
  | 'SELECTING_SOURCE'
  | 'STARTING'
  | 'RECORDING'
  | 'PAUSED'
  | 'STOPPING'
  | 'PROCESSING'
  | 'SAVED'
  | 'ERROR';

export interface SaveChunkArgs {
  sessionId: string;
  chunkIndex: number;
  data: ArrayBuffer;
}

export interface FinalizeArgs {
  sessionId: string;
  mimeType: string;
}

export interface FinalizeResult {
  success: boolean;
  filePath?: string;
  fileSize?: number;
  error?: string;
}

export interface ValidationResult {
  valid: boolean;
  filePath: string;
  fileSize: number;
  error?: string;
}
