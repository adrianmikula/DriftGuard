# Fix DriftGuard "fetch failed" Errors in VS Code Panel

Improve the user experience when the DriftGuard engine server is not running by showing helpful error messages with a "Start Engine" action instead of raw connection errors.

## Problem
When expanding "Violations" or "Import Graph" in the DriftGuard panel, users see raw "fetch failed" or "Connection failed" errors because the engine server at `localhost:3000` is not running.

## Root Cause
- `architecture-tree.ts` catches errors from `engineClient.getViolations()`/`getImportGraph()` and displays them as tree item labels
- The error messages are technical (e.g., "Connection failed: connect ECONNREFUSED...")
- Users don't know they need to start the engine server or how to do it

## Solution
Update the error handling in `architecture-tree.ts` to:
1. Detect when the error is a connection failure (engine not running)
2. Show a user-friendly message: "Engine not running. Click to start."
3. Add a command to tree items that allows users to start the engine from the UI
4. Auto-retry or refresh the tree when the engine starts

## Implementation Steps
1. **Modify architecture-tree.ts** - Update error nodes to show actionable messages with a `command` property that triggers engine start
2. **Update extension.ts** - Export a command to start the engine that can be invoked from tree items
3. **Add refresh-after-start logic** - Automatically refresh the tree view after the engine starts

## Files to Modify
- `/media/adrian/SOURCE/Repos/DriftGuard/packages/vscode-extension/src/ui/architecture-tree.ts`
- `/media/adrian/SOURCE/Repos/DriftGuard/packages/vscode-extension/src/extension.ts`
