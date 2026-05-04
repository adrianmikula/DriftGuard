import { LanguageAnalyzer, ScanContext } from '@driftguard/core-engine';
import { GraphModel } from '@driftguard/core-engine';
import { ImportGraphAnalyzer } from './analyzer/import-graph';
import { BoundaryChecker } from './analyzer/boundary-checker';
import { CircularDependencyRule } from './rules/circular-dependency-rule';
import { BoundaryViolationRule } from './rules/boundary-violation-rule';
export declare class TypeScriptAnalyzer implements LanguageAnalyzer {
    language: string;
    private parser;
    private importGraphAnalyzer;
    private boundaryChecker;
    constructor(tsConfigPath?: string);
    analyze(context: ScanContext, graph: GraphModel): Promise<void>;
    getImportGraphAnalyzer(): ImportGraphAnalyzer;
    getBoundaryChecker(): BoundaryChecker;
    getCircularDependencyRule(): CircularDependencyRule;
    getBoundaryViolationRule(): BoundaryViolationRule;
}
