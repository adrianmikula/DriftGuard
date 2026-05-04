import { LanguageAnalyzer, ScanContext, GraphModel } from '@driftguard/core-engine';

// STUB: Python analyzer - to be implemented in Phase 2
// This will integrate Python AST parsing, import graph analysis, and boundary checking

export class PythonAnalyzer implements LanguageAnalyzer {
  language = 'python';

  async analyze(context: ScanContext, graph: GraphModel): Promise<void> {
    throw new Error('Python analyzer not yet implemented - Phase 2');
  }
}
