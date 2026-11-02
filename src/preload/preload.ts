import { contextBridge } from 'electron';
import { api } from './api';

try {
  contextBridge.exposeInMainWorld('electronAPI', api);
} catch (error) {
  console.error('Failed to expose electronAPI contextBridge:', error);
}
