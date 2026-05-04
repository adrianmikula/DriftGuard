import { ParsedFile } from '../parser/ast-parser';
export interface LayerRule {
    name: string;
    pattern: string;
    canImport: string[];
    cannotImport: string[];
}
export interface BoundaryViolation {
    file: string;
    import: string;
    rule: string;
    line: number;
}
export declare class BoundaryChecker {
    addRule(rule: LayerRule): void;
    check(parsedFiles: ParsedFile[]): BoundaryViolation[];
}
