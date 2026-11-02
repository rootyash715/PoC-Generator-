import React from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Video, Sparkles, Folder, Shield, Zap } from 'lucide-react';

export const Home: React.FC = () => {
  const { setCurrentPage } = useAppStore();

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto overflow-y-auto h-full">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 border border-brand-500/20 p-8">
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" /> Professional Screen Recording Platform
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Record, Zoom & Edit with Precision
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            TraceCam gives you intelligent camera tracking, automated cursor zoom, multi-track recording, and professional video editing in one secure desktop experience.
          </p>
          <div className="pt-2 flex items-center gap-4">
            <button
              onClick={() => setCurrentPage('new-recording')}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-brand-600/30 transition-all"
            >
              <Video className="w-4 h-4" /> Start New Recording
            </button>
            <button
              onClick={() => setCurrentPage('library')}
              className="px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-medium text-sm border border-slate-700 flex items-center gap-2 transition-all"
            >
              <Folder className="w-4 h-4" /> View Library
            </button>
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl glass-panel space-y-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Video className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-100">Multi-Stream Capture</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Capture full screens, app windows, mic audio, system sound, and webcam overlay simultaneously.
          </p>
        </div>

        <div className="p-6 rounded-xl glass-panel space-y-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-100">Smart Camera Engine</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Automatic smooth zoom towards cursor focus points with customizable dead zones and ease transitions.
          </p>
        </div>

        <div className="p-6 rounded-xl glass-panel space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-100">Local Security First</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            All video data stays on your device. Node context isolation and IPC message whitelisting built-in.
          </p>
        </div>
      </div>
    </div>
  );
};
