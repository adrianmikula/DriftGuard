import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock neo4j-driver before importing GraphClient
vi.mock('neo4j-driver', async () => await import('../../__mocks__/neo4j-driver'));

import { GraphClient } from '../../graph/client';
import { resetMocks, getMockDriver, createDriver } from '../../__mocks__/neo4j-driver';
import { createGraphClientConfig } from '../utils';

describe('GraphClient', () => {
  let client: GraphClient;
  let mockDriver: ReturnType<typeof createDriver>;

  beforeEach(() => {
    resetMocks();
    mockDriver = getMockDriver();
    const config = createGraphClientConfig();
    client = new GraphClient(config);
  });

  describe('connect', () => {
    it('should successfully connect to the database', async () => {
      const verifySpy = vi.spyOn(mockDriver, 'verifyConnectivity');
      await client.connect();
      expect(verifySpy).toHaveBeenCalledOnce();
    });
  });

  describe('executeQuery', () => {
    it('should execute a query and return records', async () => {
      const result = await client.executeQuery('MATCH (n) RETURN n.name');
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('get');
    });

    it('should execute query with parameters', async () => {
      const sessionSpy = vi.spyOn(mockDriver, 'session');
      await client.executeQuery('MATCH (n) WHERE n.name = $name RETURN n', { name: 'test' });
      expect(sessionSpy).toHaveBeenCalledTimes(1);
    });

    it('should close session after query execution', async () => {
      const mockSession = mockDriver.session();
      const closeSpy = vi.spyOn(mockSession, 'close');
      await client.executeQuery('MATCH (n) RETURN n');
      expect(closeSpy).toHaveBeenCalledOnce();
    });
  });

  describe('executeWrite', () => {
    it('should execute a write query without returning data', async () => {
      const session = mockDriver.session();
      const runSpy = vi.spyOn(session, 'run');
      await client.executeWrite('CREATE (n:Node {name: $name})', { name: 'test' });
      expect(runSpy).toHaveBeenCalledOnce();
      expect(session.close).toHaveBeenCalledOnce();
    });
  });

  describe('getDriver', () => {
    it('should return the underlying driver instance', () => {
      const driver = client.getDriver();
      expect(driver).toBeDefined();
    });
  });

  describe('close', () => {
    it('should close the driver connection', async () => {
      const closeSpy = vi.spyOn(mockDriver, 'close');
      await client.close();
      expect(closeSpy).toHaveBeenCalledOnce();
    });
  });
});
