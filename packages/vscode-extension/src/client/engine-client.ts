import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ScanResult, RuleViolation } from '@driftguard/core-engine';

export interface ScanRequest {
  workspacePath: string;
  language: string;
  files: string[];
}

export interface EngineStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
}

export class EngineClient {
  private engineUrl: string;
  private timeoutMs: number;

  constructor(engineUrl?: string, timeoutMs?: number) {
    this.engineUrl = this.resolveEngineUrl(engineUrl);
    this.timeoutMs = this.resolveTimeout(timeoutMs);
  }

  async healthCheck(): Promise<boolean> {
    try {
      const status = await this.getEngineStatus();
      return status.status === 'healthy';
    } catch {
      return false;
    }
  }

  private resolveEngineUrl(provided?: string): string {
    if (provided) {
      return provided;
    }

    // 1. VS Code workspace setting
    const config = vscode.workspace.getConfiguration('driftguard');
    const settingUrl = config.get<string>('engineUrl');
    if (settingUrl) {
      return settingUrl;
    }

    // 2. Config file (.driftguard/config.json)
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
      const workspacePath = workspaceFolders[0].uri.fsPath;
      const configPath = path.join(workspacePath, '.driftguard', 'config.json');
      try {
        if (fs.existsSync(configPath)) {
          const configContent = fs.readFileSync(configPath, 'utf-8');
          const parsed = JSON.parse(configContent);
          if (parsed.engine?.url) {
            return parsed.engine.url;
          }
        }
      } catch {
        // Ignore and fall through
      }
    }

    // 3. Environment variable
    if (process.env.ENGINE_URL) {
      return process.env.ENGINE_URL;
    }

    // 4. Fallback default
    return 'http://localhost:3000';
  }

  private resolveTimeout(provided?: number): number {
    if (provided !== undefined) {
      return provided;
    }

    // 1. VS Code workspace setting
    const config = vscode.workspace.getConfiguration('driftguard');
    const settingTimeout = config.get<number>('timeoutMs');
    if (settingTimeout) {
      return settingTimeout;
    }

    // 2. Config file (.driftguard/config.json)
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
      const workspacePath = workspaceFolders[0].uri.fsPath;
      const configPath = path.join(workspacePath, '.driftguard', 'config.json');
      try {
        if (fs.existsSync(configPath)) {
          const configContent = fs.readFileSync(configPath, 'utf-8');
          const parsed = JSON.parse(configContent);
          if (parsed.engine?.timeoutMs) {
            return parsed.engine.timeoutMs;
          }
        }
      } catch {
        // Ignore and fall through
      }
    }

    // 3. Environment variable
    if (process.env.ENGINE_TIMEOUT_MS) {
      return parseInt(process.env.ENGINE_TIMEOUT_MS, 10);
    }

    // 4. Default: 30 seconds
    return 30000;
  }

  private async httpPost<T>(endpoint: string, body: unknown): Promise<T> {
    const url = `${this.engineUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return response.json() as Promise<T>;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeoutMs}ms`);
      }
      throw error;
    }
  }

  private async httpGet<T>(endpoint: string): Promise<T> {
    const url = `${this.engineUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return response.json() as Promise<T>;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeoutMs}ms`);
      }
      throw error;
    }
  }

  async scan(request: ScanRequest): Promise<ScanResult> {
    return this.httpPost<ScanResult>('/api/scan', request);
  }

  async getViolations(): Promise<RuleViolation[]> {
    return this.httpGet<{ violations: RuleViolation[] }>('/api/violations')
      .then(result => result.violations);
  }

  async getImportGraph(): Promise<{ imports: any[] }> {
    return this.httpGet('/api/graph/imports');
  }

  async getEngineStatus(): Promise<EngineStatus> {
    return this.httpGet<EngineStatus>('/api/status');
  }

  async getMetrics(): Promise<{ nodesCreated: number; edgesCreated: number }> {
    return this.httpGet<{ nodesCreated: number; edgesCreated: number }>('/api/metrics');
  }
}
