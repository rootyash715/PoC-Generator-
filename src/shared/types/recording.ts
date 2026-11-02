export type SourceType = 'screen' | 'window' | 'tab';

export interface DesktopSource {
  id: string;
  name: string;
  thumbnailUrl: string;
  type: SourceType;
  appIconUrl?: string;
}

export interface AudioDevice {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'audiooutput';
}

export interface VideoDevice {
  deviceId: string;
  label: string;
}

export interface RecordingOptions {
  sourceId: string;
  sourceType: SourceType;
  audioInputId?: string;
  includeSystemAudio: boolean;
  webcamDeviceId?: string;
  webcamShape: 'circle' | 'rounded-rect' | 'square';
  webcamSize: 'small' | 'medium' | 'large';
  frameRate: 30 | 60;
  resolution: '720p' | '1080p' | '1440p' | '4K';
}

export interface RecordingStatus {
  isRecording: boolean;
  isPaused: boolean;
  durationSeconds: number;
  currentSource?: DesktopSource;
  micActive: boolean;
  systemAudioActive: boolean;
  webcamActive: boolean;
  error?: string;
}
