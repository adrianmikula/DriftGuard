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
  private rules: LayerRule[] = [];

  addRule(rule: LayerRule): void {
    this.rules.push(rule);
  }

  removeRule(ruleName: string): void {
    this.rules = this.rules.filter(r => r.name !== ruleName);
  }

  check(parsedFiles: ParsedFile[]): BoundaryViolation[] {
    const violations: BoundaryViolation[] = [];

    parsedFiles.forEach(file => {
      const fileLayer = this.matchLayer(file.path);
      if (!fileLayer) return;

      file.imports.forEach(imp => {
        const importLayer = this.matchLayer(imp.module);
        if (!importLayer) return;

        const rule = this.rules.find(r => r.name === fileLayer);
        if (!rule) return;

        // Check cannot-import rules
        if (rule.cannotImport.includes(importLayer)) {
          violations.push({
            file: file.path,
            import: imp.module,
            rule: rule.name,
            line: imp.line,
          });
        }

        // Check can-import rules (if specified)
        if (rule.canImport.length > 0 && !rule.canImport.includes(importLayer)) {
          violations.push({
            file: file.path,
            import: imp.module,
            rule: rule.name,
            line: imp.line,
          });
        }
      });
    });

    return violations;
  }

  private matchLayer(filePath: string): string | null {
    for (const rule of this.rules) {
      if (filePath.match(rule.pattern)) {
        return rule.name;
      }
    }
    return null;
  }
}
