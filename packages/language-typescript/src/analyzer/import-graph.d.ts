import { ParsedFile } from '../parser/ast-parser';
export interface ImportEdge {
    from: string;
    to: string;
    isTypeOnly: boolean;
    line: number;
}
export declare class ImportGraphAnalyzer {
    private edges;
    private files;
    buildGraph(parsedFiles: ParsedFile[]): ImportEdge[];
    detectCycles(): string[][];
    getDependencies(file: string): ImportEdge[];
    getDependents(file: string): ImportEdge[];
    private resolveImportPath;
}
