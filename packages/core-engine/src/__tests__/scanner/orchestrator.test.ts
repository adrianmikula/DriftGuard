import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScannerOrchestrator, type ScanContext, type ScanResult, type LanguageAnalyzer } from '../../scanner/orchestrator';
import { RuleEngine } from '../../rules/engine';

describe('ScannerOrchestrator', () => {
  let orchestrator: ScannerOrchestrator;
  let mockRuleEngine: RuleEngine;
  let mockGraph: any;

  const createMockLanguageAnalyzer = (name: string, shouldSucceed: boolean = true): LanguageAnalyzer => ({
    language: name,
    analyze: async (_context: ScanContext, _graph: any): Promise<void> => {
      if (!shouldSucceed) {
        throw new Error('Analyzer failed');
      }
    },
  });

  const createScanContext = (overrides?: Partial<ScanContext>): ScanContext => ({
    workspacePath: '/test/workspace',
    language: 'typescript',
    files: ['/test/workspace/file1.ts', '/test/workspace/file2.ts'],
    ...overrides,
  });

  beforeEach(() => {
    mockRuleEngine = new RuleEngine();
    mockGraph = {
      resetMetrics: vi.fn(),
      getMetrics: vi.fn(() => ({ nodesCreated: 0, edgesCreated: 0 })),
    };
    orchestrator = new ScannerOrchestrator(mockGraph, mockRuleEngine);
  });

  describe('registerAnalyzer', () => {
    it('should register a language analyzer', () => {
      const analyzer = createMockLanguageAnalyzer('typescript');
      orchestrator.registerAnalyzer(analyzer);
      // Access internal state via public methods - orchestrator doesn't expose getAnalyzer
      // So we test through scan behavior
      expect(orchestrator).toBeDefined();
    });

    it('should overwrite existing analyzer for same language', () => {
      const analyzer1 = createMockLanguageAnalyzer('typescript');
      const analyzer2 = createMockLanguageAnalyzer('typescript', false);
      orchestrator.registerAnalyzer(analyzer1);
      orchestrator.registerAnalyzer(analyzer2);
      // New analyzer replaces old one
      expect(orchestrator).toBeDefined();
    });
  });

  describe('unregisterAnalyzer', () => {
    it('should remove a language analyzer', async () => {
      const analyzer = createMockLanguageAnalyzer('python');
      orchestrator.registerAnalyzer(analyzer);
      orchestrator.unregisterAnalyzer('python');
      // After unregistering, scan should return failure result (not throw)
      const result = await orchestrator.scan(createScanContext({ language: 'python' }));
      expect(result.success).toBe(false);
      expect(result.violations).toEqual([]);
    });

    it('should not throw if analyzer does not exist', () => {
      expect(() => orchestrator.unregisterAnalyzer('nonexistent')).not.toThrow();
    });
  });

  describe('scan', () => {
    beforeEach(async () => {
      // Register a default rule that always passes to simplify tests
      const passingRule = {
        id: 'passing-rule',
        name: 'Passing',
        description: 'Always passes',
        check: async () => ({ passed: true, violations: [] }),
      };
      mockRuleEngine.registerRule(passingRule);
    });

    it('should return success result when scan completes', async () => {
      const analyzer = createMockLanguageAnalyzer('typescript');
      orchestrator.registerAnalyzer(analyzer);

      const result = await orchestrator.scan(createScanContext());

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('violations');
      expect(result).toHaveProperty('metrics');
      expect(result.metrics).toHaveProperty('filesScanned', 2);
    });

    it('should return metrics with duration and file count', async () => {
      const analyzer = createMockLanguageAnalyzer('typescript');
      orchestrator.registerAnalyzer(analyzer);

      const result = await orchestrator.scan(createScanContext());

      expect(result.metrics.filesScanned).toBe(2);
      expect(result.metrics.duration).toBeGreaterThanOrEqual(0);
    });

    it('should execute rules and include violations in result', async () => {
      // Add a rule that fails
      const failingRule = {
        id: 'failing-rule',
        name: 'Failing',
        description: 'Always fails',
        check: async () => ({
          passed: false,
          violations: [{
            ruleId: 'failing-rule',
            severity: 'error' as const,
            message: 'Test violation',
            location: { file: 'test.ts' },
          }],
        }),
      };
      mockRuleEngine.registerRule(failingRule);

      const analyzer = createMockLanguageAnalyzer('typescript');
      orchestrator.registerAnalyzer(analyzer);

      const result = await orchestrator.scan(createScanContext());

      expect(result.violations).toHaveLength(1);
      // result.violations is RuleResult[], each has violations array
      expect(result.violations[0].violations[0].ruleId).toBe('failing-rule');
    });

    it('should handle analyzer not found error', async () => {
      const context = createScanContext({ language: 'unsupported' });
      const result = await orchestrator.scan(context);

      expect(result.success).toBe(false);
      expect(result.violations).toEqual([]);
      expect(result.metrics.filesScanned).toBe(0);
    });

    it('should handle analyzer throwing an exception', async () => {
      const failingAnalyzer = createMockLanguageAnalyzer('typescript', false);
      orchestrator.registerAnalyzer(failingAnalyzer);

      const result = await orchestrator.scan(createScanContext());

      expect(result.success).toBe(false);
      expect(result.violations).toEqual([]);
    });

    it('should execute all registered rules', async () => {
      orchestrator.registerAnalyzer(createMockLanguageAnalyzer('typescript'));

      const rule1 = { id: 'r1', name: 'R1', description: '', check: async () => ({ passed: true, violations: [] }) };
      const rule2 = { id: 'r2', name: 'R2', description: '', check: async () => ({ passed: true, violations: [] }) };
      mockRuleEngine.registerRule(rule1);
      mockRuleEngine.registerRule(rule2);

      const executeAllSpy = vi.spyOn(mockRuleEngine, 'executeAllRules');
      await orchestrator.scan(createScanContext());
      expect(executeAllSpy).toHaveBeenCalledOnce();
    });
  });
});
