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

Use the `driftguard.` namespace for per-workspace overrides:

```json
{
  "driftguard.engineUrl": "http://custom-engine:3000",
  "driftguard.configPath": "./custom-config.json"   // optional; future feature
}
```

## Precedence

1. Environment variables
2. VS Code settings (extension only)
3. Config file (`.driftguard/config.json`)
4. Built-in defaults (only for non-sensitive fields like `fileExtensions` fallback; config file is still required)

If required credentials (`MEMGRAPH_USERNAME`, `MEMGRAPH_PASSWORD`) are missing, the CLI exits with an error.

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
