# DriftGuard

Architectural drift detection engine with VS Code integration.

## Overview

DriftGuard is a modular system for detecting architectural drift in codebases, with initial support for TypeScript and planned support for Python. It uses a graph database as the core source of truth for code architecture relationships.

## Architecture

- **Core Engine**: Scanning engine that orchestrates analysis and manages graph storage
- **Language Modules**: Pluggable analyzers for different languages (TypeScript, Python)
- **VS Code Extension**: IDE integration for real-time drift detection

## Phase 1 Scope

- TypeScript-only analysis
- Import graph extraction
- Circular dependency detection
- Layer boundary violation detection
- Basic drift metrics
- Memgraph graph database backend

## Development

### Setup

Due to Windows symlink limitations, install dependencies in each package individually:

```bash
# Install dependencies for each package
cd packages/core-engine && npm install
cd ../language-typescript && npm install
cd ../language-python && npm install
cd ../vscode-extension && npm install
```

### Configuration

DriftGuard uses two configuration files:

1. **`.env`** – Stores sensitive credentials (never commit to git)
   - `MEMGRAPH_USERNAME` (required)
   - `MEMGRAPH_PASSWORD` (required)
   - `MEMGRAPH_URI` (optional; defaults to `bolt://localhost:7687`)
   - `ENGINE_URL` (optional; defaults to `http://localhost:3000`)

   Copy `.env.example` to `.env` and fill in your credentials.

2. **`.driftguard/config.json`** – Main configuration (committed to repo)
   - Layer definitions (`layers`)
   - Analyzer settings (`analyzer.fileExtensions`)
   - File discovery patterns (`fileDiscovery`)
   - Rule enablement and severity (`rules`)
   - Database URI non-sensitive (`database.uri`)
   - Engine URL (`engine.url`)

   The default config shipped with DriftGuard provides sensible defaults for a typical TypeScript project.

### Running the CLI

```bash
cd packages/core-engine
npm run cli <workspace-path> [--config <custom-config-path>]
```

The CLI loads configuration from the workspace root (or the path specified via `--config`). It requires valid database credentials in the environment (`.env` or exported).

Config precedence: environment variables > `--config` flag > workspace `.driftguard/config.json`.

### VS Code Extension

The extension respects the same configuration file and also supports VS Code workspace settings under the `driftguard.` namespace (e.g., `driftguard.engineUrl`). Settings override config file values.

```json
// .vscode/settings.json
{
  "driftguard.engineUrl": "http://localhost:3000"
}
```

### Building

```bash
# Build individual packages
cd packages/core-engine && npm run build
cd ../language-typescript && npm run build
cd ../language-python && npm run build
cd ../vscode-extension && npm run build
```

### Running the Core Engine CLI

```bash
cd packages/core-engine
npm run cli <workspace-path>
```

Environment variables (optional):
- `MEMGRAPH_URI`: Memgraph connection URI (default: bolt://localhost:7687)
- `MEMGRAPH_USERNAME`: Memgraph username (default: memgraph)
- `MEMGRAPH_PASSWORD`: Memgraph password (default: memgraph)

### VS Code Extension Development

1. Open the `packages/vscode-extension` folder in VS Code
2. Press F5 to launch the extension in a new VS Code window
3. Use the commands from the Command Palette:
   - `DriftGuard: Scan Workspace`
   - `DriftGuard: Scan Current File`

## Testing

DriftGuard uses Vitest for unit testing across all packages. Each package has its own test configuration and test files located in `src/__tests__` directories.

### Running Tests

To run tests for all packages:

```bash
# Run all tests from the root (using workspaces)
npm test
```

To run tests for a specific package:

```bash
# Example: run tests for core-engine only
cd packages/core-engine
npm test
```

#### Fast Test Loop

For rapid development feedback, AI agents can use the **fast test loop** which runs a subset of unit tests that complete in under 10 seconds:

```bash
# Run fast tests only (unit tests without external dependencies)
npm run test:fast
```

The fast test loop includes:
- Core engine unit tests (rules, config) with mocked dependencies
- Language package unit tests (TypeScript rules, analyzer stubs)
- Excludes integration tests, graph client tests, scanner tests, and VS Code extension tests

This provides quick validation during development without waiting for slower integration tests.

### Test Infrastructure

- **Core Engine**: Includes tests for GraphClient (with mocked neo4j-driver), RuleEngine, ScannerOrchestrator, and utility functions
- **VS Code Extension**: Tests for EngineClient, command registration, and ArchitectureTreeProvider (with mocked VS Code API)
- **Language-TypeScript**: Tests for ImportGraphAnalyzer, CircularDependencyRule, and BoundaryViolationRule
- **Language-Python**: Stub tests for Phase 1 (to be expanded in Phase 2)

### Mocking Strategy

- **Neo4j Driver**: Manual mocks in `packages/core-engine/src/__mocks__/neo4j-driver.ts` using Vitest's `vi.mock()`
- **VS Code API**: Manual mocks in `packages/vscode-extension/src/__mocks__/vscode.ts`
- **Test Utilities**: Shared helpers in `packages/core-engine/src/__tests__/utils.ts`

### Coverage

Test coverage reports are generated automatically when running tests. To view the coverage report:

```bash
npm test -- --coverage
```

The HTML report will be available in each package's `coverage/` directory.

## Packages

- `core-engine`: Core scanning engine and graph management
- `vscode-extension`: VS Code extension
- `language-typescript`: TypeScript analyzer
- `language-python`: Python analyzer (stub for Phase 1)

## Next Steps

- Implement HTTP/IPC communication between VS Code extension and core engine
- Add file discovery logic to CLI
- Implement actual rule registration in TypeScript analyzer
- Add configuration UI for layer rules
- Integrate Memgraph for persistent graph storage
- Add vector DB support for semantic drift detection (Phase 2)
- Implement Python analyzer (Phase 2)