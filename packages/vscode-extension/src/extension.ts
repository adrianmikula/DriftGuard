import * as vscode from 'vscode';
import { EngineClient } from './client/engine-client';
import { registerCommands } from './commands';
import { ArchitectureTreeProvider } from './ui/architecture-tree';

export function activate(context: vscode.ExtensionContext) {
  console.log('DriftGuard extension is now active');

  const engineClient = new EngineClient();
  const treeProvider = new ArchitectureTreeProvider(engineClient);

  // Register tree view
  const treeView = vscode.window.createTreeView('driftguardArchitectureView', {
    treeDataProvider: treeProvider,
  });

  // Register commands
  registerCommands(context, engineClient, treeProvider);

  context.subscriptions.push(treeView);
}

export function deactivate() {
  console.log('DriftGuard extension is now deactivated');
}
