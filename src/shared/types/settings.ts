export type ThemeMode = 'light' | 'dark' | 'system';

export interface ApplicationSettings {
  theme: ThemeMode;
  storageDirectory: string;
  defaultFps: 30 | 60;
  defaultResolution: '720p' | '1080p' | '1440p' | '4K';
  globalShortcuts: {
    startRecording: string;
    stopRecording: string;
    pauseResume: string;
    takeScreenshot: string;
  };
  hardwareAcceleration: boolean;
}
