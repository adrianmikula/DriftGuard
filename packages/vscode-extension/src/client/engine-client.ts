import { ScanResult, RuleViolation } from '@driftguard/core-engine';

export interface ScanRequest {
  workspacePath: string;
  language: string;
  files: string[];
}

export class EngineClient {
  private engineUrl: string;

  constructor(engineUrl: string = 'http://localhost:3000') {
    this.engineUrl = engineUrl;
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
