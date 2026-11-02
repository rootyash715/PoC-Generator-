import { ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/types/ipc';
import { DesktopSource } from '../shared/types/recording';
import { Project, ProjectMetadata } from '../shared/types/project';
import { ApplicationSettings } from '../shared/types/settings';
import {
  SaveChunkArgs,
  FinalizeArgs,
  FinalizeResult,
  ValidationResult
} from '../shared/types/ipc';

export interface ElectronAPI {
  // Sources
  getDesktopSources: () => Promise<{ success: boolean; sources?: DesktopSource[]; error?: string }>;
  setupMediaHandlerWithSource: (sourceId: string) => void;

  // Recording pipeline
  saveRecordingChunk: (args: SaveChunkArgs) => Promise<{ success: boolean; error?: string }>;
  finalizeRecording: (args: FinalizeArgs) => Promise<FinalizeResult>;
  validateRecording: (filePath: string) => Promise<ValidationResult>;

  // Projects
  getProjects: () => Promise<ProjectMetadata[]>;
  getProject: (id: string) => Promise<Project | null>;
  saveProject: (project: Project) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;

  // Settings
  getSettings: () => Promise<ApplicationSettings>;
  saveSettings: (settings: ApplicationSettings) => Promise<boolean>;

  // System
  getSystemInfo: () => Promise<{
    platform: string;
    arch: string;
    nodeVersion: string;
    electronVersion: string;
  }>;
}

export const api: ElectronAPI = {
  getDesktopSources: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SOURCES),

  setupMediaHandlerWithSource: (sourceId: string) =>
    ipcRenderer.send(IPC_CHANNELS.SETUP_MEDIA_HANDLER_WITH_SOURCE, sourceId),

  saveRecordingChunk: (args: SaveChunkArgs) =>
    ipcRenderer.invoke(IPC_CHANNELS.SAVE_RECORDING_CHUNK, args),

  finalizeRecording: (args: FinalizeArgs) =>
    ipcRenderer.invoke(IPC_CHANNELS.FINALIZE_RECORDING, args),

  validateRecording: (filePath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.VALIDATE_RECORDING, filePath),

  getProjects: () => ipcRenderer.invoke(IPC_CHANNELS.GET_PROJECTS),
  getProject: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.GET_PROJECT, id),
  saveProject: (project: Project) => ipcRenderer.invoke(IPC_CHANNELS.SAVE_PROJECT, project),
  deleteProject: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.DELETE_PROJECT, id),
  getSettings: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SETTINGS),
  saveSettings: (settings: ApplicationSettings) =>
    ipcRenderer.invoke(IPC_CHANNELS.SAVE_SETTINGS, settings),
  getSystemInfo: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SYSTEM_INFO)
};
