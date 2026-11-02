export type CursorEventType = 'move' | 'click' | 'mousedown' | 'mouseup';

export type MouseButton = 'left' | 'right' | 'middle';

export interface CursorEvent {
  timestamp: number; // in seconds from recording start
  x: number; // raw or normalized coordinate X
  y: number; // raw or normalized coordinate Y
  event: CursorEventType;
  button?: MouseButton;
}

export interface CursorSettings {
  visible: boolean;
  scale: number; // 0.5 to 2.0 (50% -> 200%)
  shadow: boolean;
  highlight: boolean;
  highlightColor: string;
  clickRipple: boolean;
  clickRippleColorLeft: string;
  clickRippleColorRight: string;
  smoothing: number; // 0 to 100%
}
