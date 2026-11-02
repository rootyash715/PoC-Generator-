import React from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { ShieldCheck, Monitor } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentPage, systemInfo } = useAppStore();

  const titleMap: Record<string, string> = {
    home: 'Studio Dashboard',
    'new-recording': 'New Recording Setup',
    recorder: 'Screen & Camera Recorder',
    preview: 'Recording Preview',
    editor: 'Smart Zoom & Timeline Editor',
    library: 'Recording Library',
    settings: 'Application Settings'
  };

  return (
    <header className="h-16 glass-panel border-b border-slate-800 flex items-center justify-between px-6 z-10">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-slate-100">{titleMap[currentPage] || 'TraceCam'}</h2>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Security Sandbox Active</span>
        </div>

        {systemInfo && (
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <Monitor className="w-3.5 h-3.5 text-slate-400" />
            <span className="capitalize">{systemInfo.platform} ({systemInfo.arch})</span>
          </div>
        )}
      </div>
    </header>
  );
};
