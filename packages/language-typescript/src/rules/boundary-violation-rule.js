"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoundaryViolationRule = void 0;
class BoundaryViolationRule {
    checker;
    id = 'boundary-violation';
    name = 'Layer Boundary Violation';
    description = 'Detects violations of architectural layer boundaries';
    constructor(checker) {
        this.checker = checker;
    }
    async check(context) {
        const violations = this.checker.check(context.parsedFiles);
        if (violations.length === 0) {
            return { passed: true, violations: [] };
        }
        const ruleViolations = violations.map(v => ({
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
exports.BoundaryViolationRule = BoundaryViolationRule;
