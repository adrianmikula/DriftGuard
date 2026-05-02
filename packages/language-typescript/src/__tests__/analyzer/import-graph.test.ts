import { describe, it, expect, beforeEach } from 'vitest';
import { ImportGraphAnalyzer } from '../../analyzer/import-graph';
import type { ParsedFile } from '../../parser/ast-parser';

describe('ImportGraphAnalyzer', () => {
  let analyzer: ImportGraphAnalyzer;

  const createParsedFile = (path: string, imports: Array<{ module: string; isTypeOnly?: boolean; line?: number; namedImports?: string[]; defaultImport?: string }>): ParsedFile => ({
    path,
    imports: imports.map(imp => ({
      module: imp.module,
      isTypeOnly: imp.isTypeOnly ?? false,
      line: imp.line ?? 1,
      namedImports: imp.namedImports,
      defaultImport: imp.defaultImport,
    })),
    exports: [],
    classes: [],
    functions: [],
    interfaces: [],
  });

  beforeEach(() => {
    analyzer = new ImportGraphAnalyzer();
  });

  describe('buildGraph', () => {
    it('should build edges from parsed files', () => {
      const files = [
        createParsedFile('/src/a.ts', [{ module: './b', line: 1 }]),
        createParsedFile('/src/b.ts', [{ module: './c', line: 1 }]),
        createParsedFile('/src/c.ts', []),
      ];

      const edges = analyzer.buildGraph(files);

      expect(edges).toHaveLength(2);
      expect(edges[0].from).toBe('/src/a.ts');
      expect(edges[0].to).toBe('/src/b.ts');
      expect(edges[1].from).toBe('/src/b.ts');
      expect(edges[1].to).toBe('/src/c.ts');
    });

    it('should preserve isTypeOnly flag on edges', () => {
      const files = [
        createParsedFile('/src/a.ts', [{ module: './b', isTypeOnly: true, line: 1 }]),
      ];

      const edges = analyzer.buildGraph(files);

      expect(edges[0].isTypeOnly).toBe(true);
    });

    it('should preserve line numbers', () => {
      const files = [
        createParsedFile('/src/a.ts', [{ module: './b', line: 42 }]),
      ];

      const edges = analyzer.buildGraph(files);

      expect(edges[0].line).toBe(42);
    });

    it('should handle empty file list', () => {
      const edges = analyzer.buildGraph([]);
      expect(edges).toEqual([]);
    });

    it('should clear previous graph on rebuild', () => {
      const files1 = [createParsedFile('/src/a.ts', [{ module: './b' }])];
      analyzer.buildGraph(files1);

      const files2 = [createParsedFile('/src/c.ts', [{ module: './d' }])];
      const edges = analyzer.buildGraph(files2);

      expect(edges).toHaveLength(1);
      expect(edges[0].from).toBe('/src/c.ts');
    });
  });

  describe('resolveImportPath', () => {
    it('should resolve relative imports using fromDir', () => {
      const fromFile = '/src/utils/a.ts';
      const importModule = './b';
      // This is private but we can exercise via buildGraph
      const files = [createParsedFile(fromFile, [{ module: importModule }])];
      analyzer.buildGraph(files);
      const edges = analyzer.buildGraph(files);

      expect(edges[0].to).toBe('/src/utils/b.ts');
    });

    it('should handle parent directory references', () => {
      const fromFile = '/src/utils/a.ts';
      const importModule = '../index';
      const files = [createParsedFile(fromFile, [{ module: importModule }])];
      analyzer.buildGraph(files);

      const edges = analyzer.buildGraph(files);
      expect(edges[0].to).toBe('/src/index.ts');
    });

    it('should return non-relative modules as-is', () => {
      const files = [createParsedFile('/src/a.ts', [{ module: 'react' }])];
      analyzer.buildGraph(files);

      const edges = analyzer.buildGraph(files);
      expect(edges[0].to).toBe('react');
    });
  });

  describe('detectCycles', () => {
    it('should detect a simple cycle', () => {
      const files = [
        createParsedFile('/src/a.ts', [{ module: './b' }]),
        createParsedFile('/src/b.ts', [{ module: './a' }]),
      ];
      analyzer.buildGraph(files);

      const cycles = analyzer.detectCycles();

      expect(cycles.length).toBeGreaterThan(0);
      // Expect cycle containing both a and b
      const cycle = cycles[0];
      expect(cycle).toContain('/src/a.ts');
      expect(cycle).toContain('/src/b.ts');
    });

    it('should not report cycles when none exist', () => {
      const files = [
        createParsedFile('/src/a.ts', [{ module: './b' }]),
        createParsedFile('/src/b.ts', [{ module: './c' }]),
        createParsedFile('/src/c.ts', []),
      ];
      analyzer.buildGraph(files);

      const cycles = analyzer.detectCycles();

      expect(cycles).toHaveLength(0);
    });

    it('should detect larger cycles across multiple files', () => {
      const files = [
        createParsedFile('/src/a.ts', [{ module: './b' }]),
        createParsedFile('/src/b.ts', [{ module: './c' }]),
        createParsedFile('/src/c.ts', [{ module: './a' }]),
      ];
      analyzer.buildGraph(files);

      const cycles = analyzer.detectCycles();

      expect(cycles.length).toBeGreaterThan(0);
      const cycle = cycles[0];
      expect(cycle).toContain('/src/a.ts');
      expect(cycle).toContain('/src/b.ts');
      expect(cycle).toContain('/src/c.ts');
    });

    it('should detect self-cycle (file imports itself)', () => {
      const files = [
        createParsedFile('/src/a.ts', [{ module: './a' }]),
      ];
      analyzer.buildGraph(files);

      const cycles = analyzer.detectCycles();

      expect(cycles[0][0]).toContain('/src/a.ts'); // Contains self-reference
    });
  });

  describe('getDependencies', () => {
    it('should return empty array when file has no dependencies', () => {
      const files = [createParsedFile('/src/a.ts', [])];
      analyzer.buildGraph(files);

      const deps = analyzer.getDependencies('/src/a.ts');

      expect(deps).toEqual([]);
    });

    it('should return import edges for a file', () => {
      const files = [
        createParsedFile('/src/a.ts', [{ module: './b', line: 5 }]),
        createParsedFile('/src/b.ts', []),
      ];
      analyzer.buildGraph(files);

      const deps = analyzer.getDependencies('/src/a.ts');

      expect(deps).toHaveLength(1);
      expect(deps[0].to).toBe('/src/b.ts');
      expect(deps[0].line).toBe(5);
    });

    it('should handle unknown file', () => {
      const files = [createParsedFile('/src/a.ts', [])];
      analyzer.buildGraph(files);

      const deps = analyzer.getDependencies('/nonexistent.ts');

      expect(deps).toEqual([]);
    });
  });

  describe('getDependents', () => {
    it('return files that import the given file', () => {
      const files = [
        createParsedFile('/src/a.ts', [{ module: './b' }]),
        createParsedFile('/src/c.ts', [{ module: './b' }]),
        createParsedFile('/src/b.ts', []),
      ];
      analyzer.buildGraph(files);

      const dependents = analyzer.getDependents('/src/b.ts');

      expect(dependents).toHaveLength(2);
      const fromPaths = dependents.map(d => d.from);
      expect(fromPaths).toContain('/src/a.ts');
      expect(fromPaths).toContain('/src/c.ts');
    });

    it('return empty array when no dependents', () => {
      const files = [createParsedFile('/src/a.ts', [{ module: './b' }])];
      analyzer.buildGraph(files);

      const dependents = analyzer.getDependents('/src/c.ts'); // doesn't exist

      expect(dependents).toEqual([]);
    });
  });
});
