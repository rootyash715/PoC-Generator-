import { StorageService } from '../services/storage';
import { setupRecordingIpc } from './recording';
import { setupStorageIpc } from './storage';

export function registerAllIpcHandlers(storageService: StorageService) {
  setupRecordingIpc();
  setupStorageIpc(storageService);
}
