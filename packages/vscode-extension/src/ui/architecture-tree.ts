import * as vscode from 'vscode';
import { EngineClient } from '../client/engine-client';

export interface ArchitectureNode {
  label: string;
  collapsibleState: vscode.TreeItemCollapsibleState;
  children?: ArchitectureNode[];
  iconPath?: vscode.ThemeIcon;
  contextValue?: string;
}

export class ArchitectureTreeProvider implements vscode.TreeDataProvider<ArchitectureNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<ArchitectureNode | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private engineClient: EngineClient) {}

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: ArchitectureNode): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(element.label, element.collapsibleState);
    treeItem.contextValue = element.contextValue;
    treeItem.iconPath = element.iconPath;
    return treeItem;
  }

  async getChildren(element?: ArchitectureNode): Promise<ArchitectureNode[]> {
    if (!element) {
      // Root level
      return [
        {
          label: 'Violations',
          collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
          iconPath: new vscode.ThemeIcon('warning'),
          contextValue: 'violations',
        },
        {
          label: 'Import Graph',
          collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
          iconPath: new vscode.ThemeIcon('graph'),
          contextValue: 'import-graph',
        },
      ];
    }

    if (element.contextValue === 'violations') {
      // TODO: Fetch actual violations from engine
      return [];
    }

    if (element.contextValue === 'import-graph') {
      // TODO: Fetch actual import graph from engine
      return [];
    }

    return [];
  }
}
