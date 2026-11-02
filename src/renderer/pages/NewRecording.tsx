import React from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Monitor, Mic, Camera, Play } from 'lucide-react';

export const NewRecording: React.FC = () => {
  const { setCurrentPage } = useAppStore();

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto overflow-y-auto h-full">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Recording Setup</h2>
          <p className="text-xs text-slate-400 mt-1">Configure your screen, webcam, and audio sources before launching.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source selector */}
        <div className="p-6 rounded-xl glass-panel space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 font-medium text-sm">
            <Monitor className="w-4 h-4" /> Screen Capture Source
          </div>
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-300">Select display or application window</p>
            <button
              onClick={() => setCurrentPage('recorder')}
              className="w-full py-2 px-4 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm transition-all"
            >
              Choose Display Source
            </button>
          </div>
        </div>

        {/* Audio options */}
        <div className="p-6 rounded-xl glass-panel space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 font-medium text-sm">
            <Mic className="w-4 h-4" /> Audio Input
          </div>
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
            <label className="flex items-center justify-between text-xs text-slate-300">
              <span>Microphone</span>
              <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-800 text-brand-500" />
            </label>
            <label className="flex items-center justify-between text-xs text-slate-300">
              <span>System Audio</span>
              <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-800 text-brand-500" />
            </label>
          </div>
        </div>

        {/* Webcam options */}
        <div className="p-6 rounded-xl glass-panel space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 font-medium text-sm">
            <Camera className="w-4 h-4" /> Camera Overlay
          </div>
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3 text-xs text-slate-300">
            <div className="flex justify-between items-center">
              <span>Webcam Preview</span>
              <span className="text-emerald-400 font-medium">Ready</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Shape</span>
              <span className="text-slate-400">Circle</span>
            </div>
          </div>
        </div>

        {/* Start button */}
        <div className="p-6 rounded-xl glass-panel flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">Ready to Capture?</h3>
            <p className="text-xs text-slate-400 mt-1">Make sure all permissions are granted before starting.</p>
          </div>
          <button
            onClick={() => setCurrentPage('recorder')}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all mt-4"
          >
            <Play className="w-4 h-4 fill-white" /> Launch Recorder Interface
          </button>
        </div>
      </div>
    </div>
  );
};
