// STUB: Python boundary violation rule - to be implemented in Phase 2

import { Rule, RuleResult } from '@driftguard/core-engine';
import { BoundaryChecker } from '../analyzer/boundary-checker';
import { ParsedFile } from '../parser/ast-parser';

export class BoundaryViolationRule implements Rule {
  id = 'python-boundary-violation';
  name = 'Python Layer Boundary Violation';
  description = 'Detects violations of architectural layer boundaries in Python';

  constructor(private checker: BoundaryChecker) {}

  async check(context: { parsedFiles: ParsedFile[] }): Promise<RuleResult> {
    throw new Error('Python boundary violation rule not yet implemented - Phase 2');
  }
}
