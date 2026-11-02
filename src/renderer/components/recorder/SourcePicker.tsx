import React, { useEffect, useState } from 'react';
import { Monitor, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { DesktopSource } from '@shared/types/recording';

interface SourcePickerProps {
  onSelect: (source: DesktopSource) => void;
  selectedId?: string;
}

export const SourcePicker: React.FC<SourcePickerProps> = ({ onSelect, selectedId }) => {
  const [sources, setSources] = useState<DesktopSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSources = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI?.getDesktopSources();
      if (!result?.success || !result.sources) {
        throw new Error(result?.error || 'Failed to enumerate desktop sources');
      }
      if (result.sources.length === 0) {
        throw new Error('No capturable display source was found.');
      }
      setSources(result.sources);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSources(); }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-slate-400 text-sm py-6">
        <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
        Enumerating available display sources…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-3">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">Source Enumeration Failed</p>
          <p className="text-xs text-red-400 mt-1">{error}</p>
          <button
            onClick={fetchSources}
            className="mt-2 px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">{sources.length} source{sources.length !== 1 ? 's' : ''} available</p>
        <button onClick={fetchSources} className="text-xs text-brand-400 hover:text-brand-300">Refresh</button>
      </div>

      <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
        {sources.map((src) => {
          const isSelected = src.id === selectedId;
          return (
            <button
              key={src.id}
              onClick={() => onSelect(src)}
              className={`relative rounded-xl overflow-hidden border-2 text-left transition-all group ${
                isSelected
                  ? 'border-brand-500 shadow-lg shadow-brand-500/20'
                  : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-slate-900 relative">
                {src.thumbnailUrl ? (
                  <img
                    src={src.thumbnailUrl}
                    alt={src.name}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Monitor className="w-8 h-8 text-slate-600" />
                  </div>
                )}
                {isSelected && (
                  <div className="absolute inset-0 bg-brand-500/20 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-brand-400" />
                  </div>
                )}
              </div>
              {/* Label */}
              <div className="px-2 py-1.5 bg-slate-900/90">
                <p className="text-xs font-medium text-slate-200 truncate">{src.name}</p>
                <p className="text-[10px] text-slate-500 capitalize">{src.type}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
