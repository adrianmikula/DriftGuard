import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { EngineClient } from '../client/engine-client';
import { ArchitectureTreeProvider } from '../ui/architecture-tree';

interface WorkspaceConfig {
  fileDiscovery?: {
    includePatterns?: string[];
    excludePatterns?: string[];
  };
}

const EXT_TO_LANGUAGE: Record<string, string> = {
  ts: 'typescript', tsx: 'typescript',
  js: 'javascript', jsx: 'javascript',
  py: 'python',
};

function detectLanguage(filePath: string): string {
  const ext = path.extname(filePath).slice(1).toLowerCase();
  return EXT_TO_LANGUAGE[ext] ?? 'typescript';
}

function loadWorkspaceConfig(workspacePath: string): WorkspaceConfig {
  try {
    const configPath = path.join(workspacePath, '.driftguard', 'config.json');
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    // Ignore and return defaults
  }
  return {};
}

export function registerCommands(
  context: vscode.ExtensionContext,
  engineClient: EngineClient,
  treeProvider: ArchitectureTreeProvider
) {
  const scanWorkspaceCommand = vscode.commands.registerCommand(
    'driftguard.scanWorkspace',
    async () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder found');
        return;
      }

      const workspacePath = workspaceFolders[0].uri.fsPath;
      const config = loadWorkspaceConfig(workspacePath);

      const includePatterns = config.fileDiscovery?.includePatterns || ['**/*.{ts,tsx}'];
      const excludePatterns = config.fileDiscovery?.excludePatterns || ['**/node_modules/**', '**/dist/**'];

      const includeGlob = includePatterns.join(';');
      const excludeGlob = excludePatterns.join(';');

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Scanning workspace for architectural drift...',
          cancellable: false,
        },
        async (progress) => {
          try {
            const files = await vscode.workspace.findFiles(includeGlob, excludeGlob);
            const filePaths = files.map(f => f.fsPath);

            const result = await engineClient.scan({
              workspacePath,
              language: detectLanguage(filePaths[0] ?? ''),
              files: filePaths,
            });

            if (result.success) {
              vscode.window.showInformationMessage(
                `Scan complete: ${result.metrics.filesScanned} files scanned, ${result.violations.length} violations found`
              );
              treeProvider.refresh();
            } else {
              vscode.window.showErrorMessage('Scan failed');
            }
          } catch (error) {
            vscode.window.showErrorMessage(`Scan error: ${error}`);
          }
        }
      );
    }
  );

  const scanFileCommand = vscode.commands.registerCommand(
    'driftguard.scanFile',
    async () => {
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor) {
        vscode.window.showErrorMessage('No active file');
        return;
      }

      const filePath = activeEditor.document.uri.fsPath;
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder found');
        return;
      }

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Scanning file for architectural drift...',
          cancellable: false,
        },
        async (progress) => {
          try {
            const result = await engineClient.scan({
              workspacePath: workspaceFolders[0].uri.fsPath,
              language: detectLanguage(filePath),
              files: [filePath],
            });

            if (result.success) {
              vscode.window.showInformationMessage(
                `Scan complete: ${result.violations.length} violations found`
              );
            } else {
              vscode.window.showErrorMessage('Scan failed');
            }
          } catch (error) {
            vscode.window.showErrorMessage(`Scan error: ${error}`);
          }
        }
      );
    }
  );

  const defaultConfig = {
    layers: [
      { name: 'ui', pattern: 'src/ui/**', canImport: ['domain'], cannotImport: ['infrastructure'] },
      { name: 'domain', pattern: 'src/domain/**', canImport: [], cannotImport: ['ui', 'infrastructure'] },
      { name: 'infrastructure', pattern: 'src/infrastructure/**', canImport: ['domain'], cannotImport: ['ui'] },
    ],
    analyzer: { fileExtensions: ['ts', 'tsx'] },
    fileDiscovery: {
      includePatterns: ['**/*.{ts,tsx}'],
      excludePatterns: ['**/node_modules/**', '**/dist/**'],
    },
    rules: {
      'boundary-violation': { enabled: true, severity: 'error' },
      'circular-dependency': { enabled: true, severity: 'warning' },
    },
    database: { uri: 'bolt://localhost:7687' },
    engine: { url: 'http://localhost:3000' },
  };

  const openConfigCommand = vscode.commands.registerCommand(
    'driftguard.openConfig',
    async () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder found');
        return;
      }

      const workspacePath = workspaceFolders[0].uri.fsPath;
      const configDir = path.join(workspacePath, '.driftguard');
      const configPath = path.join(configDir, 'config.json');

      try {
        if (!fs.existsSync(configPath)) {
          const answer = await vscode.window.showInformationMessage(
            'No DriftGuard config found. Create a default config.json?',
            'Create',
            'Cancel'
          );
          if (answer !== 'Create') {
            return;
          }
          if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
          }
          fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), 'utf-8');
        }
        const document = await vscode.workspace.openTextDocument(configPath);
        await vscode.window.showTextDocument(document);
      } catch (error) {
        vscode.window.showErrorMessage(`Could not open config file: ${error}`);
      }
    }
  );

  context.subscriptions.push(scanWorkspaceCommand, scanFileCommand, openConfigCommand);
}
