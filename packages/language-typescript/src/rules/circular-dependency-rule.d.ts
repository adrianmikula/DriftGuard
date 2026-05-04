import { Rule, RuleResult } from '@driftguard/core-engine';
import { ImportGraphAnalyzer } from '../analyzer/import-graph';
import { ParsedFile } from '../parser/ast-parser';
export declare class CircularDependencyRule implements Rule {
    private analyzer;
    id: string;
    name: string;
    description: string;
    constructor(analyzer: ImportGraphAnalyzer);
    check(context: {
        parsedFiles: ParsedFile[];
    }): Promise<RuleResult>;
}
