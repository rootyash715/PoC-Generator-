import { create } from 'zustand';
import { ProjectMetadata, Project } from '../../shared/types/project';
import { ApplicationSettings } from '../../shared/types/settings';

export type ActivePage = 'home' | 'new-recording' | 'recorder' | 'preview' | 'editor' | 'library' | 'settings';

interface AppStore {
  currentPage: ActivePage;
  setCurrentPage: (page: ActivePage) => void;

  projects: ProjectMetadata[];
  setProjects: (projects: ProjectMetadata[]) => void;
  activeProject: Project | null;
  setActiveProject: (project: Project | null) => void;

  settings: ApplicationSettings;
  setSettings: (settings: ApplicationSettings) => void;

  systemInfo: { platform: string; arch: string; nodeVersion: string; electronVersion: string } | null;
  setSystemInfo: (info: { platform: string; arch: string; nodeVersion: string; electronVersion: string }) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  currentPage: 'home',
  setCurrentPage: (page) => set({ currentPage: page }),

  projects: [],
  setProjects: (projects) => set({ projects }),
  activeProject: null,
  setActiveProject: (project) => set({ activeProject: project }),

  settings: {
    theme: 'dark',
    storageDirectory: '',
    defaultFps: 60,
    defaultResolution: '1080p',
    globalShortcuts: {
      startRecording: 'CommandOrControl+Shift+R',
      stopRecording: 'CommandOrControl+Shift+S',
      pauseResume: 'CommandOrControl+Shift+P',
      takeScreenshot: 'CommandOrControl+Shift+C'
    },
    hardwareAcceleration: true
  },
  setSettings: (settings) => set({ settings }),

  systemInfo: null,
  setSystemInfo: (systemInfo) => set({ systemInfo })
}));
