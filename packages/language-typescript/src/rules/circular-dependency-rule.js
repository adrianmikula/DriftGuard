"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircularDependencyRule = void 0;
class CircularDependencyRule {
    analyzer;
    id = 'circular-dependency';
    name = 'Circular Dependency Detection';
    description = 'Detects circular dependencies in the import graph';
    constructor(analyzer) {
        this.analyzer = analyzer;
    }
    async check(context) {
        // Build the import graph from parsed files
        this.analyzer.buildGraph(context.parsedFiles);
        const cycles = this.analyzer.detectCycles();
        if (cycles.length === 0) {
            return { passed: true, violations: [] };
        }
        const violations = cycles.map(cycle => ({
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
exports.CircularDependencyRule = CircularDependencyRule;
