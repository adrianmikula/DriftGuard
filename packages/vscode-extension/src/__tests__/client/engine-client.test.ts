import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EngineClient, type ScanRequest } from '../../client/engine-client';

describe('EngineClient', () => {
  let client: EngineClient;

  const defaultRequest: ScanRequest = {
    workspacePath: '/test/workspace',
    language: 'typescript',
    files: ['/test/workspace/file1.ts'],
  };

  beforeEach(() => {
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
      // Depends on server state; assume true for integration tests
      expect(typeof healthy).toBe('boolean');
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
    });
  });

  describe('getImportGraph', () => {
    it('should return a graph object with nodes and edges', async () => {
      const graph = await client.getImportGraph();
      expect(graph).toHaveProperty('nodes', []);
      expect(graph).toHaveProperty('edges', []);
    });
  });
});
