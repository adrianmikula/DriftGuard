import { z } from 'zod';

export interface RuleViolation {
  ruleId: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  location: {
    file: string;
    line?: number;
    column?: number;
  };
  metadata?: Record<string, any>;
}

export interface RuleResult {
  passed: boolean;
  violations: RuleViolation[];
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  check: (context: any) => Promise<RuleResult>;
}

export class RuleEngine {
  private rules: Map<string, Rule> = new Map();
  private ruleConfigs: Record<string, { enabled?: boolean; severity?: 'error' | 'warning' | 'info' }>;

  constructor(ruleConfigs?: Record<string, { enabled?: boolean; severity?: 'error' | 'warning' | 'info' }>) {
    this.ruleConfigs = ruleConfigs || {};
  }

  registerRule(rule: Rule): void {
    this.rules.set(rule.id, rule);
  }

  unregisterRule(ruleId: string): void {
    this.rules.delete(ruleId);
  }

  getRule(ruleId: string): Rule | undefined {
    return this.rules.get(ruleId);
  }

  getAllRules(): Rule[] {
    return Array.from(this.rules.values());
  }

  async executeRule(ruleId: string, context: any): Promise<RuleResult> {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      throw new Error(`Rule not found: ${ruleId}`);
    }
    return await rule.check(context);
  }

  async executeAllRules(context: any): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    for (const rule of this.rules.values()) {
      const config = this.ruleConfigs[rule.id];

      // Skip disabled rules
      if (config?.enabled === false) {
        continue;
      }

      const result = await rule.check(context);

      // Apply severity override if configured
      if (config && config.severity) {
        for (const violation of result.violations) {
          violation.severity = config.severity;
        }
      }

      results.push(result);
    }
    return results;
  }
}

// Configuration schema for rules
export const RuleConfigSchema = z.object({
  enabled: z.boolean(),
  severity: z.enum(['error', 'warning', 'info']),
  options: z.record(z.any()).optional(),
});

export type RuleConfig = z.infer<typeof RuleConfigSchema>;
