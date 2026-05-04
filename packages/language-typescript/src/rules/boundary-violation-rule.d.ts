import { Rule, RuleResult } from '@driftguard/core-engine';
import { BoundaryChecker } from '../analyzer/boundary-checker';
import { ParsedFile } from '../parser/ast-parser';
export declare class BoundaryViolationRule implements Rule {
    private checker;
    id: string;
    name: string;
    description: string;
    constructor(checker: BoundaryChecker);
    check(context: {
        parsedFiles: ParsedFile[];
    }): Promise<RuleResult>;
}
