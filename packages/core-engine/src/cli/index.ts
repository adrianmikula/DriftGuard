#!/usr/bin/env node

import { GraphClient } from '../graph/client';
import { GraphModel } from '../graph/model';
import { RuleEngine } from '../rules';
import { ScannerOrchestrator, ScanContext } from '../scanner';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: driftguard <workspace-path>');
    process.exit(1);
  }

  const workspacePath = args[0];

  // Initialize graph client
  const client = new GraphClient({
    uri: process.env.MEMGRAPH_URI || 'bolt://localhost:7687',
    username: process.env.MEMGRAPH_USERNAME || 'memgraph',
    password: process.env.MEMGRAPH_PASSWORD || 'memgraph',
  });

  try {
    await client.connect();
    console.log('Connected to Memgraph');

    const graph = new GraphModel(client);
    await graph.initializeSchema();
    console.log('Graph schema initialized');

    const ruleEngine = new RuleEngine();
    const orchestrator = new ScannerOrchestrator(graph, ruleEngine);

    // TODO: Register language analyzers
    // For now, this is a placeholder

    const context: ScanContext = {
      workspacePath,
      language: 'typescript',
      files: [], // TODO: Discover files
    };

    console.log(`Scanning workspace: ${workspacePath}`);
    const result = await orchestrator.scan(context);

    console.log('\nScan Results:');
    console.log(`Success: ${result.success}`);
    console.log(`Files scanned: ${result.metrics.filesScanned}`);
    console.log(`Duration: ${result.metrics.duration}ms`);
    console.log(`Violations: ${result.violations.length}`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
