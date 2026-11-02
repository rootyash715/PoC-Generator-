import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/types/ipc';
import { StorageService } from '../services/storage';
import { Project } from '../../shared/types/project';
import { ApplicationSettings } from '../../shared/types/settings';

export function setupStorageIpc(storageService: StorageService) {
  ipcMain.handle(IPC_CHANNELS.GET_PROJECTS, async () => {
    return storageService.getProjects();
  });

  ipcMain.handle(IPC_CHANNELS.GET_PROJECT, async (_, id: string) => {
    return storageService.getProject(id);
  });

  ipcMain.handle(IPC_CHANNELS.SAVE_PROJECT, async (_, project: Project) => {
    return storageService.saveProject(project);
  });

  ipcMain.handle(IPC_CHANNELS.DELETE_PROJECT, async (_, id: string) => {
    return storageService.deleteProject(id);
  });

  ipcMain.handle(IPC_CHANNELS.GET_SETTINGS, async () => {
    return storageService.getSettings();
  });

  ipcMain.handle(IPC_CHANNELS.SAVE_SETTINGS, async (_, settings: ApplicationSettings) => {
    return storageService.saveSettings(settings);
  });
}
