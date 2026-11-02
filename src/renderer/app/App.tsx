import React, { useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { Home } from '../pages/Home';
import { NewRecording } from '../pages/NewRecording';
import { Recorder } from '../pages/Recorder';
import { Preview } from '../pages/Preview';
import { Editor } from '../pages/Editor';
import { Library } from '../pages/Library';
import { Settings } from '../pages/Settings';

export const App: React.FC = () => {
  const { currentPage, setSystemInfo, setSettings } = useAppStore();

  useEffect(() => {
    if (window.electronAPI?.getSystemInfo) {
      window.electronAPI.getSystemInfo().then((info) => {
        setSystemInfo(info);
      });
    }
    if (window.electronAPI?.getSettings) {
      window.electronAPI.getSettings().then((st) => {
        if (st) setSettings(st);
      });
    }
  }, [setSystemInfo, setSettings]);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'new-recording':
        return <NewRecording />;
      case 'recorder':
        return <Recorder />;
      case 'preview':
        return <Preview />;
      case 'editor':
        return <Editor />;
      case 'library':
        return <Library />;
      case 'settings':
        return <Settings />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden relative">{renderCurrentPage()}</main>
      </div>
    </div>
  );
};

export default App;
