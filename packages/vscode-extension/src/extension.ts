import * as vscode from 'vscode';
import { EngineClient } from './client/engine-client';
import { registerCommands } from './commands';
import { ArchitectureTreeProvider } from './ui/architecture-tree';

let engineClient: EngineClient;
let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
  console.log('DriftGuard extension is now active');

  // Initialize engine client
  engineClient = new EngineClient();

  // Create status bar item to show engine connection status
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.command = 'driftguard.checkStatus';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Perform health check asynchronously (don't block activation)
  checkEngineHealth().catch(console.error);

  // Initialize tree provider
  const treeProvider = new ArchitectureTreeProvider(engineClient);
  const treeView = vscode.window.createTreeView('driftguardArchitectureView', {
    treeDataProvider: treeProvider,
  });

  // Register commands
  registerCommands(context, engineClient, treeProvider);

  // Register status check command
  const checkStatusCommand = vscode.commands.registerCommand(
    'driftguard.checkStatus',
    async () => {
      await checkEngineHealth();
    }
  );
  context.subscriptions.push(checkStatusCommand);

  context.subscriptions.push(treeView);
}

async function checkEngineHealth() {
  try {
    const isHealthy = await engineClient.healthCheck();
    if (isHealthy) {
      statusBarItem.text = '$(check) DriftGuard: Connected';
      statusBarItem.tooltip = 'DriftGuard engine is running';
      statusBarItem.color = 'green';
    } else {
      statusBarItem.text = '$(warning) DriftGuard: Disconnected';
      statusBarItem.tooltip = 'DriftGuard engine is not reachable. Ensure the server is running.';
      statusBarItem.color = 'red';
    }
  } catch (error) {
    statusBarItem.text = '$(error) DriftGuard: Error';
    statusBarItem.tooltip = `Error checking engine: ${error}`;
    statusBarItem.color = 'red';
  }
}

export function deactivate() {
  console.log('DriftGuard extension is now deactivated');
}
