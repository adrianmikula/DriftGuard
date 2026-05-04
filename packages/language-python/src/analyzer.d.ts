import { LanguageAnalyzer, ScanContext } from '@driftguard/core-engine';
import { GraphModel } from '@driftguard/core-engine';
export declare class PythonAnalyzer implements LanguageAnalyzer {
    language: string;
    analyze(context: ScanContext, graph: GraphModel): Promise<void>;
}
