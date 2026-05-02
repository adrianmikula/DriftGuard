import { z } from 'zod';
import type { GraphClientConfig } from '../graph/client';
import type { RuleViolation, RuleResult } from '../rules/engine';

export function createGraphClientConfig(overrides?: Partial<GraphClientConfig>): GraphClientConfig {
  return {
    uri: 'bolt://localhost:7687',
    username: 'neo4j',
    password: 'password',
    ...overrides,
  };
}

export function createRuleViolation(overrides?: Partial<z.infer<typeof RuleViolationSchema>>): z.infer<typeof RuleViolationSchema> {
  return {
    ruleId: 'test-rule',
    severity: 'error',
    message: 'Test violation message',
    location: { file: 'test.ts' },
    ...overrides,
  };
}

export function createRuleResult(overrides?: Partial<RuleResult>): RuleResult {
  return {
    passed: true,
    violations: [],
    ...overrides,
  };
}

export function createMockRecord(data: Record<string, any>) {
  return {
    keys: Object.keys(data),
    get: (key: string) => data[key],
    toJSON: () => data,
  };
}

export function createMockResult(records: Record<string, any>[]) {
  return {
    records: records.map(createMockRecord),
    sum: () => records.length,
    consume: () => ({ stats: { counters: {} } }),
  };
}

// RuleViolation schema for type inference
export const RuleViolationSchema = z.object({
  ruleId: z.string(),
  severity: z.enum(['error', 'warning', 'info']),
  message: z.string(),
  location: z.object({
    file: z.string(),
    line: z.number().optional(),
    column: z.number().optional(),
  }),
  metadata: z.record(z.any()).optional(),
});
