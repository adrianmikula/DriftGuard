// STUB: Python import graph analyzer - to be implemented in Phase 2

import { ParsedFile } from '../parser/ast-parser';

export interface ImportEdge {
  from: string;
  to: string;
  line: number;
}

export class ImportGraphAnalyzer {
  buildGraph(parsedFiles: ParsedFile[]): ImportEdge[] {
    throw new Error('Python import graph analyzer not yet implemented - Phase 2');
  }

  detectCycles(): string[][] {
    throw new Error('Python cycle detection not yet implemented - Phase 2');
  }
}
