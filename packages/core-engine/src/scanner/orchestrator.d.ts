import { GraphModel } from '../graph/model';
import { RuleEngine, RuleResult } from '../rules';
export interface ScanContext {
    workspacePath: string;
    language: string;
    files: string[];
}
export interface ScanResult {
    success: boolean;
    violations: RuleResult[];
    metrics: {
        filesScanned: number;
        nodesCreated: number;
        edgesCreated: number;
        duration: number;
    };
}
export interface LanguageAnalyzer {
    language: string;
    analyze(context: ScanContext, graph: GraphModel): Promise<void>;
}
export declare class ScannerOrchestrator {
    private graph;
    private ruleEngine;
    private analyzers;
    constructor(graph: GraphModel, ruleEngine: RuleEngine);
    registerAnalyzer(analyzer: LanguageAnalyzer): void;
    unregisterAnalyzer(language: string): void;
    scan(context: ScanContext): Promise<ScanResult>;
}
