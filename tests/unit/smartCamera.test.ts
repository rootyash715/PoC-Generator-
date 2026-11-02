import { describe, it, expect } from 'vitest';
import { computeSmartCameraKeyframes } from '../../src/shared/cameraEngine';
import { CursorEvent } from '../../src/shared/types/cursor';
import { SmartZoomSettings } from '../../src/shared/types/camera';

describe('Smart Camera Engine', () => {
  const defaultSettings: SmartZoomSettings = {
    enabled: true,
    maxZoom: 1.5,
    focusMode: 'Smart',
    transition: 'Normal',
    focusDelay: 'Medium',
    cameraSmoothing: 50,
    deadZoneRadius: 20
  };

  const screen = { width: 1920, height: 1080 };

  it('handles user prompt test case correctly without jitter or instantaneous jumps', () => {
    const testEvents: CursorEvent[] = [
      { timestamp: 0, x: 900, y: 500, event: 'move' },
      { timestamp: 1, x: 900, y: 500, event: 'move' },
      { timestamp: 2, x: 910, y: 505, event: 'move' }, // minor shift within deadzone
      { timestamp: 3, x: 1300, y: 700, event: 'move' },
      { timestamp: 4, x: 1300, y: 700, event: 'move' }
    ];

    const keyframes = computeSmartCameraKeyframes(testEvents, screen, defaultSettings);

    expect(keyframes).toHaveLength(5);

    // t=0
    expect(keyframes[0].zoom).toBeGreaterThanOrEqual(1.0);

    // t=1 to t=2 (minor movement 900,500 -> 910,505 should not cause camera jitter)
    const posT1 = keyframes[1];
    const posT2 = keyframes[2];
    const shift = Math.sqrt(Math.pow(posT2.x - posT1.x, 2) + Math.pow(posT2.y - posT1.y, 2));
    expect(shift).toBeLessThan(25);

    // t=3 (large movement toward 1300, 700 should be smooth, not instantaneous teleport)
    const posT3 = keyframes[3];
    expect(posT3.x).toBeLessThan(1300); // smooth panning in progress

    // Camera must stay within 1920x1080 bounds
    keyframes.forEach((kf) => {
      const minX = screen.width / (2 * kf.zoom);
      const maxX = screen.width - minX;
      const minY = screen.height / (2 * kf.zoom);
      const maxY = screen.height - minY;

      expect(kf.x).toBeGreaterThanOrEqual(minX);
      expect(kf.x).toBeLessThanOrEqual(maxX);
      expect(kf.y).toBeGreaterThanOrEqual(minY);
      expect(kf.y).toBeLessThanOrEqual(maxY);
    });
  });
});
