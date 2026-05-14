# Test Improvements for DriftGuard

## Executive Summary

Current test coverage: **103 tests**, **97 passing** (94.2% pass rate)
- **6 failing tests**: All in `core-engine/src/__tests__/graph/client.test.ts` due to missing Neo4j database
- **0 compilation errors** across all packages after recent fixes
- **Workspace dependency issues** resolved via tarball-based installation (Windows-compatible)

---

## 1. Critical Issues to Fix

### 1.1 Mock Neo4j Database Integration Tests

**Problem:** `GraphClient` tests attempt to connect to a real Neo4j instance at `bolt://localhost:7687`, causing failures when the database is not running.

**Impact:** 6 tests failing; entire test suite appears unstable.

**Recommendations:**

#### Option A: Mock the Neo4j Driver (Recommended for Unit Tests)
- Create a mock implementation of `neo4j-driver` that returns canned responses
- Store mock data in test fixtures or factories
- Benefits: Fast, deterministic, no external dependency
- Implementation:
  ```typescript
  // packages/core-engine/src/__tests__/graph/__mocks__/neo4j-driver.ts
  export const mockDriver = {
    verifyConnection: vi.fn().mockResolvedValue(true),
    close: vi.fn(),
    session: vi.fn(() => ({
      run: vi.fn().mockResolvedValue({ records: [], summary: {} }),
      close: vi.fn(),
    })),
  };
  ```

#### Option B: Skip Integration Tests When Database Unavailable
- Detect if Neo4j is running before running integration tests
- Use Vitest's `skip` or conditional test execution:
  ```typescript
  const isDbAvailable = await checkDatabaseHealth();
  if (isDbAvailable) {
    describe('GraphClient (integration)', () => { ... });
  }
  ```

#### Option C: Use In-Memory Test Database
- Set up a temporary Neo4j instance for tests (Docker or embedded)
- Requires test infrastructure setup and cleanup
- Most realistic but heaviest option

**Priority:** HIGH — Fixes immediate test failures

---

### 1.2 Isolate Package-Level Type-Checking

**Problem:** ESLint `parserOptions.project` points to root `tsconfig.json` which includes all packages, causing `.d.ts` file parsing errors.

**Solution:**
- Create `tsconfig.eslint.json` per package (or root) with narrower `include` patterns
- Alternatively, disable `project` in ESLint config (loses type-aware rules)

**Example per-package tsconfig.eslint.json:**
```json
{
  "extends": "./tsconfig.json",
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/__mocks__/**"]
}
```

**Priority:** MEDIUM — Improves linting reliability

---

## 2. Test Coverage Gaps

### 2.1 Core Engine

| Component | Coverage Status | Recommendations |
|-----------|----------------|-----------------|
| `ConfigLoader` | ✅ Excellent | Add tests for nested config overrides and edge-case JSON structures |
| `RuleEngine` | ✅ Good | Test severity overrides when rules have conflicting severities |
| `ScannerOrchestrator` | ✅ Good | Test analyzer registration lifecycle (unregister → scan failure) |
| `GraphClient` | ❌ Integration-only | Create unit tests with mocked driver (see 1.1) |
| `Server` (Express) | ❌ Untested | Add integration tests for `/api/scan`, `/api/status`, `/api/metrics`, `/api/graph/imports`, `/api/violations` endpoints |

### 2.2 Language Modules

| Component | Coverage Status | Recommendations |
|-----------|----------------|-----------------|
| TypeScript Analyzer | ✅ Good | Add tests for edge cases: circular imports, conditional imports, type-only imports |
| Python Analyzer | ⚠️ Stubs only | Stubs throw "not implemented"; mark tests as `todo` or skip until Phase 2 |
| Boundary Violation Rule (TS) | ✅ Good | Include tests for regex pattern matching, multi-layer scenarios |
| Circular Dependency Rule (TS) | ✅ Good | Expand to test transitive cycles (A→B→C→A) |

### 2.3 VS Code Extension

| Component | Coverage Status | Recommendations |
|-----------|----------------|-----------------|
| `EngineClient` | ✅ Good (mocked) | Add tests for timeout handling, malformed responses, network errors |
| `ArchitectureTreeProvider` | ✅ Good | Test refresh event propagation, tree item identity |
| Commands (`registerCommands`) | ✅ Good | Add tests for error display paths (no workspace, scan failure) |
| Extension activation | ❌ Untested | Create `extension.test.ts` that activates the extension in a test harness |

---

## 3. Structural Improvements

### 3.1 Shared Test Utilities

Create `packages/*/src/__tests__/utils.ts` or root `test/utils/` for:
- Mock factory functions (e.g., `createMockScanContext()`, `createMockConfig()`)
- Common test fixtures (sample config files, sample TypeScript files)
- Vitest setup file for global mocks (vscode, fs, fetch)

