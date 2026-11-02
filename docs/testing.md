# TraceCam — Testing Manual & Guidelines

## Automated Testing Suite

TraceCam uses **Vitest** for fast unit testing of core modules, security checks, and camera math logic.

### 1. Running Automated Tests

Run unit tests once:
```bash
npm run test
```

Run tests in watch mode:
```bash
npm run test:watch
```

### 2. Manual Testing Checklist (Phase 0)

1. **Scaffolding Compilation & Verification**
   - Run `npm run typecheck` to verify strict TypeScript compliance across `main`, `preload`, `renderer`, and `shared`.
   - Run `npm run lint` to check ESLint compliance.
   - Run `npm run test` to check unit test assertions.

2. **Application Startup**
   - Execute `npm run dev` to launch Vite & Electron.
   - Verify the main window opens with dimension 1360x860.
   - Ensure dark theme is applied with proper glassmorphism UI.

3. **Navigation & IPC Readiness**
   - Click through sidebar items: Home, New Recording, Recorder, Preview, Editor, Library, Settings.
   - Verify environment info in Settings (OS, Node version, Electron version).

4. **Security Verification**
   - Ensure renderer cannot access `require('child_process')` or `require('fs')` directly in developer tools (`nodeIntegration: false`, `contextIsolation: true`).
   - Validate contextBridge exposes `window.electronAPI`.
