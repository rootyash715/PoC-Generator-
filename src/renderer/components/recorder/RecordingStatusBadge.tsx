import React from 'react';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { RecorderState } from '@shared/types/ipc';
import { RecordingDiagnostics } from '../../hooks/useRecorder';

interface RecordingStatusBadgeProps {
  state: RecorderState;
  elapsedSeconds: number;
  diagnostics: RecordingDiagnostics | null;
  error: string | null;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

const STATE_LABELS: Record<RecorderState, string> = {
  IDLE: 'Ready',
  SELECTING_SOURCE: 'Selecting Source…',
  STARTING: 'Starting Recording…',
  RECORDING: 'Recording',
  PAUSED: 'Paused',
  STOPPING: 'Stopping…',
  PROCESSING: 'Processing…',
  SAVED: 'Saved',
  ERROR: 'Error'
};

export const RecordingStatusBadge: React.FC<RecordingStatusBadgeProps> = ({
  state,
  elapsedSeconds,
  diagnostics,
  error
}) => {
  const isLive = state === 'RECORDING';
  const isError = state === 'ERROR';
  const isSaved = state === 'SAVED';
  const isBusy = state === 'STARTING' || state === 'STOPPING' || state === 'PROCESSING';

  return (
    <div className="space-y-3">
      {/* Main status row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isLive && (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
          )}
          {isError && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
          {isSaved && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
          {isBusy && <Loader2 className="w-4 h-4 text-brand-400 animate-spin shrink-0" />}
          {!isLive && !isError && !isSaved && !isBusy && (
            <span className="w-3 h-3 rounded-full bg-slate-500" />
          )}

          <span className={`font-semibold text-sm ${isLive ? 'text-red-300' : isSaved ? 'text-emerald-300' : isError ? 'text-red-400' : 'text-slate-300'}`}>
            {STATE_LABELS[state]}
          </span>
        </div>

        <span className="text-xl font-mono font-bold text-brand-400">{formatTime(elapsedSeconds)}</span>
      </div>

      {/* Error */}
      {isError && error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          {error}
        </div>
      )}

      {/* Diagnostics panel (shown during recording) */}
      {diagnostics && isLive && (
        <div className="grid grid-cols-4 gap-2 text-[10px] font-mono">
          {[
            { label: 'Resolution', value: `${diagnostics.videoWidth}×${diagnostics.videoHeight}` },
            { label: 'FPS', value: `${Math.round(diagnostics.videoFrameRate)}` },
            { label: 'Chunks', value: `${diagnostics.chunkCount}` },
            { label: 'Data', value: `${(diagnostics.totalBytes / (1024 * 1024)).toFixed(1)} MB` }
          ].map((d) => (
            <div key={d.label} className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="block text-slate-500">{d.label}</span>
              <span className="text-slate-200 font-semibold">{d.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
