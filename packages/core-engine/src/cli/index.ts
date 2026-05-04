#!/usr/bin/env node

import fg from 'fast-glob';
import { GraphClient } from '../graph/client';
import { GraphModel } from '../graph/model';
import { RuleEngine } from '../rules';
import { ScannerOrchestrator } from '../scanner';
import { ConfigLoader } from '../config';
import { TypeScriptAnalyzer } from '@driftguard/language-typescript';
import type { Config } from '../config/schema';

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments: driftguard <workspace-path> [--config <config-path>]
  if (args.length === 0) {
    console.error('Usage: driftguard <workspace-path> [--config <config-path>]');
    process.exit(1);
  }

  let configPath?: string;
  let workspacePath = args[0];
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
    } else {
      console.error(`Unknown argument: ${arg}`);
      process.exit(1);
    }
  }

  let config: Config;
  let credentials: { username: string; password: string };

  try {
    // Load configuration
    const loader = new ConfigLoader(workspacePath, configPath);
    config = loader.load();
    credentials = loader.getDatabaseCredentials();
    console.log('Configuration loaded successfully');
  } catch (error: any) {
    console.error('Configuration error:', error.message);
    process.exit(1);
  }

  // Discover files using configured patterns
  let files: string[];
  try {
    files = await fg(config.fileDiscovery.includePatterns, {
      cwd: workspacePath,
      absolute: true,
      ignore: config.fileDiscovery.excludePatterns,
    });
    console.log(`Discovered ${files.length} files`);
  } catch (error: any) {
    console.error('File discovery error:', error.message);
    process.exit(1);
  }

  // Initialize graph client
  const client = new GraphClient({
    uri: config.database.uri,
    username: credentials.username,
    password: credentials.password,
  });

  try {
    await client.connect();
    console.log('Connected to Memgraph');

    const graph = new GraphModel(client);
    await graph.initializeSchema();
    console.log('Graph schema initialized');

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
    orchestrator.registerAnalyzer(analyzer);

    // Register rules based on analyzer and config
    if (config.rules['boundary-violation']?.enabled !== false) {
      ruleEngine.registerRule(analyzer.getBoundaryViolationRule());
    }
    if (config.rules['circular-dependency']?.enabled !== false) {
      ruleEngine.registerRule(analyzer.getCircularDependencyRule());
    }

    const context: ScanContext = {
      workspacePath,
      language: 'typescript',
      files,
    };

    console.log(`Scanning workspace: ${workspacePath}`);
    const startTime = Date.now();
    const result = await orchestrator.scan(context);
    const duration = Date.now() - startTime;

    console.log('\nScan Results:');
    console.log(`Success: ${result.success}`);
    console.log(`Files scanned: ${result.metrics.filesScanned}`);
    console.log(`Duration: ${duration}ms`);
    console.log(`Violations: ${result.violations.reduce((sum, r) => sum + r.violations.length, 0)}`);

    if (!result.success) {
      process.exit(1);
    }

  } catch (error: any) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
