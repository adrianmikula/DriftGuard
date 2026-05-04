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
    private rules;
    addRule(rule: LayerRule): void;
    removeRule(ruleName: string): void;
    check(parsedFiles: ParsedFile[]): BoundaryViolation[];
    private matchLayer;
}
