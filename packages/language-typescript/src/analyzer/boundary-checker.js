"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoundaryChecker = void 0;
class BoundaryChecker {
    rules = [];
    addRule(rule) {
        this.rules.push(rule);
    }
    removeRule(ruleName) {
        this.rules = this.rules.filter(r => r.name !== ruleName);
    }
    check(parsedFiles) {
        const violations = [];
        parsedFiles.forEach(file => {
            const fileLayer = this.matchLayer(file.path);
            if (!fileLayer)
                return;
            file.imports.forEach(imp => {
                const importLayer = this.matchLayer(imp.module);
                const rule = this.rules.find(r => r.name === fileLayer);
                if (!rule)
                    return;
                // Check cannot-import rules (only if importLayer is resolved)
                if (importLayer && rule.cannotImport.includes(importLayer)) {
                    violations.push({
                        file: file.path,
                        import: imp.module,
                        rule: rule.name,
                        line: imp.line,
                    });
                }
                // Check can-import rules (if specified)
                // This applies even if importLayer is null (importing from outside the layered architecture)
                if (rule.canImport.length > 0) {
                    if (!importLayer || !rule.canImport.includes(importLayer)) {
                        violations.push({
                            file: file.path,
                            import: imp.module,
                            rule: rule.name,
                            line: imp.line,
                        });
                    }
                }
            });
        });
        return violations;
    }
    matchLayer(filePath) {
        for (const rule of this.rules) {
            if (filePath.match(rule.pattern)) {
                return rule.name;
            }
        }
        return null;
    }
}
exports.BoundaryChecker = BoundaryChecker;
