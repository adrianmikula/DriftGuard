export interface ScanRequest {
  workspacePath: string;
  language: string;
  files: string[];
}

export interface RuleViolation {
  ruleId: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  location: {
    file: string;
    line?: number;
    column?: number;
  };
  metadata?: Record<string, any>;
}

export interface ScanResult {
  success: boolean;
  violations: RuleViolation[];
  metrics: {
    filesScanned: number;
    nodesCreated: number;
    edgesCreated: number;
    duration: number;
  };
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
    this.engineUrl = engineUrl || 'http://localhost:3000';
    this.timeoutMs = timeoutMs || 30000;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const status = await this.getEngineStatus();
      return status.status === 'healthy';
    } catch {
      return false;
    }
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
    return this.httpGet<{ nodesCreated: number; edgesCreated: number }>('/api/metrics/json');
  }
}
