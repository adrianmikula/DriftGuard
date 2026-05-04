import { Rule, RuleResult, RuleViolation } from './types';
import { ImportGraphAnalyzer } from '../analyzer/import-graph';
import { ParsedFile } from '../parser/ast-parser';

export class CircularDependencyRule implements Rule {
  id = 'circular-dependency';
  name = 'Circular Dependency Detection';
  description = 'Detects circular dependencies in the import graph';

  constructor(private analyzer: ImportGraphAnalyzer) {}

  async check(context: { parsedFiles: ParsedFile[] }): Promise<RuleResult> {
    // Build the import graph from parsed files
    this.analyzer.buildGraph(context.parsedFiles);
    const cycles = this.analyzer.detectCycles();

    if (cycles.length === 0) {
      return { passed: true, violations: [] };
    }

    const violations: RuleViolation[] = cycles.map(cycle => ({
      ruleId: this.id,
      severity: 'error',
      message: `Circular dependency detected: ${cycle.join(' -> ')}`,
      location: {
        file: cycle[0],
      },
      metadata: { cycle },
    }));

    return { passed: false, violations };
  }
}
