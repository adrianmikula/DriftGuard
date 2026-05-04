import { vi } from 'vitest';

export const commands = {
  registerCommand: vi.fn(() => ({ dispose: vi.fn() })),
};

export const window = {
  showErrorMessage: vi.fn(),
  showInformationMessage: vi.fn(),
  withProgress: vi.fn((options, task) => task({} as any)),
  activeTextEditor: null,
};

export const workspace = {
  workspaceFolders: null,
  findFiles: vi.fn(async () => []),
};

export const TreeItem = class {
  label: string;
  collapsibleState: any;
  contextValue?: string;
  iconPath?: any;
  constructor(label: string, collapsibleState: any) {
    this.label = label;
    this.collapsibleState = collapsibleState;
  }
};

export const TreeItemCollapsibleState = {
  Collapsed: 1,
  Expanded: 2,
  None: 0,
};

export const ThemeIcon = class {
  constructor(public id: string) {}
};
