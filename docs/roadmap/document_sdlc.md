# Update Root README with Dev Setup and Publishing Guide

Update the root README.md to provide comprehensive developer setup, debugging, and VS Code extension publishing instructions.

## Current README Gaps
- Missing prerequisite checks (Node.js version, Memgraph setup)
- No step-by-step debug workflow for core engine
- No step-by-step debug workflow for VS Code extension
- Missing VS Code extension marketplace publishing steps
- Build/release process not documented

## Solution
Restructure README with clear sections:

### 1. Prerequisites
- Node.js >= 18.0.0
- pnpm or npm (monorepo uses pnpm workspaces)
- Memgraph database (optional - falls back to mock graph)
- VS Code with Extension Development tools

### 2. Development Setup
```bash
# Clone and install
git clone <repo>
cd DriftGuard

# Install root dependencies
npm install

# Install all package dependencies
for pkg in packages/*; do (cd "$pkg" && npm install); done
```

### 3. Building the Project
```bash
# Build all packages
cd packages/core-engine && npm run build
cd ../language-typescript && npm run build
cd ../vscode-extension && npm run build
```

### 4. Running/Debugging the Core Engine
- **CLI Mode**: `npm run cli <workspace-path>`
- **Server Mode**: `npm run cli <workspace-path> --server --port 3000`
- **With Debugger**: VS Code launch config or `node --inspect-brk`

### 5. Running/Debugging the VS Code Extension
- Open `packages/vscode-extension` in VS Code
- Press F5 to launch Extension Development Host
- Requires engine server running on localhost:3000

### 6. Testing
- Unit tests: `npm run test:fast`
- Full test suite: `npm test`
- With coverage: `npm test -- --coverage`

### 7. Publishing the VS Code Extension
1. Install vsce: `npm install -g @vscode/vsce`
2. Create publisher account on Azure DevOps
3. Create Personal Access Token
4. Login: `vsce login <publisher>`
5. Package: `vsce package`
6. Publish: `vsce publish`

## Files to Modify
- `/media/adrian/SOURCE/Repos/DriftGuard/README.md`

## Key Additions
- Table of contents
- Prerequisites checklist
- Debug configuration explanation
- vsce publishing workflow
- Troubleshooting section for common issues

