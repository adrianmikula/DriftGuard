import { ParsedFile } from '../parser/ast-parser';
export interface ImportEdge {
    from: string;
    to: string;
    line: number;
}
export declare class ImportGraphAnalyzer {
    buildGraph(parsedFiles: ParsedFile[]): ImportEdge[];
    detectCycles(): string[][];
}
