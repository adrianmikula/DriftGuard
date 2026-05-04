import { vi } from 'vitest';

// Mock vscode module for unit tests - exports as ES module members
export const EventEmitter = class EventEmitter {
  readonly event = { _: null } as any;
  constructor() {}
  fire(value: any): void {}
};

export const TreeItem = class TreeItem {
  constructor(
    public label: string,
    public collapsibleState: any
  ) {}
  contextValue?: string;
  iconPath?: any;
};

export const TreeItemCollapsibleState = {
  Collapsed: 1,
  Expanded: 2,
  None: 0,
};

export const ThemeIcon = class ThemeIcon {
  constructor(public id: string) {}
};

export const commands = {
  registerCommand: vi.fn(),
};

export const window = {
  showInformationMessage: vi.fn(),
  showErrorMessage: vi.fn(),
  withProgress: vi.fn((options, task) => task({} as any)),
  activeTextEditor: null,
};

export const workspace = {
  workspaceFolders: null,
  findFiles: vi.fn(async () => []),
};

// Also provide a default export for namespace import compatibility
export default {
  EventEmitter,
  TreeItem,
  TreeItemCollapsibleState,
  ThemeIcon,
  commands,
  window,
  workspace,
};

// Reset function
export function resetVSCodeMocks() {
  vi.clearAllMocks();
  (window as any).activeTextEditor = null;
  (workspace as any).workspaceFolders = null;
  (workspace as any).findFiles.mockClear();
}

export function setActiveEditor(filePath: string) {
  (window as any).activeTextEditor = {
    document: { uri: { fsPath: filePath } },
  };
}

export function setWorkspaceFolders(paths: string[]) {
  (workspace as any).workspaceFolders = paths.map(p => ({ uri: { fsPath: p } }));
}

export function setFoundFiles(filePaths: string[]) {
  (workspace as any).findFiles.mockResolvedValue(filePaths.map(f => ({ fsPath: f })));
}
