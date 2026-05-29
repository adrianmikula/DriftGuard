# DriftGuard

**Detect architectural drift in your TypeScript codebase — directly inside VS Code.**

DriftGuard watches your import graph and flags layer violations and circular dependencies before they compound into architectural debt.

## Features

- **Layer boundary enforcement** — Define layers (`ui`, `domain`, `infrastructure`) and get notified when code crosses forbidden boundaries.
- **Circular dependency detection** — Finds import cycles across your TypeScript files.
- **Architecture panel** — Browse violations and your import graph from the DriftGuard sidebar.
- **Status bar indicator** — Always see whether the DriftGuard engine is connected.

## Requirements

DriftGuard requires the **DriftGuard engine server** to be running locally. Start it from the core-engine package:

```bash
cd packages/core-engine
node dist/cli/index.js <workspace-path> --server --port 3000
```

## Getting Started

1. Install the extension.
2. Start the DriftGuard engine server (see above).
3. Open a TypeScript workspace.
4. Run **DriftGuard: Open Configuration** from the Command Palette to create a `.driftguard/config.json`.
5. Edit the config to define your layer rules.
6. Run **DriftGuard: Scan Workspace** to detect violations.

## Commands

| Command | Description |
|---|---|
| `DriftGuard: Scan Workspace` | Scan all TypeScript files for violations |
| `DriftGuard: Scan Current File` | Scan the active file |
| `DriftGuard: Check Engine Status` | Ping the engine and update the status bar |
| `DriftGuard: Check Trial Status` | Check trial days remaining or license status |
| `DriftGuard: Open Configuration` | Open (or create) `.driftguard/config.json` |

## Configuration

| Setting | Default | Description |
|---|---|---|
| `driftguard.engineUrl` | `http://localhost:3000` | URL of the DriftGuard engine server |
| `driftguard.timeoutMs` | `30000` | Request timeout in milliseconds |
| `driftguard.licenseKey` | `""` | License key to unlock after trial (purchase via Marketplace) |

## Example `.driftguard/config.json`

```json
{
  "layers": [
    { "name": "ui", "pattern": "src/ui/**", "canImport": ["domain"], "cannotImport": ["infrastructure"] },
    { "name": "domain", "pattern": "src/domain/**", "canImport": [], "cannotImport": ["ui", "infrastructure"] },
    { "name": "infrastructure", "pattern": "src/infrastructure/**", "canImport": ["domain"], "cannotImport": ["ui"] }
  ],
  "rules": {
    "boundary-violation": { "enabled": true, "severity": "error" },
    "circular-dependency": { "enabled": true, "severity": "warning" }
  }
}
```

## Pricing

DriftGuard includes a **7-day free trial** with full access to all features. After the trial period, a valid license key is required to continue using scan commands.

- **Trial** — Install and use all features for 7 days at no cost.
- **License** — Purchase via the VS Code Marketplace. Enter your license key in `driftguard.licenseKey` settings.
- **Bulk/team pricing** — Contact **support@codemedic.dev**.

## Support

- **Issues & bugs:** [GitHub Issues](https://github.com/adrianmikula/DriftGuard/issues)
- **Documentation:** [Configuration Guide](https://github.com/adrianmikula/DriftGuard/blob/main/docs/configuration.md)
- **Email:** support@codemedic.dev

## License

MIT
