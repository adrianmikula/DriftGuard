# Dual Transport Architecture: HTTP API and Direct Method Calls

**Status:** Accepted  
**Created:** 2026-05-06  
**Last Updated:** 2026-05-06  
**Deciders:** Architecture Team  
**Technical Area:** API Design, Client-Server Communication

---

## Context and Problem Statement

The DriftGuard core engine (`@driftguard/core-engine`) can be invoked in two ways:

1. **HTTP API** — Run as an Express server exposing REST endpoints
2. **Direct method calls** — Import and instantiate classes directly (used by CLI)

Currently, the VSCode extension uses only the HTTP API. However, the architecture leaves open questions about:

- Should the extension support direct method calls for better performance?
- What are the trade-offs between the two approaches for different consumers?
- How do we maintain a clean separation between the core library and the HTTP server?
- How do we prevent API drift between the two invocation styles?

This ADR formalizes the decision to keep both transport mechanisms available, with the VSCode extension using HTTP exclusively for safety and isolation.

---

## Decision

We will **maintain both HTTP and direct invocation styles** in the core engine, with the following characteristics:

### Core Engine Public Interface

- **Library API** (direct calls): Exported from `packages/core-engine/src/index.ts`
  - `ScannerOrchestrator`
  - `GraphModel` / `GraphClient`
  - `RuleEngine`
  - Language analyzers and rules
  - Configuration loaders
  
- **Server API** (HTTP): Provided by `packages/core-engine/src/server/index.ts`
  - `createServer(orchestrator: ScannerOrchestrator, graph: GraphModel, config: ServerConfig)`
  - `startServer(orchestrator, graph, config)`
  - The server internally reuses the same library classes

### VSCode Extension Transport Choice

The extension will use **HTTP API only** (not direct method calls).

**Rationale for HTTP-only in VSCode:**

1. **Process isolation:** The core engine performs heavy static analysis and database operations. Running it in a separate process prevents crashes, memory leaks, or unbounded CPU usage from affecting the VSCode UI.
2. **Security and privileges:** The core engine may need database credentials and filesystem access. A separate HTTP server can run with appropriate credentials without exposing them to the extension process.
3. **Language server pattern alignment:** VSCode extensions commonly communicate with language servers via stdio or HTTP. This pattern is familiar, debuggable, and supported by tooling.
4. **Deployment flexibility:** Users can run the HTTP server remotely (e.g., on a build server) and point the extension to it via `driftguard.engineUrl`. This is useful for large monorepos where local scanning is expensive.
5. **Observability:** HTTP enables standard monitoring (logs, metrics, tracing) without custom instrumentation inside VSCode.

### When to Use Direct Calls

Direct method calls are still supported and appropriate for:

- **CLI tool** (`driftguard scan <path>`) — already implemented and simpler without HTTP overhead
- **Unit and integration tests** — can import classes directly for fast, isolated testing
- **Embedded scenarios** — other tools may want to link the core engine as a library

No fallback or auto-detection logic will be added to the VSCode extension. Users explicitly choose HTTP mode via configuration. Direct mode remains available for other consumers.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        VSCode Extension                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  EngineClient (HTTP-only)                                 │  │
│  │  - scan()                                                │  │
│  │  - getEngineStatus()                                     │  │
│  │  - getMetrics()                                          │  │
│  └────────────────────────┬──────────────────────────────────┘  │
└───────────────────────────┼──────────────────────────────────────┘
                            │ HTTP (localhost:3000)
┌───────────────────────────▼──────────────────────────────────────┐
│              DriftGuard HTTP Server (Express)                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Routes: /api/scan, /api/status, /api/metrics, /api/graph │  │
│  │  ┌────────────┐  ┌────────────┐  ┌─────────────────────┐ │  │
│  │  │ ScanRouter │  │StatusRouter│  │GraphRouter │Metrics │ │  │
│  │  └─────┬──────┘  └───────────┘  └───────────┬─────────┘ │  │
│  └────────┼────────────────────────────────────┼───────────┘  │
└───────────┼────────────────────────────────────┼──────────────┘
            │ Calls library methods                │ Returns results
            ▼                                      ▼
┌───────────────────────────────────────────────────────────────┐
│              DriftGuard Core Library (@driftguard/core-engine) │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ScannerOrchestrator                                     │   │
│  │  ┌──────────────┐    ┌─────────────────────────────────┐ │   │
│  │  │ RuleEngine   │    │ GraphModel (Neo4j Client)       │ │   │
│  │  └──────┬───────┘    └────────────┬────────────────────┘ │   │
│  │         │                         │                      │   │
│  │  ┌──────▼─────────────────────────▼───────┐              │   │
│  │  │  Language Analyzers (TS, Python, ...)  │              │   │
│  │  └────────────────────────────────────────┘              │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    DriftGuard CLI (direct calls)                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Direct import:                                          │  │
│  │  import { ScannerOrchestrator, GraphModel, RuleEngine } │  │
│  │  const result = await orchestrator.scan(context)        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Consequences

### Positive (Advantages)

1. **Performance flexibility** — Direct calls avoid HTTP overhead for suitable consumers (CLI, tests)
2. **Safety and isolation** — VSCode extension runs heavy analysis in separate process
3. **Deployment flexibility** — HTTP server can run locally, remotely, or containerized
4. **Debuggability** — HTTP traffic can be inspected with standard tools (curl, Wireshark, browser dev tools)
5. **Language-agnostic future** — HTTP could be consumed by non-TypeScript clients

