import { Rule, RuleResult, RuleViolation } from '@driftguard/core-engine';
import { BoundaryChecker, BoundaryViolation } from '../analyzer/boundary-checker';
import { ParsedFile } from '../parser/ast-parser';

export class BoundaryViolationRule implements Rule {
  id = 'boundary-violation';
  name = 'Layer Boundary Violation';
  description = 'Detects violations of architectural layer boundaries';

  constructor(private checker: BoundaryChecker) {}

  async check(context: { parsedFiles: ParsedFile[] }): Promise<RuleResult> {
    const violations = this.checker.check(context.parsedFiles);

    if (violations.length === 0) {
      return { passed: true, violations: [] };
    }

    const ruleViolations: RuleViolation[] = violations.map(v => ({
      ruleId: this.id,
      severity: 'error',
      message: `Layer boundary violation: ${v.file} imports ${v.import} (violates ${v.rule})`,
      location: {
        file: v.file,
        line: v.line,
      },
      metadata: { import: v.import, rule: v.rule },
    }));

    return { passed: false, violations: ruleViolations };
  }
}
