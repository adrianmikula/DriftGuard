import { describe, it, expect, beforeEach } from 'vitest';
import { CircularDependencyRule } from '../../rules/circular-dependency-rule';
import { ImportGraphAnalyzer } from '../../analyzer/import-graph';
import type { ParsedFile } from '../../parser/ast-parser';

describe('CircularDependencyRule', () => {
  let rule: CircularDependencyRule;
  let analyzer: ImportGraphAnalyzer;

  const createParsedFile = (path: string, imports: Array<{ module: string; isTypeOnly?: boolean; line?: number }>): ParsedFile => ({
    path,
    imports: imports.map(imp => ({
      module: imp.module,
      isTypeOnly: imp.isTypeOnly ?? false,
      line: imp.line ?? 1,
      namedImports: [],
      defaultImport: undefined,
    })),
    exports: [],
    classes: [],
    functions: [],
    interfaces: [],
  });

  beforeEach(() => {
    analyzer = new ImportGraphAnalyzer();
    rule = new CircularDependencyRule(analyzer);
  });

  describe('check', () => {
    it('should pass when no cycles are present', async () => {
      const files = [
        createParsedFile('/src/a.ts', [{ module: './b' }]),
        createParsedFile('/src/b.ts', [{ module: './c' }]),
        createParsedFile('/src/c.ts', []),
      ];
      analyzer.buildGraph(files);

      const result = await rule.check({ parsedFiles: files });

      expect(result.passed).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should fail when a cycle is detected', async () => {
      const files = [
        createParsedFile('/src/a.ts', [{ module: './b' }]),
        createParsedFile('/src/b.ts', [{ module: './a' }]),
      ];
      analyzer.buildGraph(files);

      const result = await rule.check({ parsedFiles: files });

      expect(result.passed).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].ruleId).toBe('circular-dependency');
      expect(result.violations[0].severity).toBe('error');
      expect(result.violations[0].message).toContain('Circular dependency detected');
      expect(result.violations[0].location.file).toBe('/src/a.ts');
      expect(result.violations[0].metadata).toHaveProperty('cycle');
    });

    it('should detect multiple cycles', async () => {
      const files = [
        createParsedFile('/src/a.ts', [{ module: './b' }]),
        createParsedFile('/src/b.ts', [{ module: './a' }]),
        createParsedFile('/src/c.ts', [{ module: './d' }]),
        createParsedFile('/src/d.ts', [{ module: './c' }]),
      ];
      analyzer.buildGraph(files);

      const result = await rule.check({ parsedFiles: files });

      expect(result.passed).toBe(false);
      expect(result.violations.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle self-cycle (file imports itself)', async () => {
      const files = [
        createParsedFile('/src/a.ts', [{ module: './a' }]),
      ];
      analyzer.buildGraph(files);

      const result = await rule.check({ parsedFiles: files });

      expect(result.passed).toBe(false);
      expect(result.violations[0].message).toContain('/src/a.ts');
    });

    it('should not affect analyzer state across multiple checks', async () => {
      const files1 = [createParsedFile('/src/a.ts', [{ module: './b' }]), createParsedFile('/src/b.ts', [])];
      const files2 = [createParsedFile('/src/x.ts', [{ module: './x' }])];

      await rule.check({ parsedFiles: files1 });
      const result2 = await rule.check({ parsedFiles: files2 });

      expect(result2.passed).toBe(false);
    });
  });

  describe('rule metadata', () => {
    it('should have correct rule id', () => {
      expect(rule.id).toBe('circular-dependency');
    });

    it('should have correct name', () => {
      expect(rule.name).toBe('Circular Dependency Detection');
    });

    it('should have a description', () => {
      expect(rule.description).toBe('Detects circular dependencies in the import graph');
    });
  });
});
