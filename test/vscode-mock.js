export const commands = {
  registerCommand: vi.fn(() => ({ dispose: vi.fn() })),
};

export const window = {
  showErrorMessage: vi.fn(),
  showInformationMessage: vi.fn(),
  withProgress: vi.fn((options, task) => task({})),
  activeTextEditor: null,
};

export const workspace = {
  workspaceFolders: null,
  findFiles: vi.fn(async () => []),
};

export const TreeItem = class {
  label;
  collapsibleState;
  contextValue;
  iconPath;
  constructor(label, collapsibleState) {
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
  constructor(public id) {}
};
