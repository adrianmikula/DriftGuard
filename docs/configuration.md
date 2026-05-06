# Configuration Reference

DriftGuard's behaviour is controlled by two configuration sources:

- **`.env`** – Environment variables for secrets and overrides
- **`.driftguard/config.json`** – Main configuration file

## Configuration File

**Location:** `.driftguard/config.json` in the workspace root

### Schema

```typescript
interface Config {
  layers: LayerRule[];
  analyzer: {
    fileExtensions: string[];
  };
  fileDiscovery: {
    includePatterns: string[];
    excludePatterns: string[];
  };
  rules: Record<string, { enabled: boolean; severity: 'error' | 'warning' | 'info' }>;
  database: {
    uri: string;
  };
  engine: {
    url: string;
    timeoutMs?: number;
  };
}

interface LayerRule {
  name: string;
  pattern: string;        // Regex pattern matching file paths
  canImport: string[];    // Layers this layer is allowed to import (empty = any)
  cannotImport: string[]; // Layers this layer must not import
}
```

### Default Configuration

```json
{
  "layers": [
    {
      "name": "ui",
      "pattern": ".*src/components/.*",
      "canImport": ["ui", "shared"],
      "cannotImport": ["data", "api"]
    },
    {
      "name": "data",
      "pattern": ".*src/data/.*",
      "canImport": ["data", "shared"],
      "cannotImport": ["ui"]
    },
    {
      "name": "api",
      "pattern": ".*src/api/.*",
      "canImport": ["api", "data", "shared"],
      "cannotImport": ["ui"]
    },
    {
      "name": "shared",
      "pattern": ".*src/shared/.*",
      "canImport": ["shared"],
      "cannotImport": []
    }
  ],
  "analyzer": {
    "fileExtensions": ["ts", "tsx"]
  },
  "fileDiscovery": {
    "includePatterns": ["**/*.{ts,tsx}"],
    "excludePatterns": ["**/node_modules/**", "**/dist/**"]
  },
  "rules": {
    "boundary-violation": {
      "enabled": true,
      "severity": "error"
    },
    "circular-dependency": {
      "enabled": true,
      "severity": "error"
    }
  },
  "database": {
    "uri": "bolt://localhost:7687"
  },
  "engine": {
    "url": "http://localhost:3000",
    "timeoutMs": 30000
  }
}
```

## Environment Variables (`.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MEMGRAPH_USERNAME` | Yes | – | Memgraph database username |
| `MEMGRAPH_PASSWORD` | Yes | – | Memgraph database password |
| `MEMGRAPH_URI` | No | `bolt://localhost:7687` | Overrides `database.uri` |
| `ENGINE_URL` | No | `http://localhost:3000` | Overrides `engine.url` |

`.env` is loaded automatically from the workspace root if present.

## VS Code Settings

The extension uses the `driftguard.` namespace for configuration. These settings override the `.driftguard/config.json` file for engine connection parameters only.

### Available Settings

```json
{
  "driftguard.engineUrl": "http://localhost:3000",
  "driftguard.timeoutMs": 30000
}
```

- **`driftguard.engineUrl`** (string, default: `http://localhost:3000`)  
  URL of the DriftGuard engine server. The extension communicates with the engine via HTTP API. Ensure the server is running and accessible at this address.

- **`driftguard.timeoutMs`** (number, default: `30000`)  
  Timeout in milliseconds for engine API requests. If a scan takes longer than this, the request will be aborted.

### Precedence

For engine connectivity (HTTP client):
1. VS Code settings (`driftguard.engineUrl`, `driftguard.timeoutMs`)
2. Environment variables (`ENGINE_URL`, `ENGINE_TIMEOUT_MS`)
3. Config file (`.driftguard/config.json` → `engine.url`, `engine.timeoutMs`)
4. Built-in defaults (`http://localhost:3000`, `30000`)

For all other configuration (rules, layers, file discovery), the extension does not override the config file; it only provides file paths to the engine, which reads its own configuration from the workspace `.driftguard/config.json`.

### Status Bar

The extension adds a status bar item indicating the engine connection status:
- **Green checkmark** — Engine is reachable and healthy
- **Red warning** — Engine is unreachable; click the status item to retry

Click the status bar item or run the **"DriftGuard: Check Engine Status"** command to manually verify connectivity.

---

## Migration from Hardcoded Defaults

The default configuration replicates the previous hardcoded behaviour. Existing installations can simply copy the default config to their workspace root and add a `.env` file with credentials. No code changes required.

```bash
# Initialise a workspace
mkdir -p .driftguard
cp path/to/repo/.driftguard/config.json .driftguard/
cp path/to/repo/.env.example .env
# edit .env with your database credentials
```

## Validation

The configuration is validated using Zod on startup. Errors include field paths and expected types. Invalid JSON, unknown keys, or missing required fields produce clear error messages.

---

## See Also

- **Dual Transport Architecture** — explains why the engine can be used via HTTP or direct library calls, and why the VSCode extension uses HTTP: [`docs/adr/001-dual-transport-architecture.md`](./adr/001-dual-transport-architecture.md)
