import React from 'react';
import { useAppStore } from '../stores/useAppStore';
import { HardDrive, Keyboard, Monitor } from 'lucide-react';

export const Settings: React.FC = () => {
  const { settings, systemInfo } = useAppStore();

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 overflow-y-auto h-full">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-slate-100">Application Settings</h2>
        <p className="text-xs text-slate-400 mt-1">Configure global recording behaviors, shortcuts, and storage paths.</p>
      </div>

      <div className="space-y-6">
        {/* Storage Settings */}
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-brand-400" /> Storage Location
          </h3>
          <div className="space-y-2 text-xs">
            <label className="text-slate-400">Default Project Directory</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={settings.storageDirectory || 'Default User Data Directory'}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Global Shortcuts */}
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-indigo-400" /> Keyboard Shortcuts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Start Recording</span>
              <kbd className="px-2 py-1 bg-slate-800 rounded text-indigo-300 font-mono">{settings.globalShortcuts.startRecording}</kbd>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Stop Recording</span>
              <kbd className="px-2 py-1 bg-slate-800 rounded text-indigo-300 font-mono">{settings.globalShortcuts.stopRecording}</kbd>
            </div>
          </div>
        </div>

        {/* System & Architecture Info */}
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
            <Monitor className="w-4 h-4 text-emerald-400" /> Environment Information
          </h3>
          {systemInfo && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">OS Platform</span>
                <span className="text-slate-300">{systemInfo.platform}</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Architecture</span>
                <span className="text-slate-300">{systemInfo.arch}</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Node.js</span>
                <span className="text-slate-300">{systemInfo.nodeVersion}</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Electron</span>
                <span className="text-slate-300">{systemInfo.electronVersion}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
