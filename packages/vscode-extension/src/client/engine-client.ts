import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ScanResult, RuleViolation } from '@driftguard/core-engine';

export interface ScanRequest {
  workspacePath: string;
  language: string;
  files: string[];
}

export class EngineClient {
  private engineUrl: string;

  constructor(engineUrl?: string) {
    this.engineUrl = this.resolveEngineUrl(engineUrl);
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
      } catch (error) {
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

  async scan(request: ScanRequest): Promise<ScanResult> {
    // TODO: Implement actual HTTP/IPC communication with core engine
    // For now, return a mock result
    return {
      success: true,
      violations: [],
      metrics: {
        filesScanned: request.files.length,
        nodesCreated: 0,
        edgesCreated: 0,
        duration: 0,
      },
    };
  }

  async getViolations(): Promise<RuleViolation[]> {
    // TODO: Implement actual HTTP/IPC communication
    return [];
  }

  async getImportGraph(): Promise<any> {
    // TODO: Implement actual HTTP/IPC communication
    return { nodes: [], edges: [] };
  }
}
