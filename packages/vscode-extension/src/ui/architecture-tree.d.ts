import * as vscode from 'vscode';
import { EngineClient } from '../client/engine-client';
export interface ArchitectureNode {
    label: string;
    collapsibleState: vscode.TreeItemCollapsibleState;
    children?: ArchitectureNode[];
    iconPath?: vscode.ThemeIcon;
    contextValue?: string;
}
export declare class ArchitectureTreeProvider implements vscode.TreeDataProvider<ArchitectureNode> {
    private engineClient;
    private _onDidChangeTreeData;
    readonly onDidChangeTreeData: vscode.Event<ArchitectureNode | undefined>;
    constructor(engineClient: EngineClient);
    refresh(): void;
    getTreeItem(element: ArchitectureNode): vscode.TreeItem;
    getChildren(element?: ArchitectureNode): Promise<ArchitectureNode[]>;
}
