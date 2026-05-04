import * as vscode from 'vscode';
import { EngineClient } from '../client/engine-client';
import { ArchitectureTreeProvider } from '../ui/architecture-tree';
export declare function registerCommands(context: vscode.ExtensionContext, engineClient: EngineClient, treeProvider: ArchitectureTreeProvider): void;
