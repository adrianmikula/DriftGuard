import { LanguageAnalyzer, ScanContext, GraphModel } from '@driftguard/core-engine';
import { ImportGraphAnalyzer } from './analyzer/import-graph';
import { BoundaryChecker } from './analyzer/boundary-checker';
import { CircularDependencyRule } from './rules/circular-dependency-rule';
import { BoundaryViolationRule } from './rules/boundary-violation-rule';
import type { LayerRule } from '@driftguard/core-engine';
export interface AnalyzerConfig {
    layers: LayerRule[];
    fileExtensions?: string[];
}
export declare class TypeScriptAnalyzer implements LanguageAnalyzer {
    language: string;
    private parser;
    private importGraphAnalyzer;
    private boundaryChecker;
    private fileExtensions;
    constructor(tsConfigPath?: string, config?: AnalyzerConfig);
    analyze(context: ScanContext, graph: GraphModel): Promise<void>;
    getImportGraphAnalyzer(): ImportGraphAnalyzer;
    getBoundaryChecker(): BoundaryChecker;
    getCircularDependencyRule(): CircularDependencyRule;
    getBoundaryViolationRule(): BoundaryViolationRule;
}
