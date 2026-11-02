import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Sparkles, Video, FileVideo, CheckCircle, ArrowLeft } from 'lucide-react';

// Stored in module-scope so it persists across navigations within the same session
export let previewUrl: string | null = null;
export let previewFilePath: string | null = null;
export let previewCursorEventCount = 0;

export function setPreviewData(url: string | null, filePath: string | null, cursorCount: number) {
  previewUrl = url;
  previewFilePath = filePath;
  previewCursorEventCount = cursorCount;
}

export const Preview: React.FC = () => {
  const { setCurrentPage } = useAppStore();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && previewUrl) {
      videoRef.current.src = previewUrl;
    }
  }, []);

  const hasVideo = Boolean(previewUrl);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">
            {hasVideo ? 'Recording Saved' : 'No Recording Found'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {hasVideo
              ? 'Play your recording below, then open the editor to add smart zoom.'
              : 'Complete a recording first to preview it here.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage('new-recording')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> New Recording
          </button>
          {hasVideo && (
            <button
              onClick={() => setCurrentPage('editor')}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg shadow-brand-600/30 transition-all"
            >
              <Sparkles className="w-4 h-4" /> Open in Editor
            </button>
          )}
        </div>
      </div>

      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-4">
        {hasVideo ? (
          <>
            {/* Actual video player */}
            <video
              ref={videoRef}
              controls
              className="w-full rounded-xl bg-black aspect-video"
              style={{ maxHeight: '480px' }}
            />

            {/* File & validation info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-500 block">Status</span>
                  <span className="text-emerald-300 font-semibold">Validated</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block">Cursor Events</span>
                <span className="text-slate-200 font-semibold">{previewCursorEventCount} events</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 col-span-2">
                <span className="text-slate-500 block">Saved File</span>
                <span className="text-slate-300 font-mono text-[10px] break-all">
                  {previewFilePath || '(browser blob — not persisted to disk yet)'}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="aspect-video flex flex-col items-center justify-center gap-4">
            <FileVideo className="w-14 h-14 text-slate-700" />
            <div className="text-center space-y-1">
              <p className="text-slate-400 font-medium">No recording to preview</p>
              <p className="text-xs text-slate-500">Go to New Recording to start a session.</p>
            </div>
            <button
              onClick={() => setCurrentPage('new-recording')}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg shadow-brand-600/30 transition-all"
            >
              <Video className="w-4 h-4" /> Start Recording
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
