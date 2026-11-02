# TraceCam — Professional Screen Recording & Smart Camera Platform

TraceCam is a desktop screen recording application with intelligent camera tracking, automated cursor-following zoom, smooth camera movements, multi-track timeline editing, and local FFmpeg rendering.

## Architecture

- **Desktop Framework**: Electron + React + TypeScript + Vite
- **UI & Styling**: Tailwind CSS (Modern dark/light interface with glassmorphism)
- **State Management**: Zustand
- **Security**: Context isolation enabled, Node integration disabled, strict IPC channel whitelisting, path traversal protection, sanitized child process execution.

## Phase 0 Foundation Setup

### Prerequisites
- Node.js v18+ (v24 tested)
- npm v9+

### Installation

```bash
npm install
```

### Development Mode

Start the Vite dev server and Electron process:

```bash
npm run dev
```

### Type Checking & Code Quality

```bash
# Type check TypeScript definitions across main & renderer
npm run typecheck

# Lint codebase
npm run lint

# Format codebase
npm run format
```

### Unit Tests

```bash
npm run test
```

### Build Production Bundle

```bash
npm run build
```

## Platform Support
- Primary: Windows 10/11
- Abstractions ready for macOS & Linux support.
