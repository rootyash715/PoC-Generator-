import { ipcMain, desktopCapturer, BrowserWindow, app } from 'electron';
import fs from 'fs';
import path from 'path';
import { IPC_CHANNELS } from '../../shared/types/ipc';
import { DesktopSource } from '../../shared/types/recording';
import {
  SaveChunkArgs,
  FinalizeArgs,
  FinalizeResult,
  ValidationResult
} from '../../shared/types/ipc';
import { isValidSessionId, isPathSafe } from '../security/ipcSecurity';

// ── Per-session chunk accumulator ──────────────────────────────────────────
const sessionChunks = new Map<string, Buffer[]>();
const sessionDirs = new Map<string, string>();

function getRecordingsDir(): string {
  const userDataDir = app?.getPath ? app.getPath('userData') : (process.env.APPDATA || process.env.HOME || process.cwd());
  const dir = path.join(userDataDir, 'TraceCamData', 'Recordings');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function setupRecordingIpc() {
  // ── Source enumeration ────────────────────────────────────────────────────
  ipcMain.handle(IPC_CHANNELS.GET_SOURCES, async () => {
    try {
      console.log('[IPC:recording] Fetching desktop sources');
      const sources = await desktopCapturer.getSources({
        types: ['screen', 'window'],
        thumbnailSize: { width: 320, height: 180 },
        fetchWindowIcons: true
      });

      const result: DesktopSource[] = sources.map((src) => ({
        id: src.id,
        name: src.name,
        thumbnailUrl: src.thumbnail.toDataURL(),
        type: src.id.startsWith('screen') ? 'screen' : 'window',
        appIconUrl: src.appIcon ? src.appIcon.toDataURL() : undefined
      }));

      console.log(`[IPC:recording] Found ${result.length} sources`);
      return { success: true, sources: result };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to capture desktop sources';
      console.error('[IPC:recording] getSources failed:', err);
      return { success: false, error: errorMessage };
    }
  });

  // ── setDisplayMediaRequestHandler (Electron ≥20 requirement) ─────────────
  ipcMain.on(IPC_CHANNELS.SETUP_MEDIA_HANDLER, () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (!win) return;

    win.webContents.session.setDisplayMediaRequestHandler(
      (request, callback) => {
        console.log('[IPC:recording] setDisplayMediaRequestHandler triggered');
        desktopCapturer.getSources({ types: ['screen', 'window'] }).then((sources) => {
          // Automatically select first screen source
          const screenSource = sources.find((s) => s.id.startsWith('screen')) || sources[0];
          if (screenSource) {
            console.log(`[IPC:recording] Auto-selecting source: ${screenSource.name}`);
            callback({ video: screenSource, audio: 'loopback' });
          } else {
            console.warn('[IPC:recording] No screen source available for handler');
            callback({});
          }
        });
      },
      { useSystemPicker: false }
    );
  });

  // ── Source-specific handler: renderer picks the source ID ─────────────────
  ipcMain.on(IPC_CHANNELS.SETUP_MEDIA_HANDLER_WITH_SOURCE, (_event, sourceId: string) => {
    const win = BrowserWindow.getAllWindows()[0];
    if (!win) return;

    win.webContents.session.setDisplayMediaRequestHandler(
      (request, callback) => {
        console.log(`[IPC:recording] setDisplayMediaRequestHandler for sourceId=${sourceId}`);
        desktopCapturer.getSources({ types: ['screen', 'window'] }).then((sources) => {
          const target = sources.find((s) => s.id === sourceId) || sources[0];
          if (target) {
            console.log(`[IPC:recording] Routing to source: ${target.name}`);
            callback({ video: target, audio: 'loopback' });
          } else {
            callback({});
          }
        });
      },
      { useSystemPicker: false }
    );
  });

  // ── Save incoming chunk (renderer → main via ArrayBuffer) ─────────────────
  ipcMain.handle(IPC_CHANNELS.SAVE_RECORDING_CHUNK, async (_event, args: SaveChunkArgs) => {
    try {
      const { sessionId, chunkIndex, data } = args;
      if (!isValidSessionId(sessionId)) {
        return { success: false, error: 'Invalid recording session ID' };
      }
      if (!data) {
        return { success: false, error: 'Empty chunk data provided' };
      }

      if (!sessionChunks.has(sessionId)) {
        sessionChunks.set(sessionId, []);
        const dir = getRecordingsDir();
        const sessionDir = path.join(dir, sessionId);
        if (!isPathSafe(sessionDir, dir)) {
          return { success: false, error: 'Path traversal prevented for session directory' };
        }
        fs.mkdirSync(sessionDir, { recursive: true });
        sessionDirs.set(sessionId, sessionDir);
      }

      const buf = Buffer.from(data);
      sessionChunks.get(sessionId)!.push(buf);
      console.log(`[IPC:chunk] Session=${sessionId} chunk#${chunkIndex} size=${buf.byteLength}B`);
      return { success: true };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('[IPC:chunk] Failed to save chunk:', err);
      return { success: false, error: errorMessage };
    }
  });

  // ── Finalize: concatenate chunks → write .webm file ──────────────────────
  ipcMain.handle(IPC_CHANNELS.FINALIZE_RECORDING, async (_event, args: FinalizeArgs): Promise<FinalizeResult> => {
    const { sessionId, mimeType } = args;
    try {
      if (!isValidSessionId(sessionId)) {
        return { success: false, error: 'Invalid recording session ID' };
      }

      const chunks = sessionChunks.get(sessionId);
      if (!chunks || chunks.length === 0) {
        return { success: false, error: 'No recorded chunks available for this session' };
      }

      const combined = Buffer.concat(chunks);
      const ext = mimeType && mimeType.includes('webm') ? 'webm' : 'mp4';
      const baseDir = getRecordingsDir();
      const sessionDir = sessionDirs.get(sessionId) || path.join(baseDir, sessionId);

      if (!isPathSafe(sessionDir, baseDir)) {
        return { success: false, error: 'Security violation: directory path outside recording base' };
      }

      const filePath = path.join(sessionDir, `recording.${ext}`);
      fs.writeFileSync(filePath, combined);

      const stats = fs.statSync(filePath);
      console.log(`[IPC:finalize] Saved: ${filePath} (${stats.size} bytes)`);

      // Clean up memory
      sessionChunks.delete(sessionId);

      return { success: true, filePath, fileSize: stats.size };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('[IPC:finalize] Failed to write recording:', err);
      return { success: false, error: errorMessage };
    }
  });

  // ── Validate the output file ──────────────────────────────────────────────
  ipcMain.handle(IPC_CHANNELS.VALIDATE_RECORDING, async (_event, filePath: string): Promise<ValidationResult> => {
    try {
      const recordingsDir = getRecordingsDir();
      if (!filePath || typeof filePath !== 'string' || !isPathSafe(filePath, recordingsDir)) {
        return { valid: false, filePath: filePath || '', fileSize: 0, error: 'Access denied: unsafe file path' };
      }
      if (!fs.existsSync(filePath)) {
        return { valid: false, filePath, fileSize: 0, error: 'File does not exist' };
      }
      const stats = fs.statSync(filePath);
      if (stats.size === 0) {
        return { valid: false, filePath, fileSize: 0, error: 'Recording file is empty (0 bytes)' };
      }
      console.log(`[IPC:validate] ${filePath} → ${stats.size} bytes ✓`);
      return { valid: true, filePath, fileSize: stats.size };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return { valid: false, filePath: filePath || '', fileSize: 0, error: errorMessage };
    }
  });

  // ── System info ───────────────────────────────────────────────────────────
  ipcMain.handle(IPC_CHANNELS.GET_SYSTEM_INFO, async () => ({
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.versions.node,
    electronVersion: process.versions.electron
  }));
}
