import React from 'react';
import { useAppStore, ActivePage } from '../../stores/useAppStore';
import { Home, Video, PlaySquare, Film, Folder, Settings, Sparkles } from 'lucide-react';

interface NavItem {
  id: ActivePage;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'new-recording', label: 'New Recording', icon: Video },
  { id: 'recorder', label: 'Recorder', icon: PlaySquare },
  { id: 'preview', label: 'Preview', icon: Film },
  { id: 'editor', label: 'Video Editor', icon: Sparkles },
  { id: 'library', label: 'Library', icon: Folder },
  { id: 'settings', label: 'Settings', icon: Settings }
];

export const Sidebar: React.FC = () => {
  const { currentPage, setCurrentPage } = useAppStore();

  return (
    <aside className="w-64 glass-panel border-r border-slate-800 flex flex-col justify-between h-full p-4 z-20">
      <div>
        <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800/80">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-100 tracking-tight leading-none">TraceCam</h1>
            <p className="text-xs text-indigo-400 font-medium mt-1">Screen & Camera Studio</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/60">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Engine Status</span>
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Ready
          </span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1">v0.1.0 (Phase 0 Scaffold)</div>
      </div>
    </aside>
  );
};
