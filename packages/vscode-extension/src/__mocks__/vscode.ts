import { vi } from 'vitest';

// Mock vscode module for unit tests
const mockCommands = {
  registerCommand: vi.fn(),
};

const mockWindow = {
  showInformationMessage: vi.fn(),
  showErrorMessage: vi.fn(),
  withProgress: vi.fn((options, task) => task({} as any)),
  activeTextEditor: null,
};

const mockWorkspace = {
  workspaceFolders: null,
  findFiles: vi.fn(async () => []),
};

const mockTreeItem = class {
  constructor(public label: string, public collapsibleState: any) {
    // ignore
  }
  contextValue?: string;
  iconPath?: any;
};

const mockThemeIcon = class {
  constructor(public id: string) {}
};

const TreeItemCollapsibleState = {
  Collapsed: 1,
  Expanded: 2,
  None: 0,
};

const mockEventEmitter = class<T> {
  private _event: T | undefined;
  readonly event = {_: null} as any;
  fire(value: T | undefined) {
    this._event = value;
  }
};

export const vscode = {
  commands: mockCommands,
  window: mockWindow,
  workspace: mockWorkspace,
  TreeItem: mockTreeItem as any,
  ThemeIcon: mockThemeIcon as any,
  TreeItemCollapsibleState: TreeItemCollapsibleState,
  EventEmitter: mockEventEmitter as any,
};

// Reset all mocks
export function resetVSCodeMocks() {
  vi.clearAllMocks();
  mockWindow.activeTextEditor = null;
  mockWorkspace.workspaceFolders = null;
  mockWorkspace.findFiles.mockClear();
}

// Helper to set active editor
export function setActiveEditor(filePath: string) {
  mockWindow.activeTextEditor = {
    document: {
      uri: { fsPath: filePath },
    },
  };
}

// Helper to set workspace folders
export function setWorkspaceFolders(paths: string[]) {
  mockWorkspace.workspaceFolders = paths.map(p => ({ uri: { fsPath: p } }));
}

// Helper to set found files
export function setFoundFiles(filePaths: string[]) {
  mockWorkspace.findFiles.mockResolvedValue(filePaths.map(f => ({ fsPath: f })));
}
