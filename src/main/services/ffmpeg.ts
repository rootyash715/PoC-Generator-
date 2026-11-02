import { spawn, ChildProcess } from 'child_process';
import events from 'events';

export class FFmpegService extends events.EventEmitter {
  private activeProcess: ChildProcess | null = null;

  public isFFmpegAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const process = spawn('ffmpeg', ['-version']);
        process.on('error', () => resolve(false));
        process.on('exit', (code) => resolve(code === 0));
      } catch {
        resolve(false);
      }
    });
  }

  public runExport(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.activeProcess) {
        return reject(new Error('An export job is already running'));
      }

      // Execute spawn securely without shell: true
      try {
        this.activeProcess = spawn('ffmpeg', args, { shell: false });

        this.activeProcess.stderr?.on('data', (data: Buffer) => {
          const message = data.toString();
          this.emit('log', message);
        });

        this.activeProcess.on('exit', (code) => {
          this.activeProcess = null;
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`FFmpeg process exited with code ${code}`));
          }
        });

        this.activeProcess.on('error', (err) => {
          this.activeProcess = null;
          reject(err);
        });
      } catch (err) {
        this.activeProcess = null;
        reject(err);
      }
    });
  }

  public cancelExport(): void {
    if (this.activeProcess) {
      this.activeProcess.kill('SIGKILL');
      this.activeProcess = null;
    }
  }
}
