import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as vscode from 'vscode';
import { registerCommands } from '../../commands';
import { EngineClient } from '../../client/engine-client';
import { ArchitectureTreeProvider } from '../../ui/architecture-tree';

// Mock the vscode module
vi.mock('vscode', () => ({
  commands: {
    registerCommand: vi.fn(() => ({ dispose: vi.fn() })),
  },
  window: {
    showErrorMessage: vi.fn(),
    showInformationMessage: vi.fn(),
    withProgress: vi.fn((options, task) => task({} as any)),
    activeTextEditor: null,
  },
  workspace: {
    workspaceFolders: null,
    findFiles: vi.fn(async () => []),
  },
}));

describe('Commands', () => {
  let context: any;
  let engineClient: EngineClient;
  let treeProvider: ArchitectureTreeProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    context = {
      subscriptions: [],
    };
    engineClient = new EngineClient('http://localhost:3000');
    treeProvider = new ArchitectureTreeProvider(engineClient);
  });

  describe('registerCommands', () => {
    it('should register both scan commands', () => {
      registerCommands(context, engineClient, treeProvider);
      expect(vscode.commands.registerCommand).toHaveBeenCalledTimes(2);
    });

    it('should add both commands to context subscriptions', () => {
      registerCommands(context, engineClient, treeProvider);
      expect(context.subscriptions).toHaveLength(2);
    });

    it('should register driftguard.scanWorkspace command', () => {
      registerCommands(context, engineClient, treeProvider);
      const calls = (vscode.commands.registerCommand as any).mock.calls;
      expect(calls[0][0]).toBe('driftguard.scanWorkspace');
    });

    it('should register driftguard.scanFile command', () => {
      registerCommands(context, engineClient, treeProvider);
      const calls = (vscode.commands.registerCommand as any).mock.calls;
      expect(calls[1][0]).toBe('driftguard.scanFile');
    });
  });

  describe('scanWorkspace command logic', () => {
    it('should show error when no workspace folder', async () => {
      registerCommands(context, engineClient, treeProvider);
      const commandFn = (vscode.commands.registerCommand as any).mock.calls[0][1];

      await commandFn();

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('No workspace folder found');
    });

    it('should call engineClient.scan with correct parameters', async () => {
      const mockScan = vi.spyOn(engineClient, 'scan').mockResolvedValue({
        success: true,
        violations: [],
        metrics: { filesScanned: 1, nodesCreated: 0, edgesCreated: 0, duration: 0 },
      });

      (vscode.workspace as any).workspaceFolders = [{ uri: { fsPath: '/test' } }];
      (vscode.workspace as any).findFiles = vi.fn(async () => [{ fsPath: '/test/file.ts' }]);

      registerCommands(context, engineClient, treeProvider);
      const commandFn = (vscode.commands.registerCommand as any).mock.calls[0][1];

      await commandFn();

      expect(mockScan).toHaveBeenCalledWith({
        workspacePath: '/test',
        language: 'typescript',
        files: ['/test/file.ts'],
      });
    });

    it('should show success message when scan succeeds', async () => {
      (vscode.workspace as any).workspaceFolders = [{ uri: { fsPath: '/test' } }];
      (vscode.workspace as any).findFiles = vi.fn(async () => [{ fsPath: '/test/file.ts' }]);

      registerCommands(context, engineClient, treeProvider);
      const commandFn = (vscode.commands.registerCommand as any).mock.calls[0][1];

      await commandFn();

      expect(vscode.window.showInformationMessage).toHaveBeenCalled();
    });

    it('should refresh tree provider on success', async () => {
      const refreshSpy = vi.spyOn(treeProvider, 'refresh');
      (vscode.workspace as any).workspaceFolders = [{ uri: { fsPath: '/test' } }];
      (vscode.workspace as any).findFiles = vi.fn(async () => [{ fsPath: '/test/file.ts' }]);

      registerCommands(context, engineClient, treeProvider);
      const commandFn = (vscode.commands.registerCommand as any).mock.calls[0][1];

      await commandFn();

      expect(refreshSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('scanFile command logic', () => {
    it('should show error when no active editor', async () => {
      registerCommands(context, engineClient, treeProvider);
      const commandFn = (vscode.commands.registerCommand as any).mock.calls[1][1];

      await commandFn();

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('No active file');
    });

    it('should call engineClient.scan with single file', async () => {
      const mockScan = vi.spyOn(engineClient, 'scan').mockResolvedValue({
        success: true,
        violations: [],
        metrics: { filesScanned: 1, nodesCreated: 0, edgesCreated: 0, duration: 0 },
      });

      (vscode.window as any).activeTextEditor = {
        document: { uri: { fsPath: '/test/specific.ts' } },
      };
      (vscode.workspace as any).workspaceFolders = [{ uri: { fsPath: '/test' } }];

      registerCommands(context, engineClient, treeProvider);
      const commandFn = (vscode.commands.registerCommand as any).mock.calls[1][1];

      await commandFn();

      expect(mockScan).toHaveBeenCalledWith({
        workspacePath: '/test',
        language: 'typescript',
        files: ['/test/specific.ts'],
      });
    });
  });
});
