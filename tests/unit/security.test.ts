import { describe, it, expect } from 'vitest';
import { isValidIpcChannel, isPathSafe, sanitizeFileName } from '../../src/main/security/ipcSecurity';
import { IPC_CHANNELS } from '../../src/shared/types/ipc';

describe('Security Layer Validation', () => {
  it('validates whitelisted IPC channels', () => {
    expect(isValidIpcChannel(IPC_CHANNELS.GET_SOURCES)).toBe(true);
    expect(isValidIpcChannel(IPC_CHANNELS.SAVE_PROJECT)).toBe(true);
    expect(isValidIpcChannel('unauthorized:channel')).toBe(false);
  });

  it('prevents path traversal attacks', () => {
    const baseDir = 'C:\\Users\\test\\TraceCamData';
    expect(isPathSafe('C:\\Users\\test\\TraceCamData\\Projects\\proj1', baseDir)).toBe(true);
    expect(isPathSafe('C:\\Users\\test\\TraceCamData\\..\\..\\Windows\\System32', baseDir)).toBe(false);
    expect(isPathSafe('C:\\Users\\test\\TraceCamData_evil\\hack', baseDir)).toBe(false);
  });

  it('validates session ID formats strictly', async () => {
    const { isValidSessionId } = await import('../../src/main/security/ipcSecurity');
    expect(isValidSessionId('rec_123456_abcdef')).toBe(true);
    expect(isValidSessionId('session-01_test')).toBe(true);
    expect(isValidSessionId('../evil/session')).toBe(false);
    expect(isValidSessionId('rec; rm -rf /')).toBe(false);
    expect(isValidSessionId('')).toBe(false);
  });

  it('sanitizes file names cleanly', () => {
    expect(sanitizeFileName('my-recording_01.mp4')).toBe('my-recording_01_mp4');
    expect(sanitizeFileName('../../etc/passwd')).toBe('______etc_passwd');
  });
});
