import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { EngineClient } from './client/engine-client';
import { registerCommands } from './commands';
import { ArchitectureTreeProvider } from './ui/architecture-tree';
import { checkTrialAndNotify, isTrialActive } from './trial';

let engineClient: EngineClient;
let statusBarItem: vscode.StatusBarItem;
let engineProcess: cp.ChildProcess | undefined;
let treeProvider: ArchitectureTreeProvider | undefined;

function createEngineClient(): EngineClient {
  const config = vscode.workspace.getConfiguration('driftguard');
  const engineUrl = config.get<string>('engineUrl', 'http://localhost:3000');
  const timeoutMs = config.get<number>('timeoutMs', 30000);
  return new EngineClient(engineUrl, timeoutMs);
}

export function activate(context: vscode.ExtensionContext) {
  console.log('DriftGuard extension is now active');

  // Check trial status and notify user
  checkTrialAndNotify(context);

  // Initialize engine client from VS Code settings
  engineClient = createEngineClient();

  // Create status bar item to show engine connection status
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.command = 'driftguard.checkStatus';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Start engine immediately on activation, then verify health
  startEngineServer().catch((error) => {
    console.warn(`[DriftGuard] Engine auto-start failed: ${error}`);
  });

  // Initialize tree provider
  treeProvider = new ArchitectureTreeProvider(engineClient);
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

  // Register trial status check command
  const checkTrialCommand = vscode.commands.registerCommand(
    'driftguard.checkTrialStatus',
    async () => {
      const active = isTrialActive(context);
      const config = vscode.workspace.getConfiguration('driftguard');
      const hasLicense = config.get<string>('licenseKey', '').trim().length > 0;
      if (hasLicense) {
        vscode.window.showInformationMessage('DriftGuard is fully licensed. Thank you for your support!');
      } else if (active) {
        vscode.window.showInformationMessage('DriftGuard trial is active. Enjoy the full feature set.');
      } else {
        vscode.window.showWarningMessage(
          'DriftGuard trial has expired. Please purchase a license to continue using the extension.',
          'Purchase'
        ).then(selection => {
          if (selection === 'Purchase') {
            vscode.env.openExternal(vscode.Uri.parse('https://marketplace.visualstudio.com/items?itemName=CodeMedic.driftguard'));
          }
        });
      }
    }
  );
  context.subscriptions.push(checkTrialCommand);

  context.subscriptions.push(treeView);

  // Re-create the engine client when settings change
  const configWatcher = vscode.workspace.onDidChangeConfiguration(e => {
    if (e.affectsConfiguration('driftguard')) {
      engineClient = createEngineClient();
      if (treeProvider) {
        treeProvider.updateClient(engineClient);
      }
      checkEngineHealth().catch(console.error);
    }
  });
  context.subscriptions.push(configWatcher);
}

async function checkEngineHealth() {
  try {
    const isHealthy = await engineClient.healthCheck();
    if (isHealthy) {
      statusBarItem.text = '$(check) DriftGuard: Connected';
      statusBarItem.tooltip = 'DriftGuard engine is running';
      statusBarItem.color = undefined; // Use default color
    } else {
      statusBarItem.text = '$(warning) DriftGuard: Disconnected';
      statusBarItem.tooltip = 'DriftGuard engine is not reachable. Attempting to start...';
      statusBarItem.color = undefined;
      // Try to auto-start the engine
      await startEngineServer();
    }
  } catch (error) {
    statusBarItem.text = '$(error) DriftGuard: Error';
    statusBarItem.tooltip = `Error checking engine: ${error}. Attempting to start...`;
    statusBarItem.color = undefined;
    // Try to auto-start the engine
    await startEngineServer();
  }
}

function findEngineCliPath(): string | undefined {
  // Try to find the engine CLI in the monorepo structure
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    console.log('[DriftGuard] No workspace folders open');
    return undefined;
  }

  const workspaceRoot = workspaceFolders[0].uri.fsPath;
  console.log(`[DriftGuard] Workspace root: ${workspaceRoot}`);

  // Check if we're in the DriftGuard monorepo
  const possiblePaths = [
    path.join(workspaceRoot, 'packages', 'core-engine', 'dist', 'cli', 'index.js'),
    path.join(workspaceRoot, '..', 'core-engine', 'dist', 'cli', 'index.js'),
    path.join(workspaceRoot, '..', '..', 'packages', 'core-engine', 'dist', 'cli', 'index.js'),
  ];

  for (const cliPath of possiblePaths) {
    const resolvedPath = path.resolve(cliPath);
    const exists = fs.existsSync(resolvedPath);
    console.log(`[DriftGuard] Checking: ${resolvedPath} -> ${exists ? 'FOUND' : 'NOT FOUND'}`);
    if (exists) {
      return resolvedPath;
    }
  }

  return undefined;
}

async function startEngineServer(): Promise<void> {
  if (engineProcess) {
    // Engine already running
    return;
  }

  const engineCliPath = findEngineCliPath();
  if (!engineCliPath) {
    vscode.window.showWarningMessage(
      'DriftGuard engine not found. Please start the engine manually: cd packages/core-engine && node dist/cli/index.js <workspace> --server --port 3000'
    );
    return;
  }

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showWarningMessage('No workspace folder open. Cannot start DriftGuard engine.');
    return;
  }

  const workspacePath = workspaceFolders[0].uri.fsPath;
  const port = 3000;

  vscode.window.showInformationMessage('Starting DriftGuard engine server...');

  try {
    engineProcess = cp.spawn('node', [engineCliPath, workspacePath, '--server', `--port ${port}`], {
      detached: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    engineProcess.stdout?.on('data', (data) => {
      console.log(`[DriftGuard Engine] ${data}`);
    });

    engineProcess.stderr?.on('data', (data) => {
      console.error(`[DriftGuard Engine] ${data}`);
    });

    engineProcess.on('error', (error) => {
      vscode.window.showErrorMessage(`Failed to start DriftGuard engine: ${error.message}`);
      engineProcess = undefined;
    });

    engineProcess.on('exit', (code) => {
      console.log(`DriftGuard engine exited with code ${code}`);
      engineProcess = undefined;
    });

    // Wait a moment for the server to start, then check health
    await new Promise(resolve => setTimeout(resolve, 2000));
    await checkEngineHealth();

    // Refresh the tree view after engine starts so connection error items are replaced with actual data
    if (treeProvider) {
      treeProvider.refresh();
    }

  } catch (error) {
    vscode.window.showErrorMessage(`Error starting DriftGuard engine: ${error}`);
    engineProcess = undefined;
  }
}

export function deactivate(): void {
  if (engineProcess) {
    engineProcess.kill();
    engineProcess = undefined;
  }
}

