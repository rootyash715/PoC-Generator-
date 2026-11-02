import React, { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import {
  Play, Pause, Square, XCircle, Mic, MicOff, Camera, CameraOff
} from 'lucide-react';
import { useRecorder } from '../hooks/useRecorder';
import { SourcePicker } from '../components/recorder/SourcePicker';
import { RecordingStatusBadge } from '../components/recorder/RecordingStatusBadge';
import { DesktopSource } from '../../shared/types/recording';
import { setPreviewData } from './Preview';

export const Recorder: React.FC = () => {
  const { setCurrentPage } = useAppStore();

  // ── Local config state ─────────────────────────────────────────────────────
  const [selectedSource, setSelectedSource] = useState<DesktopSource | null>(null);
  const [includeMic, setIncludeMic] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(false);

  // ── Real recorder hook ─────────────────────────────────────────────────────
  const {
    recorderState,
    elapsedSeconds,
    diagnostics,
    error,
    savedFilePath,
    cursorEvents,
    previewObjectUrl,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording
  } = useRecorder();

  const isIdle = recorderState === 'IDLE' || recorderState === 'ERROR';
  const isRecording = recorderState === 'RECORDING';
  const isPaused = recorderState === 'PAUSED';
  const isSaved = recorderState === 'SAVED';
  const isBusy = recorderState === 'STARTING' || recorderState === 'STOPPING' || recorderState === 'PROCESSING';

  // ── Handle start ──────────────────────────────────────────────────────────
  const handleStart = async () => {
    if (!selectedSource) return;
    await startRecording(selectedSource.id, selectedSource.name, includeMic);
  };

  // ── Handle stop → navigate to preview ─────────────────────────────────────
  const handleStop = async () => {
    await stopRecording();
    // Navigate after onstop fires (SAVED state)
  };

  // Watch for SAVED state and navigate
  React.useEffect(() => {
    if (isSaved && previewObjectUrl) {
      setPreviewData(previewObjectUrl, savedFilePath, cursorEvents.length);
      setCurrentPage('preview');
    }
  }, [isSaved, previewObjectUrl, savedFilePath, cursorEvents.length, setCurrentPage]);

  // ── Source picker phase ───────────────────────────────────────────────────
  if (isIdle && !selectedSource) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6 overflow-y-auto h-full">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Select Screen Source</h2>
            <p className="text-xs text-slate-400 mt-1">Choose a display or application window to capture.</p>
          </div>

          <SourcePicker
            selectedId={selectedSource ? (selectedSource as DesktopSource).id : undefined}
            onSelect={(src) => setSelectedSource(src)}
          />
        </div>
      </div>
    );
  }

  // ── Recording control phase ───────────────────────────────────────────────
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 overflow-y-auto h-full">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">

        {/* Status Badge */}
        <RecordingStatusBadge
          state={recorderState}
          elapsedSeconds={elapsedSeconds}
          diagnostics={diagnostics}
          error={error}
        />

        {/* Stream preview / source info */}
        <div className="aspect-video rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center relative overflow-hidden">
          {selectedSource?.thumbnailUrl && isIdle ? (
            <img
              src={selectedSource.thumbnailUrl}
              alt="Source preview"
              className="w-full h-full object-contain opacity-40"
            />
          ) : isRecording || isPaused ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <p className="text-red-400 text-sm font-medium">Live Capture Active</p>
              {diagnostics && (
                <p className="text-xs text-slate-400">
                  {diagnostics.videoWidth}×{diagnostics.videoHeight} @ {Math.round(diagnostics.videoFrameRate)} FPS
                </p>
              )}
            </div>
          ) : (
            <div className="text-center space-y-1">
              <p className="text-slate-400 text-sm">{selectedSource?.name || 'No source selected'}</p>
              <p className="text-xs text-slate-500">Ready to record</p>
            </div>
          )}

          {cameraEnabled && (
            <div className="absolute bottom-4 right-4 w-28 h-28 rounded-full border-2 border-indigo-500 bg-slate-800 shadow-xl flex items-center justify-center">
              <span className="text-[10px] text-indigo-300 font-medium">Webcam</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between p-4 bg-slate-900/80 rounded-xl border border-slate-800">
          {/* Left: audio/camera toggles */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIncludeMic(!includeMic)}
              disabled={isRecording || isPaused || isBusy}
              title={includeMic ? 'Mute microphone' : 'Unmute microphone'}
              className={`p-3 rounded-lg border text-sm transition-all disabled:opacity-50 ${
                !includeMic
                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                  : 'bg-slate-800 text-slate-200 border-slate-700'
              }`}
            >
              {includeMic ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setCameraEnabled(!cameraEnabled)}
              disabled={isRecording || isPaused || isBusy}
              title={cameraEnabled ? 'Disable webcam' : 'Enable webcam'}
              className={`p-3 rounded-lg border text-sm transition-all disabled:opacity-50 ${
                !cameraEnabled
                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                  : 'bg-slate-800 text-slate-200 border-slate-700'
              }`}
            >
              {cameraEnabled ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
            </button>
          </div>

          {/* Right: main record controls */}
          <div className="flex items-center gap-3">
            {/* Cancel / Back button */}
            {(recorderState === 'IDLE' || recorderState === 'ERROR') && (
              <button
                onClick={() => setSelectedSource(null)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
              >
                <XCircle className="w-4 h-4" /> Change Source
              </button>
            )}

            {/* START */}
            {isIdle && selectedSource && (
              <button
                onClick={handleStart}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all"
              >
                <Play className="w-4 h-4 fill-white" /> Start Recording
              </button>
            )}

            {/* PAUSE / RESUME */}
            {(isRecording || isPaused) && (
              <button
                onClick={isPaused ? resumeRecording : pauseRecording}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-medium text-sm flex items-center gap-2 transition-all"
              >
                <Pause className="w-4 h-4" /> {isPaused ? 'Resume' : 'Pause'}
              </button>
            )}

            {/* STOP */}
            {(isRecording || isPaused) && (
              <button
                onClick={handleStop}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
              >
                <Square className="w-4 h-4 fill-white" /> Stop & Save
              </button>
            )}

            {/* BUSY spinner label */}
            {isBusy && (
              <span className="text-slate-400 text-sm animate-pulse">Processing…</span>
            )}
          </div>
        </div>

        {/* Selected source info */}
        {selectedSource && (
          <div className="flex items-center gap-2 text-xs text-slate-400 px-1">
            <span className="text-slate-500">Source:</span>
            <span className="text-slate-300 font-medium">{selectedSource.name}</span>
            <span className="capitalize text-slate-500">({selectedSource.type})</span>
          </div>
        )}
      </div>
    </div>
  );
};
