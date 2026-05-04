export interface ParsedFile {
    path: string;
    imports: ImportStatement[];
    exports: ExportStatement[];
    classes: ClassInfo[];
    functions: FunctionInfo[];
    interfaces: InterfaceInfo[];
}
export interface ImportStatement {
    module: string;
    isTypeOnly: boolean;
    line: number;
    namedImports?: string[];
    defaultImport?: string;
}
export interface ExportStatement {
    name: string;
    isDefault: boolean;
    isType: boolean;
    line: number;
}
export interface ClassInfo {
    name: string;
    isExported: boolean;
    isAbstract: boolean;
    extends?: string;
    implements: string[];
    methods: FunctionInfo[];
    properties: PropertyInfo[];
    line: number;
}
export interface FunctionInfo {
    name: string;
    isExported: boolean;
    isAsync: boolean;
    isStatic: boolean;
    parameters: ParameterInfo[];
    returnType?: string;
    line: number;
}
export interface PropertyInfo {
    name: string;
    type?: string;
    isReadonly: boolean;
    isStatic: boolean;
    line: number;
}
export interface ParameterInfo {
    name: string;
    type?: string;
    isOptional: boolean;
}
export interface InterfaceInfo {
    name: string;
    isExported: boolean;
    extends: string[];
    properties: PropertyInfo[];
    methods: FunctionInfo[];
    line: number;
}
export declare class ASTParser {
    private project;
    constructor(tsConfigPath?: string);
    parseFile(filePath: string): ParsedFile;
    parseFiles(filePaths: string[]): ParsedFile[];
    private extractFileInfo;
    private extractImports;
    private extractExports;
    private extractClasses;
    private extractFunctions;
    private extractInterfaces;
}
