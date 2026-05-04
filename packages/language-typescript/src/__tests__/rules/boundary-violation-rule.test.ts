import { describe, it, expect, beforeEach } from 'vitest';
import { BoundaryViolationRule } from '../../rules/boundary-violation-rule';
import { BoundaryChecker } from '../../analyzer/boundary-checker';
import type { ParsedFile } from '../../parser/ast-parser';

describe('BoundaryViolationRule', () => {
  let rule: BoundaryViolationRule;
  let checker: BoundaryChecker;

  const createParsedFile = (path: string, imports: Array<{ module: string; line?: number }>): ParsedFile => ({
    path,
    imports: imports.map(imp => ({
      module: imp.module,
      isTypeOnly: false,
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
    checker = new BoundaryChecker();
    rule = new BoundaryViolationRule(checker);
  });

  const setupLayers = (layerRules: Array<{ name: string; pattern: string; canImport?: string[]; cannotImport?: string[] }>) => {
    layerRules.forEach(lr => {
      checker.addRule({
        name: lr.name,
        pattern: lr.pattern,
        canImport: lr.canImport ?? [],
        cannotImport: lr.cannotImport ?? [],
      });
    });
  };

  describe('check', () => {
    it('should pass when no boundary violations exist', async () => {
      setupLayers([
        { name: 'presentation', pattern: '^/src/presentation/', canImport: ['application', 'domain'] },
        { name: 'application', pattern: '^/src/application/', canImport: ['domain'] },
        { name: 'domain', pattern: '^/src/domain/', canImport: [] },
      ]);

      const files = [
        createParsedFile('/src/presentation/ui.ts', [{ module: '/src/application/service.ts' }]),
        createParsedFile('/src/application/service.ts', [{ module: '/src/domain/entity.ts' }]),
        createParsedFile('/src/domain/entity.ts', []),
      ];

      const result = await rule.check({ parsedFiles: files });

      expect(result.passed).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should fail when a cannot-import violation occurs', async () => {
      setupLayers([
        { name: 'presentation', pattern: '^/src/presentation/', cannotImport: ['infrastructure'] },
        { name: 'infrastructure', pattern: '^/src/infrastructure/', canImport: [] },
      ]);

      const files = [
        createParsedFile('/src/presentation/ui.ts', [{ module: '/src/infrastructure/db.ts', line: 10 }]),
      ];

      const result = await rule.check({ parsedFiles: files });

      expect(result.passed).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].ruleId).toBe('boundary-violation');
      expect(result.violations[0].severity).toBe('error');
      expect(result.violations[0].message).toContain('Layer boundary violation');
      expect(result.violations[0].location.file).toBe('/src/presentation/ui.ts');
      expect(result.violations[0].location.line).toBe(10);
      expect(result.violations[0].metadata).toEqual({
        import: '/src/infrastructure/db.ts',
        rule: 'presentation',
      });
    });

    it('should fail when canImport is set and import is from non-allowed layer', async () => {
      setupLayers([
        { name: 'application', pattern: '^/src/application/', canImport: ['domain'] },
        { name: 'domain', pattern: '^/src/domain/', canImport: [] },
      ]);

      const files = [
        createParsedFile('/src/application/service.ts', [{ module: '/src/infrastructure/repo.ts', line: 5 }]),
      ];

      const result = await rule.check({ parsedFiles: files });

      expect(result.passed).toBe(false);
      expect(result.violations[0].metadata?.rule).toBe('application');
    });

    it('should handle multiple violations across different files', async () => {
      setupLayers([
        { name: 'presentation', pattern: '^/src/presentation/', cannotImport: ['domain'] },
        { name: 'domain', pattern: '^/src/domain/', cannotImport: [] },
      ]);

      const files = [
        createParsedFile('/src/presentation/ui.ts', [{ module: '/src/domain/entity.ts', line: 1 }]),
        createParsedFile('/src/presentation/other.ts', [{ module: '/src/domain/value.ts', line: 3 }]),
      ];

      const result = await rule.check({ parsedFiles: files });

      expect(result.passed).toBe(false);
      expect(result.violations).toHaveLength(2);
    });

    it('should skip files that do not match any layer rule', async () => {
      setupLayers([
        { name: 'domain', pattern: '^/src/domain/', canImport: [] },
      ]);

      const files = [
        createParsedFile('/src/presentation/ui.ts', [{ module: '/src/domain/entity.ts' }]),
      ];

      const result = await rule.check({ parsedFiles: files });

      expect(result.passed).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should handle imports that do not match any layer rule', async () => {
      setupLayers([
        { name: 'domain', pattern: '^/src/domain/', canImport: [] },
      ]);

      const files = [
        createParsedFile('/src/domain/entity.ts', [{ module: 'react' }]),
      ];

      const result = await rule.check({ parsedFiles: files });

      expect(result.passed).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should pass with empty file list', async () => {
      setupLayers([{ name: 'domain', pattern: '^/src/domain/', canImport: [] }]);

      const result = await rule.check({ parsedFiles: [] });

      expect(result.passed).toBe(true);
      expect(result.violations).toEqual([]);
    });
  });

  describe('rule metadata', () => {
    it('should have correct rule id', () => {
      expect(rule.id).toBe('boundary-violation');
    });

    it('should have correct name', () => {
      expect(rule.name).toBe('Layer Boundary Violation');
    });

    it('should have a description', () => {
      expect(rule.description).toBe('Detects violations of architectural layer boundaries');
    });
  });
});
