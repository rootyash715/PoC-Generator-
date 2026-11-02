import { CursorEvent } from './types/cursor';
import { CameraKeyframe, SmartZoomSettings } from './types/camera';

export interface ViewportBounds {
  width: number;
  height: number;
}

export function computeSmartCameraKeyframes(
  events: CursorEvent[],
  screen: ViewportBounds,
  settings: SmartZoomSettings
): CameraKeyframe[] {
  if (events.length === 0) return [];

  const keyframes: CameraKeyframe[] = [];
  let currentX = screen.width / 2;
  let currentY = screen.height / 2;
  let currentZoom = 1.0;

  for (let i = 0; i < events.length; i++) {
    const ev = events[i];

    // Check for jitter around focus zone
    const dx = ev.x - currentX;
    const dy = ev.y - currentY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Apply dead zone threshold to prevent camera jitter
    let targetX = currentX;
    let targetY = currentY;
    let targetZoom = currentZoom;

    if (distance > settings.deadZoneRadius) {
      // Smooth interpolation (no instantaneous jump)
      const smoothingFactor = Math.max(0.1, 1 - settings.cameraSmoothing / 100);
      targetX = currentX + dx * smoothingFactor;
      targetY = currentY + dy * smoothingFactor;
      targetZoom = settings.enabled ? settings.maxZoom : 1.0;
    }

    // Clamp camera within valid video boundaries
    const halfWidth = screen.width / (2 * targetZoom);
    const halfHeight = screen.height / (2 * targetZoom);

    const clampedX = Math.max(halfWidth, Math.min(screen.width - halfWidth, targetX));
    const clampedY = Math.max(halfHeight, Math.min(screen.height - halfHeight, targetY));

    currentX = clampedX;
    currentY = clampedY;
    currentZoom = targetZoom;

    keyframes.push({
      id: `kf_${i}_${ev.timestamp}`,
      time: ev.timestamp,
      x: clampedX,
      y: clampedY,
      zoom: targetZoom
    });
  }

  return keyframes;
}
