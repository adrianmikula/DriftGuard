export interface ParsedFile {
    path: string;
    imports: ImportStatement[];
    exports: ExportStatement[];
    classes: ClassInfo[];
    functions: FunctionInfo[];
}
export interface ImportStatement {
    module: string;
    isFromImport: boolean;
    line: number;
    names?: string[];
}
export interface ExportStatement {
    name: string;
    line: number;
}
export interface ClassInfo {
    name: string;
    bases: string[];
    methods: FunctionInfo[];
    line: number;
}
export interface FunctionInfo {
    name: string;
    parameters: string[];
    isAsync: boolean;
    line: number;
}
export declare class ASTParser {
    parseFile(filePath: string): ParsedFile;
    parseFiles(filePaths: string[]): ParsedFile[];
}
