#!/usr/bin/env node

import fg from 'fast-glob';
import { GraphClient } from '../graph/client';
import { GraphModel } from '../graph/model';
import { RuleEngine } from '../rules';
import { ScannerOrchestrator } from '../scanner';
import { ConfigLoader } from '../config';
import { TypeScriptAnalyzer } from '@driftguard/language-typescript';
import { type LanguageAnalyzer } from '../scanner';
import type { Config } from '../config/schema';
import { startServer, createServer } from '../server';
import { MockGraphModel } from '../stubs/mock-graph';

async function runScan(
  workspacePath: string,
  configPath?: string,
  files?: string[]
): Promise<void> {
  let config: Config;
  let credentials: { username: string; password: string };

  try {
    const loader = new ConfigLoader(workspacePath, configPath);
    config = loader.load();
    credentials = loader.getDatabaseCredentials();
    console.log('Configuration loaded successfully');
  } catch (error: any) {
    console.error('Configuration error:', error.message);
    process.exit(1);
  }

  // Discover files using configured patterns (or use provided files)
  let discoveredFiles: string[];
  try {
    discoveredFiles = await fg(config.fileDiscovery.includePatterns, {
      cwd: workspacePath,
      absolute: true,
      ignore: config.fileDiscovery.excludePatterns,
    });
    console.log(`Discovered ${discoveredFiles.length} files`);
  } catch (error: any) {
    console.error('File discovery error:', error.message);
    process.exit(1);
  }

  const fileList = files || discoveredFiles;

  // Initialize graph client or use mock if database unavailable
  let graph: any;
  try {
    const client = new GraphClient({
      uri: config.database.uri,
      username: credentials.username,
      password: credentials.password,
    });

    await client.connect();
    console.log('Connected to database');

    graph = new GraphModel(client);
    await graph.initializeSchema();
    console.log('Graph schema initialized');
  } catch (dbError) {
    console.log('Database connection failed, using mock graph for testing:', (dbError as Error).message);
    graph = new MockGraphModel();
  }

  // Build rule config for RuleEngine from config.rules
  const ruleConfigs: Record<string, { enabled: boolean; severity: 'error' | 'warning' | 'info' }> = {};
  for (const [id, rc] of Object.entries(config.rules)) {
    ruleConfigs[id] = { enabled: rc.enabled, severity: rc.severity };
  }

  const ruleEngine = new RuleEngine(ruleConfigs);
  const orchestrator = new ScannerOrchestrator(graph, ruleEngine);

  // Create and register TypeScript analyzer
  const analyzer = new TypeScriptAnalyzer(undefined, {
    layers: config.layers,
    fileExtensions: config.analyzer.fileExtensions,
  });
  orchestrator.registerAnalyzer(analyzer as unknown as LanguageAnalyzer);

  // Register rules based on analyzer and config
  if (config.rules['boundary-violation']?.enabled !== false) {
    ruleEngine.registerRule(analyzer.getBoundaryViolationRule());
  }
  if (config.rules['circular-dependency']?.enabled !== false) {
    ruleEngine.registerRule(analyzer.getCircularDependencyRule());
  }

  const context = {
    workspacePath,
    language: 'typescript',
    files: fileList,
  };

  console.log(`Scanning workspace: ${workspacePath}`);
  const startTime = Date.now();
  const result = await orchestrator.scan(context);
  const duration = Date.now() - startTime;

  console.log('\nScan Results:');
  console.log(`Success: ${result.success}`);
  console.log(`Files scanned: ${result.metrics.filesScanned}`);
  console.log(`Nodes created: ${result.metrics.nodesCreated}`);
  console.log(`Edges created: ${result.metrics.edgesCreated}`);
  console.log(`Duration: ${duration}ms`);
  console.log(`Violations: ${result.violations.reduce((sum, r) => sum + r.violations.length, 0)}`);

  if (!result.success) {
    process.exit(1);
  }
}

function runServer(
  port: number,
  host: string,
  workspacePath?: string
): void {
  async function initAndStart(): Promise<void> {
    // Use provided workspace path or current working directory
    const wsPath = workspacePath || process.cwd();

    let config: Config;
    let credentials: { username: string; password: string };

    try {
      const loader = new ConfigLoader(wsPath);
      config = loader.load();
      credentials = loader.getDatabaseCredentials();
      console.log('Configuration loaded successfully');
    } catch (error: any) {
      console.error('Configuration error:', error.message);
      process.exit(1);
    }

    // Discover files (for potential background refresh, not used immediately)
    try {
      await fg(config.fileDiscovery.includePatterns, {
        cwd: workspacePath,
        absolute: true,
        ignore: config.fileDiscovery.excludePatterns,
      });
      // Files discovered but not used in server mode; scans are triggered via HTTP
    } catch (error: any) {
      console.error('File discovery error:', error.message);
      process.exit(1);
    }

    // Initialize graph client or use mock if database unavailable
    let graph: any;
    try {
      const client = new GraphClient({
        uri: config.database.uri,
        username: credentials.username,
        password: credentials.password,
      });

      await client.connect();
      console.log('Connected to database');

      graph = new GraphModel(client);
      await graph.initializeSchema();
      console.log('Graph schema initialized');
    } catch (dbError) {
      console.log('Database connection failed, using mock graph for testing:', (dbError as Error).message);
      graph = new MockGraphModel();
    }

    // Build rule engine
    const ruleConfigs: Record<string, { enabled: boolean; severity: 'error' | 'warning' | 'info' }> = {};
    for (const [id, rc] of Object.entries(config.rules)) {
      ruleConfigs[id] = { enabled: rc.enabled, severity: rc.severity };
    }

    const ruleEngine = new RuleEngine(ruleConfigs);
    const orchestrator = new ScannerOrchestrator(graph, ruleEngine);

    // Register TypeScript analyzer
    const analyzer = new TypeScriptAnalyzer(undefined, {
      layers: config.layers,
      fileExtensions: config.analyzer.fileExtensions,
    });
    orchestrator.registerAnalyzer(analyzer as unknown as LanguageAnalyzer);

    // Register rules
    if (config.rules['boundary-violation']?.enabled !== false) {
      ruleEngine.registerRule(analyzer.getBoundaryViolationRule());
    }
    if (config.rules['circular-dependency']?.enabled !== false) {
      ruleEngine.registerRule(analyzer.getCircularDependencyRule());
    }

    // Start HTTP server
    startServer(orchestrator, graph, { port, host });
  }

  initAndStart().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: driftguard <workspace-path> [--config <config-path>] [--server] [--port <port>]');
    process.exit(1);
  }

  let configPath: string | undefined;
  let workspacePath = args[0];
  let serverMode = false;
  let port = 3000;
  let i = 1;

  while (i < args.length) {
    const arg = args[i];
    if (arg === '--config') {
      if (i + 1 >= args.length) {
        console.error('Missing argument for --config');
        process.exit(1);
      }
      configPath = args[i + 1];
      i += 2;
    } else if (arg === '--server') {
      serverMode = true;
      i++;
    } else if (arg === '--port') {
      if (i + 1 >= args.length) {
        console.error('Missing argument for --port');
        process.exit(1);
      }
      port = parseInt(args[i + 1], 10);
      i += 2;
    } else {
      console.error(`Unknown argument: ${arg}`);
      process.exit(1);
    }
  }

  if (serverMode) {
    runServer(port, 'localhost', workspacePath);
  } else {
    await runScan(workspacePath, configPath);
  }
}

main();
