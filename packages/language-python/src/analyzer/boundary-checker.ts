// STUB: Python boundary checker - to be implemented in Phase 2

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

export class BoundaryChecker {
  addRule(rule: LayerRule): void {
    throw new Error('Python boundary checker not yet implemented - Phase 2');
  }

  check(parsedFiles: ParsedFile[]): BoundaryViolation[] {
    throw new Error('Python boundary checker not yet implemented - Phase 2');
  }
}
