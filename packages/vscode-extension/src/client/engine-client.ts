import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';

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

  private async httpRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST',
    body?: unknown
  ): Promise<T> {
    const url = new URL(endpoint, this.engineUrl);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const options: http.RequestOptions = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers,
      timeout: this.timeoutMs,
    };

    return new Promise((resolve, reject) => {
      const req = client.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsed = JSON.parse(data);
              resolve(parsed as T);
            } catch (e) {
              reject(new Error(`Invalid JSON response: ${e}`));
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Connection failed: ${error.message}. Is the engine server running at ${this.engineUrl}?`));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout after ${this.timeoutMs}ms`));
      });

      if (body) {
        req.write(JSON.stringify(body));
      }

      req.end();
    });
  }

  private async httpPost<T>(endpoint: string, body: unknown): Promise<T> {
    return this.httpRequest<T>(endpoint, 'POST', body);
  }

  private async httpGet<T>(endpoint: string): Promise<T> {
    return this.httpRequest<T>(endpoint, 'GET');
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
