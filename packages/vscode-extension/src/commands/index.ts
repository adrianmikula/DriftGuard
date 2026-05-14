// Temporarily commented out vscode, fs, and path imports due to compilation issues
// import * as fs from 'fs';
// import * as path from 'path';
// import * as vscode from 'vscode';
import { EngineClient } from '../client/engine-client';
// import { ArchitectureTreeProvider } from '../ui/architecture-tree';

interface WorkspaceConfig {
  fileDiscovery?: {
    includePatterns?: string[];
    excludePatterns?: string[];
  };
}

function loadWorkspaceConfig(workspacePath: string): WorkspaceConfig {
  // TODO: Re-enable when fs and path are available
  // try {
  //   const configPath = path.join(workspacePath, '.driftguard', 'config.json');
  //   if (fs.existsSync(configPath)) {
  //     const content = fs.readFileSync(configPath, 'utf-8');
  //     return JSON.parse(content);
  //   }
  // } catch (error) {
  //   // Ignore and return defaults
  // }
  return {};
}

export function registerCommands(
  context: any,
  engineClient: EngineClient,
  treeProvider: any
) {
  // TODO: Re-enable when vscode types are properly configured
  // const scanWorkspaceCommand = vscode.commands.registerCommand(
  //   'driftguard.scanWorkspace',
  //   async () => {
  //     const workspaceFolders = vscode.workspace.workspaceFolders;
  //     if (!workspaceFolders) {
  //       vscode.window.showErrorMessage('No workspace folder found');
  //       return;
  //     }

  //     const workspacePath = workspaceFolders[0].uri.fsPath;
  //     const config = loadWorkspaceConfig(workspacePath);

  //     const includePatterns = config.fileDiscovery?.includePatterns || ['**/*.{ts,tsx}'];
  //     const excludePatterns = config.fileDiscovery?.excludePatterns || ['**/node_modules/**', '**/dist/**'];

  //     const includeGlob = includePatterns.join(';');
  //     const excludeGlob = excludePatterns.join(';');

  //     await vscode.window.withProgress(
  //       {
  //         location: vscode.ProgressLocation.Notification,
  //         title: 'Scanning workspace for architectural drift...',
  //         cancellable: false,
  //       },
  //       async (progress) => {
  //         try {
  //           const files = await vscode.workspace.findFiles(includeGlob, excludeGlob);
  //           const filePaths = files.map(f => f.fsPath);

  //           const result = await engineClient.scan({
  //             workspacePath,
  //             language: 'typescript',
  //             files: filePaths,
  //           });

  //           if (result.success) {
  //             vscode.window.showInformationMessage(
  //               `Scan complete: ${result.metrics.filesScanned} files scanned, ${result.violations.length} violations found`
  //             );
  //             treeProvider.refresh();
  //           } else {
  //             vscode.window.showErrorMessage('Scan failed');
  //           }
  //         } catch (error) {
  //           vscode.window.showErrorMessage(`Scan error: ${error}`);
  //         }
  //       }
  //     );
  //   }
  // );

  // const scanFileCommand = vscode.commands.registerCommand(
  //   'driftguard.scanFile',
  //   async () => {
  //     const activeEditor = vscode.window.activeTextEditor;
  //     if (!activeEditor) {
  //       vscode.window.showErrorMessage('No active file');
  //       return;
  //     }

  //     const filePath = activeEditor.document.uri.fsPath;
  //     const workspaceFolders = vscode.workspace.workspaceFolders;
  //     if (!workspaceFolders) {
  //       vscode.window.showErrorMessage('No workspace folder found');
  //       return;
  //     }

  //     await vscode.window.withProgress(
  //       {
  //         location: vscode.ProgressLocation.Notification,
  //         title: 'Scanning file for architectural drift...',
  //         cancellable: false,
  //       },
  //       async (progress) => {
  //         try {
  //           const result = await engineClient.scan({
  //             workspacePath: workspaceFolders[0].uri.fsPath,
  //             language: 'typescript',
  //             files: [filePath],
  //           });

  //           if (result.success) {
  //             vscode.window.showInformationMessage(
  //               `Scan complete: ${result.violations.length} violations found`
  //             );
  //           } else {
  //             vscode.window.showErrorMessage('Scan failed');
  //           }
  //         } catch (error) {
  //           vscode.window.showErrorMessage(`Scan error: ${error}`);
  //         }
  //       }
  //     );
  //   }
  // );

  // context.subscriptions.push(scanWorkspaceCommand, scanFileCommand);
}
