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
  private _onDidChangeTreeData = new vscode.EventEmitter<ArchitectureNode | undefined | null>();
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
      // Fetch actual violations from engine
      try {
        const violations = await this.engineClient.getViolations();
        return violations.map(v => ({
          label: `${v.ruleId}: ${v.message}`,
          collapsibleState: vscode.TreeItemCollapsibleState.None,
          iconPath: new vscode.ThemeIcon('error'),
          contextValue: 'violation',
        }));
      } catch (error) {
        return [{
          label: `Error loading violations: ${error}`,
          collapsibleState: vscode.TreeItemCollapsibleState.None,
          iconPath: new vscode.ThemeIcon('error'),
          contextValue: 'error',
        }];
      }
    }

    if (element.contextValue === 'import-graph') {
      // Fetch actual import graph from engine
      try {
        const graph = await this.engineClient.getImportGraph();
        return graph.imports.map((imp: any) => ({
          label: `${imp.from} → ${imp.to}`,
          collapsibleState: vscode.TreeItemCollapsibleState.None,
          iconPath: new vscode.ThemeIcon('references'),
          contextValue: 'import',
        }));
      } catch (error) {
        return [{
          label: `Error loading import graph: ${error}`,
          collapsibleState: vscode.TreeItemCollapsibleState.None,
          iconPath: new vscode.ThemeIcon('error'),
          contextValue: 'error',
        }];
      }
    }

    return [];
  }
}
