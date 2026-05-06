import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ConfigLoader } from '../../config/loader';

describe('ConfigLoader', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let tempDir: string;

  beforeEach(() => {
    originalEnv = { ...process.env };
    // Clear driftguard-specific env vars to ensure clean state
    delete process.env.MEMGRAPH_USERNAME;
    delete process.env.MEMGRAPH_PASSWORD;
    delete process.env.MEMGRAPH_URI;
    delete process.env.ENGINE_URL;
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'driftguard-test-'));
  });

  afterEach(() => {
    process.env = originalEnv;
    // Clean up temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  const createConfigFile = (content: any, filename = 'config.json'): string => {
    const configDir = path.join(tempDir, '.driftguard');
    fs.mkdirSync(configDir, { recursive: true });
    const configPath = path.join(configDir, filename);
    fs.writeFileSync(configPath, JSON.stringify(content, null, 2));
    return configPath;
  };

  const createEnvFile = (envVars: Record<string, string>): string => {
    const envPath = path.join(tempDir, '.env');
    const content = Object.entries(envVars)
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');
    fs.writeFileSync(envPath, content);
    return envPath;
  };

  it('should load valid config from default location', () => {
    const configData = {
      layers: [],
      analyzer: { fileExtensions: ['ts', 'tsx'] },
      fileDiscovery: { includePatterns: ['**/*.ts'], excludePatterns: [] },
      rules: {},
      database: { uri: 'bolt://localhost:7687' },
      engine: { url: 'http://localhost:3000' },
    };
    createConfigFile(configData);

    // Set required env vars
    createEnvFile({ MEMGRAPH_USERNAME: 'user', MEMGRAPH_PASSWORD: 'pass' });

    const loader = new ConfigLoader(tempDir);
    const config = loader.load();

    expect(config.layers).toEqual([]);
    expect(config.database.uri).toBe('bolt://localhost:7687');
    expect(loader.getDatabaseCredentials()).toEqual({ username: 'user', password: 'pass' });
  });

  it('should throw error if config file not found', () => {
    createEnvFile({ MEMGRAPH_USERNAME: 'user', MEMGRAPH_PASSWORD: 'pass' });

    const loader = new ConfigLoader(tempDir);
    expect(() => loader.load()).toThrow('Configuration file not found');
  });

  it('should throw error on invalid JSON', () => {
    const configDir = path.join(tempDir, '.driftguard');
    fs.mkdirSync(configDir, { recursive: true });
    const configPath = path.join(configDir, 'config.json');
    fs.writeFileSync(configPath, '{ invalid json }');

    createEnvFile({ MEMGRAPH_USERNAME: 'user', MEMGRAPH_PASSWORD: 'pass' });

    const loader = new ConfigLoader(tempDir);
    expect(() => loader.load()).toThrow('Invalid configuration');
  });

  it('should throw error if required credentials missing', () => {
    const configData = {
      layers: [],
      analyzer: { fileExtensions: ['ts'] },
      fileDiscovery: { includePatterns: [], excludePatterns: [] },
      rules: {},
      database: { uri: 'bolt://localhost:7687' },
      engine: { url: 'http://localhost:3000' },
    };
    createConfigFile(configData);
    // No .env file or env vars

    const loader = new ConfigLoader(tempDir);
    expect(() => loader.load()).toThrow('MEMGRAPH_USERNAME is required');
  });

  it('should allow overriding database URI via MEMGRAPH_URI env var', () => {
    const configData = {
      layers: [],
      analyzer: { fileExtensions: ['ts'] },
      fileDiscovery: { includePatterns: [], excludePatterns: [] },
      rules: {},
      database: { uri: 'bolt://localhost:7687' },
      engine: { url: 'http://localhost:3000' },
    };
    createConfigFile(configData);
    createEnvFile({ MEMGRAPH_USERNAME: 'user', MEMGRAPH_PASSWORD: 'pass', MEMGRAPH_URI: 'bolt://other:7688' });

    const loader = new ConfigLoader(tempDir);
    const config = loader.load();

    expect(config.database.uri).toBe('bolt://other:7688');
  });

  it('should allow overriding engine URL via ENGINE_URL env var', () => {
    const configData = {
      layers: [],
      analyzer: { fileExtensions: ['ts'] },
      fileDiscovery: { includePatterns: [], excludePatterns: [] },
      rules: {},
      database: { uri: 'bolt://localhost:7687' },
      engine: { url: 'http://localhost:3000' },
    };
    createConfigFile(configData);
    createEnvFile({ MEMGRAPH_USERNAME: 'user', MEMGRAPH_PASSWORD: 'pass', ENGINE_URL: 'http://other:4000' });

    const loader = new ConfigLoader(tempDir);
    const config = loader.load();

    expect(config.engine.url).toBe('http://other:4000');
  });

  it('should support custom config path via constructor', () => {
    const customPath = path.join(tempDir, 'custom-config.json');
    const configData = {
      layers: [],
      analyzer: { fileExtensions: ['ts'] },
      fileDiscovery: { includePatterns: [], excludePatterns: [] },
      rules: {},
      database: { uri: 'bolt://localhost:7687' },
      engine: { url: 'http://localhost:3000' },
    };
    fs.writeFileSync(customPath, JSON.stringify(configData));
    createEnvFile({ MEMGRAPH_USERNAME: 'u', MEMGRAPH_PASSWORD: 'p' });

    const loader = new ConfigLoader(tempDir, customPath);
    const config = loader.load();

    expect(config.database.uri).toBe('bolt://localhost:7687');
  });

  it('should load .env from workspace root and populate process.env', () => {
    const configData = {
      layers: [],
      analyzer: { fileExtensions: ['ts'] },
      fileDiscovery: { includePatterns: [], excludePatterns: [] },
      rules: {},
      database: { uri: 'bolt://localhost:7687' },
      engine: { url: 'http://localhost:3000' },
    };
    createConfigFile(configData);
    createEnvFile({ MEMGRAPH_USERNAME: 'envuser', MEMGRAPH_PASSWORD: 'envpass', CUSTOM_VAR: 'value' });

    const loader = new ConfigLoader(tempDir);
    loader.load();

    expect(process.env.MEMGRAPH_USERNAME).toBe('envuser');
    expect(process.env.MEMGRAPH_PASSWORD).toBe('envpass');
  });
});
