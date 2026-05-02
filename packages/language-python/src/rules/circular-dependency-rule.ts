// STUB: Python circular dependency rule - to be implemented in Phase 2

import { Rule, RuleResult } from '@driftguard/core-engine';
import { ImportGraphAnalyzer } from '../analyzer/import-graph';
import { ParsedFile } from '../parser/ast-parser';

export class CircularDependencyRule implements Rule {
  id = 'python-circular-dependency';
  name = 'Python Circular Dependency Detection';
  description = 'Detects circular dependencies in Python import graph';

  constructor(private analyzer: ImportGraphAnalyzer) {}

  async check(context: { parsedFiles: ParsedFile[] }): Promise<RuleResult> {
    throw new Error('Python circular dependency rule not yet implemented - Phase 2');
  }
}
