export type ExportFormat = 'mp4' | 'webm';
export type ExportResolution = '720p' | '1080p' | '1440p' | '4K';
export type ExportFps = 30 | 60;

export interface ExportSettings {
  format: ExportFormat;
  resolution: ExportResolution;
  fps: ExportFps;
  codec: 'h264' | 'vp9';
  outputPath: string;
}

export interface ExportJob {
  id: string;
  projectId: string;
  progressPercentage: number;
  status: 'idle' | 'rendering' | 'completed' | 'failed' | 'cancelled';
  error?: string;
  elapsedSeconds: number;
  estimatedRemainingSeconds?: number;
}
