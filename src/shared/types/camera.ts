export type FocusMode = 'Cursor' | 'Click' | 'Smart';
export type TransitionSpeed = 'Fast' | 'Normal' | 'Smooth';
export type FocusDelay = 'Short' | 'Medium' | 'Long';

export interface CameraKeyframe {
  id: string;
  time: number; // in seconds
  x: number; // center target X
  y: number; // center target Y
  zoom: number; // e.g. 1.0, 1.25, 1.5, 2.0
  duration?: number; // transition duration in seconds
  isManual?: boolean;
}

export interface SmartZoomSettings {
  enabled: boolean;
  maxZoom: number; // e.g., 1.5, 2.0
  focusMode: FocusMode;
  transition: TransitionSpeed;
  focusDelay: FocusDelay;
  cameraSmoothing: number; // 0 to 100
  deadZoneRadius: number; // in pixels
}
