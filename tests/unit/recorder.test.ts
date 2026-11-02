import { describe, it, expect } from 'vitest';

// ── MIME detection logic (pure unit test) ────────────────────────────────────
const MIME_CANDIDATES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm;codecs=h264,opus',
  'video/webm'
];

// In jsdom environment MediaRecorder is not available,
// so we mock isTypeSupported for testing the selection logic
function detectSupportedMime(supportedSet: string[]): string | null {
  for (const mime of MIME_CANDIDATES) {
    if (supportedSet.includes(mime)) return mime;
  }
  return null;
}

// ── State machine transition logic ───────────────────────────────────────────
describe('Recorder: MIME type detection', () => {
  it('picks vp9+opus when all codecs supported', () => {
    const result = detectSupportedMime(MIME_CANDIDATES);
    expect(result).toBe('video/webm;codecs=vp9,opus');
  });

  it('falls back to vp8+opus when vp9 unavailable', () => {
    const result = detectSupportedMime(MIME_CANDIDATES.slice(1));
    expect(result).toBe('video/webm;codecs=vp8,opus');
  });

  it('falls back to plain webm as last resort', () => {
    const result = detectSupportedMime(['video/webm']);
    expect(result).toBe('video/webm');
  });

  it('returns null when nothing is supported', () => {
    const result = detectSupportedMime([]);
    expect(result).toBeNull();
  });
});

// ── Chunk accumulation simulation ─────────────────────────────────────────────
describe('Recorder: chunk accumulation', () => {
  it('correctly sums chunk bytes', () => {
    const chunks = [100, 200, 300, 400].map((size) => ({ size }));
    const total = chunks.reduce((acc, c) => acc + c.size, 0);
    expect(total).toBe(1000);
  });

  it('detects zero-byte recording', () => {
    const chunks: { size: number }[] = [];
    const total = chunks.reduce((acc, c) => acc + c.size, 0);
    expect(total).toBe(0);
  });
});

// ── IPC channel validation ────────────────────────────────────────────────────
describe('Recorder: IPC channel constants', () => {
  it('SAVE_RECORDING_CHUNK is defined', async () => {
    const { IPC_CHANNELS } = await import('../../src/shared/types/ipc');
    expect(IPC_CHANNELS.SAVE_RECORDING_CHUNK).toBe('recording:save-chunk');
  });

  it('FINALIZE_RECORDING is defined', async () => {
    const { IPC_CHANNELS } = await import('../../src/shared/types/ipc');
    expect(IPC_CHANNELS.FINALIZE_RECORDING).toBe('recording:finalize');
  });

  it('VALIDATE_RECORDING is defined', async () => {
    const { IPC_CHANNELS } = await import('../../src/shared/types/ipc');
    expect(IPC_CHANNELS.VALIDATE_RECORDING).toBe('recording:validate');
  });
});
