import { app, BrowserWindow, shell } from 'electron';
import path from 'path';
import { StorageService } from './services/storage';
import { registerAllIpcHandlers } from './ipc';

// Disable Chromium Autofill feature communication to prevent benign DevTools CDP error spam
app.commandLine.appendSwitch('disable-features', 'AutofillServerCommunication');

let mainWindow: BrowserWindow | null = null;
let storageService: StorageService | null = null;

// Catch uncaught exceptions and rejections gracefully in main process
process.on('uncaughtException', (error) => {
  console.error('[Main] Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Main] Unhandled Rejection:', reason);
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1024,
    minHeight: 700,
    title: 'TraceCam — Screen Recorder & Smart Camera',
    backgroundColor: '#090d16',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  // Secure window opening: prevent opening arbitrary untrusted windows
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
        shell.openExternal(url);
      }
    } catch {
      // Ignore invalid URLs
    }
    return { action: 'deny' };
  });

  // Restrict navigation to prevent redirection to arbitrary untrusted external sites
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (process.env.VITE_DEV_SERVER_URL) {
      try {
        const devUrl = new URL(process.env.VITE_DEV_SERVER_URL);
        const targetUrl = new URL(url);
        if (devUrl.origin === targetUrl.origin) {
          return;
        }
      } catch {
        if (url.startsWith(process.env.VITE_DEV_SERVER_URL)) {
          return;
        }
      }
    }
    if (url.startsWith('file://')) {
      return;
    }
    event.preventDefault();
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    // Open DevTools detached so main screen recorder UI stays completely visible
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  storageService = new StorageService();
  // Register all IPC handlers once at app startup
  registerAllIpcHandlers(storageService);
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
