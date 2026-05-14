// Temporarily commented out vscode imports due to compilation issues
// import * as vscode from 'vscode';
import { EngineClient } from '../client/engine-client';

export interface ArchitectureNode {
  label: string;
  collapsibleState: number; // vscode.TreeItemCollapsibleState
  children?: ArchitectureNode[];
  iconPath?: any; // vscode.ThemeIcon
  contextValue?: string;
}

export class ArchitectureTreeProvider {
  // TODO: Re-enable when vscode types are properly configured
  // private _onDidChangeTreeData = new vscode.EventEmitter<ArchitectureNode | undefined>();
  // readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private engineClient: EngineClient) {}

  refresh(): void {
    // this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: ArchitectureNode): any {
    // TODO: Re-enable when vscode types are properly configured
    // const treeItem = new vscode.TreeItem(element.label, element.collapsibleState);
    // treeItem.contextValue = element.contextValue;
    // treeItem.iconPath = element.iconPath;
    // return treeItem;
    return element;
  }

  async getChildren(element?: ArchitectureNode): Promise<ArchitectureNode[]> {
    if (!element) {
      // Root level
      return [
        {
          label: 'Violations',
          collapsibleState: 1, // vscode.TreeItemCollapsibleState.Collapsed
          iconPath: { id: 'warning' }, // new vscode.ThemeIcon('warning')
          contextValue: 'violations',
        },
        {
          label: 'Import Graph',
          collapsibleState: 1, // vscode.TreeItemCollapsibleState.Collapsed
          iconPath: { id: 'graph' }, // new vscode.ThemeIcon('graph')
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
