export declare const vscode: {
    commands: {
        registerCommand: import("vitest").Mock<(...args: any[]) => any>;
    };
    window: {
        showInformationMessage: import("vitest").Mock<(...args: any[]) => any>;
        showErrorMessage: import("vitest").Mock<(...args: any[]) => any>;
        withProgress: import("vitest").Mock<(options: any, task: any) => any>;
        activeTextEditor: null;
    };
    workspace: {
        workspaceFolders: null;
        findFiles: import("vitest").Mock<() => Promise<never[]>>;
    };
    TreeItem: any;
    ThemeIcon: any;
    TreeItemCollapsibleState: {
        Collapsed: number;
        Expanded: number;
        None: number;
    };
    EventEmitter: any;
};
export declare function resetVSCodeMocks(): void;
export declare function setActiveEditor(filePath: string): void;
export declare function setWorkspaceFolders(paths: string[]): void;
export declare function setFoundFiles(filePaths: string[]): void;
