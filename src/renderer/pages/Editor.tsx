import React from 'react';
import { Sparkles, Scissors, Plus, ZoomIn } from 'lucide-react';

export const Editor: React.FC = () => {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-surface-950">
      {/* Editor Main Canvas & Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Video Stage */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center relative">
          <div className="w-full max-w-4xl aspect-video rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center relative shadow-2xl overflow-hidden">
            <div className="text-center space-y-2">
              <Sparkles className="w-8 h-8 text-brand-400 mx-auto" />
              <p className="text-slate-300 text-sm font-medium">Smart Zoom Stage Preview</p>
              <p className="text-xs text-slate-500">Timeline and Keyframe interpolation ready</p>
            </div>
          </div>
        </div>

        {/* Right Inspector Panel */}
        <div className="w-80 glass-panel border-l border-slate-800 p-4 space-y-6 overflow-y-auto">
          <div>
            <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
              <ZoomIn className="w-4 h-4 text-brand-400" /> Smart Camera
            </h3>
            <p className="text-xs text-slate-400 mt-1">Configure automated cursor tracking zoom settings.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Zoom Factor</label>
              <select className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200">
                <option>1.5x (Default)</option>
                <option>1.25x</option>
                <option>1.75x</option>
                <option>2.0x</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Focus Mode</label>
              <select className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200">
                <option>Smart Focus</option>
                <option>Cursor Track</option>
                <option>Click Events Only</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Camera Smoothing</label>
              <input type="range" min="0" max="100" defaultValue="75" className="w-full accent-brand-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Timeline Tracks */}
      <div className="h-56 glass-panel border-t border-slate-800 p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add Zoom Keyframe
            </button>
            <button className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1">
              <Scissors className="w-3.5 h-3.5" /> Split Clip
            </button>
          </div>
          <div className="text-xs font-mono text-slate-400">00:00:00 / 00:02:45</div>
        </div>

        {/* Timeline Tracks Visualizer Placeholder */}
        <div className="space-y-2 my-2 overflow-x-auto">
          <div className="h-7 bg-brand-950/40 rounded-lg border border-brand-500/20 px-3 flex items-center text-[11px] text-brand-300 font-medium">
            VIDEO TRACK (1080p)
          </div>
          <div className="h-7 bg-indigo-950/40 rounded-lg border border-indigo-500/20 px-3 flex items-center text-[11px] text-indigo-300 font-medium">
            AUDIO TRACK (MIC + SYSTEM)
          </div>
          <div className="h-7 bg-purple-950/40 rounded-lg border border-purple-500/20 px-3 flex items-center text-[11px] text-purple-300 font-medium">
            CAMERA KEYFRAMES (SMART ZOOM)
          </div>
        </div>
      </div>
    </div>
  );
};
