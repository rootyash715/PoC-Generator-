import { CursorEvent, CursorSettings } from './cursor';
import { CameraKeyframe, SmartZoomSettings } from './camera';
import { TimelineClip } from './timeline';

export interface ProjectMetadata {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  durationSeconds: number;
  width: number;
  height: number;
  fps: number;
  fileSize: number;
  thumbnailPath: string;
  projectFolderPath: string;
}

export interface Project {
  metadata: ProjectMetadata;
  rawVideoPath: string;
  rawAudioPath?: string;
  webcamVideoPath?: string;
  cursorEvents: CursorEvent[];
  cameraKeyframes: CameraKeyframe[];
  cursorSettings: CursorSettings;
  smartZoomSettings: SmartZoomSettings;
  timelineClips: TimelineClip[];
}
