export type TrackType = 'VIDEO' | 'AUDIO' | 'CAMERA' | 'CURSOR' | 'WEBCAM' | 'EFFECTS';

export interface TimelineClip {
  id: string;
  track: TrackType;
  startTime: number; // position on timeline
  duration: number; // clip duration
  sourceStartTime: number; // start offset in raw recording
  filePath?: string;
  title: string;
}

export interface TimelineState {
  currentTime: number;
  duration: number;
  zoomLevel: number;
  isPlaying: boolean;
  selectedClipId?: string;
  clips: TimelineClip[];
}
