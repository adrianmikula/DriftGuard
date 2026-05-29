# DriftGuard

Architectural drift detection engine with VS Code integration.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Development Setup](#development-setup)
- [Configuration](#configuration)
- [Building the Project](#building-the-project)
- [Running / Debugging the Core Engine](#running--debugging-the-core-engine)
- [Running / Debugging the VS Code Extension](#running--debugging-the-vs-code-extension)
- [Testing](#testing)
- [Publishing the VS Code Extension](#publishing-the-vs-code-extension)
- [Packages](#packages)
- [Troubleshooting](#troubleshooting)

---

## Overview

DriftGuard is a modular system for detecting architectural drift in codebases, with initial support for TypeScript and planned support for Python. It uses a graph database as the core source of truth for code architecture relationships.

## Architecture

- **Core Engine**: Scanning engine that orchestrates analysis and manages graph storage
- **Language Modules**: Pluggable analyzers for different languages (TypeScript, Python)
- **VS Code Extension**: IDE integration for real-time drift detection

### Phase 1 Scope

- TypeScript-only analysis
- Import graph extraction
- Circular dependency detection
- Layer boundary violation detection
- Basic drift metrics
- Memgraph graph database backend

---

## Prerequisites

Before setting up DriftGuard, ensure the following are available on your system:

- **Node.js >= 18.0.0** – Check with `node --version`
- **pnpm** (recommended) or **npm** – The monorepo uses pnpm workspaces. Install pnpm with `npm install -g pnpm`.
- **Memgraph** *(optional)* – Graph database backend. If not running, the engine falls back to a mock graph. See [Memgraph installation docs](https://memgraph.com/docs/getting-started).
- **VS Code** with the **Extension Development** tools – Required to run the extension in development mode (press F5).

---

## Development Setup

```bash
# Clone the repository
git clone https://github.com/adrianmikula/DriftGuard.git
cd DriftGuard

# Install root-level dev dependencies
npm install

# Install dependencies in each package
# (pnpm workspace symlinks may not work on all platforms)
cd packages/core-engine && npm install
cd ../language-typescript && npm install
cd ../language-python && npm install
cd ../vscode-extension && npm install
cd ../..
```

> **Note**: Due to platform symlink limitations (e.g. Windows), dependencies must be installed in each package individually rather than relying on workspace hoisting.

---

## Configuration

DriftGuard uses two configuration files:

### `.env` – Sensitive credentials (never commit to git)

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `MEMGRAPH_USERNAME` | Yes | — | Memgraph database username |
| `MEMGRAPH_PASSWORD` | Yes | — | Memgraph database password |
| `MEMGRAPH_URI` | No | `bolt://localhost:7687` | Memgraph connection URI |
| `ENGINE_URL` | No | `http://localhost:3000` | Core engine HTTP server URL |

### `.driftguard/config.json` – Project configuration (committed to repo)

Controls layer definitions, analyzer settings, file discovery, rule enablement, and severity. The shipped defaults work for a typical TypeScript project.

| Key | Description |
|---|---|
| `layers` | Named layer definitions with path patterns |
| `analyzer.fileExtensions` | File types to include in analysis |
| `fileDiscovery` | Glob patterns for file discovery |
| `rules` | Rule enablement and severity per rule ID |
| `database.uri` | Non-sensitive database URI (overridden by `.env`) |
| `engine.url` | Engine server URL |

Config precedence: **environment variables** > `--config` flag > workspace `.driftguard/config.json`.

### VS Code workspace settings

The extension also supports VS Code workspace settings under the `driftguard.` namespace:

```json
// .vscode/settings.json
{
  "driftguard.engineUrl": "http://localhost:3000",
  "driftguard.timeoutMs": 30000
}
```

VS Code settings override config file values.

---

## Building the Project

Each package must be built individually. Build `core-engine` and `language-typescript` before `vscode-extension`, as the extension depends on a packed tarball of the core engine.

```bash
cd packages/core-engine && npm run build
cd ../language-typescript && npm run build
cd ../language-python && npm run build
cd ../vscode-extension && npm run build
```

To watch for changes during development:

```bash
# In separate terminals:
cd packages/core-engine && npm run watch
cd packages/vscode-extension && npm run watch
```

---

## Running / Debugging the Core Engine

### CLI mode

```bash
cd packages/core-engine
npm run cli <workspace-path>
# With a custom config path:
npm run cli <workspace-path> -- --config <custom-config-path>
```

### HTTP server mode

```bash
cd packages/core-engine
npm run cli <workspace-path> -- --server --port 3000
```

The engine will listen on `http://localhost:3000` and expose a REST API consumed by the VS Code extension.

### With the Node.js debugger

```bash
cd packages/core-engine
npm run build
node --inspect-brk dist/cli/index.js <workspace-path>
```

Then attach VS Code's debugger (or Chrome DevTools at `chrome://inspect`) to the process.

### VS Code launch configuration

The root `.vscode/launch.json` includes a `Run Extension` configuration that builds and launches the extension host. To debug the core engine separately, add a configuration like this to `.vscode/launch.json`:

```json
{
  "name": "Debug Core Engine CLI",
  "type": "node",
  "request": "launch",
  "program": "${workspaceFolder}/packages/core-engine/dist/cli/index.js",
  "args": ["${workspaceFolder}"],
  "preLaunchTask": "build-extension",
  "outFiles": ["${workspaceFolder}/packages/core-engine/dist/**/*.js"]
}
```

---

## Running / Debugging the VS Code Extension

1. **Build the core engine first** (the extension bundles a packed tarball):
   ```bash
   cd packages/core-engine && npm run build
   ```

2. **Open the workspace root** (`DriftGuard/`) in VS Code.

3. **Press F5** (or run *Run Extension* from the Run & Debug panel). This launches an **Extension Development Host** window with DriftGuard loaded.

4. **Start the engine server** in a separate terminal so the extension can communicate with it:
   ```bash
   cd packages/core-engine && npm run cli <your-workspace-path> -- --server --port 3000
   ```

5. In the Extension Development Host, open the Command Palette (`Ctrl+Shift+P`) and run:
   - `DriftGuard: Scan Workspace`
   - `DriftGuard: Scan Current File`
   - `DriftGuard: Check Engine Status`
   - `DriftGuard: Open Configuration`

> **Tip**: The extension uses `driftguard.engineUrl` (default `http://localhost:3000`) to reach the engine. If the engine is not running, commands will report a connection error.

---

## Testing

DriftGuard uses [Vitest](https://vitest.dev/) for unit testing across all packages. Test files live in `src/__tests__` directories within each package.

### Running all tests

```bash
npm test
```

### Running tests for a specific package

```bash
cd packages/core-engine && npm test
```

### Fast test loop (recommended during development)

Runs unit tests only — no external dependencies, completes in under 10 seconds:

```bash
npm run test:fast
```

Includes:
- Core engine unit tests (rules, config) with mocked dependencies
- Language package unit tests (TypeScript rules, analyzer stubs)

Excludes: integration tests, graph client tests, scanner tests, VS Code extension tests.

### Test coverage

```bash
npm test -- --coverage
```

HTML reports are generated in each package's `coverage/` directory.

### Test infrastructure

- **Core Engine**: GraphClient (mocked neo4j-driver), RuleEngine, ScannerOrchestrator, utility functions
- **VS Code Extension**: EngineClient, command registration, ArchitectureTreeProvider (mocked VS Code API)
- **Language-TypeScript**: ImportGraphAnalyzer, CircularDependencyRule, BoundaryViolationRule
- **Language-Python**: Stub tests for Phase 1 (expanded in Phase 2)

### Mocking strategy

- **Neo4j Driver**: Manual mock at `packages/core-engine/src/__mocks__/neo4j-driver.ts` via `vi.mock()`
- **VS Code API**: Manual mock at `packages/vscode-extension/src/__mocks__/vscode.ts`
- **Test Utilities**: Shared helpers at `packages/core-engine/src/__tests__/utils.ts`

---

## Publishing the VS Code Extension

The extension is published to the [VS Code Marketplace](https://marketplace.visualstudio.com/) under the `CodeMedic` publisher.

### One-time setup

1. Install the `vsce` packaging tool:
   ```bash
   npm install -g @vscode/vsce
   ```

2. Create a publisher account at [Azure DevOps](https://dev.azure.com/) if you don't have one.

3. Generate a **Personal Access Token (PAT)** in Azure DevOps:
   - Organization: `All accessible organizations`
   - Scopes: `Marketplace → Manage`

4. Log in with `vsce`:
   ```bash
   vsce login CodeMedic
   # Paste your PAT when prompted
   ```

### Packaging

```bash
cd packages/vscode-extension
vsce package
# Produces: driftguard-<version>.vsix
```

### Publishing

```bash
cd packages/vscode-extension
vsce publish
# To bump the version and publish in one step:
vsce publish patch   # or minor / major
```

### Installing a local build

```bash
code --install-extension packages/vscode-extension/driftguard-0.1.0.vsix
```

---

## Packages

| Package | Description |
|---|---|
| `core-engine` | Core scanning engine, graph management, CLI, HTTP server |
| `language-typescript` | TypeScript import graph analyzer and rules |
| `language-python` | Python analyzer (stub for Phase 1, expanded in Phase 2) |
| `vscode-extension` | VS Code IDE integration |

---

## Troubleshooting

### Engine server not reachable

- Confirm the engine is running: `curl http://localhost:3000/health`
- Check `driftguard.engineUrl` in VS Code settings or `.driftguard/config.json`
- Ensure the engine built successfully before starting: `cd packages/core-engine && npm run build`

### Memgraph connection errors

- If Memgraph is not installed or not running, the engine falls back to a mock in-memory graph — no action needed for local development.
- To connect a real Memgraph instance, set `MEMGRAPH_URI`, `MEMGRAPH_USERNAME`, and `MEMGRAPH_PASSWORD` in `.env`.

### Extension not loading in Extension Development Host

- Ensure `packages/vscode-extension` has been built (`npm run build`) before pressing F5.
- The VS Code launch config uses `--extensionDevelopmentPath` pointing to `packages/vscode-extension`.
- Check the **Extension Host** output panel for errors.

### `npm install` fails in a package

- Try deleting `node_modules` and `package-lock.json` in the affected package, then re-run `npm install`.
- Ensure your Node.js version meets the `>=18.0.0` requirement: `node --version`.

### Tests failing unexpectedly

- Run `npm run test:fast` first to isolate unit test failures from integration issues.
- Ensure all packages are built before running tests that depend on compiled output.