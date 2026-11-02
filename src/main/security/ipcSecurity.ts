import path from 'path';
import { IPC_CHANNELS, IpcChannel } from '../../shared/types/ipc';

const ALLOWED_CHANNELS = new Set<string>(Object.values(IPC_CHANNELS));

export function isValidIpcChannel(channel: string): channel is IpcChannel {
  return ALLOWED_CHANNELS.has(channel);
}

export function isPathSafe(targetPath: string, allowedBaseDirectory: string): boolean {
  if (!targetPath || typeof targetPath !== 'string') return false;
  if (!allowedBaseDirectory || typeof allowedBaseDirectory !== 'string') return false;
  const resolvedTarget = path.resolve(targetPath);
  const resolvedBase = path.resolve(allowedBaseDirectory);
  const relative = path.relative(resolvedBase, resolvedTarget);
  // Ensure the relative path does not climb above the base directory
  return !relative.startsWith('..') && !path.isAbsolute(relative);
}

export function sanitizeFileName(name: string): string {
  if (!name || typeof name !== 'string') return 'unnamed';
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 100);
}

export function isValidSessionId(sessionId: string): boolean {
  if (!sessionId || typeof sessionId !== 'string') return false;
  return /^[a-zA-Z0-9_-]{1,128}$/.test(sessionId);
}
