/// <reference types="vitest" />

import { describe, it, expect } from 'vitest';
import { PythonAnalyzer } from '../analyzer';
import { CircularDependencyRule, BoundaryViolationRule } from '../rules';

describe('Language-Python Package (Stub)', () => {
  describe('PythonAnalyzer (stub)', () => {
    it('should be constructable', () => {
      const analyzer = new PythonAnalyzer();
      expect(analyzer).toBeInstanceOf(PythonAnalyzer);
      expect(analyzer.language).toBe('python');
    });

    it('analyze method should throw not-implemented', async () => {
      const analyzer = new PythonAnalyzer();
      await expect(analyzer.analyze({} as any, {} as any)).rejects.toThrow('Python analyzer not yet implemented - Phase 2');
    });
  });

  describe('CircularDependencyRule (stub)', () => {
    it('should be constructable', () => {
      const rule = new CircularDependencyRule({} as any);
      expect(rule).toBeInstanceOf(CircularDependencyRule);
      expect(rule.id).toBe('python-circular-dependency');
    });

    it('check method should throw not-implemented', async () => {
      const rule = new CircularDependencyRule({} as any);
      await expect(rule.check({ parsedFiles: [] })).rejects.toThrow('Python circular dependency rule not yet implemented - Phase 2');
    });
  });

  describe('BoundaryViolationRule (stub)', () => {
    it('should be constructable', () => {
      const rule = new BoundaryViolationRule({} as any);
      expect(rule).toBeInstanceOf(BoundaryViolationRule);
      expect(rule.id).toBe('python-boundary-violation');
    });

    it('check method should throw not-implemented', async () => {
      const rule = new BoundaryViolationRule({} as any);
      await expect(rule.check({ parsedFiles: [] })).rejects.toThrow('Python boundary violation rule not yet implemented - Phase 2');
    });
  });
});
