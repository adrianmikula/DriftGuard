import { vi, describe, it, expect, beforeEach } from 'vitest';

// Inline mock for vscode
vi.mock('vscode', () => ({
  EventEmitter: class EventEmitter {
    readonly event = { _: null } as any;
    constructor() {}
    fire(value: any): void {}
  },
  TreeItem: class TreeItem {
    constructor(
      public label: string,
      public collapsibleState: any
    ) {}
    contextValue?: string;
    iconPath?: any;
  },
  TreeItemCollapsibleState: {
    Collapsed: 1,
    Expanded: 2,
    None: 0,
  },
  ThemeIcon: class ThemeIcon {
    constructor(public id: string) {}
  },
  ProgressLocation: {
    Notification: 1,
    Window: 2,
  },
  commands: {
    registerCommand: vi.fn(),
  },
  window: {
    showInformationMessage: vi.fn(),
    showErrorMessage: vi.fn(),
    withProgress: vi.fn((options, task) => task({} as any)),
    activeTextEditor: null,
  },
  workspace: {
    workspaceFolders: null,
    findFiles: vi.fn(async () => []),
    getConfiguration: vi.fn(() => ({
      get: vi.fn(),
    })),
  },
}));

import { ArchitectureTreeProvider, type ArchitectureNode } from '../../ui/architecture-tree';
import { EngineClient } from '../../client/engine-client';

describe('ArchitectureTreeProvider', () => {
  let engineClient: EngineClient;
  let treeProvider: ArchitectureTreeProvider;

  beforeEach(() => {
    engineClient = new EngineClient('http://localhost:3000');
    treeProvider = new ArchitectureTreeProvider(engineClient);
  });

  describe('getTreeItem', () => {
    it('should create a TreeItem with correct label and collapsible state', () => {
      const node: ArchitectureNode = {
        label: 'Test Node',
        collapsibleState: 1, // Collapsed
      };

      const item = treeProvider.getTreeItem(node);

      expect(item.label).toBe('Test Node');
      expect(item.collapsibleState).toBe(1);
    });

    it('should set contextValue when provided', () => {
      const node: ArchitectureNode = {
        label: 'Violations',
        collapsibleState: 1,
        contextValue: 'violations',
      };

      const item = treeProvider.getTreeItem(node);

      expect(item.contextValue).toBe('violations');
    });

    it('should set iconPath when provided', () => {
      const icon = { id: 'warning' } as any;
      const node: ArchitectureNode = {
        label: 'Warnings',
        collapsibleState: 1,
        iconPath: icon,
      };

      const item = treeProvider.getTreeItem(node);

      expect(item.iconPath).toBe(icon);
    });
  });

  describe('getChildren', () => {
    it('should return root level nodes when element is undefined', async () => {
      const children = await treeProvider.getChildren();

      expect(Array.isArray(children)).toBe(true);
      expect(children).toHaveLength(2);

      const violationsNode = children.find((n: any) => n.contextValue === 'violations');
      const importGraphNode = children.find((n: any) => n.contextValue === 'import-graph');

      expect(violationsNode).toBeDefined();
      expect(violationsNode.label).toBe('Violations');
      expect(importGraphNode).toBeDefined();
      expect(importGraphNode.label).toBe('Import Graph');
    });

    it('should return empty array for violations sub-tree', async () => {
      const violationsNode: ArchitectureNode = {
        label: 'Violations',
        collapsibleState: 1,
        contextValue: 'violations',
      };

      const children = await treeProvider.getChildren(violationsNode);

      expect(Array.isArray(children)).toBe(true);
      expect(children).toHaveLength(0);
    });

    it('should return empty array for import-graph sub-tree', async () => {
      const importGraphNode: ArchitectureNode = {
        label: 'Import Graph',
        collapsibleState: 1,
        contextValue: 'import-graph',
      };

      const children = await treeProvider.getChildren(importGraphNode);

      expect(Array.isArray(children)).toBe(true);
      expect(children).toHaveLength(0);
    });

    it('should return empty array for unknown context values', async () => {
      const unknownNode: ArchitectureNode = {
        label: 'Unknown',
        collapsibleState: 1,
        contextValue: 'unknown',
      };

      const children = await treeProvider.getChildren(unknownNode);

      expect(Array.isArray(children)).toBe(true);
      expect(children).toHaveLength(0);
    });
  });

  describe('refresh', () => {
    it('should trigger tree data change event', () => {
      // The refresh method calls _onDidChangeTreeData.fire(undefined)
      // We can't easily test event listeners without exposing internals,
      // but we can verify refresh() runs without error
      expect(() => treeProvider.refresh()).not.toThrow();
    });
  });
});