**Example structure:**
```
test/
  fixtures/
    workspace/
      .driftguard/
        config.json
      src/
        sample.ts
  utils/
    create-mock-engine-client.ts
    create-mock-graph.ts
```

### 3.2 Test Data Factories

Use `@test-lib/factory` or simple builders to generate complex objects:

```typescript
export const buildScanContext = (overrides: Partial<ScanContext> = {}): ScanContext => ({
  workspacePath: '/workspace',
  language: 'typescript',
  files: [],
  ...overrides,
});
```

Benefits:
- Reduces boilerplate
- Makes test intent clearer
- Easier to maintain when interfaces change

### 3.3 Integration Test Suite

Create a dedicated `test-integration/` directory or `**/*.integration.test.ts` pattern for:
- End-to-end workflow: config → scan → results → violations
- VS Code command flow (requires vscode-test harness)
- HTTP server requests (supertest against in-memory server)

**Isolation:** Integration tests should skip when:
- Neo4j is not running
- VS Code extension host not available

---

## 4. Quality of Life Improvements

### 4.1 Test Organization

- Group tests by feature using `describe` blocks consistently
- Name test files with suffix `.test.ts` (already done)
- Consider BDD-style naming: `should <behavior> when <condition>`

### 4.2 Fixtures & Mock Data

- Move inline mock data to separate fixture files (JSON or TS)
- Use `fixture` pattern to load sample filesystem structures
- Keep test data DRY and reusable

### 4.3 CI/CD Integration

**GitHub Actions workflow:**
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      neo4j:
        image: neo4j:5
        env:
          NEO4J_AUTH: neo4j/test
        ports: ["7687:7687"]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npx vitest run
      - run: npx eslint . --ext .ts
```

**Note:** For PRs, integration tests could be gated behind a label or optional.

---

## 5. Specific Action Items

### Immediate (Next Sprint)

1. **Mock Neo4j driver** to eliminate 6 failing tests
   - Create `__mocks__/neo4j-driver.ts` in `core-engine`
   - Update `vitest.config.ts` to auto-mock `neo4j-driver`
   - Verify `GraphClient` tests pass without database

2. **Add missing ESLint plugin:** `eslint-plugin-gh` or `eslint-plugin-jsdoc` for documentation consistency

3. **Fix current ESLint errors** (optional for now):
   - Add explicit `any` types or better typings in mocks
   - Remove unused imports flagged by `unused-imports`
   - Replace `||` with `??` in nullish contexts

4. **Create test README** documenting:
   - How to run unit vs integration tests
   - How to add new tests
   - Mocking conventions

### Short-term (1–2 Months)

5. **Add HTTP server integration tests** using `supertest`:
   - `/api/scan` returns `ScanResult`
   - `/api/status` returns health status
   - Error handling (400, 500)

6. **Expand ConfigLoader tests:**
   - Invalid schema fields (unknown properties)
   - Mixed valid/invalid config scenarios

7. **TypeScript analyzer tests:**
   - Complex import graph scenarios (re-exports, barrel files)
   - Boundary rule with nested directories
   - Circular dependency with multiple cycles

8. **VS Code extension:**
   - `extension.test.ts` using `vscode-test` to activate extension
   - Verify tree view registration and updates

### Long-term (3+ Months)

9. **Property-based testing** with `fast-check`:
   - Generate random file trees and verify graph invariants

10. **Performance benchmarks**:
    - Scan time for 1000+ files
    - Memory usage profiling

11. **Mutation testing** with `stryker` or `mutmut` to assess test quality

---

## 6. Metrics & Monitoring

- **Coverage target:** ≥90% statements, ≥85% branches
- Use `vitest coverage` with `--reporter=html` for visualization
- Add coverage threshold to `package.json`:
  ```json
  "scripts": {
    "test:coverage": "vitest run --coverage"
  }
  ```

---

## Appendix: Current Failing Tests (Neo4j-dependent)

File: `packages/core-engine/src/__tests__/graph/client.test.ts`

| Test | Failure Reason |
|------|----------------|
| `connect > should successfully connect` | ECONNREFUSED ::1:7687 |
| `executeQuery > should execute a query` | ECONNREFUSED |
| `executeQuery > should execute with parameters` | ECONNREFUSED |
| `executeQuery > should close session` | ECONNREFUSED |
| `executeWrite > should execute write` | ECONNREFUSED |
| `close > should close driver` | Spy not called (driver never initialized) |

**Fix:** Mock the driver or skip these when `NEO4J_TEST_URL` is not set.

---

*Document version: 1.0 — 2026-05-06*
