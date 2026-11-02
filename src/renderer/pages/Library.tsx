import React from 'react';
import { Search, Play } from 'lucide-react';

export const Library: React.FC = () => {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Project Library</h2>
          <p className="text-xs text-slate-400 mt-1">Manage, open, edit, or export your saved screen recordings.</p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search recordings..."
            className="pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Empty State / Mock Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-xl overflow-hidden border border-slate-800 hover:border-brand-500/40 transition-all group">
          <div className="aspect-video bg-slate-900 relative flex items-center justify-center">
            <span className="text-xs text-slate-500 font-mono">1920 × 1080</span>
            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button className="p-2 rounded-full bg-brand-600 text-white shadow-lg">
                <Play className="w-4 h-4 fill-white" />
              </button>
            </div>
          </div>
          <div className="p-4 space-y-2">
            <h4 className="font-semibold text-slate-200 text-sm">Demo Recording 01</h4>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>00:01:20</span>
              <span>12.4 MB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