### Negative (Drawbacks)

1. **Code duplication risk** — Two invocation paths (HTTP routes vs direct methods) must stay in sync
2. **Increased complexity** — Consumers must understand which approach to use
3. **Latency for HTTP** — Local network adds ~1–5ms overhead per call (acceptable for long scans)
4. **Version compatibility** — API contracts between HTTP and direct must be compatible
5. **Testing burden** — Need to verify both paths produce identical results

---

## Implementation Notes

### Library vs Server Separation

The core engine's `index.ts` cleanly exports both the library API and the server factory:

```typescript
// Library API (for direct imports)
export * from './scanner';
export * from './rules';
export * from './graph';
export * from './config';

// Server API (for embedding HTTP server)
export { createServer, startServer, ServerConfig } from './server';
export * from './server'; // if needed for advanced usage
```

This separation is already present and will be preserved.

### Configuration Precedence

**For HTTP mode (VSCode extension):**

1. VSCode setting `driftguard.engineUrl`
2. `.driftguard/config.json` → `engine.url`
3. Environment variable `ENGINE_URL`
4. Default: `http://localhost:3000`

**For direct mode (CLI):**

1. Command-line flag `--config <path>`
2. `.driftguard/config.json` (workspace root)
3. Environment variables (`.env` file auto-loaded)
4. Defaults from schema

### Error Handling

- **HTTP client** — Must handle network errors (connection refused, timeouts, non-2xx status)
- **Direct calls** — Must handle database errors, file I/O errors, analysis exceptions
- Both should surface errors with sufficient context for debugging

### Validation Strategy

To prevent API drift, we will:

1. **Unit test both paths** — Mock underlying services; ensure response shapes match
2. **Integration test parity** — Run identical scans via HTTP and CLI; assert result equality (modulo timing)
3. **Type safety** — Share TypeScript interfaces between server routes and client (if possible). For VSCode extension, define shared types in `@driftguard/core-engine` types package

---

## Alternatives Considered

### Alternative 1: Direct calls only in VSCode extension

**Pros:** Lower latency, simpler deployment (no separate server)
**Cons:** VSCode process crashes directly affect editor stability; less flexibility for remote analysis
**Rejected because:** Stability is paramount for editor plugins; isolation justifies HTTP overhead.

### Alternative 2: Auto-detection with fallback (HTTP → direct or vice versa)

**Pros:** Seamless user experience; "just works"
**Cons:** Hidden behavior makes debugging hard; unexpected mode switches
**Rejected because:** Explicit configuration is clearer and more debuggable.

### Alternative 3: Worker threads for direct mode isolation

**Pros:** Sandboxing without network overhead
**Cons:** Significant complexity (message passing, serialization, lifecycle)
**Rejected for now** — Could be revisited if needed. Currently unnecessary since VSCode uses HTTP.

---

## Migration Guide for Users

### Existing VSCode Extension Users

No changes required. The extension defaults to HTTP mode and will continue working as before. Ensure the core engine HTTP server is running:

```bash
# Terminal 1: Start the server
cd packages/core-engine
npm run cli -- --server --port 3000

# Terminal 2: VSCode (extension activates automatically)
```

**Tip:** Configure engine URL in VSCode settings if not using default localhost:3000.

### New Direct-mode Consumers (e.g., building a custom tool)

```typescript
import { ScannerOrchestrator, GraphModel, GraphClient, RuleEngine } from '@driftguard/core-engine';
import { TypeScriptAnalyzer } from '@driftguard/language-typescript';

async function run() {
  // Initialize components
  const client = new GraphClient({ uri: 'bolt://localhost:7687' });
  await client.connect();
  const graph = new GraphModel(client);
  await graph.initializeSchema();

  const ruleEngine = new RuleEngine();
  const orchestrator = new ScannerOrchestrator(graph, ruleEngine);
  
  const analyzer = new TypeScriptAnalyzer();
  orchestrator.registerAnalyzer(analyzer);
  ruleEngine.registerRule(analyzer.getBoundaryViolationRule());

  // Scan
  const result = await orchestrator.scan({
    workspacePath: '/path/to/workspace',
    language: 'typescript',
    files: ['/path/to/file.ts']
  });

  console.log(result);
}
```

---

## Open Questions

| Question | Status | Notes |
|----------|--------|-------|
| Could we auto-start HTTP server from VSCode? | Open | Would require spawning child process; adds complexity |
| Should we add WebSocket for streaming results? | Open | Large scans could stream progress; HTTP buffering is current default |
| Should we support STDIO transport? | Open | Common for language servers; not needed currently |
| Can we share types between server and client? | Resolved | Types will be extracted to a shared `@driftguard/types` package if needed |

---

## Related Decisions

- **Database choice** — Neo4j for graph storage (see `docs/database_types.md`)
- **Configuration management** — `.driftguard/config.json` + `.env` (see `docs/configuration.md`)
- **Layered architecture** — Already established through analyzer/rule separation

---

## References

- HTTP Server implementation: `packages/core-engine/src/server/`
- CLI direct invocation: `packages/core-engine/src/cli/index.ts`
- VSCode extension client: `packages/vscode-extension/src/client/engine-client.ts`
