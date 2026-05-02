import { describe, it, expect, beforeEach } from 'vitest';
import { RuleEngine, Rule, RuleResult } from '../../rules/engine';
import { z } from 'zod';

describe('RuleEngine', () => {
  let engine: RuleEngine;

  const createMockRule = (id: string, passed: boolean, violations: any[] = []): Rule => ({
    id,
    name: `Mock Rule ${id}`,
    description: 'A mock rule for testing',
    check: async (_context: any): Promise<RuleResult> => ({
      passed,
      violations,
    }),
  });

  beforeEach(() => {
    engine = new RuleEngine();
  });

  describe('registerRule', () => {
    it('should register a rule', () => {
      const rule = createMockRule('rule1', true);
      engine.registerRule(rule);
      expect(engine.getRule('rule1')).toBe(rule);
    });

    it('should overwrite existing rule with same id', () => {
      const rule1 = createMockRule('rule1', true);
      const rule2 = createMockRule('rule1', false, [{ ruleId: 'rule1', severity: 'error', message: 'fail', location: { file: 'test' } }]);
      engine.registerRule(rule1);
      engine.registerRule(rule2);
      expect(engine.getRule('rule1')).toBe(rule2);
    });
  });

  describe('unregisterRule', () => {
    it('should remove a registered rule', () => {
      const rule = createMockRule('rule1', true);
      engine.registerRule(rule);
      engine.unregisterRule('rule1');
      expect(engine.getRule('rule1')).toBeUndefined();
    });

    it('should do nothing if rule does not exist', () => {
      expect(() => engine.unregisterRule('nonexistent')).not.toThrow();
    });
  });

  describe('getAllRules', () => {
    it('should return all registered rules', () => {
      engine.registerRule(createMockRule('rule1', true));
      engine.registerRule(createMockRule('rule2', true));
      const rules = engine.getAllRules();
      expect(rules).toHaveLength(2);
    });

    it('should return empty array when no rules registered', () => {
      expect(engine.getAllRules()).toEqual([]);
    });
  });

  describe('executeRule', () => {
    it('should execute a registered rule and return its result', async () => {
      const rule = createMockRule('rule1', true);
      engine.registerRule(rule);
      const result = await engine.executeRule('rule1', {});
      expect(result.passed).toBe(true);
    });

    it('should throw an error if rule is not found', async () => {
      await expect(engine.executeRule('nonexistent', {})).rejects.toThrow('Rule not found: nonexistent');
    });
  });

  describe('executeAllRules', () => {
    it('should execute all registered rules', async () => {
      engine.registerRule(createMockRule('rule1', true));
      engine.registerRule(createMockRule('rule2', false, [{
        ruleId: 'rule2',
        severity: 'error',
        message: 'violation',
        location: { file: 'test.ts' },
      }]));

      const results = await engine.executeAllRules({});
      expect(results).toHaveLength(2);
      expect(results[0].passed).toBe(true);
      expect(results[1].passed).toBe(false);
      expect(results[1].violations).toHaveLength(1);
    });

    it('should return empty array when no rules registered', async () => {
      const results = await engine.executeAllRules({});
      expect(results).toEqual([]);
    });
  });
});
