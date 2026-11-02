import { useCallback, useRef, useState } from 'react';
import { RecorderState } from '../../shared/types/ipc';
import { CursorEvent } from '../../shared/types/cursor';

// ── MIME type detection ───────────────────────────────────────────────────────
const MIME_CANDIDATES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm;codecs=h264,opus',
  'video/webm'
];

function detectSupportedMime(): string | null {
  for (const mime of MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }
  return null;
}

// ── Session ID generator ──────────────────────────────────────────────────────
function generateSessionId(): string {
  return `rec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface RecordingDiagnostics {
  sourceId: string;
  sourceName: string;
  mimeType: string;
  videoWidth: number;
  videoHeight: number;
  videoFrameRate: number;
  videoTracks: number;
  audioTracks: number;
  chunkCount: number;
  totalBytes: number;
  state: string;
}

export interface UseRecorderReturn {
  recorderState: RecorderState;
  elapsedSeconds: number;
  diagnostics: RecordingDiagnostics | null;
  error: string | null;
  savedFilePath: string | null;
  cursorEvents: CursorEvent[];
  startRecording: (sourceId: string, sourceName: string, includeMic: boolean) => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: () => Promise<void>;
  cancelRecording: () => void;
  previewObjectUrl: string | null;
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useRecorder(): UseRecorderReturn {
  const [recorderState, setRecorderState] = useState<RecorderState>('IDLE');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [diagnostics, setDiagnostics] = useState<RecordingDiagnostics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedFilePath, setSavedFilePath] = useState<string | null>(null);
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);
  const [cursorEvents, setCursorEvents] = useState<CursorEvent[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionIdRef = useRef<string>('');
  const chunkIndexRef = useRef(0);
  const startTimeRef = useRef<number>(0);
  const cursorEventsRef = useRef<CursorEvent[]>([]);

  // ── Cursor tracking ─────────────────────────────────────────────────────────
  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!startTimeRef.current) return;
    const ts = (Date.now() - startTimeRef.current) / 1000;
    cursorEventsRef.current.push({ timestamp: ts, x: e.screenX, y: e.screenY, event: 'move' });
  }, []);

  const onMouseClick = useCallback((e: MouseEvent) => {
    if (!startTimeRef.current) return;
    const ts = (Date.now() - startTimeRef.current) / 1000;
    const button = e.button === 0 ? 'left' : e.button === 2 ? 'right' : 'middle';
    cursorEventsRef.current.push({ timestamp: ts, x: e.screenX, y: e.screenY, event: 'click', button });
  }, []);

  // ── Cleanup helper ──────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('click', onMouseClick);
    chunkIndexRef.current = 0;
    chunksRef.current = [];
    cursorEventsRef.current = [];
    startTimeRef.current = 0;
  }, [onMouseMove, onMouseClick]);

  // ── START ────────────────────────────────────────────────────────────────────
  const startRecording = useCallback(async (sourceId: string, sourceName: string, includeMic: boolean) => {
    setError(null);
    setRecorderState('STARTING');
    console.log(`[Recorder] Start requested — source=${sourceName} (${sourceId}) mic=${includeMic}`);

    try {
      // 1. Tell main process to register the display media handler for THIS source
      window.electronAPI?.setupMediaHandlerWithSource(sourceId);
      // Give the IPC message time to register in main before calling getDisplayMedia
      await new Promise((r) => setTimeout(r, 100));

      // 2. Request display media (main process intercepts and routes to chosen source)
      let displayStream: MediaStream;
      try {
        displayStream = await (navigator.mediaDevices as MediaDevices & { getDisplayMedia: (constraints?: MediaStreamConstraints) => Promise<MediaStream> }).getDisplayMedia({
          video: { frameRate: 60 } as MediaTrackConstraints,
          audio: true
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('Permission denied') || msg.includes('NotAllowedError')) {
          throw new Error('Screen capture permission was denied. Grant screen recording access and try again.');
        }
        if (msg.includes('AbortError') || msg.includes('cancelled')) {
          throw new Error('Screen selection cancelled.');
        }
        throw new Error(`Unable to access the selected screen: ${msg}`);
      }

      // 3. Validate video tracks
      const videoTracks = displayStream.getVideoTracks();
      if (videoTracks.length === 0) {
        displayStream.getTracks().forEach((t) => t.stop());
        throw new Error('Screen capture returned no video track. Select a valid screen and try again.');
      }

      const videoSettings = videoTracks[0].getSettings();
      console.log(`[Recorder] Video tracks: ${videoTracks.length}`);
      console.log(`[Recorder] Width: ${videoSettings.width} Height: ${videoSettings.height} FPS: ${videoSettings.frameRate}`);
      console.log(`[Recorder] Track state: ${videoTracks[0].readyState}`);

      // 4. Optionally add microphone track
      let combinedStream = displayStream;
      if (includeMic) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          const combinedTracks = [...displayStream.getTracks(), ...micStream.getAudioTracks()];
          combinedStream = new MediaStream(combinedTracks);
          console.log(`[Recorder] Microphone added`);
        } catch (micErr) {
          console.warn('[Recorder] Microphone unavailable, continuing screen-only:', micErr);
        }
      }

      const audioTracks = combinedStream.getAudioTracks();
      console.log(`[Recorder] Audio tracks: ${audioTracks.length}`);

      // 5. Detect MIME type
      const mimeType = detectSupportedMime();
      if (!mimeType) {
        combinedStream.getTracks().forEach((t) => t.stop());
        throw new Error('This recording format is not supported by the current Electron runtime.');
      }
      console.log(`[Recorder] Selected MIME type: ${mimeType}`);

      // 6. Init MediaRecorder
      const mr = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 8_000_000,
        audioBitsPerSecond: 128_000
      });

      const sessionId = generateSessionId();
      sessionIdRef.current = sessionId;
      chunksRef.current = [];
      chunkIndexRef.current = 0;
      cursorEventsRef.current = [];

      // 7. Wire events
      mr.onstart = () => {
        console.log('[Recorder] MediaRecorder started — state:', mr.state);
        setRecorderState('RECORDING');
        startTimeRef.current = Date.now();

        // Attach cursor tracking
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('click', onMouseClick);

        // Start elapsed timer
        timerRef.current = setInterval(() => {
          setElapsedSeconds((s) => s + 1);
        }, 1000);
      };

      mr.ondataavailable = async (e) => {
        if (!e.data || e.data.size === 0) {
          console.warn('[Recorder] Empty chunk received — skipping');
          return;
        }
        const idx = chunkIndexRef.current++;
        console.log(`[Recorder] Chunk #${idx}: ${e.data.size} bytes`);
        chunksRef.current.push(e.data);

        // Send chunk to main process for disk persistence
        try {
          const arrayBuffer = await e.data.arrayBuffer();
          await window.electronAPI?.saveRecordingChunk({ sessionId, chunkIndex: idx, data: arrayBuffer });
        } catch (err) {
          console.error('[Recorder] Failed to persist chunk to main process:', err);
        }

        setDiagnostics({
          sourceId,
          sourceName,
          mimeType,
          videoWidth: videoSettings.width || 0,
          videoHeight: videoSettings.height || 0,
          videoFrameRate: videoSettings.frameRate || 0,
          videoTracks: videoTracks.length,
          audioTracks: audioTracks.length,
          chunkCount: chunkIndexRef.current,
          totalBytes: chunksRef.current.reduce((acc, b) => acc + b.size, 0),
          state: mr.state
        });
      };

      mr.onstop = async () => {
        console.log('[Recorder] MediaRecorder stopped');
        console.log(`[Recorder] Total chunks: ${chunksRef.current.length}`);
        const totalBytes = chunksRef.current.reduce((acc, b) => acc + b.size, 0);
        console.log(`[Recorder] Total bytes: ${totalBytes}`);

        if (totalBytes === 0) {
          setError('Recording failed because no video data was produced. Try a different screen source.');
          setRecorderState('ERROR');
          cleanup();
          return;
        }

        setRecorderState('PROCESSING');

        // Create browser-side preview URL immediately
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const objUrl = URL.createObjectURL(blob);
        setPreviewObjectUrl(objUrl);

        // Finalize file on disk via main process
        const finalizeResult = await window.electronAPI?.finalizeRecording({ sessionId, mimeType });
        if (finalizeResult?.success && finalizeResult.filePath) {
          console.log(`[Recorder] Saved to: ${finalizeResult.filePath} (${finalizeResult.fileSize} bytes)`);
          setSavedFilePath(finalizeResult.filePath);

          // Validate
          const validation = await window.electronAPI?.validateRecording(finalizeResult.filePath);
          if (validation?.valid) {
            console.log('[Recorder] Validation: PASS');
            setRecorderState('SAVED');
          } else {
            console.error('[Recorder] Validation: FAIL —', validation?.error);
            setError(`Recording validation failed: ${validation?.error}`);
            setRecorderState('ERROR');
          }
        } else {
          console.error('[Recorder] Finalize failed:', finalizeResult?.error);
          // Still mark saved since we have the browser blob
          setRecorderState('SAVED');
        }

        setCursorEvents([...cursorEventsRef.current]);
        console.log(`[Recorder] Cursor events captured: ${cursorEventsRef.current.length}`);
        cleanup();
      };

      mr.onerror = (ev) => {
        console.error('[Recorder] MediaRecorder error:', ev);
        setError('MediaRecorder encountered an error during recording.');
        setRecorderState('ERROR');
        cleanup();
      };

      // 8. Store refs & start
      mediaRecorderRef.current = mr;
      streamRef.current = combinedStream;

      // Request a chunk every 2s to keep disk writes incremental
      mr.start(2000);
      console.log('[Recorder] MediaRecorder started with 2s timeslice');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[Recorder] Start failed:', msg);
      setError(msg);
      setRecorderState('ERROR');
      cleanup();
    }
  }, [cleanup, onMouseMove, onMouseClick]);

  // ── PAUSE ────────────────────────────────────────────────────────────────────
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      if (timerRef.current) clearInterval(timerRef.current);
      setRecorderState('PAUSED');
      console.log('[Recorder] Paused');
    }
  }, []);

  // ── RESUME ───────────────────────────────────────────────────────────────────
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
      setRecorderState('RECORDING');
      console.log('[Recorder] Resumed');
    }
  }, []);

  // ── STOP ─────────────────────────────────────────────────────────────────────
  const stopRecording = useCallback(async () => {
    const mr = mediaRecorderRef.current;
    if (!mr || mr.state === 'inactive') return;

    setRecorderState('STOPPING');
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    // Remove cursor tracking now (stop fires onstop async)
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('click', onMouseClick);

    // Stop the stream tracks AFTER stop() is called so final data arrives
    console.log('[Recorder] Stopping MediaRecorder');
    mr.stop();
    // Track cleanup happens in onstop
  }, [onMouseMove, onMouseClick]);

  // ── CANCEL ───────────────────────────────────────────────────────────────────
  const cancelRecording = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== 'inactive') {
      mr.stop();
    }
    cleanup();
    setRecorderState('IDLE');
    setElapsedSeconds(0);
    setError(null);
    console.log('[Recorder] Cancelled');
  }, [cleanup]);

  return {
    recorderState,
    elapsedSeconds,
    diagnostics,
    error,
    savedFilePath,
    cursorEvents,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
    previewObjectUrl
  };
}
