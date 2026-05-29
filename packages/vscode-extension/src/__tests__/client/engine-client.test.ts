import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock vscode module
vi.mock('vscode', () => ({
  workspace: {
    getConfiguration: vi.fn(() => ({
      get: vi.fn(),
    })),
  },
}));

// Shared state to capture request body
let capturedBody: string = '';

// Mock http and https modules using inline factory (no top-level variables)
vi.mock('http', () => {
  const createMockResponse = (statusCode: number, data: any) => {
    const listeners: Record<string, Function[]> = {};
    return {
      statusCode,
      on: (event: string, callback: Function) => {
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push(callback);
        return { on: () => {} };
      },
      _end: () => {
        if (listeners['data']) listeners['data'].forEach(cb => cb(JSON.stringify(data)));
        if (listeners['end']) listeners['end'].forEach(cb => cb());
      },
    };
  };

  const createMockRequest = (options: any, callback: any) => {
    const path = options.path || '/';
    let statusCode = 200;
    let responseData: any = {};
    let requestBody: string = '';

    const res = createMockResponse(statusCode, responseData);
    callback(res);

    return {
      on: () => ({ on: () => {} }),
      write: (data: string) => {
        requestBody += data;
      },
      end: () => {
        let filesCount = 1;
        try {
          const body = JSON.parse(requestBody);
          filesCount = body.files?.length || 1;
        } catch {
          // ignore
        }

        if (path.includes('/api/scan')) {
          responseData = {
            success: true,
            violations: [],
            metrics: { filesScanned: filesCount, nodesCreated: 0, edgesCreated: 0, duration: 0 },
          };
        } else if (path.includes('/api/violations')) {
          responseData = { violations: [] };
        } else if (path.includes('/api/graph/imports')) {
          responseData = { imports: [] };
        } else if (path.includes('/api/status')) {
          responseData = { status: 'healthy', timestamp: new Date().toISOString(), uptime: 0 };
        } else if (path.includes('/api/metrics')) {
          responseData = { nodesCreated: 0, edgesCreated: 0 };
        } else {
          statusCode = 404;
          responseData = 'Not found';
        }

        // Update response with correct data
        const finalRes = createMockResponse(statusCode, responseData);
        callback(finalRes);
        setTimeout(() => finalRes._end(), 0);
      },
    };
  };

  return { request: createMockRequest };
});

vi.mock('https', () => {
  const createMockResponse = (statusCode: number, data: any) => {
    const listeners: Record<string, Function[]> = {};
    return {
      statusCode,
      on: (event: string, callback: Function) => {
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push(callback);
        return { on: () => {} };
      },
      _end: () => {
        if (listeners['data']) listeners['data'].forEach(cb => cb(JSON.stringify(data)));
        if (listeners['end']) listeners['end'].forEach(cb => cb());
      },
    };
  };

  const createMockRequest = (options: any, callback: any) => {
    const path = options.path || '/';
    let statusCode = 200;
    let responseData: any = {};
    let requestBody: string = '';

    const res = createMockResponse(statusCode, responseData);
    callback(res);

    return {
      on: () => ({ on: () => {} }),
      write: (data: string) => {
        requestBody += data;
      },
      end: () => {
        let filesCount = 1;
        try {
          const body = JSON.parse(requestBody);
          filesCount = body.files?.length || 1;
        } catch {
          // ignore
        }

        if (path.includes('/api/scan')) {
          responseData = {
            success: true,
            violations: [],
            metrics: { filesScanned: filesCount, nodesCreated: 0, edgesCreated: 0, duration: 0 },
          };
        } else if (path.includes('/api/violations')) {
          responseData = { violations: [] };
        } else if (path.includes('/api/graph/imports')) {
          responseData = { imports: [] };
        } else if (path.includes('/api/status')) {
          responseData = { status: 'healthy', timestamp: new Date().toISOString(), uptime: 0 };
        } else if (path.includes('/api/metrics')) {
          responseData = { nodesCreated: 0, edgesCreated: 0 };
        } else {
          statusCode = 404;
          responseData = 'Not found';
        }

        // Update response with correct data
        const finalRes = createMockResponse(statusCode, responseData);
        callback(finalRes);
        setTimeout(() => finalRes._end(), 0);
      },
    };
  };

  return { request: createMockRequest };
});

import { EngineClient, type ScanRequest } from '../../client/engine-client';

describe('EngineClient', () => {
  let client: EngineClient;

  const defaultRequest: ScanRequest = {
    workspacePath: '/test/workspace',
    language: 'typescript',
    files: ['/test/workspace/file1.ts'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    client = new EngineClient('http://localhost:3000');
  });

  describe('constructor', () => {
    it('should create instance with default engine URL', () => {
      const defaultClient = new EngineClient();
      expect(defaultClient).toBeInstanceOf(EngineClient);
    });

    it('should create instance with custom engine URL', () => {
      const customClient = new EngineClient('http://custom:4000');
      expect(customClient).toBeInstanceOf(EngineClient);
    });

    it('should accept custom timeout', () => {
      const timeoutClient = new EngineClient('http://localhost:3000', 5000);
      expect(timeoutClient).toBeInstanceOf(EngineClient);
    });
  });

  describe('healthCheck', () => {
    it('should return true when engine is healthy', async () => {
      const healthy = await client.healthCheck();
      expect(healthy).toBe(true);
    });
  });

  describe('scan', () => {
    it('should return a successful ScanResult', async () => {
      const result = await client.scan(defaultRequest);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('violations', []);
      expect(result).toHaveProperty('metrics');
      expect(result.metrics).toHaveProperty('filesScanned', defaultRequest.files.length);
      expect(result.metrics).toHaveProperty('nodesCreated', 0);
      expect(result.metrics).toHaveProperty('edgesCreated', 0);
      expect(result.metrics).toHaveProperty('duration', 0);
    });

    it('should count scanned files correctly', async () => {
      const request = { ...defaultRequest, files: ['a.ts', 'b.ts', 'c.ts'] };
      const result = await client.scan(request);
      expect(result.metrics.filesScanned).toBe(3);
    });

    it('should include file list length in metrics', async () => {
      const result = await client.scan(defaultRequest);
      expect(result.metrics.filesScanned).toBe(defaultRequest.files.length);
    });
  });

  describe('getViolations', () => {
    it('should return an empty array (placeholder)', async () => {
      const violations = await client.getViolations();
      expect(Array.isArray(violations)).toBe(true);
      expect(violations).toHaveLength(0);
    });
  });

  describe('getImportGraph', () => {
    it('should return a graph object with imports', async () => {
      const graph = await client.getImportGraph();
      expect(graph).toHaveProperty('imports');
      expect(graph.imports).toEqual([]);
    });
  });
});
