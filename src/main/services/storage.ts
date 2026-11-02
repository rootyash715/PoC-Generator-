import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { Project, ProjectMetadata } from '../../shared/types/project';
import { ApplicationSettings } from '../../shared/types/settings';
import { isPathSafe } from '../security/ipcSecurity';

export class StorageService {
  private baseDir: string;
  private projectsDir: string;
  private settingsFile: string;

  constructor() {
    const userData = app?.getPath ? app.getPath('userData') : process.cwd();
    this.baseDir = path.join(userData, 'TraceCamData');
    this.projectsDir = path.join(this.baseDir, 'Projects');
    this.settingsFile = path.join(this.baseDir, 'settings.json');
    this.initDirectories();
  }

  private initDirectories() {
    if (!fs.existsSync(this.baseDir)) fs.mkdirSync(this.baseDir, { recursive: true });
    if (!fs.existsSync(this.projectsDir)) fs.mkdirSync(this.projectsDir, { recursive: true });
  }

  public getProjectsDir(): string {
    return this.projectsDir;
  }

  public getProjects(): ProjectMetadata[] {
    try {
      if (!fs.existsSync(this.projectsDir)) return [];
      const folders = fs.readdirSync(this.projectsDir, { withFileTypes: true });
      const projects: ProjectMetadata[] = [];

      for (const folder of folders) {
        if (folder.isDirectory()) {
          const metaPath = path.join(this.projectsDir, folder.name, 'project.json');
          if (fs.existsSync(metaPath)) {
            const raw = fs.readFileSync(metaPath, 'utf-8');
            const projectData = JSON.parse(raw) as Project;
            if (projectData.metadata) {
              projects.push(projectData.metadata);
            }
          }
        }
      }
      return projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch (err) {
      console.error('Failed to list projects:', err);
      return [];
    }
  }

  public getProject(projectId: string): Project | null {
    try {
      const projectFolder = path.join(this.projectsDir, projectId);
      if (!isPathSafe(projectFolder, this.projectsDir)) return null;
      const metaPath = path.join(projectFolder, 'project.json');
      if (!fs.existsSync(metaPath)) return null;
      const raw = fs.readFileSync(metaPath, 'utf-8');
      return JSON.parse(raw) as Project;
    } catch (err) {
      console.error(`Failed to load project ${projectId}:`, err);
      return null;
    }
  }

  public saveProject(project: Project): boolean {
    try {
      const projectFolder = path.join(this.projectsDir, project.metadata.id);
      if (!isPathSafe(projectFolder, this.projectsDir)) return false;
      if (!fs.existsSync(projectFolder)) {
        fs.mkdirSync(projectFolder, { recursive: true });
      }
      const metaPath = path.join(projectFolder, 'project.json');
      fs.writeFileSync(metaPath, JSON.stringify(project, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('Failed to save project:', err);
      return false;
    }
  }

  public deleteProject(projectId: string): boolean {
    try {
      const projectFolder = path.join(this.projectsDir, projectId);
      if (!isPathSafe(projectFolder, this.projectsDir)) return false;
      if (fs.existsSync(projectFolder)) {
        fs.rmSync(projectFolder, { recursive: true, force: true });
      }
      return true;
    } catch (err) {
      console.error(`Failed to delete project ${projectId}:`, err);
      return false;
    }
  }

  public getSettings(): ApplicationSettings {
    const defaultSettings: ApplicationSettings = {
      theme: 'dark',
      storageDirectory: this.projectsDir,
      defaultFps: 60,
      defaultResolution: '1080p',
      globalShortcuts: {
        startRecording: 'CommandOrControl+Shift+R',
        stopRecording: 'CommandOrControl+Shift+S',
        pauseResume: 'CommandOrControl+Shift+P',
        takeScreenshot: 'CommandOrControl+Shift+C'
      },
      hardwareAcceleration: true
    };

    try {
      if (fs.existsSync(this.settingsFile)) {
        const raw = fs.readFileSync(this.settingsFile, 'utf-8');
        return { ...defaultSettings, ...JSON.parse(raw) };
      }
    } catch (err) {
      console.error('Failed to read settings:', err);
    }
    return defaultSettings;
  }

  public saveSettings(settings: ApplicationSettings): boolean {
    try {
      fs.writeFileSync(this.settingsFile, JSON.stringify(settings, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('Failed to save settings:', err);
      return false;
    }
  }
}
