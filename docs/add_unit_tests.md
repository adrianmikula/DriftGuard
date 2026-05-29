# Setup Vitest Testing for DriftGuard

This plan adds Vite and Vitest testing infrastructure to all DriftGuard packages (core-engine, vscode-extension, language-typescript, language-python) with Memgraph/Neo4j driver mocking support.

## Overview

- Add Vite + Vitest to all 4 packages
- Configure Vitest for TypeScript monorepo
- Set up Memgraph/Neo4j driver mocking using manual mocks (simpler than neo-forgery)
- Create initial unit tests for core components
- Skip complex VSCode extension host testing (unit tests only for extension logic)

## Steps

### 1. Root Configuration
- Add `vitest` and `@vitest/ui` to root `package.json` devDependencies
- Create `vitest.config.ts` at root for workspace configuration
- Update root `test` script to use Vitest

### 2. Core-Engine Package
- Add `vitest` to devDependencies
- Create `vitest.config.ts` with TypeScript support
- Update `test` script in package.json
- Create test directory structure: `src/__tests__/`
- Create initial tests:
  - `graph/client.test.ts` - Mock GraphClient with fake neo4j-driver
  - `rules/engine.test.ts` - RuleEngine logic tests
  - `scanner/orchestrator.test.ts` - ScannerOrchestrator with mocked dependencies
- Create `__mocks__/neo4j-driver.ts` to mock the Neo4j driver (works for Memgraph)

### 3. VSCode Extension Package
- Add `vitest` to devDependencies
- Create `vitest.config.ts` 
- Update `test` script
- Create test directory: `src/__tests__/`
- Create initial tests:
  - `client/engine-client.test.ts` - EngineClient with mocked HTTP calls
  - `commands/index.test.ts` - Command registration logic
  - `ui/architecture-tree.test.ts` - TreeDataProvider logic
- Note: Skip `@vscode/test-electron` integration tests for now

### 4. Language-TypeScript Package
- Add `vitest` to devDependencies
- Create `vitest.config.ts`
- Update `test` script
- Create test directory: `src/__tests__/`
- Create initial tests:
  - `analyzer/import-graph.test.ts` - Import graph extraction logic
  - `rules/circular-dependency-rule.test.ts` - Circular dependency detection
  - `rules/boundary-violation-rule.test.ts` - Boundary violation detection

### 5. Language-Python Package
- Add `vitest` to devDependencies
- Create `vitest.config.ts`
- Update `test` script
- Create test directory: `src/__tests__/`
- Create basic stub tests (package is a stub for Phase 1)

### 6. Memgraph/Neo4j Mocking Strategy
- Create manual mock at `core-engine/src/__mocks__/neo4j-driver.ts`
- Mock the driver, session, and query results
- Use Vitest's `vi.mock()` to replace the real driver in tests
- This approach is simpler than neo-forgery and sufficient for unit tests

### 7. Test Utilities
- Create shared test utilities in `core-engine/src/__tests__/utils.ts`
- Helper functions for creating test data
- Common setup/teardown patterns

## Dependencies to Add

Root:
- `vitest@^2.0.0`
- `@vitest/ui@^2.0.0`

Each package:
- `vitest@^2.0.0` (in devDependencies)

## Files to Create

- `vitest.config.ts` (root)
- `packages/core-engine/vitest.config.ts`
- `packages/core-engine/src/__mocks__/neo4j-driver.ts`
- `packages/core-engine/src/__tests__/graph/client.test.ts`
- `packages/core-engine/src/__tests__/rules/engine.test.ts`
- `packages/core-engine/src/__tests__/scanner/orchestrator.test.ts`
- `packages/core-engine/src/__tests__/utils.ts`
- `packages/vscode-extension/vitest.config.ts`
- `packages/vscode-extension/src/__tests__/client/engine-client.test.ts`
- `packages/vscode-extension/src/__tests__/commands/index.test.ts`
- `packages/vscode-extension/src/__tests__/ui/architecture-tree.test.ts`
- `packages/language-typescript/vitest.config.ts`
- `packages/language-typescript/src/__tests__/analyzer/import-graph.test.ts`
- `packages/language-typescript/src/__tests__/rules/circular-dependency-rule.test.ts`
- `packages/language-typescript/src/__tests__/rules/boundary-violation-rule.test.ts`
- `packages/language-python/vitest.config.ts`
- `packages/language-python/src/__tests__/index.test.ts` (stub)

## Files to Modify

- `package.json` (root) - add vitest, update test script
- `packages/core-engine/package.json` - add vitest, update test script
- `packages/vscode-extension/package.json` - add vitest, update test script
- `packages/language-typescript/package.json` - add vitest, update test script
- `packages/language-python/package.json` - add vitest, update test script
